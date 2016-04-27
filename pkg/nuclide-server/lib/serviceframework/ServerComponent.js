Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rxjs = require('rxjs');

var _nuclideServiceParser = require('../../../nuclide-service-parser');

var _nuclideServiceParserLibTypeRegistry = require('../../../nuclide-service-parser/lib/TypeRegistry');

var _nuclideServiceParserLibTypeRegistry2 = _interopRequireDefault(_nuclideServiceParserLibTypeRegistry);

var _nuclideServiceParserLibBuiltinTypes = require('../../../nuclide-service-parser/lib/builtin-types');

var _nuclideAnalytics = require('../../../nuclide-analytics');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var logger = require('../../../nuclide-logging').getLogger();

var ServerComponent = (function () {
  function ServerComponent(services) {
    _classCallCheck(this, ServerComponent);

    this._typeRegistry = new _nuclideServiceParserLibTypeRegistry2['default']();
    this._functionsByName = new Map();
    this._classesByName = new Map();

    // NuclideUri type requires no transformations (it is done on the client side).
    this._typeRegistry.registerType('NuclideUri', function (uri) {
      return uri;
    }, function (remotePath) {
      return remotePath;
    });

    this.addServices(services);
  }

  _createClass(ServerComponent, [{
    key: 'addServices',
    value: function addServices(services) {
      services.forEach(this.addService, this);
    }
  }, {
    key: 'addService',
    value: function addService(service) {
      var _this = this;

      logger.debug('Registering 3.0 service ' + service.name + '...');
      try {
        (function () {
          var defs = (0, _nuclideServiceParser.getDefinitions)(service.definition);
          // $FlowIssue - the parameter passed to require must be a literal string.
          var localImpl = require(service.implementation);
          // TODO: Remove the any cast once we have bi-directional marshalling.
          var proxy = (0, _nuclideServiceParser.getProxy)(service.name, service.definition, _this);

          // Register type aliases.
          defs.forEach(function (definition) {
            var name = definition.name;
            switch (definition.kind) {
              case 'alias':
                logger.debug('Registering type alias ' + name + '...');
                if (definition.definition != null) {
                  _this._typeRegistry.registerAlias(name, definition.definition);
                }
                break;
              case 'function':
                // Register module-level functions.
                _this._registerFunction(service.name + '/' + name, localImpl[name], definition.type);
                break;
              case 'interface':
                // Register interfaces.
                logger.debug('Registering interface ' + name + '...');
                _this._classesByName.set(name, {
                  localImplementation: localImpl[name],
                  definition: definition
                });

                _this._typeRegistry.registerType(name, function (object, context) {
                  return context.marshal(name, object);
                }, function (objectId, context) {
                  return context.unmarshal(objectId, proxy[name]);
                });

                // Register all of the static methods as remote functions.
                definition.staticMethods.forEach(function (funcType, funcName) {
                  _this._registerFunction(name + '/' + funcName, localImpl[name][funcName], funcType);
                });
                break;
            }
          });
        })();
      } catch (e) {
        logger.error('Failed to load service ' + service.name + '. Stack Trace:\n' + e.stack);
        throw e;
      }
    }
  }, {
    key: '_registerFunction',
    value: function _registerFunction(name, localImpl, type) {
      logger.debug('Registering function ' + name + '...');
      if (this._functionsByName.has(name)) {
        throw new Error('Duplicate RPC function: ' + name);
      }
      this._functionsByName.set(name, {
        localImplementation: localImpl,
        type: type
      });
    }
  }, {
    key: 'handleMessage',
    value: _asyncToGenerator(function* (client, message) {
      var _this2 = this;

      var requestId = message.requestId;
      var marshallingContext = client.getMarshallingContext();

      // Track timings of all function calls, method calls, and object creations.
      // Note: for Observables we only track how long it takes to create the initial Observable.
      // while for Promises we track the length of time it takes to resolve or reject.
      // For returning void, we track the time for the call to complete.
      var timingTracker = (0, _nuclideAnalytics.startTracking)(trackingIdOfMessage(marshallingContext, message));

      var returnPromise = function returnPromise(candidate, type) {
        var returnVal = candidate;
        // Ensure that the return value is a promise.
        if (!isThenable(returnVal)) {
          returnVal = Promise.reject(new Error('Expected a Promise, but the function returned something else.'));
        }

        // Marshal the result, to send over the network.
        (0, _assert2['default'])(returnVal != null);
        returnVal = returnVal.then(function (value) {
          return _this2._typeRegistry.marshal(marshallingContext, value, type);
        });

        // Send the result of the promise across the socket.
        returnVal.then(function (result) {
          client.sendSocketMessage(createPromiseMessage(requestId, result));
          timingTracker.onSuccess();
        }, function (error) {
          client.sendSocketMessage(createErrorMessage(requestId, error));
          timingTracker.onError(error == null ? new Error() : error);
        });
      };

      var returnObservable = function returnObservable(returnVal, elementType) {
        var result = undefined;
        // Ensure that the return value is an observable.
        if (!isObservable(returnVal)) {
          result = _rxjs.Observable['throw'](new Error('Expected an Observable, but the function returned something else.'));
        } else {
          result = returnVal;
        }

        // Marshal the result, to send over the network.
        result = result.concatMap(function (value) {
          return _this2._typeRegistry.marshal(marshallingContext, value, elementType);
        });

        // Send the next, error, and completion events of the observable across the socket.
        var subscription = result.subscribe(function (data) {
          client.sendSocketMessage(createNextMessage(requestId, data));
        }, function (error) {
          client.sendSocketMessage(createErrorMessage(requestId, error));
          marshallingContext.removeSubscription(requestId);
        }, function (completed) {
          client.sendSocketMessage(createCompletedMessage(requestId));
          marshallingContext.removeSubscription(requestId);
        });
        marshallingContext.addSubscription(requestId, subscription);
      };

      // Returns true if a promise was returned.
      var returnValue = function returnValue(value, type) {
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
            throw new Error('Unkown return type ' + type.kind + '.');
        }
        return false;
      };

      var callFunction = _asyncToGenerator(function* (call) {
        var _getFunctionImplemention2 = _this2._getFunctionImplemention(call['function']);

        var localImplementation = _getFunctionImplemention2.localImplementation;
        var type = _getFunctionImplemention2.type;

        var marshalledArgs = yield _this2._typeRegistry.unmarshalArguments(marshallingContext, call.args, type.argumentTypes);

        return returnValue(localImplementation.apply(client, marshalledArgs), type.returnType);
      });

      var callMethod = _asyncToGenerator(function* (call) {
        var object = marshallingContext.unmarshal(call.objectId);
        (0, _assert2['default'])(object != null);

        var interfaceName = marshallingContext.getInterface(call.objectId);
        var classDefinition = _this2._classesByName.get(interfaceName);
        (0, _assert2['default'])(classDefinition != null);
        var type = classDefinition.definition.instanceMethods.get(call.method);
        (0, _assert2['default'])(type != null);

        var marshalledArgs = yield _this2._typeRegistry.unmarshalArguments(marshallingContext, call.args, type.argumentTypes);

        return returnValue(object[call.method].apply(object, marshalledArgs), type.returnType);
      });

      var callConstructor = _asyncToGenerator(function* (constructorMessage) {
        var classDefinition = _this2._classesByName.get(constructorMessage['interface']);
        (0, _assert2['default'])(classDefinition != null);
        var localImplementation = classDefinition.localImplementation;
        var definition = classDefinition.definition;

        var marshalledArgs = yield _this2._typeRegistry.unmarshalArguments(marshallingContext, constructorMessage.args, definition.constructorArgs);

        // Create a new object and put it in the registry.
        var newObject = construct(localImplementation, marshalledArgs);

        // Return the object, which will automatically be converted to an id through the
        // marshalling system.
        returnPromise(Promise.resolve(newObject), {
          kind: 'named',
          name: constructorMessage['interface'],
          location: _nuclideServiceParserLibBuiltinTypes.builtinLocation
        });
      });

      // Here's the main message handler ...
      try {
        var returnedPromise = false;
        switch (message.type) {
          case 'FunctionCall':
            returnedPromise = yield callFunction(message);
            break;
          case 'MethodCall':
            returnedPromise = yield callMethod(message);
            break;
          case 'NewObject':
            yield callConstructor(message);
            returnedPromise = true;
            break;
          case 'DisposeObject':
            yield marshallingContext.disposeObject(message.objectId);
            returnPromise(Promise.resolve(), _nuclideServiceParserLibBuiltinTypes.voidType);
            returnedPromise = true;
            break;
          case 'DisposeObservable':
            marshallingContext.disposeSubscription(requestId);
            break;
          default:
            throw new Error('Unkown message type ' + message.type);
        }
        if (!returnedPromise) {
          timingTracker.onSuccess();
        }
      } catch (e) {
        logger.error(e != null ? e.message : e);
        timingTracker.onError(e == null ? new Error() : e);
        client.sendSocketMessage(createErrorMessage(requestId, e));
      }
    })
  }, {
    key: '_getFunctionImplemention',
    value: function _getFunctionImplemention(name) {
      var result = this._functionsByName.get(name);
      (0, _assert2['default'])(result);
      return result;
    }
  }]);

  return ServerComponent;
})();

exports['default'] = ServerComponent;

function trackingIdOfMessage(registry, message) {
  switch (message.type) {
    case 'FunctionCall':
      return 'service-framework:' + message['function'];
    case 'MethodCall':
      var callInterface = registry.getInterface(message.objectId);
      return 'service-framework:' + callInterface + '.' + message.method;
    case 'NewObject':
      return 'service-framework:new:' + message['interface'];
    case 'DisposeObject':
      var interfaceName = registry.getInterface(message.objectId);
      return 'service-framework:dispose:' + interfaceName;
    case 'DisposeObservable':
      return 'service-framework:disposeObservable';
    default:
      throw new Error('Unknown message type ' + message.type);
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
function isThenable(object) {
  return Boolean(object && object.then);
}

/**
 * A helper function that checks if an object is an Observable.
 */
function isObservable(object) {
  return Boolean(object && object.concatMap && object.subscribe);
}

function createPromiseMessage(requestId, result) {
  return {
    channel: 'service_framework3_rpc',
    type: 'PromiseMessage',
    requestId: requestId,
    result: result,
    hadError: false
  };
}

function createNextMessage(requestId, data) {
  return {
    channel: 'service_framework3_rpc',
    type: 'ObservableMessage',
    requestId: requestId,
    hadError: false,
    result: {
      type: 'next',
      data: data
    }
  };
}

function createCompletedMessage(requestId) {
  return {
    channel: 'service_framework3_rpc',
    type: 'ObservableMessage',
    requestId: requestId,
    hadError: false,
    result: { type: 'completed' }
  };
}

function createErrorMessage(requestId, error) {
  return {
    channel: 'service_framework3_rpc',
    type: 'ErrorMessage',
    requestId: requestId,
    hadError: true,
    error: formatError(error)
  };
}

/**
 * Format the error before sending over the web socket.
 * TODO: This should be a custom marshaller registered in the TypeRegistry
 */
function formatError(error) {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.code,
      stack: error.stack
    };
  } else if (typeof error === 'string') {
    return error.toString();
  } else if (error === undefined) {
    return undefined;
  } else {
    try {
      return 'Unknown Error: ' + JSON.stringify(error, null, 2);
    } catch (jsonError) {
      return 'Unknown Error: ' + error.toString();
    }
  }
}
module.exports = exports['default'];

/**
 * Store a mapping from function name to a structure holding both the local implementation and
 * the type definition of the function.
 */

/**
 * Store a mapping from a class name to a struct containing it's local constructor and it's
 * interface definition.
 */