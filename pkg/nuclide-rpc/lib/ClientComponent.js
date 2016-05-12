'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {SERVICE_FRAMEWORK3_CHANNEL} from './config';
import type {ConfigEntry, Transport} from './index';
import type {ReturnType, Type} from './types';
import type {TypeRegistry} from './TypeRegistry';
import type {
  ResponseMessage,
  RequestMessage,
  DisposeRemoteObjectMessage,
  ObservableResult,
} from './messages';

import invariant from 'assert';
import {EventEmitter} from 'events';
import {Observable} from 'rxjs';
import {ServiceRegistry} from './ServiceRegistry';
import {ObjectRegistry} from './ObjectRegistry';
import {getPath, createRemoteUri} from '../../nuclide-remote-uri';
import {
  createCallFunctionMessage,
  createCallMethodMessage,
  createNewObjectMessage,
  createDisposeMessage,
  decodeError,
} from './messages';

const logger = require('../../nuclide-logging').getLogger();
const SERVICE_FRAMEWORK_RPC_TIMEOUT_MS = 60 * 1000;

export class ClientComponent<TransportType: Transport> {
  _rpcRequestId: number;
  _emitter: EventEmitter;
  _transport: TransportType;
  _serviceRegistry: ServiceRegistry;
  _objectRegistry: ObjectRegistry;

  constructor(
    kind: 'server' | 'client',
    serviceRegistry: ServiceRegistry,
    transport: TransportType
  ) {
    this._emitter = new EventEmitter();
    this._transport = transport;
    this._rpcRequestId = 1;
    this._serviceRegistry = serviceRegistry;
    this._objectRegistry = new ObjectRegistry(kind, this._serviceRegistry, this);
    this._transport.onMessage(message => this._handleMessage(message));
  }

  static createRemote(
    hostname: string, port: number, transport: TransportType, services: Array<ConfigEntry>
  ): ClientComponent<TransportType> {
    return new ClientComponent(
      'client',
      new ServiceRegistry(
        remoteUri => getPath(remoteUri),
        path => createRemoteUri(hostname, port, path),
      services),
      transport);
  }

  static createLocal(
    transport: TransportType,
    services: Array<ConfigEntry>
  ): ClientComponent<TransportType> {
    return new ClientComponent(
      'client',
      new ServiceRegistry(
        remoteUri => remoteUri,
        path => path,
        services),
      transport);
  }

  getService(serviceName: string): Object {
    const service = this._objectRegistry.getService(serviceName);
    invariant(service != null, `No config found for service ${serviceName}`);
    return service;
  }

  addServices(services: Array<ConfigEntry>): void {
    services.forEach(this.addService, this);
  }

  addService(service: ConfigEntry): void {
    this._serviceRegistry.addService(service);
  }

  // Delegate marshalling to the type registry.
  marshal(value: any, type: Type): any {
    return this._getTypeRegistry().marshal(this._objectRegistry, value, type);
  }
  unmarshal(value: any, type: Type): any {
    return this._getTypeRegistry().unmarshal(this._objectRegistry, value, type);
  }

  /**
   * Call a remote function, through the service framework.
   * @param functionName - The name of the remote function to invoke.
   * @param returnType - The type of object that this function returns, so the the transport
   *   layer can register the appropriate listeners.
   * @param args - The serialized arguments to invoke the remote function with.
   */
  callRemoteFunction(functionName: string, returnType: ReturnType, args: Array<any>): any {
    return this._sendMessageAndListenForResult(
      createCallFunctionMessage(functionName, this._generateRequestId(), args),
      returnType,
      `Calling function ${functionName}`
    );
  }

  /**
   * Call a method of a remote object, through the service framework.
   * @param objectId - The id of the remote object.
   * @param methodName - The name of the method to invoke.
   * @param returnType - The type of object that this function returns, so the the transport
   *   layer can register the appropriate listeners.
   * @param args - The serialized arguments to invoke the remote method with.
   */
  callRemoteMethod(
    objectId: number,
    methodName: string,
    returnType: ReturnType,
    args: Array<any>
  ): any {
    return this._sendMessageAndListenForResult(
      createCallMethodMessage(methodName, objectId, this._generateRequestId(), args),
      returnType,
      `Calling remote method ${methodName}.`
    );
  }

  /**
   * Call a remote constructor, returning an id that eventually resolves to a unique identifier
   * for the object.
   * @param interfaceName - The name of the remote class for which to construct an object.
   * @param thisArg - The newly created proxy object.
   * @param unmarshalledArgs - Unmarshalled arguments to pass to the remote constructor.
   * @param argTypes - Types of arguments.
   */
  createRemoteObject(
    interfaceName: string,
    thisArg: Object,
    unmarshalledArgs: Array<any>,
    argTypes: Array<Type>
  ): void {
    const idPromise = (async () => {
      const marshalledArgs = await this._getTypeRegistry().marshalArguments(
        this._objectRegistry, unmarshalledArgs, argTypes);
      return this._sendMessageAndListenForResult(
        createNewObjectMessage(interfaceName, this._generateRequestId(), marshalledArgs),
        'promise',
        `Creating instance of ${interfaceName}`
      );
    })();
    this._objectRegistry.addProxy(thisArg, idPromise);
  }

  /**
   * Dispose a remote object. This makes it's proxies unsuable, and calls the `dispose` method on
   * the remote object.
   * @param object - The remote object.
   * @returns A Promise that resolves when the object disposal has completed.
   */
  async disposeRemoteObject(object: Object): Promise<void> {
    const objectId = await this._objectRegistry.disposeProxy(object);
    if (objectId != null) {
      const message: DisposeRemoteObjectMessage = {
        protocol: SERVICE_FRAMEWORK3_CHANNEL,
        type: 'DisposeObject',
        requestId: this._generateRequestId(),
        objectId,
      };
      return await this._sendMessageAndListenForResult(
        message, 'promise', `Disposing object ${objectId}`);
    } else {
      logger.info('Duplicate dispose call on remote proxy');
    }
  }

  /**
   * Helper function that listens for a result for the given requestId.
   * @param returnType - Determines the type of messages we should subscribe to, and what this
   *   function should return.
   * @param requestId - The id of the request who's result we are listening for.
   * @returns Depending on the expected return type, this function either returns undefined, a
   *   Promise, or an Observable.
   */
  _sendMessageAndListenForResult(
    message: RequestMessage,
    returnType: ReturnType,
    timeoutMessage: string
  ): any {
    switch (returnType) {
      case 'void':
        this._transport.send(message);
        return; // No values to return.
      case 'promise':
        // Listen for a single message, and resolve or reject a promise on that message.
        return new Promise((resolve, reject) => {
          this._transport.send(message);
          this._emitter.once(message.requestId.toString(), (hadError, error, result) => {
            hadError ? reject(decodeError(message, error)) : resolve(result);
          });

          setTimeout(() => {
            this._emitter.removeAllListeners(message.requestId.toString());
            reject(new Error(
              `Timeout after ${SERVICE_FRAMEWORK_RPC_TIMEOUT_MS} for requestId: ` +
              `${message.requestId}, ${timeoutMessage}.`
            ));
          }, SERVICE_FRAMEWORK_RPC_TIMEOUT_MS);
        });
      case 'observable':
        const observable = Observable.create(observer => {
          this._transport.send(message);

          // Listen for 'next', 'error', and 'completed' events.
          this._emitter.on(
            message.requestId.toString(),
            (hadError: boolean, error: ?Error, result: ?ObservableResult) => {
              if (hadError) {
                observer.error(decodeError(message, error));
              } else {
                invariant(result);
                if (result.type === 'completed') {
                  observer.complete();
                } else if (result.type === 'next') {
                  observer.next(result.data);
                }
              }
            });

          // Observable dispose function, which is called on subscription dipsose, on stream
          // completion, and on stream error.
          return {
            unsubscribe: () => {
              this._emitter.removeAllListeners(message.requestId.toString());

              // Send a message to server to call the dispose function of
              // the remote Observable subscription.
              this._transport.send(createDisposeMessage(message.requestId));
            },
          };
        });

        return observable;
      default:
        throw new Error(`Unkown return type: ${returnType}.`);
    }
  }

  getTransport(): TransportType {
    return this._transport;
  }

  _handleMessage(message: ResponseMessage): void {
    const {channel} = message;
    invariant(channel === SERVICE_FRAMEWORK3_CHANNEL);
    switch (message.type) {
      case 'PromiseMessage': {
        const {requestId, result} = message;
        this._emitter.emit(requestId.toString(), false, null, result);
        break;
      }
      case 'ObservableMessage': {
        const {requestId, result} = message;
        this._emitter.emit(requestId.toString(), false, null, result);
        break;
      }
      case 'ErrorMessage': {
        const {requestId, error} = message;
        this._emitter.emit(requestId.toString(), true, error, undefined);
        break;
      }
      default:
        throw new Error(`Unexpected message type ${JSON.stringify(message)}`);
    }
  }

  _generateRequestId(): number {
    return this._rpcRequestId++;
  }

  _getTypeRegistry(): TypeRegistry {
    return this._serviceRegistry.getTypeRegistry();
  }

  dispose(): void {
    this._transport.close();
    this._objectRegistry.dispose();
  }
}
