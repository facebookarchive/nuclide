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

var _reactivexRxjs = require('@reactivex/rxjs');

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
                  return context.add(name, object);
                }, function (objectId, context) {
                  return context.get(objectId);
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
          result = _reactivexRxjs.Observable['throw'](new Error('Expected an Observable, but the function returned something else.'));
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
        var object = marshallingContext.get(call.objectId);
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
//# sourceMappingURL=data:application/json;base64,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LEtBQVUsRUFBc0I7QUFDbkQsTUFBSSxLQUFLLFlBQVksS0FBSyxFQUFFO0FBQzFCLFdBQU87QUFDTCxhQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87QUFDdEIsVUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO0FBQ2hCLFdBQUssRUFBRSxLQUFLLENBQUMsS0FBSztLQUNuQixDQUFDO0dBQ0gsTUFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtBQUNwQyxXQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztHQUN6QixNQUFNLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtBQUM5QixXQUFPLFNBQVMsQ0FBQztHQUNsQixNQUFNO0FBQ0wsUUFBSTtBQUNGLGlDQUF5QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUc7S0FDM0QsQ0FBQyxPQUFPLFNBQVMsRUFBRTtBQUNsQixpQ0FBeUIsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFHO0tBQzdDO0dBQ0Y7Q0FDRiIsImZpbGUiOiJTZXJ2ZXJDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5pbXBvcnQge2dldERlZmluaXRpb25zfSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLXNlcnZpY2UtcGFyc2VyJztcbmltcG9ydCBUeXBlUmVnaXN0cnkgZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1zZXJ2aWNlLXBhcnNlci9saWIvVHlwZVJlZ2lzdHJ5JztcbmltcG9ydCB7YnVpbHRpbkxvY2F0aW9uLCB2b2lkVHlwZX0gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1zZXJ2aWNlLXBhcnNlci9saWIvYnVpbHRpbi10eXBlcyc7XG5pbXBvcnQge3N0YXJ0VHJhY2tpbmd9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB0eXBlIHtUaW1pbmdUcmFja2VyfSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQgdHlwZSB7XG4gIEZ1bmN0aW9uVHlwZSxcbiAgRGVmaW5pdGlvbixcbiAgSW50ZXJmYWNlRGVmaW5pdGlvbixcbiAgVHlwZSxcbn0gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1zZXJ2aWNlLXBhcnNlci9saWIvdHlwZXMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHR5cGUge0NvbmZpZ0VudHJ5fSBmcm9tICcuL2luZGV4JztcbmltcG9ydCB0eXBlIHtPYmplY3RSZWdpc3RyeX0gZnJvbSAnLi9PYmplY3RSZWdpc3RyeSc7XG5cbmltcG9ydCB0eXBlIHtcbiAgUmVxdWVzdE1lc3NhZ2UsXG4gIEVycm9yUmVzcG9uc2VNZXNzYWdlLFxuICBQcm9taXNlUmVzcG9uc2VNZXNzYWdlLFxuICBPYnNlcnZhYmxlUmVzcG9uc2VNZXNzYWdlLFxuICBDYWxsUmVtb3RlRnVuY3Rpb25NZXNzYWdlLFxuICBDYWxsUmVtb3RlTWV0aG9kTWVzc2FnZSxcbiAgQ3JlYXRlUmVtb3RlT2JqZWN0TWVzc2FnZSxcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7U29ja2V0Q2xpZW50fSBmcm9tICcuLi9Tb2NrZXRDbGllbnQnO1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxudHlwZSBGdW5jdGlvbkltcGxlbWVudGF0aW9uID0ge2xvY2FsSW1wbGVtZW50YXRpb246IEZ1bmN0aW9uOyB0eXBlOiBGdW5jdGlvblR5cGV9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2ZXJDb21wb25lbnQge1xuICBfdHlwZVJlZ2lzdHJ5OiBUeXBlUmVnaXN0cnk8T2JqZWN0UmVnaXN0cnk+O1xuXG4gIC8qKlxuICAgKiBTdG9yZSBhIG1hcHBpbmcgZnJvbSBmdW5jdGlvbiBuYW1lIHRvIGEgc3RydWN0dXJlIGhvbGRpbmcgYm90aCB0aGUgbG9jYWwgaW1wbGVtZW50YXRpb24gYW5kXG4gICAqIHRoZSB0eXBlIGRlZmluaXRpb24gb2YgdGhlIGZ1bmN0aW9uLlxuICAgKi9cbiAgX2Z1bmN0aW9uc0J5TmFtZTogTWFwPHN0cmluZywgRnVuY3Rpb25JbXBsZW1lbnRhdGlvbj47XG5cbiAgLyoqXG4gICAqIFN0b3JlIGEgbWFwcGluZyBmcm9tIGEgY2xhc3MgbmFtZSB0byBhIHN0cnVjdCBjb250YWluaW5nIGl0J3MgbG9jYWwgY29uc3RydWN0b3IgYW5kIGl0J3NcbiAgICogaW50ZXJmYWNlIGRlZmluaXRpb24uXG4gICAqL1xuICBfY2xhc3Nlc0J5TmFtZTogTWFwPHN0cmluZywge2xvY2FsSW1wbGVtZW50YXRpb246IGFueTsgZGVmaW5pdGlvbjogSW50ZXJmYWNlRGVmaW5pdGlvbn0+O1xuXG4gIGNvbnN0cnVjdG9yKHNlcnZpY2VzOiBBcnJheTxDb25maWdFbnRyeT4pIHtcbiAgICB0aGlzLl90eXBlUmVnaXN0cnkgPSBuZXcgVHlwZVJlZ2lzdHJ5KCk7XG4gICAgdGhpcy5fZnVuY3Rpb25zQnlOYW1lID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2NsYXNzZXNCeU5hbWUgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBOdWNsaWRlVXJpIHR5cGUgcmVxdWlyZXMgbm8gdHJhbnNmb3JtYXRpb25zIChpdCBpcyBkb25lIG9uIHRoZSBjbGllbnQgc2lkZSkuXG4gICAgdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyVHlwZSgnTnVjbGlkZVVyaScsIHVyaSA9PiB1cmksIHJlbW90ZVBhdGggPT4gcmVtb3RlUGF0aCk7XG5cbiAgICB0aGlzLmFkZFNlcnZpY2VzKHNlcnZpY2VzKTtcbiAgfVxuXG4gIGFkZFNlcnZpY2VzKHNlcnZpY2VzOiBBcnJheTxDb25maWdFbnRyeT4pOiB2b2lkIHtcbiAgICBzZXJ2aWNlcy5mb3JFYWNoKHRoaXMuYWRkU2VydmljZSwgdGhpcyk7XG4gIH1cblxuICBhZGRTZXJ2aWNlKHNlcnZpY2U6IENvbmZpZ0VudHJ5KTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKGBSZWdpc3RlcmluZyAzLjAgc2VydmljZSAke3NlcnZpY2UubmFtZX0uLi5gKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGVmcyA9IGdldERlZmluaXRpb25zKHNlcnZpY2UuZGVmaW5pdGlvbik7XG4gICAgICAvLyAkRmxvd0lzc3VlIC0gdGhlIHBhcmFtZXRlciBwYXNzZWQgdG8gcmVxdWlyZSBtdXN0IGJlIGEgbGl0ZXJhbCBzdHJpbmcuXG4gICAgICBjb25zdCBsb2NhbEltcGwgPSByZXF1aXJlKHNlcnZpY2UuaW1wbGVtZW50YXRpb24pO1xuXG4gICAgICAvLyBSZWdpc3RlciB0eXBlIGFsaWFzZXMuXG4gICAgICBkZWZzLmZvckVhY2goKGRlZmluaXRpb246IERlZmluaXRpb24pID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGRlZmluaXRpb24ubmFtZTtcbiAgICAgICAgc3dpdGNoIChkZWZpbml0aW9uLmtpbmQpIHtcbiAgICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoYFJlZ2lzdGVyaW5nIHR5cGUgYWxpYXMgJHtuYW1lfS4uLmApO1xuICAgICAgICAgICAgaWYgKGRlZmluaXRpb24uZGVmaW5pdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3R5cGVSZWdpc3RyeS5yZWdpc3RlckFsaWFzKG5hbWUsIChkZWZpbml0aW9uLmRlZmluaXRpb246IFR5cGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIG1vZHVsZS1sZXZlbCBmdW5jdGlvbnMuXG4gICAgICAgICAgICB0aGlzLl9yZWdpc3RlckZ1bmN0aW9uKGAke3NlcnZpY2UubmFtZX0vJHtuYW1lfWAsIGxvY2FsSW1wbFtuYW1lXSwgZGVmaW5pdGlvbi50eXBlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2ludGVyZmFjZSc6XG4gICAgICAgICAgICAvLyBSZWdpc3RlciBpbnRlcmZhY2VzLlxuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGBSZWdpc3RlcmluZyBpbnRlcmZhY2UgJHtuYW1lfS4uLmApO1xuICAgICAgICAgICAgdGhpcy5fY2xhc3Nlc0J5TmFtZS5zZXQobmFtZSwgIHtcbiAgICAgICAgICAgICAgbG9jYWxJbXBsZW1lbnRhdGlvbjogbG9jYWxJbXBsW25hbWVdLFxuICAgICAgICAgICAgICBkZWZpbml0aW9uLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3R5cGVSZWdpc3RyeS5yZWdpc3RlclR5cGUobmFtZSwgKG9iamVjdCwgY29udGV4dDogT2JqZWN0UmVnaXN0cnkpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQuYWRkKG5hbWUsIG9iamVjdCk7XG4gICAgICAgICAgICB9LCAob2JqZWN0SWQsIGNvbnRleHQ6IE9iamVjdFJlZ2lzdHJ5KSA9PiBjb250ZXh0LmdldChvYmplY3RJZCkpO1xuXG4gICAgICAgICAgICAvLyBSZWdpc3RlciBhbGwgb2YgdGhlIHN0YXRpYyBtZXRob2RzIGFzIHJlbW90ZSBmdW5jdGlvbnMuXG4gICAgICAgICAgICBkZWZpbml0aW9uLnN0YXRpY01ldGhvZHMuZm9yRWFjaCgoZnVuY1R5cGUsIGZ1bmNOYW1lKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuX3JlZ2lzdGVyRnVuY3Rpb24oYCR7bmFtZX0vJHtmdW5jTmFtZX1gLCBsb2NhbEltcGxbbmFtZV1bZnVuY05hbWVdLCBmdW5jVHlwZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgRmFpbGVkIHRvIGxvYWQgc2VydmljZSAke3NlcnZpY2UubmFtZX0uIFN0YWNrIFRyYWNlOlxcbiR7ZS5zdGFja31gKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgX3JlZ2lzdGVyRnVuY3Rpb24obmFtZTogc3RyaW5nLCBsb2NhbEltcGw6IEZ1bmN0aW9uLCB0eXBlOiBGdW5jdGlvblR5cGUpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoYFJlZ2lzdGVyaW5nIGZ1bmN0aW9uICR7bmFtZX0uLi5gKTtcbiAgICBpZiAodGhpcy5fZnVuY3Rpb25zQnlOYW1lLmhhcyhuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBEdXBsaWNhdGUgUlBDIGZ1bmN0aW9uOiAke25hbWV9YCk7XG4gICAgfVxuICAgIHRoaXMuX2Z1bmN0aW9uc0J5TmFtZS5zZXQobmFtZSwgIHtcbiAgICAgIGxvY2FsSW1wbGVtZW50YXRpb246IGxvY2FsSW1wbCxcbiAgICAgIHR5cGUsXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBoYW5kbGVNZXNzYWdlKGNsaWVudDogU29ja2V0Q2xpZW50LCBtZXNzYWdlOiBSZXF1ZXN0TWVzc2FnZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJlcXVlc3RJZCA9IG1lc3NhZ2UucmVxdWVzdElkO1xuICAgIGNvbnN0IG1hcnNoYWxsaW5nQ29udGV4dCA9IGNsaWVudC5nZXRNYXJzaGFsbGluZ0NvbnRleHQoKTtcblxuICAgIC8vIFRyYWNrIHRpbWluZ3Mgb2YgYWxsIGZ1bmN0aW9uIGNhbGxzLCBtZXRob2QgY2FsbHMsIGFuZCBvYmplY3QgY3JlYXRpb25zLlxuICAgIC8vIE5vdGU6IGZvciBPYnNlcnZhYmxlcyB3ZSBvbmx5IHRyYWNrIGhvdyBsb25nIGl0IHRha2VzIHRvIGNyZWF0ZSB0aGUgaW5pdGlhbCBPYnNlcnZhYmxlLlxuICAgIC8vIHdoaWxlIGZvciBQcm9taXNlcyB3ZSB0cmFjayB0aGUgbGVuZ3RoIG9mIHRpbWUgaXQgdGFrZXMgdG8gcmVzb2x2ZSBvciByZWplY3QuXG4gICAgLy8gRm9yIHJldHVybmluZyB2b2lkLCB3ZSB0cmFjayB0aGUgdGltZSBmb3IgdGhlIGNhbGwgdG8gY29tcGxldGUuXG4gICAgY29uc3QgdGltaW5nVHJhY2tlcjogVGltaW5nVHJhY2tlclxuICAgICAgPSBzdGFydFRyYWNraW5nKHRyYWNraW5nSWRPZk1lc3NhZ2UobWFyc2hhbGxpbmdDb250ZXh0LCBtZXNzYWdlKSk7XG5cbiAgICBjb25zdCByZXR1cm5Qcm9taXNlID0gKGNhbmRpZGF0ZTogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBsZXQgcmV0dXJuVmFsID0gY2FuZGlkYXRlO1xuICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIHJldHVybiB2YWx1ZSBpcyBhIHByb21pc2UuXG4gICAgICBpZiAoIWlzVGhlbmFibGUocmV0dXJuVmFsKSkge1xuICAgICAgICByZXR1cm5WYWwgPSBQcm9taXNlLnJlamVjdChcbiAgICAgICAgICBuZXcgRXJyb3IoJ0V4cGVjdGVkIGEgUHJvbWlzZSwgYnV0IHRoZSBmdW5jdGlvbiByZXR1cm5lZCBzb21ldGhpbmcgZWxzZS4nKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1hcnNoYWwgdGhlIHJlc3VsdCwgdG8gc2VuZCBvdmVyIHRoZSBuZXR3b3JrLlxuICAgICAgaW52YXJpYW50KHJldHVyblZhbCAhPSBudWxsKTtcbiAgICAgIHJldHVyblZhbCA9IHJldHVyblZhbC50aGVuKHZhbHVlID0+IHRoaXMuX3R5cGVSZWdpc3RyeS5tYXJzaGFsKFxuICAgICAgICBtYXJzaGFsbGluZ0NvbnRleHQsIHZhbHVlLCB0eXBlKSk7XG5cbiAgICAgIC8vIFNlbmQgdGhlIHJlc3VsdCBvZiB0aGUgcHJvbWlzZSBhY3Jvc3MgdGhlIHNvY2tldC5cbiAgICAgIHJldHVyblZhbC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIGNsaWVudC5zZW5kU29ja2V0TWVzc2FnZShjcmVhdGVQcm9taXNlTWVzc2FnZShyZXF1ZXN0SWQsIHJlc3VsdCkpO1xuICAgICAgICB0aW1pbmdUcmFja2VyLm9uU3VjY2VzcygpO1xuICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICBjbGllbnQuc2VuZFNvY2tldE1lc3NhZ2UoY3JlYXRlRXJyb3JNZXNzYWdlKHJlcXVlc3RJZCwgZXJyb3IpKTtcbiAgICAgICAgdGltaW5nVHJhY2tlci5vbkVycm9yKGVycm9yID09IG51bGwgPyBuZXcgRXJyb3IoKSA6IGVycm9yKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCByZXR1cm5PYnNlcnZhYmxlID0gKHJldHVyblZhbDogYW55LCBlbGVtZW50VHlwZTogVHlwZSkgPT4ge1xuICAgICAgbGV0IHJlc3VsdDogT2JzZXJ2YWJsZTtcbiAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSByZXR1cm4gdmFsdWUgaXMgYW4gb2JzZXJ2YWJsZS5cbiAgICAgIGlmICghaXNPYnNlcnZhYmxlKHJldHVyblZhbCkpIHtcbiAgICAgICAgcmVzdWx0ID0gT2JzZXJ2YWJsZS50aHJvdyhuZXcgRXJyb3IoXG4gICAgICAgICAgJ0V4cGVjdGVkIGFuIE9ic2VydmFibGUsIGJ1dCB0aGUgZnVuY3Rpb24gcmV0dXJuZWQgc29tZXRoaW5nIGVsc2UuJykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gcmV0dXJuVmFsO1xuICAgICAgfVxuXG4gICAgICAvLyBNYXJzaGFsIHRoZSByZXN1bHQsIHRvIHNlbmQgb3ZlciB0aGUgbmV0d29yay5cbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXRNYXAodmFsdWUgPT4gdGhpcy5fdHlwZVJlZ2lzdHJ5Lm1hcnNoYWwoXG4gICAgICAgIG1hcnNoYWxsaW5nQ29udGV4dCwgdmFsdWUsIGVsZW1lbnRUeXBlKSk7XG5cbiAgICAgIC8vIFNlbmQgdGhlIG5leHQsIGVycm9yLCBhbmQgY29tcGxldGlvbiBldmVudHMgb2YgdGhlIG9ic2VydmFibGUgYWNyb3NzIHRoZSBzb2NrZXQuXG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSByZXN1bHQuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgICAgICBjbGllbnQuc2VuZFNvY2tldE1lc3NhZ2UoY3JlYXRlTmV4dE1lc3NhZ2UocmVxdWVzdElkLCBkYXRhKSk7XG4gICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgIGNsaWVudC5zZW5kU29ja2V0TWVzc2FnZShjcmVhdGVFcnJvck1lc3NhZ2UocmVxdWVzdElkLCBlcnJvcikpO1xuICAgICAgICBtYXJzaGFsbGluZ0NvbnRleHQucmVtb3ZlU3Vic2NyaXB0aW9uKHJlcXVlc3RJZCk7XG4gICAgICB9LCBjb21wbGV0ZWQgPT4ge1xuICAgICAgICBjbGllbnQuc2VuZFNvY2tldE1lc3NhZ2UoY3JlYXRlQ29tcGxldGVkTWVzc2FnZShyZXF1ZXN0SWQpKTtcbiAgICAgICAgbWFyc2hhbGxpbmdDb250ZXh0LnJlbW92ZVN1YnNjcmlwdGlvbihyZXF1ZXN0SWQpO1xuICAgICAgfSk7XG4gICAgICBtYXJzaGFsbGluZ0NvbnRleHQuYWRkU3Vic2NyaXB0aW9uKHJlcXVlc3RJZCwgc3Vic2NyaXB0aW9uKTtcbiAgICB9O1xuXG4gICAgLy8gUmV0dXJucyB0cnVlIGlmIGEgcHJvbWlzZSB3YXMgcmV0dXJuZWQuXG4gICAgY29uc3QgcmV0dXJuVmFsdWUgPSAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgc3dpdGNoICh0eXBlLmtpbmQpIHtcbiAgICAgICAgY2FzZSAndm9pZCc6XG4gICAgICAgICAgYnJlYWs7IC8vIE5vIG5lZWQgdG8gc2VuZCBhbnl0aGluZyBiYWNrIHRvIHRoZSB1c2VyLlxuICAgICAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgICAgICByZXR1cm5Qcm9taXNlKHZhbHVlLCB0eXBlLnR5cGUpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgICAgICByZXR1cm5PYnNlcnZhYmxlKHZhbHVlLCB0eXBlLnR5cGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rb3duIHJldHVybiB0eXBlICR7dHlwZS5raW5kfS5gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgY29uc3QgY2FsbEZ1bmN0aW9uID0gYXN5bmMgKGNhbGw6IENhbGxSZW1vdGVGdW5jdGlvbk1lc3NhZ2UpID0+IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgbG9jYWxJbXBsZW1lbnRhdGlvbixcbiAgICAgICAgdHlwZSxcbiAgICAgIH0gPSB0aGlzLl9nZXRGdW5jdGlvbkltcGxlbWVudGlvbihjYWxsLmZ1bmN0aW9uKTtcbiAgICAgIGNvbnN0IG1hcnNoYWxsZWRBcmdzID0gYXdhaXQgdGhpcy5fdHlwZVJlZ2lzdHJ5LnVubWFyc2hhbEFyZ3VtZW50cyhcbiAgICAgICAgbWFyc2hhbGxpbmdDb250ZXh0LCBjYWxsLmFyZ3MsIHR5cGUuYXJndW1lbnRUeXBlcyk7XG5cbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZShcbiAgICAgICAgbG9jYWxJbXBsZW1lbnRhdGlvbi5hcHBseShjbGllbnQsIG1hcnNoYWxsZWRBcmdzKSxcbiAgICAgICAgdHlwZS5yZXR1cm5UeXBlKTtcbiAgICB9O1xuXG4gICAgY29uc3QgY2FsbE1ldGhvZCA9IGFzeW5jIChjYWxsOiBDYWxsUmVtb3RlTWV0aG9kTWVzc2FnZSkgPT4ge1xuICAgICAgY29uc3Qgb2JqZWN0ID0gbWFyc2hhbGxpbmdDb250ZXh0LmdldChjYWxsLm9iamVjdElkKTtcbiAgICAgIGludmFyaWFudChvYmplY3QgIT0gbnVsbCk7XG5cbiAgICAgIGNvbnN0IGludGVyZmFjZU5hbWUgPSBtYXJzaGFsbGluZ0NvbnRleHQuZ2V0SW50ZXJmYWNlKGNhbGwub2JqZWN0SWQpO1xuICAgICAgY29uc3QgY2xhc3NEZWZpbml0aW9uID0gdGhpcy5fY2xhc3Nlc0J5TmFtZS5nZXQoaW50ZXJmYWNlTmFtZSk7XG4gICAgICBpbnZhcmlhbnQoY2xhc3NEZWZpbml0aW9uICE9IG51bGwpO1xuICAgICAgY29uc3QgdHlwZSA9IGNsYXNzRGVmaW5pdGlvbi5kZWZpbml0aW9uLmluc3RhbmNlTWV0aG9kcy5nZXQoY2FsbC5tZXRob2QpO1xuICAgICAgaW52YXJpYW50KHR5cGUgIT0gbnVsbCk7XG5cbiAgICAgIGNvbnN0IG1hcnNoYWxsZWRBcmdzID0gYXdhaXQgdGhpcy5fdHlwZVJlZ2lzdHJ5LnVubWFyc2hhbEFyZ3VtZW50cyhcbiAgICAgICAgbWFyc2hhbGxpbmdDb250ZXh0LCBjYWxsLmFyZ3MsIHR5cGUuYXJndW1lbnRUeXBlcyk7XG5cbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZShcbiAgICAgICAgb2JqZWN0W2NhbGwubWV0aG9kXS5hcHBseShvYmplY3QsIG1hcnNoYWxsZWRBcmdzKSxcbiAgICAgICAgdHlwZS5yZXR1cm5UeXBlKTtcbiAgICB9O1xuXG4gICAgY29uc3QgY2FsbENvbnN0cnVjdG9yID0gYXN5bmMgKGNvbnN0cnVjdG9yTWVzc2FnZTogQ3JlYXRlUmVtb3RlT2JqZWN0TWVzc2FnZSkgPT4ge1xuICAgICAgY29uc3QgY2xhc3NEZWZpbml0aW9uID0gdGhpcy5fY2xhc3Nlc0J5TmFtZS5nZXQoY29uc3RydWN0b3JNZXNzYWdlLmludGVyZmFjZSk7XG4gICAgICBpbnZhcmlhbnQoY2xhc3NEZWZpbml0aW9uICE9IG51bGwpO1xuICAgICAgY29uc3Qge1xuICAgICAgICBsb2NhbEltcGxlbWVudGF0aW9uLFxuICAgICAgICBkZWZpbml0aW9uLFxuICAgICAgfSA9IGNsYXNzRGVmaW5pdGlvbjtcblxuICAgICAgY29uc3QgbWFyc2hhbGxlZEFyZ3MgPSBhd2FpdCB0aGlzLl90eXBlUmVnaXN0cnkudW5tYXJzaGFsQXJndW1lbnRzKFxuICAgICAgICBtYXJzaGFsbGluZ0NvbnRleHQsIGNvbnN0cnVjdG9yTWVzc2FnZS5hcmdzLCBkZWZpbml0aW9uLmNvbnN0cnVjdG9yQXJncyk7XG5cbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBvYmplY3QgYW5kIHB1dCBpdCBpbiB0aGUgcmVnaXN0cnkuXG4gICAgICBjb25zdCBuZXdPYmplY3QgPSBjb25zdHJ1Y3QobG9jYWxJbXBsZW1lbnRhdGlvbiwgbWFyc2hhbGxlZEFyZ3MpO1xuXG4gICAgICAvLyBSZXR1cm4gdGhlIG9iamVjdCwgd2hpY2ggd2lsbCBhdXRvbWF0aWNhbGx5IGJlIGNvbnZlcnRlZCB0byBhbiBpZCB0aHJvdWdoIHRoZVxuICAgICAgLy8gbWFyc2hhbGxpbmcgc3lzdGVtLlxuICAgICAgcmV0dXJuUHJvbWlzZShcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKG5ld09iamVjdCksXG4gICAgICAgIHtcbiAgICAgICAgICBraW5kOiAnbmFtZWQnLFxuICAgICAgICAgIG5hbWU6IGNvbnN0cnVjdG9yTWVzc2FnZS5pbnRlcmZhY2UsXG4gICAgICAgICAgbG9jYXRpb246IGJ1aWx0aW5Mb2NhdGlvbixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIEhlcmUncyB0aGUgbWFpbiBtZXNzYWdlIGhhbmRsZXIgLi4uXG4gICAgdHJ5IHtcbiAgICAgIGxldCByZXR1cm5lZFByb21pc2UgPSBmYWxzZTtcbiAgICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ0Z1bmN0aW9uQ2FsbCc6XG4gICAgICAgICAgcmV0dXJuZWRQcm9taXNlID0gYXdhaXQgY2FsbEZ1bmN0aW9uKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdNZXRob2RDYWxsJzpcbiAgICAgICAgICByZXR1cm5lZFByb21pc2UgPSBhd2FpdCBjYWxsTWV0aG9kKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdOZXdPYmplY3QnOlxuICAgICAgICAgIGF3YWl0IGNhbGxDb25zdHJ1Y3RvcihtZXNzYWdlKTtcbiAgICAgICAgICByZXR1cm5lZFByb21pc2UgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdEaXNwb3NlT2JqZWN0JzpcbiAgICAgICAgICBhd2FpdCBtYXJzaGFsbGluZ0NvbnRleHQuZGlzcG9zZU9iamVjdChtZXNzYWdlLm9iamVjdElkKTtcbiAgICAgICAgICByZXR1cm5Qcm9taXNlKFByb21pc2UucmVzb2x2ZSgpLCB2b2lkVHlwZSk7XG4gICAgICAgICAgcmV0dXJuZWRQcm9taXNlID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnRGlzcG9zZU9ic2VydmFibGUnOlxuICAgICAgICAgIG1hcnNoYWxsaW5nQ29udGV4dC5kaXNwb3NlU3Vic2NyaXB0aW9uKHJlcXVlc3RJZCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtvd24gbWVzc2FnZSB0eXBlICR7bWVzc2FnZS50eXBlfWApO1xuICAgICAgfVxuICAgICAgaWYgKCFyZXR1cm5lZFByb21pc2UpIHtcbiAgICAgICAgdGltaW5nVHJhY2tlci5vblN1Y2Nlc3MoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoZSAhPSBudWxsID8gZS5tZXNzYWdlIDogZSk7XG4gICAgICB0aW1pbmdUcmFja2VyLm9uRXJyb3IoZSA9PSBudWxsID8gbmV3IEVycm9yKCkgOiBlKTtcbiAgICAgIGNsaWVudC5zZW5kU29ja2V0TWVzc2FnZShjcmVhdGVFcnJvck1lc3NhZ2UocmVxdWVzdElkLCBlKSk7XG4gICAgfVxuICB9XG5cbiAgX2dldEZ1bmN0aW9uSW1wbGVtZW50aW9uKG5hbWU6IHN0cmluZyk6IEZ1bmN0aW9uSW1wbGVtZW50YXRpb24ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2Z1bmN0aW9uc0J5TmFtZS5nZXQobmFtZSk7XG4gICAgaW52YXJpYW50KHJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cmFja2luZ0lkT2ZNZXNzYWdlKHJlZ2lzdHJ5OiBPYmplY3RSZWdpc3RyeSwgbWVzc2FnZTogUmVxdWVzdE1lc3NhZ2UpOiBzdHJpbmcge1xuICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgIGNhc2UgJ0Z1bmN0aW9uQ2FsbCc6XG4gICAgICByZXR1cm4gYHNlcnZpY2UtZnJhbWV3b3JrOiR7bWVzc2FnZS5mdW5jdGlvbn1gO1xuICAgIGNhc2UgJ01ldGhvZENhbGwnOlxuICAgICAgY29uc3QgY2FsbEludGVyZmFjZSA9IHJlZ2lzdHJ5LmdldEludGVyZmFjZShtZXNzYWdlLm9iamVjdElkKTtcbiAgICAgIHJldHVybiBgc2VydmljZS1mcmFtZXdvcms6JHtjYWxsSW50ZXJmYWNlfS4ke21lc3NhZ2UubWV0aG9kfWA7XG4gICAgY2FzZSAnTmV3T2JqZWN0JzpcbiAgICAgIHJldHVybiBgc2VydmljZS1mcmFtZXdvcms6bmV3OiR7bWVzc2FnZS5pbnRlcmZhY2V9YDtcbiAgICBjYXNlICdEaXNwb3NlT2JqZWN0JzpcbiAgICAgIGNvbnN0IGludGVyZmFjZU5hbWUgPSByZWdpc3RyeS5nZXRJbnRlcmZhY2UobWVzc2FnZS5vYmplY3RJZCk7XG4gICAgICByZXR1cm4gYHNlcnZpY2UtZnJhbWV3b3JrOmRpc3Bvc2U6JHtpbnRlcmZhY2VOYW1lfWA7XG4gICAgY2FzZSAnRGlzcG9zZU9ic2VydmFibGUnOlxuICAgICAgcmV0dXJuIGBzZXJ2aWNlLWZyYW1ld29yazpkaXNwb3NlT2JzZXJ2YWJsZWA7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBtZXNzYWdlIHR5cGUgJHttZXNzYWdlLnR5cGV9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0aGF0IGxldCdzIHVzICdhcHBseScgYW4gYXJyYXkgb2YgYXJndW1lbnRzIHRvIGEgY29uc3RydWN0b3IuXG4gKiBJdCB3b3JrcyBieSBjcmVhdGluZyBhIG5ldyBjb25zdHJ1Y3RvciB0aGF0IGhhcyB0aGUgc2FtZSBwcm90b3R5cGUgYXMgdGhlIG9yaWdpbmFsXG4gKiBjb25zdHJ1Y3RvciwgYW5kIHNpbXBseSBhcHBsaWVzIHRoZSBvcmlnaW5hbCBjb25zdHJ1Y3RvciBkaXJlY3RseSB0byAndGhpcycuXG4gKiBAcmV0dXJucyBBbiBpbnN0YW5jZSBvZiBjbGFzc09iamVjdC5cbiAqL1xuZnVuY3Rpb24gY29uc3RydWN0KGNsYXNzT2JqZWN0LCBhcmdzKSB7XG4gIGZ1bmN0aW9uIEYoKSB7XG4gICAgcmV0dXJuIGNsYXNzT2JqZWN0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG4gIEYucHJvdG90eXBlID0gY2xhc3NPYmplY3QucHJvdG90eXBlO1xuICByZXR1cm4gbmV3IEYoKTtcbn1cblxuLyoqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0aGF0IGNoZWNrcyBpZiBhbiBvYmplY3QgaXMgdGhlbmFibGUgKFByb21pc2UtbGlrZSkuXG4gKi9cbmZ1bmN0aW9uIGlzVGhlbmFibGUob2JqZWN0OiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIEJvb2xlYW4ob2JqZWN0ICYmIG9iamVjdC50aGVuKTtcbn1cblxuLyoqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0aGF0IGNoZWNrcyBpZiBhbiBvYmplY3QgaXMgYW4gT2JzZXJ2YWJsZS5cbiAqL1xuZnVuY3Rpb24gaXNPYnNlcnZhYmxlKG9iamVjdDogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBCb29sZWFuKG9iamVjdCAmJiBvYmplY3QuY29uY2F0TWFwICYmIG9iamVjdC5zdWJzY3JpYmUpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQcm9taXNlTWVzc2FnZShyZXF1ZXN0SWQ6IG51bWJlciwgcmVzdWx0OiBhbnkpOiBQcm9taXNlUmVzcG9uc2VNZXNzYWdlIHtcbiAgcmV0dXJuIHtcbiAgICBjaGFubmVsOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgdHlwZTogJ1Byb21pc2VNZXNzYWdlJyxcbiAgICByZXF1ZXN0SWQsXG4gICAgcmVzdWx0LFxuICAgIGhhZEVycm9yOiBmYWxzZSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTmV4dE1lc3NhZ2UocmVxdWVzdElkOiBudW1iZXIsIGRhdGE6IGFueSk6IE9ic2VydmFibGVSZXNwb25zZU1lc3NhZ2Uge1xuICByZXR1cm4ge1xuICAgIGNoYW5uZWw6ICdzZXJ2aWNlX2ZyYW1ld29yazNfcnBjJyxcbiAgICB0eXBlOiAnT2JzZXJ2YWJsZU1lc3NhZ2UnLFxuICAgIHJlcXVlc3RJZCxcbiAgICBoYWRFcnJvcjogZmFsc2UsXG4gICAgcmVzdWx0OiB7XG4gICAgICB0eXBlOiAnbmV4dCcsXG4gICAgICBkYXRhOiBkYXRhLFxuICAgIH0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbXBsZXRlZE1lc3NhZ2UocmVxdWVzdElkOiBudW1iZXIpOiBPYnNlcnZhYmxlUmVzcG9uc2VNZXNzYWdlIHtcbiAgcmV0dXJuIHtcbiAgICBjaGFubmVsOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgdHlwZTogJ09ic2VydmFibGVNZXNzYWdlJyxcbiAgICByZXF1ZXN0SWQsXG4gICAgaGFkRXJyb3I6IGZhbHNlLFxuICAgIHJlc3VsdDogeyB0eXBlOiAnY29tcGxldGVkJyB9LFxuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVFcnJvck1lc3NhZ2UocmVxdWVzdElkOiBudW1iZXIsIGVycm9yOiBhbnkpOiBFcnJvclJlc3BvbnNlTWVzc2FnZSB7XG4gIHJldHVybiB7XG4gICAgY2hhbm5lbDogJ3NlcnZpY2VfZnJhbWV3b3JrM19ycGMnLFxuICAgIHR5cGU6ICdFcnJvck1lc3NhZ2UnLFxuICAgIHJlcXVlc3RJZCxcbiAgICBoYWRFcnJvcjogdHJ1ZSxcbiAgICBlcnJvcjogZm9ybWF0RXJyb3IoZXJyb3IpLFxuICB9O1xufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgZXJyb3IgYmVmb3JlIHNlbmRpbmcgb3ZlciB0aGUgd2ViIHNvY2tldC5cbiAqIFRPRE86IFRoaXMgc2hvdWxkIGJlIGEgY3VzdG9tIG1hcnNoYWxsZXIgcmVnaXN0ZXJlZCBpbiB0aGUgVHlwZVJlZ2lzdHJ5XG4gKi9cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKGVycm9yOiBhbnkpOiA/KE9iamVjdCB8IHN0cmluZykge1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIHJldHVybiB7XG4gICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgY29kZTogZXJyb3IuY29kZSxcbiAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICB9O1xuICB9IGVsc2UgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZXJyb3IudG9TdHJpbmcoKTtcbiAgfSBlbHNlIGlmIChlcnJvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGBVbmtub3duIEVycm9yOiAke0pTT04uc3RyaW5naWZ5KGVycm9yLCBudWxsLCAyKX1gO1xuICAgIH0gY2F0Y2ggKGpzb25FcnJvcikge1xuICAgICAgcmV0dXJuIGBVbmtub3duIEVycm9yOiAke2Vycm9yLnRvU3RyaW5nKCl9YDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==