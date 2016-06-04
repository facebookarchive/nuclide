'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {SERVICE_FRAMEWORK3_PROTOCOL} from './config';
import type {ConfigEntry, Transport} from './index';
import type {ReturnType, Type} from './types';
import type {TypeRegistry} from './TypeRegistry';
import type {
  ResponseMessage,
  RequestMessage,
  DisposeRemoteObjectMessage,
  ObservableResult,
  CallRemoteFunctionMessage,
  CallRemoteMethodMessage,
  CreateRemoteObjectMessage,
} from './messages';
import type {
  ClassDefinition,
  FunctionImplementation,
} from './ServiceRegistry';
import type {TimingTracker} from '../../nuclide-analytics';

import invariant from 'assert';
import {EventEmitter} from 'events';
import {Observable} from 'rxjs';
import {ServiceRegistry} from './ServiceRegistry';
import {ObjectRegistry} from './ObjectRegistry';
import {
  createCallFunctionMessage,
  createCallMethodMessage,
  createNewObjectMessage,
  createDisposeMessage,
  createPromiseMessage,
  createErrorMessage,
  createNextMessage,
  createCompletedMessage,
  decodeError,
} from './messages';
import {builtinLocation, voidType} from './builtin-types';
import {startTracking} from '../../nuclide-analytics';

const logger = require('../../nuclide-logging').getLogger();
const SERVICE_FRAMEWORK_RPC_TIMEOUT_MS = 60 * 1000;

type RpcConnectionKind = 'server' | 'client';

export class RpcConnection<TransportType: Transport> {
  _rpcRequestId: number;
  _emitter: EventEmitter;
  _transport: TransportType;
  _serviceRegistry: ServiceRegistry;
  _objectRegistry: ObjectRegistry;

  // Do not call this directly, use factory methods below.
  constructor(
    kind: RpcConnectionKind,
    serviceRegistry: ServiceRegistry,
    transport: TransportType,
  ) {
    this._emitter = new EventEmitter();
    this._transport = transport;
    this._rpcRequestId = 1;
    this._serviceRegistry = serviceRegistry;
    this._objectRegistry = new ObjectRegistry(kind, this._serviceRegistry, this);
    this._transport.onMessage(message => { this._handleMessage(message); });
  }

  // Creates a connection on the server side.
  static createServer(
    serviceRegistry: ServiceRegistry,
    transport: TransportType,
  ): RpcConnection<TransportType> {
    return new RpcConnection(
      'server',
      serviceRegistry,
      transport);
  }

  // Creates a client side connection to a server on another machine.
  static createRemote(
    hostname: string, transport: TransportType, services: Array<ConfigEntry>,
  ): RpcConnection<TransportType> {
    return new RpcConnection(
      'client',
      ServiceRegistry.createRemote(hostname, services),
      transport);
  }

  // Creates a client side connection to a server on the same machine.
  static createLocal(
    transport: TransportType,
    services: Array<ConfigEntry>,
  ): RpcConnection<TransportType> {
    return new RpcConnection(
      'client',
      ServiceRegistry.createLocal(services),
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
    args: Array<any>,
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
    argTypes: Array<Type>,
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
        protocol: SERVICE_FRAMEWORK3_PROTOCOL,
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
    timeoutMessage: string,
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

  _returnPromise(
    requestId: number,
    timingTracker: TimingTracker,
    candidate: any,
    type: Type,
  ): void {
    let returnVal = candidate;
    // Ensure that the return value is a promise.
    if (!isThenable(returnVal)) {
      returnVal = Promise.reject(
        new Error('Expected a Promise, but the function returned something else.'));
    }

    // Marshal the result, to send over the network.
    invariant(returnVal != null);
    returnVal = returnVal.then(value => this._getTypeRegistry().marshal(
      this._objectRegistry, value, type));

    // Send the result of the promise across the socket.
    returnVal.then(result => {
      this._transport.send(createPromiseMessage(requestId, result));
      timingTracker.onSuccess();
    }, error => {
      this._transport.send(createErrorMessage(requestId, error));
      timingTracker.onError(error == null ? new Error() : error);
    });
  }

  _returnObservable(requestId: number, returnVal: any, elementType: Type): void {
    let result: Observable;
    // Ensure that the return value is an observable.
    if (!isObservable(returnVal)) {
      result = Observable.throw(new Error(
        'Expected an Observable, but the function returned something else.'));
    } else {
      result = returnVal;
    }

    // Marshal the result, to send over the network.
    result = result.concatMap(value => this._getTypeRegistry().marshal(
      this._objectRegistry, value, elementType));

    // Send the next, error, and completion events of the observable across the socket.
    const subscription = result.subscribe(data => {
      this._transport.send(createNextMessage(requestId, data));
    }, error => {
      this._transport.send(createErrorMessage(requestId, error));
      this._objectRegistry.removeSubscription(requestId);
    }, completed => {
      this._transport.send(createCompletedMessage(requestId));
      this._objectRegistry.removeSubscription(requestId);
    });
    this._objectRegistry.addSubscription(requestId, subscription);
  }

  // Returns true if a promise was returned.
  _returnValue(requestId: number, timingTracker: TimingTracker, value: any, type: Type): boolean {
    switch (type.kind) {
      case 'void':
        break; // No need to send anything back to the user.
      case 'promise':
        this._returnPromise(requestId, timingTracker, value, type.type);
        return true;
      case 'observable':
        this._returnObservable(requestId, value, type.type);
        break;
      default:
        throw new Error(`Unkown return type ${type.kind}.`);
    }
    return false;
  }

  async _callFunction(
    requestId: number,
    timingTracker: TimingTracker,
    call: CallRemoteFunctionMessage,
  ): Promise<boolean> {
    const {
      localImplementation,
      type,
    } = this._getFunctionImplemention(call.function);
    const marshalledArgs = await this._getTypeRegistry().unmarshalArguments(
      this._objectRegistry, call.args, type.argumentTypes);

    return this._returnValue(
      requestId,
      timingTracker,
      localImplementation.apply(this, marshalledArgs),
      type.returnType);
  }

  async _callMethod(
    requestId: number,
    timingTracker: TimingTracker,
    call: CallRemoteMethodMessage,
  ): Promise<boolean> {
    const object = this._objectRegistry.unmarshal(call.objectId);
    invariant(object != null);

    const interfaceName = this._objectRegistry.getInterface(call.objectId);
    const classDefinition = this._getClassDefinition(interfaceName);
    invariant(classDefinition != null);
    const type = classDefinition.definition.instanceMethods.get(call.method);
    invariant(type != null);

    const marshalledArgs = await this._getTypeRegistry().unmarshalArguments(
      this._objectRegistry, call.args, type.argumentTypes);

    return this._returnValue(
      requestId,
      timingTracker,
      object[call.method].apply(object, marshalledArgs),
      type.returnType);
  }

  async _callConstructor(
    requestId: number,
    timingTracker: TimingTracker,
    constructorMessage: CreateRemoteObjectMessage,
  ): Promise<void> {
    const classDefinition = this._getClassDefinition(constructorMessage.interface);
    invariant(classDefinition != null);
    const {
      localImplementation,
      definition,
    } = classDefinition;
    const constructorArgs = definition.constructorArgs;
    invariant(constructorArgs != null);

    const marshalledArgs = await this._getTypeRegistry().unmarshalArguments(
      this._objectRegistry, constructorMessage.args, constructorArgs);

    // Create a new object and put it in the registry.
    const newObject = construct(localImplementation, marshalledArgs);

    // Return the object, which will automatically be converted to an id through the
    // marshalling system.
    this._returnPromise(
      requestId,
      timingTracker,
      Promise.resolve(newObject),
      {
        kind: 'named',
        name: constructorMessage.interface,
        location: builtinLocation,
      });
  }

  getTransport(): TransportType {
    return this._transport;
  }

  _handleMessage(message: RequestMessage | ResponseMessage): void {
    // TODO: advinsky uncomment after version 0.136 and below are phased out
    // invariant(message.protocol === SERVICE_FRAMEWORK3_PROTOCOL);

    switch (message.type) {
      case 'PromiseMessage':
      case 'ObservableMessage':
      case 'ErrorMessage':
        this._handleResponseMessage(message);
        break;
      case 'FunctionCall':
      case 'MethodCall':
      case 'NewObject':
      case 'DisposeObject':
      case 'DisposeObservable':
        this._handleRequestMessage(message);
        break;
      default:
        throw new Error('Unexpected message type');
    }
  }

  _handleResponseMessage(message: ResponseMessage): void {
    const requestId = message.requestId;
    switch (message.type) {
      case 'PromiseMessage': {
        const {result} = message;
        this._emitter.emit(requestId.toString(), false, null, result);
        break;
      }
      case 'ObservableMessage': {
        const {result} = message;
        this._emitter.emit(requestId.toString(), false, null, result);
        break;
      }
      case 'ErrorMessage': {
        const {error} = message;
        this._emitter.emit(requestId.toString(), true, error, undefined);
        break;
      }
      default:
        throw new Error(`Unexpected message type ${JSON.stringify(message)}`);
    }
  }

  async _handleRequestMessage(message: RequestMessage): Promise<void> {
    const requestId = message.requestId;

    // Track timings of all function calls, method calls, and object creations.
    // Note: for Observables we only track how long it takes to create the initial Observable.
    // while for Promises we track the length of time it takes to resolve or reject.
    // For returning void, we track the time for the call to complete.
    const timingTracker: TimingTracker
      = startTracking(trackingIdOfMessage(this._objectRegistry, message));

    // Here's the main message handler ...
    try {
      let returnedPromise = false;
      switch (message.type) {
        case 'FunctionCall':
          returnedPromise = await this._callFunction(requestId, timingTracker, message);
          break;
        case 'MethodCall':
          returnedPromise = await this._callMethod(requestId, timingTracker, message);
          break;
        case 'NewObject':
          await this._callConstructor(requestId, timingTracker, message);
          returnedPromise = true;
          break;
        case 'DisposeObject':
          await this._objectRegistry.disposeObject(message.objectId);
          this._returnPromise(requestId, timingTracker, Promise.resolve(), voidType);
          returnedPromise = true;
          break;
        case 'DisposeObservable':
          this._objectRegistry.disposeSubscription(requestId);
          break;
        default:
          throw new Error(`Unkown message type ${message.type}`);
      }
      if (!returnedPromise) {
        timingTracker.onSuccess();
      }
    } catch (e) {
      logger.error(e != null ? e.message : e);
      timingTracker.onError(e == null ? new Error() : e);
      this._transport.send(createErrorMessage(requestId, e));
    }
  }

  _getFunctionImplemention(name: string): FunctionImplementation {
    return this._serviceRegistry.getFunctionImplemention(name);
  }

  _getClassDefinition(className: string): ClassDefinition {
    return this._serviceRegistry.getClassDefinition(className);
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

function trackingIdOfMessage(registry: ObjectRegistry, message: RequestMessage): string {
  switch (message.type) {
    case 'FunctionCall':
      return `service-framework:${message.function}`;
    case 'MethodCall':
      const callInterface = registry.getInterface(message.objectId);
      return `service-framework:${callInterface}.${message.method}`;
    case 'NewObject':
      return `service-framework:new:${message.interface}`;
    case 'DisposeObject':
      const interfaceName = registry.getInterface(message.objectId);
      return `service-framework:dispose:${interfaceName}`;
    case 'DisposeObservable':
      return 'service-framework:disposeObservable';
    default:
      throw new Error(`Unknown message type ${message.type}`);
  }
}

/**
 * A helper function that let's us 'apply' an array of arguments to a constructor.
 * It works by creating a new constructor that has the same prototype as the original
 * constructor, and simply applies the original constructor directly to 'this'.
 * @returns An instance of classObject.
 */
function construct(classObject, args) {
  function F() {
    return classObject.apply(this, args);
  }
  F.prototype = classObject.prototype;
  return new F();
}

/**
 * A helper function that checks if an object is thenable (Promise-like).
 */
function isThenable(object: any): boolean {
  return Boolean(object && object.then);
}

/**
 * A helper function that checks if an object is an Observable.
 */
function isObservable(object: any): boolean {
  return Boolean(object && object.concatMap && object.subscribe);
}
