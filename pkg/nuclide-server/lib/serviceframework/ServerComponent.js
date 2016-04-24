'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Observable} from 'rxjs';
import {getDefinitions} from '../../../nuclide-service-parser';
import TypeRegistry from '../../../nuclide-service-parser/lib/TypeRegistry';
import {builtinLocation, voidType} from '../../../nuclide-service-parser/lib/builtin-types';
import {startTracking} from '../../../nuclide-analytics';
import type {TimingTracker} from '../../../nuclide-analytics';
import type {
  FunctionType,
  Definition,
  InterfaceDefinition,
  Type,
} from '../../../nuclide-service-parser/lib/types';
import invariant from 'assert';
import type {ConfigEntry} from './index';
import type {ObjectRegistry} from './ObjectRegistry';

import type {
  RequestMessage,
  ErrorResponseMessage,
  PromiseResponseMessage,
  ObservableResponseMessage,
  CallRemoteFunctionMessage,
  CallRemoteMethodMessage,
  CreateRemoteObjectMessage,
} from './types';
import type {SocketClient} from '../SocketClient';

const logger = require('../../../nuclide-logging').getLogger();

type FunctionImplementation = {localImplementation: Function; type: FunctionType};

export default class ServerComponent {
  _typeRegistry: TypeRegistry<ObjectRegistry>;

  /**
   * Store a mapping from function name to a structure holding both the local implementation and
   * the type definition of the function.
   */
  _functionsByName: Map<string, FunctionImplementation>;

  /**
   * Store a mapping from a class name to a struct containing it's local constructor and it's
   * interface definition.
   */
  _classesByName: Map<string, {localImplementation: any; definition: InterfaceDefinition}>;

  constructor(services: Array<ConfigEntry>) {
    this._typeRegistry = new TypeRegistry();
    this._functionsByName = new Map();
    this._classesByName = new Map();

    // NuclideUri type requires no transformations (it is done on the client side).
    this._typeRegistry.registerType('NuclideUri', uri => uri, remotePath => remotePath);

    this.addServices(services);
  }

  addServices(services: Array<ConfigEntry>): void {
    services.forEach(this.addService, this);
  }

  addService(service: ConfigEntry): void {
    logger.debug(`Registering 3.0 service ${service.name}...`);
    try {
      const defs = getDefinitions(service.definition);
      // $FlowIssue - the parameter passed to require must be a literal string.
      const localImpl = require(service.implementation);

      // Register type aliases.
      defs.forEach((definition: Definition) => {
        const name = definition.name;
        switch (definition.kind) {
          case 'alias':
            logger.debug(`Registering type alias ${name}...`);
            if (definition.definition != null) {
              this._typeRegistry.registerAlias(name, (definition.definition: Type));
            }
            break;
          case 'function':
            // Register module-level functions.
            this._registerFunction(`${service.name}/${name}`, localImpl[name], definition.type);
            break;
          case 'interface':
            // Register interfaces.
            logger.debug(`Registering interface ${name}...`);
            this._classesByName.set(name,  {
              localImplementation: localImpl[name],
              definition,
            });

            this._typeRegistry.registerType(name, (object, context: ObjectRegistry) => {
              return context.add(name, object);
            }, (objectId, context: ObjectRegistry) => context.get(objectId));

            // Register all of the static methods as remote functions.
            definition.staticMethods.forEach((funcType, funcName) => {
              this._registerFunction(`${name}/${funcName}`, localImpl[name][funcName], funcType);
            });
            break;
        }
      });

    } catch (e) {
      logger.error(`Failed to load service ${service.name}. Stack Trace:\n${e.stack}`);
      throw e;
    }
  }

  _registerFunction(name: string, localImpl: Function, type: FunctionType): void {
    logger.debug(`Registering function ${name}...`);
    if (this._functionsByName.has(name)) {
      throw new Error(`Duplicate RPC function: ${name}`);
    }
    this._functionsByName.set(name,  {
      localImplementation: localImpl,
      type,
    });
  }

  async handleMessage(client: SocketClient, message: RequestMessage): Promise<void> {
    const requestId = message.requestId;
    const marshallingContext = client.getMarshallingContext();

    // Track timings of all function calls, method calls, and object creations.
    // Note: for Observables we only track how long it takes to create the initial Observable.
    // while for Promises we track the length of time it takes to resolve or reject.
    // For returning void, we track the time for the call to complete.
    const timingTracker: TimingTracker
      = startTracking(trackingIdOfMessage(marshallingContext, message));

    const returnPromise = (candidate: any, type: Type) => {
      let returnVal = candidate;
      // Ensure that the return value is a promise.
      if (!isThenable(returnVal)) {
        returnVal = Promise.reject(
          new Error('Expected a Promise, but the function returned something else.'));
      }

      // Marshal the result, to send over the network.
      invariant(returnVal != null);
      returnVal = returnVal.then(value => this._typeRegistry.marshal(
        marshallingContext, value, type));

      // Send the result of the promise across the socket.
      returnVal.then(result => {
        client.sendSocketMessage(createPromiseMessage(requestId, result));
        timingTracker.onSuccess();
      }, error => {
        client.sendSocketMessage(createErrorMessage(requestId, error));
        timingTracker.onError(error == null ? new Error() : error);
      });
    };

    const returnObservable = (returnVal: any, elementType: Type) => {
      let result: Observable;
      // Ensure that the return value is an observable.
      if (!isObservable(returnVal)) {
        result = Observable.throw(new Error(
          'Expected an Observable, but the function returned something else.'));
      } else {
        result = returnVal;
      }

      // Marshal the result, to send over the network.
      result = result.concatMap(value => this._typeRegistry.marshal(
        marshallingContext, value, elementType));

      // Send the next, error, and completion events of the observable across the socket.
      const subscription = result.subscribe(data => {
        client.sendSocketMessage(createNextMessage(requestId, data));
      }, error => {
        client.sendSocketMessage(createErrorMessage(requestId, error));
        marshallingContext.removeSubscription(requestId);
      }, completed => {
        client.sendSocketMessage(createCompletedMessage(requestId));
        marshallingContext.removeSubscription(requestId);
      });
      marshallingContext.addSubscription(requestId, subscription);
    };

    // Returns true if a promise was returned.
    const returnValue = (value: any, type: Type) => {
      switch (type.kind) {
        case 'void':
          break; // No need to send anything back to the user.
        case 'promise':
          returnPromise(value, type.type);
          return true;
        case 'observable':
          returnObservable(value, type.type);
          break;
        default:
          throw new Error(`Unkown return type ${type.kind}.`);
      }
      return false;
    };

    const callFunction = async (call: CallRemoteFunctionMessage) => {
      const {
        localImplementation,
        type,
      } = this._getFunctionImplemention(call.function);
      const marshalledArgs = await this._typeRegistry.unmarshalArguments(
        marshallingContext, call.args, type.argumentTypes);

      return returnValue(
        localImplementation.apply(client, marshalledArgs),
        type.returnType);
    };

    const callMethod = async (call: CallRemoteMethodMessage) => {
      const object = marshallingContext.get(call.objectId);
      invariant(object != null);

      const interfaceName = marshallingContext.getInterface(call.objectId);
      const classDefinition = this._classesByName.get(interfaceName);
      invariant(classDefinition != null);
      const type = classDefinition.definition.instanceMethods.get(call.method);
      invariant(type != null);

      const marshalledArgs = await this._typeRegistry.unmarshalArguments(
        marshallingContext, call.args, type.argumentTypes);

      return returnValue(
        object[call.method].apply(object, marshalledArgs),
        type.returnType);
    };

    const callConstructor = async (constructorMessage: CreateRemoteObjectMessage) => {
      const classDefinition = this._classesByName.get(constructorMessage.interface);
      invariant(classDefinition != null);
      const {
        localImplementation,
        definition,
      } = classDefinition;

      const marshalledArgs = await this._typeRegistry.unmarshalArguments(
        marshallingContext, constructorMessage.args, definition.constructorArgs);

      // Create a new object and put it in the registry.
      const newObject = construct(localImplementation, marshalledArgs);

      // Return the object, which will automatically be converted to an id through the
      // marshalling system.
      returnPromise(
        Promise.resolve(newObject),
        {
          kind: 'named',
          name: constructorMessage.interface,
          location: builtinLocation,
        });
    };

    // Here's the main message handler ...
    try {
      let returnedPromise = false;
      switch (message.type) {
        case 'FunctionCall':
          returnedPromise = await callFunction(message);
          break;
        case 'MethodCall':
          returnedPromise = await callMethod(message);
          break;
        case 'NewObject':
          await callConstructor(message);
          returnedPromise = true;
          break;
        case 'DisposeObject':
          await marshallingContext.disposeObject(message.objectId);
          returnPromise(Promise.resolve(), voidType);
          returnedPromise = true;
          break;
        case 'DisposeObservable':
          marshallingContext.disposeSubscription(requestId);
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
      client.sendSocketMessage(createErrorMessage(requestId, e));
    }
  }

  _getFunctionImplemention(name: string): FunctionImplementation {
    const result = this._functionsByName.get(name);
    invariant(result);
    return result;
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
      return `service-framework:disposeObservable`;
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

function createPromiseMessage(requestId: number, result: any): PromiseResponseMessage {
  return {
    channel: 'service_framework3_rpc',
    type: 'PromiseMessage',
    requestId,
    result,
    hadError: false,
  };
}

function createNextMessage(requestId: number, data: any): ObservableResponseMessage {
  return {
    channel: 'service_framework3_rpc',
    type: 'ObservableMessage',
    requestId,
    hadError: false,
    result: {
      type: 'next',
      data: data,
    },
  };
}

function createCompletedMessage(requestId: number): ObservableResponseMessage {
  return {
    channel: 'service_framework3_rpc',
    type: 'ObservableMessage',
    requestId,
    hadError: false,
    result: { type: 'completed' },
  };
}

function createErrorMessage(requestId: number, error: any): ErrorResponseMessage {
  return {
    channel: 'service_framework3_rpc',
    type: 'ErrorMessage',
    requestId,
    hadError: true,
    error: formatError(error),
  };
}

/**
 * Format the error before sending over the web socket.
 * TODO: This should be a custom marshaller registered in the TypeRegistry
 */
function formatError(error: any): ?(Object | string) {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.code,
      stack: error.stack,
    };
  } else if (typeof error === 'string') {
    return error.toString();
  } else if (error === undefined) {
    return undefined;
  } else {
    try {
      return `Unknown Error: ${JSON.stringify(error, null, 2)}`;
    } catch (jsonError) {
      return `Unknown Error: ${error.toString()}`;
    }
  }
}
