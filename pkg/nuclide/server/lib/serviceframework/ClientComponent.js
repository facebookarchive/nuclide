'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from '../../lib/serviceframework/config';

import invariant from 'assert';
import {EventEmitter} from 'events';
import NuclideSocket from '../NuclideSocket';
import {Observable} from 'rx';
import {SERVICE_FRAMEWORK_RPC_TIMEOUT_MS} from '../config';

import TypeRegistry from 'nuclide-service-parser/lib/TypeRegistry';
import {getProxy, getDefinitions} from 'nuclide-service-parser';

import type {RequestMessage, CallRemoteFunctionMessage, CreateRemoteObjectMessage,
  CallRemoteMethodMessage, DisposeRemoteObjectMessage, DisposeObservableMessage,
  ReturnType, ObservableResult} from './types';

var logger = require('nuclide-logging').getLogger();

export default class ClientComponent {
  _emitter: EventEmitter;
  _socket: NuclideSocket;
  _requestIdGenerator: () => number;

  _typeRegistry: TypeRegistry;
  _objectRegistry: Map<number, any>;

  constructor(emitter: EventEmitter, socket: NuclideSocket, requestIdGenerator: () => number) {
    this._emitter = emitter;
    this._socket = socket;
    this._requestIdGenerator = requestIdGenerator;

    this._typeRegistry = new TypeRegistry();
    this._objectRegistry = new Map();

    // Setup services.
    const services = config.loadServicesConfig();
    for (const service of services) {
      logger.debug(`Registering 3.0 service ${service.name}...`);
      try {
        const defs = getDefinitions(service.definition);
        const proxy = getProxy(service.name, service.definition, this);

        defs.forEach(definition => {
          const name = definition.name;
          switch (definition.kind) {
            case 'alias':
              logger.debug(`Registering type alias ${name}...`);
              if (definition.definition != null) {
                this._typeRegistry.registerAlias(name, definition.definition);
              }
              break;
            case 'interface':
              logger.debug(`Registering interface ${name}.`);
              this._typeRegistry.registerType(name, async object => {
                return await object._idPromise;
              }, async objectId => {
                // Return a cached proxy, if one already exists, for this object.
                if (this._objectRegistry.has(objectId)) {
                  return this._objectRegistry.get(objectId);
                }

                // Generate the proxy by manually setting the prototype of the object to be the
                // prototype of the remote proxy constructor.
                const object = { _idPromise: Promise.resolve(objectId) };
                Object.setPrototypeOf(object, proxy[name].prototype);
                this._objectRegistry.set(objectId, object);
                return object;
              });
              break;
          }
        });
      } catch(e) {
        logger.error(`Failed to load service ${service.name}. Stack Trace:\n${e.stack}`);
        continue;
      }
    }
  }

  // Delegate marshalling to the type registry.
  marshal(...args): any {
    return this._typeRegistry.marshal(...args);
  }
  unmarshal(...args): any {
    return this._typeRegistry.unmarshal(...args);
  }
  registerType(...args): void {
    return this._typeRegistry.registerType(...args);
  }

  /**
   * Call a remote function, through the service framework.
   * @param functionName - The name of the remote function to invoke.
   * @param returnType - The type of object that this function returns, so the the transport layer can
   *   register the appropriate listeners.
   * @param args - The serialized arguments to invoke the remote function with.
   */
  callRemoteFunction(functionName: string, returnType: ReturnType, args: Array<any>): any {
    var message: CallRemoteFunctionMessage = {
      protocol: 'service_framework3_rpc',
      type: 'FunctionCall',
      function: functionName,
      requestId: this._requestIdGenerator(),
      args,
    };
    return this._sendMessageAndListenForResult(message, returnType, `Calling function ${functionName}`);
  }

  /**
   * Call a method of a remote object, through the service framework.
   * @param objectId - The id of the remote object.
   * @param methodName - The name of the method to invoke.
   * @param returnType - The type of object that this function returns, so the the transport layer can
   *   register the appropriate listeners.
   * @param args - The serialized arguments to invoke the remote method with.
   */
  callRemoteMethod(objectId: number, methodName: string, returnType: ReturnType, args: Array<any>): any {
    var message: CallRemoteMethodMessage = {
      protocol: 'service_framework3_rpc',
      type: 'MethodCall',
      method: methodName,
      objectId,
      requestId: this._requestIdGenerator(),
      args,
    };
    return this._sendMessageAndListenForResult(message, returnType, `Calling remote method ${methodName}.`);
  }

  /**
   * Call a remote constructor, returning an id that eventually resolves to a unique identifier
   * for the object.
   * @param interfaceName - The name of the remote class for which to construct an object.
   * @param args - Serialized arguments to pass to the remote constructor.
   */
  createRemoteObject(interfaceName: string, args: Array<any>): Promise<number> {
    var message: CreateRemoteObjectMessage = {
      protocol: 'service_framework3_rpc',
      type: 'NewObject',
      interface: interfaceName,
      requestId: this._requestIdGenerator(),
      args,
    };
    return this._sendMessageAndListenForResult(message, 'promise', `Creating instance of ${interfaceName}`);
  }

  /**
   * Dispose a remote object. This makes it's proxies unsuable, and calls the `dispose` method on
   * the remote object.
   * @param objectId - The numerical id that identifies the remote object.
   * @returns A Promise that resolves when the object disposal has completed.
   */
  disposeRemoteObject(objectId: number): Promise<void> {
    var message: DisposeRemoteObjectMessage = {
      protocol: 'service_framework3_rpc',
      type: 'DisposeObject',
      requestId: this._requestIdGenerator(),
      objectId,
    };
    return this._sendMessageAndListenForResult(message, 'promise', `Disposing object ${objectId}`);
  }

  /**
   * Helper function that listens for a result for the given requestId.
   * @param returnType - Determines the type of messages we should subscribe to, and what this
   *   function should return.
   * @param requestId - The id of the request who's result we are listening for.
   * @returns Depending on the expected return type, this function either returns undefined, a Promise,
   *   or an Observable.
   */
  _sendMessageAndListenForResult(message: RequestMessage, returnType: ReturnType, timeoutMessage: string): any {
    switch (returnType) {
      case 'void':
        this._socket.send(message);
        return; // No values to return.
      case 'promise':
        // Listen for a single message, and resolve or reject a promise on that message.
        return new Promise((resolve, reject) => {
          this._socket.send(message);
          this._emitter.once(message.requestId.toString(), (hadError, error, result) => {
            hadError ? reject(decodeError(error)) : resolve(result);
          });

          setTimeout(() => {
            this._emitter.removeAllListeners(message.requestId.toString());
            reject(`Timeout after ${SERVICE_FRAMEWORK_RPC_TIMEOUT_MS} for requestId: ${message.requestId}, ${timeoutMessage}.`);
          }, SERVICE_FRAMEWORK_RPC_TIMEOUT_MS);
        });
      case 'observable':
        var observable = Observable.create(observer => {
          this._socket.send(message);

          // Listen for 'next', 'error', and 'completed' events.
          this._emitter.on(
            message.requestId.toString(),
            (hadError: boolean, error: ?Error, result: ?ObservableResult) => {
              if (hadError) {
                observer.onError(decodeError(error));
              } else {
                invariant(result);
                if (result.type === 'completed') {
                  observer.onCompleted();
                } else if (result.type === 'next') {
                  observer.onNext(result.data);
                }
              }
            });

          // Observable dispose function, which is called on subscription dipsose, on stream
          // completion, and on stream error.
          return () => {
            this._emitter.removeAllListeners(message.requestId.toString());

            // Send a message to server to call the dispose function of
            // the remote Observable subscription.
            var disposeMessage: DisposeObservableMessage = {
              protocol: 'service_framework3_rpc',
              type: 'DisposeObservable',
              requestId: message.requestId,
            };
            this._socket.send(disposeMessage);
          };
        });

        return observable;
      default:
        throw new Error(`Unkown return type: ${returnType}.`);
    }
  }
}

// TODO: This should be a custom marshaller registered in the TypeRegistry
function decodeError(encodedError: ?(Object | string)): ?(Error | string) {
  if (encodedError != null && typeof encodedError === 'object') {
    const resultError = new Error();
    resultError.message = encodedError.message;
    // $FlowIssue - some Errors (notably file operations) have a code.
    resultError.code = encodedError.code;
    resultError.stack = encodedError.stack;
    return resultError;
  } else {
    return encodedError;
  }
}
