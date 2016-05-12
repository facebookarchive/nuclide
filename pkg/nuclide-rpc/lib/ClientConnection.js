'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Transport} from './index';
import type {Type} from './types';
import type {
  ClassDefinition,
  FunctionImplementation,
  ServiceRegistry,
} from './ServiceRegistry';
import type {TypeRegistry} from './TypeRegistry';

import {Observable} from 'rxjs';
import {builtinLocation, voidType} from './builtin-types';
import {startTracking} from '../../nuclide-analytics';
import type {TimingTracker} from '../../nuclide-analytics';
import type {
  RequestMessage,
  CallRemoteFunctionMessage,
  CallRemoteMethodMessage,
  CreateRemoteObjectMessage,
} from './messages';
import {
  createPromiseMessage,
  createErrorMessage,
  createNextMessage,
  createCompletedMessage,
} from './messages';

import {SERVICE_FRAMEWORK3_CHANNEL} from './config';
import invariant from 'assert';

import {ObjectRegistry} from './ObjectRegistry';

const logger = require('../../nuclide-logging').getLogger();

// Per-Client state on the Server for the RPC framework
export class ClientConnection<TransportType: Transport> {
  _serviceRegistry: ServiceRegistry;
  _objectRegistry: ObjectRegistry;
  _transport: TransportType;

  constructor(
      serviceRegistry: ServiceRegistry,
      transport: TransportType) {
    this._objectRegistry = new ObjectRegistry('server', serviceRegistry, (this: any));
    this._serviceRegistry = serviceRegistry;
    this._transport = transport;
    transport.onMessage(message => {
      this._handleMessage(message);
    });
  }

  _returnPromise(
    requestId: number,
    timingTracker: TimingTracker,
    candidate: any,
    type: Type
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
    call: CallRemoteFunctionMessage
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
    call: CallRemoteMethodMessage
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
    constructorMessage: CreateRemoteObjectMessage
  ): Promise<void> {
    const classDefinition = this._getClassDefinition(constructorMessage.interface);
    invariant(classDefinition != null);
    const {
      localImplementation,
      definition,
    } = classDefinition;

    const marshalledArgs = await this._getTypeRegistry().unmarshalArguments(
      this._objectRegistry, constructorMessage.args, definition.constructorArgs);

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

  async _handleMessage(message: RequestMessage): Promise<void> {
    invariant(message.protocol && message.protocol === SERVICE_FRAMEWORK3_CHANNEL);

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

  _getTypeRegistry(): TypeRegistry {
    return this._serviceRegistry.getTypeRegistry();
  }

  _getFunctionImplemention(name: string): FunctionImplementation {
    return this._serviceRegistry.getFunctionImplemention(name);
  }

  _getClassDefinition(className: string): ClassDefinition {
    return this._serviceRegistry.getClassDefinition(className);
  }

  getMarshallingContext(): ObjectRegistry {
    return this._objectRegistry;
  }

  getTransport(): TransportType {
    return this._transport;
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
