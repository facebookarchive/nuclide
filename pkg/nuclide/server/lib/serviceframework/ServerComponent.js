'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Disposable, Observable} from 'rx';
import {getDefinitions} from 'nuclide-service-parser';
import {loadServicesConfig} from './config';
import NuclideServer from '../NuclideServer';
import TypeRegistry from 'nuclide-service-parser/lib/TypeRegistry';

import type {RequestMessage, ErrorResponseMessage, PromiseResponseMessage,
  ObservableResponseMessage} from './types';
import type {SocketClient} from '../NuclideServer';

var logger = require('nuclide-logging').getLogger();

export default class ServerComponent {
  _typeRegistry: TypeRegistry;

  /**
   * Store a mapping from function name to a structure holding both the local implementation and
   * the type definition of the function.
   */
  _functionsByName: Map<string, {localImplementation: Function; type: FunctionType}>;

  /**
   * Store a mapping from a class name to a struct containing it's local constructor and it's
   * interface definition.
   */
  _classesByName: Map<string, {localImplementation: any; definition: InterfaceDefinition}>;

  _objectRegistry: Map<number, any>;
  _nextObjectId: number;

  _subscriptions: Map<number, Disposable>;

  _server: NuclideServer;

  constructor(server: NuclideServer) {
    this._server = server;

    this._typeRegistry = new TypeRegistry();
    this._functionsByName = new Map();
    this._classesByName = new Map();

    this._nextObjectId = 1;
    this._objectRegistry = new Map();

    this._subscriptions = new Map();

    // NuclideUri type requires no transformations (it is done on the client side).
    this._typeRegistry.registerType('NuclideUri', uri => uri, remotePath => remotePath);

    var services = loadServicesConfig();
    for (var service of services) {
      logger.info(`Registering 3.0 service ${service.name}...`);
      try {
        var defs = getDefinitions(service.definition);
        var localImpl = require(service.implementation);

        // Register type aliases.
        defs.aliases.forEach((type, name) => {
          logger.info(`Registering type alias ${name}...`);
          this._typeRegistry.registerAlias(name, type);
        });

        // Register module-level functions.
        defs.functions.forEach((type, name) => {
          logger.info(`Registering function ${name}...`);
          this._functionsByName.set(name,  {
            localImplementation: localImpl[name],
            type: type,
          });
        });

        // Register interfaces.
        defs.interfaces.forEach((def, name) => {
          logger.info(`Registering interface ${name}...`);
          this._classesByName.set(name,  {
            localImplementation: localImpl[name],
            definition: def,
          });

          this._typeRegistry.registerType(name, async object => {
            // If the object has already been assigned an id, return that id.
            if (object._remoteId) {
              return object._remoteId;
            }

            // Put the object in the registry.
            object._interface = name;
            var objectId = this._nextObjectId;
            this._objectRegistry.set(objectId, object);
            object._remoteId = objectId;
            this._nextObjectId++;

            return objectId;
          }, async objectId => this._objectRegistry.get(objectId));

          // Register all of the static methods as remote functions.
          def.staticMethods.forEach((funcType, funcName) => {
            logger.info(`Registering function ${name}/${funcName}...`);
            this._functionsByName.set(`${name}/${funcName}`,  {
              localImplementation: localImpl[name][funcName],
              type: funcType,
            });
          });
        });
      } catch(e) {
        logger.error(`Failed to load service ${service.name}. Stack Trace:\n${e.stack}`);
        continue;
      }
    }
  }

  async handleMessage(client: SocketClient, message: RequestMessage): Promise<void> {
    var requestId = message.requestId;

    var returnVal: ?Promise = null;
    var returnType: PromiseType | ObservableType | VoidType = { kind: 'void' };

    try {
      switch (message.type) {
        case 'FunctionCall':
          // Transform arguments and call function.
          var {localImplementation, type} = this._functionsByName.get(message.function);
          var transfomedArgs = await Promise.all(
            message.args.map((arg, i) => this._typeRegistry.unmarshal(arg, type.argumentTypes[i]))
          );

          // Invoke function and return the results.
          returnVal = localImplementation.apply(this, transfomedArgs);
          returnType = type.returnType;
          break;
        case 'MethodCall':
          // Get the object.
          var object = this._objectRegistry.get(message.objectId);

          // Get the method FunctionType description.
          var type: FunctionType = this._classesByName.get(object._interface)
            .definition.instanceMethods.get(message.method);

          // Unmarshal arguments.
          var transfomedArgs = await Promise.all(
            message.args.map((arg, i) => this._typeRegistry.unmarshal(arg, type.argumentTypes[i]))
          );

          // Invoke message.
          returnVal = object[message.method].apply(object, transfomedArgs);
          returnType = type.returnType;
          break;
        case 'NewObject':
          var {localImplementation, definition} = this._classesByName.get(message.interface);

          // Transform arguments.
          var transfomedArgs = await Promise.all(message.args.map((arg, i) =>
            this._typeRegistry.unmarshal(arg, definition.constructorArgs[i])));

          // Create a new object and put it in the registry.
          var object = construct(localImplementation, transfomedArgs);

          // Return the object, which will automatically be converted to an id through the
          // marshalling system.
          returnVal = Promise.resolve(object);
          returnType = {kind: 'promise', type: { kind: 'named', name: message.interface }};
          break;
        case 'DisposeObject':
          // Get the object.
          var object = this._objectRegistry.get(message.objectId);

          // Remove the object from the registry, and scrub it's id.
          object._remoteId = undefined;
          this._objectRegistry.delete(message.objectId);

          // Call the object's local dispose function.
          await object.dispose();

          // Return a void Promise
          returnVal = Promise.resolve();
          returnType = {kind: 'promise', type: { kind: 'void'}};
          break;
        case 'DisposeObservable':
          // Dispose an in-progress observable, before it has naturally completed.
          if (this._subscriptions.has(requestId)) {
            this._subscriptions.get(requestId).dispose();
            this._subscriptions.delete(requestId);
          }
          break;
        default:
          throw new Error(`Unkown message type ${message.type}`);
      }
    } catch (e) {
      logger.error(e.message);
      var callError = e;
    }

    switch (returnType.kind) {
      case 'void':
        break; // No need to send anything back to the user.
      case 'promise':
        // If there was an error executing the command, we send that back as a rejected promise.
        if (callError != null) {
          returnVal = Promise.reject(callError);
        }

        // Ensure that the return value is a promise.
        if (!isThenable(returnVal)) {
          returnVal = Promise.reject(new Error('Expected a Promise, but the function returned something else.'));
        }

        // Marshal the result, to send over the network.
        returnVal = returnVal.then(value => this._typeRegistry.marshal(value, returnType.type));

        // Send the result of the promise across the socket.
        returnVal.then(result => {
          var resultMessage: PromiseResponseMessage = {
            channel: 'service_framework3_rpc',
            type: 'PromiseMessage',
            requestId,
            result,
          };
          this._server._sendSocketMessage(client, resultMessage);
        }, error => {
          var errorMessage: ErrorResponseMessage = {
            channel: 'service_framework3_rpc',
            type: 'ErrorMessage',
            requestId,
            error: formatError(error),
          };
          this._server._sendSocketMessage(client, errorMessage);
        });
        break;
      case 'observable':
        // If there was an error executing the command, we send that back as an error Observable.
        if (callError != null) {
          returnVal = Observable.throw(callError);
        }

        // Ensure that the return value is an observable.
        if (!isObservable(returnVal)) {
          returnVal = Observable.throw(new Error(
            'Expected an Observable, but the function returned something else.'));
        }

        // Marshal the result, to send over the network.
        returnVal = returnVal.concatMap(value => this._typeRegistry.marshal(value, returnType.type));

        // Send the next, error, and completion events of the observable across the socket.
        var subscription = returnVal.subscribe(data => {
          var eventMessage: ObservableResponseMessage = {
            channel: 'service_framework3_rpc',
            type: 'ObservableMessage',
            requestId,
            result: {
              type: 'next',
              data: data,
            },
          };
          this._server._sendSocketMessage(client, eventMessage);
        }, error => {
          var errorMessage: ErrorResponseMessage = {
            channel: 'service_framework3_rpc',
            type: 'ErrorMessage',
            requestId,
            error: formatError(error),
          };
          this._server._sendSocketMessage(client, errorMessage);
          this._subscriptions.delete(requestId);
        }, completed => {
          var eventMessage: ObservableResponseMessage = {
            channel: 'service_framework3_rpc',
            type: 'ObservableMessage',
            requestId,
            result: { type: 'completed' },
          };
          this._server._sendSocketMessage(client, eventMessage);
          this._subscriptions.delete(requestId);
        });
        this._subscriptions.set(requestId, subscription);
        break;
      default:
        throw new Error(`Unkown return type ${returnType.kind}.`);
    }
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

/**
 * Format the error before sending over the web socket.
 */
function formatError(error): string {
  if (error) {
    return error.stack || error.toString();
  } else {
    return 'Undefined Error.';
  }
}
