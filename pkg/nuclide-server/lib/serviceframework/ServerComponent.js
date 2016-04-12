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

var _rx = require('rx');

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
          result = _rx.Observable['throw'](new Error('Expected an Observable, but the function returned something else.'));
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
    return 'Unknown Error: ' + error.toString();
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
//# sourceMappingURL=data:application/json;base64,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QUFVLEVBQXNCO0FBQ25ELE1BQUksS0FBSyxZQUFZLEtBQUssRUFBRTtBQUMxQixXQUFPO0FBQ0wsYUFBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO0FBQ3RCLFVBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtBQUNoQixXQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7S0FDbkIsQ0FBQztHQUNILE1BQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7QUFDcEMsV0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7R0FDekIsTUFBTSxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7QUFDOUIsV0FBTyxTQUFTLENBQUM7R0FDbEIsTUFBTTtBQUNMLCtCQUF5QixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUc7R0FDN0M7Q0FDRiIsImZpbGUiOiJTZXJ2ZXJDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4JztcbmltcG9ydCB7Z2V0RGVmaW5pdGlvbnN9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtc2VydmljZS1wYXJzZXInO1xuaW1wb3J0IFR5cGVSZWdpc3RyeSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLXNlcnZpY2UtcGFyc2VyL2xpYi9UeXBlUmVnaXN0cnknO1xuaW1wb3J0IHtidWlsdGluTG9jYXRpb24sIHZvaWRUeXBlfSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLXNlcnZpY2UtcGFyc2VyL2xpYi9idWlsdGluLXR5cGVzJztcbmltcG9ydCB7c3RhcnRUcmFja2luZ30gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHR5cGUge1RpbWluZ1RyYWNrZXJ9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB0eXBlIHtcbiAgRnVuY3Rpb25UeXBlLFxuICBEZWZpbml0aW9uLFxuICBJbnRlcmZhY2VEZWZpbml0aW9uLFxuICBUeXBlLFxufSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLXNlcnZpY2UtcGFyc2VyL2xpYi90eXBlcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgdHlwZSB7Q29uZmlnRW50cnl9IGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0IHR5cGUge09iamVjdFJlZ2lzdHJ5fSBmcm9tICcuL09iamVjdFJlZ2lzdHJ5JztcblxuaW1wb3J0IHR5cGUge1xuICBSZXF1ZXN0TWVzc2FnZSxcbiAgRXJyb3JSZXNwb25zZU1lc3NhZ2UsXG4gIFByb21pc2VSZXNwb25zZU1lc3NhZ2UsXG4gIE9ic2VydmFibGVSZXNwb25zZU1lc3NhZ2UsXG4gIENhbGxSZW1vdGVGdW5jdGlvbk1lc3NhZ2UsXG4gIENhbGxSZW1vdGVNZXRob2RNZXNzYWdlLFxuICBDcmVhdGVSZW1vdGVPYmplY3RNZXNzYWdlLFxufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtTb2NrZXRDbGllbnR9IGZyb20gJy4uL1NvY2tldENsaWVudCc7XG5cbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuXG50eXBlIEZ1bmN0aW9uSW1wbGVtZW50YXRpb24gPSB7bG9jYWxJbXBsZW1lbnRhdGlvbjogRnVuY3Rpb247IHR5cGU6IEZ1bmN0aW9uVHlwZX07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcnZlckNvbXBvbmVudCB7XG4gIF90eXBlUmVnaXN0cnk6IFR5cGVSZWdpc3RyeTxPYmplY3RSZWdpc3RyeT47XG5cbiAgLyoqXG4gICAqIFN0b3JlIGEgbWFwcGluZyBmcm9tIGZ1bmN0aW9uIG5hbWUgdG8gYSBzdHJ1Y3R1cmUgaG9sZGluZyBib3RoIHRoZSBsb2NhbCBpbXBsZW1lbnRhdGlvbiBhbmRcbiAgICogdGhlIHR5cGUgZGVmaW5pdGlvbiBvZiB0aGUgZnVuY3Rpb24uXG4gICAqL1xuICBfZnVuY3Rpb25zQnlOYW1lOiBNYXA8c3RyaW5nLCBGdW5jdGlvbkltcGxlbWVudGF0aW9uPjtcblxuICAvKipcbiAgICogU3RvcmUgYSBtYXBwaW5nIGZyb20gYSBjbGFzcyBuYW1lIHRvIGEgc3RydWN0IGNvbnRhaW5pbmcgaXQncyBsb2NhbCBjb25zdHJ1Y3RvciBhbmQgaXQnc1xuICAgKiBpbnRlcmZhY2UgZGVmaW5pdGlvbi5cbiAgICovXG4gIF9jbGFzc2VzQnlOYW1lOiBNYXA8c3RyaW5nLCB7bG9jYWxJbXBsZW1lbnRhdGlvbjogYW55OyBkZWZpbml0aW9uOiBJbnRlcmZhY2VEZWZpbml0aW9ufT47XG5cbiAgY29uc3RydWN0b3Ioc2VydmljZXM6IEFycmF5PENvbmZpZ0VudHJ5Pikge1xuICAgIHRoaXMuX3R5cGVSZWdpc3RyeSA9IG5ldyBUeXBlUmVnaXN0cnkoKTtcbiAgICB0aGlzLl9mdW5jdGlvbnNCeU5hbWUgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fY2xhc3Nlc0J5TmFtZSA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE51Y2xpZGVVcmkgdHlwZSByZXF1aXJlcyBubyB0cmFuc2Zvcm1hdGlvbnMgKGl0IGlzIGRvbmUgb24gdGhlIGNsaWVudCBzaWRlKS5cbiAgICB0aGlzLl90eXBlUmVnaXN0cnkucmVnaXN0ZXJUeXBlKCdOdWNsaWRlVXJpJywgdXJpID0+IHVyaSwgcmVtb3RlUGF0aCA9PiByZW1vdGVQYXRoKTtcblxuICAgIHRoaXMuYWRkU2VydmljZXMoc2VydmljZXMpO1xuICB9XG5cbiAgYWRkU2VydmljZXMoc2VydmljZXM6IEFycmF5PENvbmZpZ0VudHJ5Pik6IHZvaWQge1xuICAgIHNlcnZpY2VzLmZvckVhY2godGhpcy5hZGRTZXJ2aWNlLCB0aGlzKTtcbiAgfVxuXG4gIGFkZFNlcnZpY2Uoc2VydmljZTogQ29uZmlnRW50cnkpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoYFJlZ2lzdGVyaW5nIDMuMCBzZXJ2aWNlICR7c2VydmljZS5uYW1lfS4uLmApO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkZWZzID0gZ2V0RGVmaW5pdGlvbnMoc2VydmljZS5kZWZpbml0aW9uKTtcbiAgICAgIC8vICRGbG93SXNzdWUgLSB0aGUgcGFyYW1ldGVyIHBhc3NlZCB0byByZXF1aXJlIG11c3QgYmUgYSBsaXRlcmFsIHN0cmluZy5cbiAgICAgIGNvbnN0IGxvY2FsSW1wbCA9IHJlcXVpcmUoc2VydmljZS5pbXBsZW1lbnRhdGlvbik7XG5cbiAgICAgIC8vIFJlZ2lzdGVyIHR5cGUgYWxpYXNlcy5cbiAgICAgIGRlZnMuZm9yRWFjaCgoZGVmaW5pdGlvbjogRGVmaW5pdGlvbikgPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gZGVmaW5pdGlvbi5uYW1lO1xuICAgICAgICBzd2l0Y2ggKGRlZmluaXRpb24ua2luZCkge1xuICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgUmVnaXN0ZXJpbmcgdHlwZSBhbGlhcyAke25hbWV9Li4uYCk7XG4gICAgICAgICAgICBpZiAoZGVmaW5pdGlvbi5kZWZpbml0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyQWxpYXMobmFtZSwgKGRlZmluaXRpb24uZGVmaW5pdGlvbjogVHlwZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgbW9kdWxlLWxldmVsIGZ1bmN0aW9ucy5cbiAgICAgICAgICAgIHRoaXMuX3JlZ2lzdGVyRnVuY3Rpb24oYCR7c2VydmljZS5uYW1lfS8ke25hbWV9YCwgbG9jYWxJbXBsW25hbWVdLCBkZWZpbml0aW9uLnR5cGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnaW50ZXJmYWNlJzpcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGludGVyZmFjZXMuXG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoYFJlZ2lzdGVyaW5nIGludGVyZmFjZSAke25hbWV9Li4uYCk7XG4gICAgICAgICAgICB0aGlzLl9jbGFzc2VzQnlOYW1lLnNldChuYW1lLCAge1xuICAgICAgICAgICAgICBsb2NhbEltcGxlbWVudGF0aW9uOiBsb2NhbEltcGxbbmFtZV0sXG4gICAgICAgICAgICAgIGRlZmluaXRpb24sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyVHlwZShuYW1lLCAob2JqZWN0LCBjb250ZXh0OiBPYmplY3RSZWdpc3RyeSkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gY29udGV4dC5hZGQobmFtZSwgb2JqZWN0KTtcbiAgICAgICAgICAgIH0sIChvYmplY3RJZCwgY29udGV4dDogT2JqZWN0UmVnaXN0cnkpID0+IGNvbnRleHQuZ2V0KG9iamVjdElkKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGFsbCBvZiB0aGUgc3RhdGljIG1ldGhvZHMgYXMgcmVtb3RlIGZ1bmN0aW9ucy5cbiAgICAgICAgICAgIGRlZmluaXRpb24uc3RhdGljTWV0aG9kcy5mb3JFYWNoKChmdW5jVHlwZSwgZnVuY05hbWUpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJGdW5jdGlvbihgJHtuYW1lfS8ke2Z1bmNOYW1lfWAsIGxvY2FsSW1wbFtuYW1lXVtmdW5jTmFtZV0sIGZ1bmNUeXBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmVycm9yKGBGYWlsZWQgdG8gbG9hZCBzZXJ2aWNlICR7c2VydmljZS5uYW1lfS4gU3RhY2sgVHJhY2U6XFxuJHtlLnN0YWNrfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBfcmVnaXN0ZXJGdW5jdGlvbihuYW1lOiBzdHJpbmcsIGxvY2FsSW1wbDogRnVuY3Rpb24sIHR5cGU6IEZ1bmN0aW9uVHlwZSk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZyhgUmVnaXN0ZXJpbmcgZnVuY3Rpb24gJHtuYW1lfS4uLmApO1xuICAgIGlmICh0aGlzLl9mdW5jdGlvbnNCeU5hbWUuaGFzKG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBSUEMgZnVuY3Rpb246ICR7bmFtZX1gKTtcbiAgICB9XG4gICAgdGhpcy5fZnVuY3Rpb25zQnlOYW1lLnNldChuYW1lLCAge1xuICAgICAgbG9jYWxJbXBsZW1lbnRhdGlvbjogbG9jYWxJbXBsLFxuICAgICAgdHlwZSxcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZU1lc3NhZ2UoY2xpZW50OiBTb2NrZXRDbGllbnQsIG1lc3NhZ2U6IFJlcXVlc3RNZXNzYWdlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVxdWVzdElkID0gbWVzc2FnZS5yZXF1ZXN0SWQ7XG4gICAgY29uc3QgbWFyc2hhbGxpbmdDb250ZXh0ID0gY2xpZW50LmdldE1hcnNoYWxsaW5nQ29udGV4dCgpO1xuXG4gICAgLy8gVHJhY2sgdGltaW5ncyBvZiBhbGwgZnVuY3Rpb24gY2FsbHMsIG1ldGhvZCBjYWxscywgYW5kIG9iamVjdCBjcmVhdGlvbnMuXG4gICAgLy8gTm90ZTogZm9yIE9ic2VydmFibGVzIHdlIG9ubHkgdHJhY2sgaG93IGxvbmcgaXQgdGFrZXMgdG8gY3JlYXRlIHRoZSBpbml0aWFsIE9ic2VydmFibGUuXG4gICAgLy8gd2hpbGUgZm9yIFByb21pc2VzIHdlIHRyYWNrIHRoZSBsZW5ndGggb2YgdGltZSBpdCB0YWtlcyB0byByZXNvbHZlIG9yIHJlamVjdC5cbiAgICAvLyBGb3IgcmV0dXJuaW5nIHZvaWQsIHdlIHRyYWNrIHRoZSB0aW1lIGZvciB0aGUgY2FsbCB0byBjb21wbGV0ZS5cbiAgICBjb25zdCB0aW1pbmdUcmFja2VyOiBUaW1pbmdUcmFja2VyXG4gICAgICA9IHN0YXJ0VHJhY2tpbmcodHJhY2tpbmdJZE9mTWVzc2FnZShtYXJzaGFsbGluZ0NvbnRleHQsIG1lc3NhZ2UpKTtcblxuICAgIGNvbnN0IHJldHVyblByb21pc2UgPSAoY2FuZGlkYXRlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGxldCByZXR1cm5WYWwgPSBjYW5kaWRhdGU7XG4gICAgICAvLyBFbnN1cmUgdGhhdCB0aGUgcmV0dXJuIHZhbHVlIGlzIGEgcHJvbWlzZS5cbiAgICAgIGlmICghaXNUaGVuYWJsZShyZXR1cm5WYWwpKSB7XG4gICAgICAgIHJldHVyblZhbCA9IFByb21pc2UucmVqZWN0KFxuICAgICAgICAgIG5ldyBFcnJvcignRXhwZWN0ZWQgYSBQcm9taXNlLCBidXQgdGhlIGZ1bmN0aW9uIHJldHVybmVkIHNvbWV0aGluZyBlbHNlLicpKTtcbiAgICAgIH1cblxuICAgICAgLy8gTWFyc2hhbCB0aGUgcmVzdWx0LCB0byBzZW5kIG92ZXIgdGhlIG5ldHdvcmsuXG4gICAgICBpbnZhcmlhbnQocmV0dXJuVmFsICE9IG51bGwpO1xuICAgICAgcmV0dXJuVmFsID0gcmV0dXJuVmFsLnRoZW4odmFsdWUgPT4gdGhpcy5fdHlwZVJlZ2lzdHJ5Lm1hcnNoYWwoXG4gICAgICAgIG1hcnNoYWxsaW5nQ29udGV4dCwgdmFsdWUsIHR5cGUpKTtcblxuICAgICAgLy8gU2VuZCB0aGUgcmVzdWx0IG9mIHRoZSBwcm9taXNlIGFjcm9zcyB0aGUgc29ja2V0LlxuICAgICAgcmV0dXJuVmFsLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgY2xpZW50LnNlbmRTb2NrZXRNZXNzYWdlKGNyZWF0ZVByb21pc2VNZXNzYWdlKHJlcXVlc3RJZCwgcmVzdWx0KSk7XG4gICAgICAgIHRpbWluZ1RyYWNrZXIub25TdWNjZXNzKCk7XG4gICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgIGNsaWVudC5zZW5kU29ja2V0TWVzc2FnZShjcmVhdGVFcnJvck1lc3NhZ2UocmVxdWVzdElkLCBlcnJvcikpO1xuICAgICAgICB0aW1pbmdUcmFja2VyLm9uRXJyb3IoZXJyb3IgPT0gbnVsbCA/IG5ldyBFcnJvcigpIDogZXJyb3IpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbnN0IHJldHVybk9ic2VydmFibGUgPSAocmV0dXJuVmFsOiBhbnksIGVsZW1lbnRUeXBlOiBUeXBlKSA9PiB7XG4gICAgICBsZXQgcmVzdWx0OiBPYnNlcnZhYmxlO1xuICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIHJldHVybiB2YWx1ZSBpcyBhbiBvYnNlcnZhYmxlLlxuICAgICAgaWYgKCFpc09ic2VydmFibGUocmV0dXJuVmFsKSkge1xuICAgICAgICByZXN1bHQgPSBPYnNlcnZhYmxlLnRocm93KG5ldyBFcnJvcihcbiAgICAgICAgICAnRXhwZWN0ZWQgYW4gT2JzZXJ2YWJsZSwgYnV0IHRoZSBmdW5jdGlvbiByZXR1cm5lZCBzb21ldGhpbmcgZWxzZS4nKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSByZXR1cm5WYWw7XG4gICAgICB9XG5cbiAgICAgIC8vIE1hcnNoYWwgdGhlIHJlc3VsdCwgdG8gc2VuZCBvdmVyIHRoZSBuZXR3b3JrLlxuICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdE1hcCh2YWx1ZSA9PiB0aGlzLl90eXBlUmVnaXN0cnkubWFyc2hhbChcbiAgICAgICAgbWFyc2hhbGxpbmdDb250ZXh0LCB2YWx1ZSwgZWxlbWVudFR5cGUpKTtcblxuICAgICAgLy8gU2VuZCB0aGUgbmV4dCwgZXJyb3IsIGFuZCBjb21wbGV0aW9uIGV2ZW50cyBvZiB0aGUgb2JzZXJ2YWJsZSBhY3Jvc3MgdGhlIHNvY2tldC5cbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHJlc3VsdC5zdWJzY3JpYmUoZGF0YSA9PiB7XG4gICAgICAgIGNsaWVudC5zZW5kU29ja2V0TWVzc2FnZShjcmVhdGVOZXh0TWVzc2FnZShyZXF1ZXN0SWQsIGRhdGEpKTtcbiAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgY2xpZW50LnNlbmRTb2NrZXRNZXNzYWdlKGNyZWF0ZUVycm9yTWVzc2FnZShyZXF1ZXN0SWQsIGVycm9yKSk7XG4gICAgICAgIG1hcnNoYWxsaW5nQ29udGV4dC5yZW1vdmVTdWJzY3JpcHRpb24ocmVxdWVzdElkKTtcbiAgICAgIH0sIGNvbXBsZXRlZCA9PiB7XG4gICAgICAgIGNsaWVudC5zZW5kU29ja2V0TWVzc2FnZShjcmVhdGVDb21wbGV0ZWRNZXNzYWdlKHJlcXVlc3RJZCkpO1xuICAgICAgICBtYXJzaGFsbGluZ0NvbnRleHQucmVtb3ZlU3Vic2NyaXB0aW9uKHJlcXVlc3RJZCk7XG4gICAgICB9KTtcbiAgICAgIG1hcnNoYWxsaW5nQ29udGV4dC5hZGRTdWJzY3JpcHRpb24ocmVxdWVzdElkLCBzdWJzY3JpcHRpb24pO1xuICAgIH07XG5cbiAgICAvLyBSZXR1cm5zIHRydWUgaWYgYSBwcm9taXNlIHdhcyByZXR1cm5lZC5cbiAgICBjb25zdCByZXR1cm5WYWx1ZSA9ICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBzd2l0Y2ggKHR5cGUua2luZCkge1xuICAgICAgICBjYXNlICd2b2lkJzpcbiAgICAgICAgICBicmVhazsgLy8gTm8gbmVlZCB0byBzZW5kIGFueXRoaW5nIGJhY2sgdG8gdGhlIHVzZXIuXG4gICAgICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgICAgICAgIHJldHVyblByb21pc2UodmFsdWUsIHR5cGUudHlwZSk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGNhc2UgJ29ic2VydmFibGUnOlxuICAgICAgICAgIHJldHVybk9ic2VydmFibGUodmFsdWUsIHR5cGUudHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtvd24gcmV0dXJuIHR5cGUgJHt0eXBlLmtpbmR9LmApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBjb25zdCBjYWxsRnVuY3Rpb24gPSBhc3luYyAoY2FsbDogQ2FsbFJlbW90ZUZ1bmN0aW9uTWVzc2FnZSkgPT4ge1xuICAgICAgY29uc3Qge1xuICAgICAgICBsb2NhbEltcGxlbWVudGF0aW9uLFxuICAgICAgICB0eXBlLFxuICAgICAgfSA9IHRoaXMuX2dldEZ1bmN0aW9uSW1wbGVtZW50aW9uKGNhbGwuZnVuY3Rpb24pO1xuICAgICAgY29uc3QgbWFyc2hhbGxlZEFyZ3MgPSBhd2FpdCB0aGlzLl90eXBlUmVnaXN0cnkudW5tYXJzaGFsQXJndW1lbnRzKFxuICAgICAgICBtYXJzaGFsbGluZ0NvbnRleHQsIGNhbGwuYXJncywgdHlwZS5hcmd1bWVudFR5cGVzKTtcblxuICAgICAgcmV0dXJuIHJldHVyblZhbHVlKFxuICAgICAgICBsb2NhbEltcGxlbWVudGF0aW9uLmFwcGx5KGNsaWVudCwgbWFyc2hhbGxlZEFyZ3MpLFxuICAgICAgICB0eXBlLnJldHVyblR5cGUpO1xuICAgIH07XG5cbiAgICBjb25zdCBjYWxsTWV0aG9kID0gYXN5bmMgKGNhbGw6IENhbGxSZW1vdGVNZXRob2RNZXNzYWdlKSA9PiB7XG4gICAgICBjb25zdCBvYmplY3QgPSBtYXJzaGFsbGluZ0NvbnRleHQuZ2V0KGNhbGwub2JqZWN0SWQpO1xuICAgICAgaW52YXJpYW50KG9iamVjdCAhPSBudWxsKTtcblxuICAgICAgY29uc3QgaW50ZXJmYWNlTmFtZSA9IG1hcnNoYWxsaW5nQ29udGV4dC5nZXRJbnRlcmZhY2UoY2FsbC5vYmplY3RJZCk7XG4gICAgICBjb25zdCBjbGFzc0RlZmluaXRpb24gPSB0aGlzLl9jbGFzc2VzQnlOYW1lLmdldChpbnRlcmZhY2VOYW1lKTtcbiAgICAgIGludmFyaWFudChjbGFzc0RlZmluaXRpb24gIT0gbnVsbCk7XG4gICAgICBjb25zdCB0eXBlID0gY2xhc3NEZWZpbml0aW9uLmRlZmluaXRpb24uaW5zdGFuY2VNZXRob2RzLmdldChjYWxsLm1ldGhvZCk7XG4gICAgICBpbnZhcmlhbnQodHlwZSAhPSBudWxsKTtcblxuICAgICAgY29uc3QgbWFyc2hhbGxlZEFyZ3MgPSBhd2FpdCB0aGlzLl90eXBlUmVnaXN0cnkudW5tYXJzaGFsQXJndW1lbnRzKFxuICAgICAgICBtYXJzaGFsbGluZ0NvbnRleHQsIGNhbGwuYXJncywgdHlwZS5hcmd1bWVudFR5cGVzKTtcblxuICAgICAgcmV0dXJuIHJldHVyblZhbHVlKFxuICAgICAgICBvYmplY3RbY2FsbC5tZXRob2RdLmFwcGx5KG9iamVjdCwgbWFyc2hhbGxlZEFyZ3MpLFxuICAgICAgICB0eXBlLnJldHVyblR5cGUpO1xuICAgIH07XG5cbiAgICBjb25zdCBjYWxsQ29uc3RydWN0b3IgPSBhc3luYyAoY29uc3RydWN0b3JNZXNzYWdlOiBDcmVhdGVSZW1vdGVPYmplY3RNZXNzYWdlKSA9PiB7XG4gICAgICBjb25zdCBjbGFzc0RlZmluaXRpb24gPSB0aGlzLl9jbGFzc2VzQnlOYW1lLmdldChjb25zdHJ1Y3Rvck1lc3NhZ2UuaW50ZXJmYWNlKTtcbiAgICAgIGludmFyaWFudChjbGFzc0RlZmluaXRpb24gIT0gbnVsbCk7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGxvY2FsSW1wbGVtZW50YXRpb24sXG4gICAgICAgIGRlZmluaXRpb24sXG4gICAgICB9ID0gY2xhc3NEZWZpbml0aW9uO1xuXG4gICAgICBjb25zdCBtYXJzaGFsbGVkQXJncyA9IGF3YWl0IHRoaXMuX3R5cGVSZWdpc3RyeS51bm1hcnNoYWxBcmd1bWVudHMoXG4gICAgICAgIG1hcnNoYWxsaW5nQ29udGV4dCwgY29uc3RydWN0b3JNZXNzYWdlLmFyZ3MsIGRlZmluaXRpb24uY29uc3RydWN0b3JBcmdzKTtcblxuICAgICAgLy8gQ3JlYXRlIGEgbmV3IG9iamVjdCBhbmQgcHV0IGl0IGluIHRoZSByZWdpc3RyeS5cbiAgICAgIGNvbnN0IG5ld09iamVjdCA9IGNvbnN0cnVjdChsb2NhbEltcGxlbWVudGF0aW9uLCBtYXJzaGFsbGVkQXJncyk7XG5cbiAgICAgIC8vIFJldHVybiB0aGUgb2JqZWN0LCB3aGljaCB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgY29udmVydGVkIHRvIGFuIGlkIHRocm91Z2ggdGhlXG4gICAgICAvLyBtYXJzaGFsbGluZyBzeXN0ZW0uXG4gICAgICByZXR1cm5Qcm9taXNlKFxuICAgICAgICBQcm9taXNlLnJlc29sdmUobmV3T2JqZWN0KSxcbiAgICAgICAge1xuICAgICAgICAgIGtpbmQ6ICduYW1lZCcsXG4gICAgICAgICAgbmFtZTogY29uc3RydWN0b3JNZXNzYWdlLmludGVyZmFjZSxcbiAgICAgICAgICBsb2NhdGlvbjogYnVpbHRpbkxvY2F0aW9uLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gSGVyZSdzIHRoZSBtYWluIG1lc3NhZ2UgaGFuZGxlciAuLi5cbiAgICB0cnkge1xuICAgICAgbGV0IHJldHVybmVkUHJvbWlzZSA9IGZhbHNlO1xuICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnRnVuY3Rpb25DYWxsJzpcbiAgICAgICAgICByZXR1cm5lZFByb21pc2UgPSBhd2FpdCBjYWxsRnVuY3Rpb24obWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ01ldGhvZENhbGwnOlxuICAgICAgICAgIHJldHVybmVkUHJvbWlzZSA9IGF3YWl0IGNhbGxNZXRob2QobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ05ld09iamVjdCc6XG4gICAgICAgICAgYXdhaXQgY2FsbENvbnN0cnVjdG9yKG1lc3NhZ2UpO1xuICAgICAgICAgIHJldHVybmVkUHJvbWlzZSA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0Rpc3Bvc2VPYmplY3QnOlxuICAgICAgICAgIGF3YWl0IG1hcnNoYWxsaW5nQ29udGV4dC5kaXNwb3NlT2JqZWN0KG1lc3NhZ2Uub2JqZWN0SWQpO1xuICAgICAgICAgIHJldHVyblByb21pc2UoUHJvbWlzZS5yZXNvbHZlKCksIHZvaWRUeXBlKTtcbiAgICAgICAgICByZXR1cm5lZFByb21pc2UgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdEaXNwb3NlT2JzZXJ2YWJsZSc6XG4gICAgICAgICAgbWFyc2hhbGxpbmdDb250ZXh0LmRpc3Bvc2VTdWJzY3JpcHRpb24ocmVxdWVzdElkKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua293biBtZXNzYWdlIHR5cGUgJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgICB9XG4gICAgICBpZiAoIXJldHVybmVkUHJvbWlzZSkge1xuICAgICAgICB0aW1pbmdUcmFja2VyLm9uU3VjY2VzcygpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihlICE9IG51bGwgPyBlLm1lc3NhZ2UgOiBlKTtcbiAgICAgIHRpbWluZ1RyYWNrZXIub25FcnJvcihlID09IG51bGwgPyBuZXcgRXJyb3IoKSA6IGUpO1xuICAgICAgY2xpZW50LnNlbmRTb2NrZXRNZXNzYWdlKGNyZWF0ZUVycm9yTWVzc2FnZShyZXF1ZXN0SWQsIGUpKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0RnVuY3Rpb25JbXBsZW1lbnRpb24obmFtZTogc3RyaW5nKTogRnVuY3Rpb25JbXBsZW1lbnRhdGlvbiB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZnVuY3Rpb25zQnlOYW1lLmdldChuYW1lKTtcbiAgICBpbnZhcmlhbnQocmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyYWNraW5nSWRPZk1lc3NhZ2UocmVnaXN0cnk6IE9iamVjdFJlZ2lzdHJ5LCBtZXNzYWdlOiBSZXF1ZXN0TWVzc2FnZSk6IHN0cmluZyB7XG4gIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgY2FzZSAnRnVuY3Rpb25DYWxsJzpcbiAgICAgIHJldHVybiBgc2VydmljZS1mcmFtZXdvcms6JHttZXNzYWdlLmZ1bmN0aW9ufWA7XG4gICAgY2FzZSAnTWV0aG9kQ2FsbCc6XG4gICAgICBjb25zdCBjYWxsSW50ZXJmYWNlID0gcmVnaXN0cnkuZ2V0SW50ZXJmYWNlKG1lc3NhZ2Uub2JqZWN0SWQpO1xuICAgICAgcmV0dXJuIGBzZXJ2aWNlLWZyYW1ld29yazoke2NhbGxJbnRlcmZhY2V9LiR7bWVzc2FnZS5tZXRob2R9YDtcbiAgICBjYXNlICdOZXdPYmplY3QnOlxuICAgICAgcmV0dXJuIGBzZXJ2aWNlLWZyYW1ld29yazpuZXc6JHttZXNzYWdlLmludGVyZmFjZX1gO1xuICAgIGNhc2UgJ0Rpc3Bvc2VPYmplY3QnOlxuICAgICAgY29uc3QgaW50ZXJmYWNlTmFtZSA9IHJlZ2lzdHJ5LmdldEludGVyZmFjZShtZXNzYWdlLm9iamVjdElkKTtcbiAgICAgIHJldHVybiBgc2VydmljZS1mcmFtZXdvcms6ZGlzcG9zZToke2ludGVyZmFjZU5hbWV9YDtcbiAgICBjYXNlICdEaXNwb3NlT2JzZXJ2YWJsZSc6XG4gICAgICByZXR1cm4gYHNlcnZpY2UtZnJhbWV3b3JrOmRpc3Bvc2VPYnNlcnZhYmxlYDtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG1lc3NhZ2UgdHlwZSAke21lc3NhZ2UudHlwZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgbGV0J3MgdXMgJ2FwcGx5JyBhbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gYSBjb25zdHJ1Y3Rvci5cbiAqIEl0IHdvcmtzIGJ5IGNyZWF0aW5nIGEgbmV3IGNvbnN0cnVjdG9yIHRoYXQgaGFzIHRoZSBzYW1lIHByb3RvdHlwZSBhcyB0aGUgb3JpZ2luYWxcbiAqIGNvbnN0cnVjdG9yLCBhbmQgc2ltcGx5IGFwcGxpZXMgdGhlIG9yaWdpbmFsIGNvbnN0cnVjdG9yIGRpcmVjdGx5IHRvICd0aGlzJy5cbiAqIEByZXR1cm5zIEFuIGluc3RhbmNlIG9mIGNsYXNzT2JqZWN0LlxuICovXG5mdW5jdGlvbiBjb25zdHJ1Y3QoY2xhc3NPYmplY3QsIGFyZ3MpIHtcbiAgZnVuY3Rpb24gRigpIHtcbiAgICByZXR1cm4gY2xhc3NPYmplY3QuYXBwbHkodGhpcywgYXJncyk7XG4gIH1cbiAgRi5wcm90b3R5cGUgPSBjbGFzc09iamVjdC5wcm90b3R5cGU7XG4gIHJldHVybiBuZXcgRigpO1xufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgY2hlY2tzIGlmIGFuIG9iamVjdCBpcyB0aGVuYWJsZSAoUHJvbWlzZS1saWtlKS5cbiAqL1xuZnVuY3Rpb24gaXNUaGVuYWJsZShvYmplY3Q6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gQm9vbGVhbihvYmplY3QgJiYgb2JqZWN0LnRoZW4pO1xufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgY2hlY2tzIGlmIGFuIG9iamVjdCBpcyBhbiBPYnNlcnZhYmxlLlxuICovXG5mdW5jdGlvbiBpc09ic2VydmFibGUob2JqZWN0OiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIEJvb2xlYW4ob2JqZWN0ICYmIG9iamVjdC5jb25jYXRNYXAgJiYgb2JqZWN0LnN1YnNjcmliZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByb21pc2VNZXNzYWdlKHJlcXVlc3RJZDogbnVtYmVyLCByZXN1bHQ6IGFueSk6IFByb21pc2VSZXNwb25zZU1lc3NhZ2Uge1xuICByZXR1cm4ge1xuICAgIGNoYW5uZWw6ICdzZXJ2aWNlX2ZyYW1ld29yazNfcnBjJyxcbiAgICB0eXBlOiAnUHJvbWlzZU1lc3NhZ2UnLFxuICAgIHJlcXVlc3RJZCxcbiAgICByZXN1bHQsXG4gICAgaGFkRXJyb3I6IGZhbHNlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVOZXh0TWVzc2FnZShyZXF1ZXN0SWQ6IG51bWJlciwgZGF0YTogYW55KTogT2JzZXJ2YWJsZVJlc3BvbnNlTWVzc2FnZSB7XG4gIHJldHVybiB7XG4gICAgY2hhbm5lbDogJ3NlcnZpY2VfZnJhbWV3b3JrM19ycGMnLFxuICAgIHR5cGU6ICdPYnNlcnZhYmxlTWVzc2FnZScsXG4gICAgcmVxdWVzdElkLFxuICAgIGhhZEVycm9yOiBmYWxzZSxcbiAgICByZXN1bHQ6IHtcbiAgICAgIHR5cGU6ICduZXh0JyxcbiAgICAgIGRhdGE6IGRhdGEsXG4gICAgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29tcGxldGVkTWVzc2FnZShyZXF1ZXN0SWQ6IG51bWJlcik6IE9ic2VydmFibGVSZXNwb25zZU1lc3NhZ2Uge1xuICByZXR1cm4ge1xuICAgIGNoYW5uZWw6ICdzZXJ2aWNlX2ZyYW1ld29yazNfcnBjJyxcbiAgICB0eXBlOiAnT2JzZXJ2YWJsZU1lc3NhZ2UnLFxuICAgIHJlcXVlc3RJZCxcbiAgICBoYWRFcnJvcjogZmFsc2UsXG4gICAgcmVzdWx0OiB7IHR5cGU6ICdjb21wbGV0ZWQnIH0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVycm9yTWVzc2FnZShyZXF1ZXN0SWQ6IG51bWJlciwgZXJyb3I6IGFueSk6IEVycm9yUmVzcG9uc2VNZXNzYWdlIHtcbiAgcmV0dXJuIHtcbiAgICBjaGFubmVsOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgdHlwZTogJ0Vycm9yTWVzc2FnZScsXG4gICAgcmVxdWVzdElkLFxuICAgIGhhZEVycm9yOiB0cnVlLFxuICAgIGVycm9yOiBmb3JtYXRFcnJvcihlcnJvciksXG4gIH07XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBlcnJvciBiZWZvcmUgc2VuZGluZyBvdmVyIHRoZSB3ZWIgc29ja2V0LlxuICogVE9ETzogVGhpcyBzaG91bGQgYmUgYSBjdXN0b20gbWFyc2hhbGxlciByZWdpc3RlcmVkIGluIHRoZSBUeXBlUmVnaXN0cnlcbiAqL1xuZnVuY3Rpb24gZm9ybWF0RXJyb3IoZXJyb3I6IGFueSk6ID8oT2JqZWN0IHwgc3RyaW5nKSB7XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICBjb2RlOiBlcnJvci5jb2RlLFxuICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgIH07XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVycm9yID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBlcnJvci50b1N0cmluZygpO1xuICB9IGVsc2UgaWYgKGVycm9yID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBgVW5rbm93biBFcnJvcjogJHtlcnJvci50b1N0cmluZygpfWA7XG4gIH1cbn1cbiJdfQ==