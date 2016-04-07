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

    this._nextObjectId = 1;
    this._objectRegistry = new Map();

    this._subscriptions = new Map();

    // NuclideUri type requires no transformations (it is done on the client side).
    this._typeRegistry.registerType('NuclideUri', function (uri) {
      return uri;
    }, function (remotePath) {
      return remotePath;
    });

    this.addServices(services);
  }

  /**
   * A helper function that let's us 'apply' an array of arguments to a constructor.
   * It works by creating a new constructor that has the same prototype as the original
   * constructor, and simply applies the original constructor directly to 'this'.
   * @returns An instance of classObject.
   */

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

                _this._typeRegistry.registerType(name, _asyncToGenerator(function* (object) {
                  // If the object has already been assigned an id, return that id.
                  if (object._remoteId) {
                    return object._remoteId;
                  }

                  // Put the object in the registry.
                  object._interface = name;
                  var objectId = _this._nextObjectId;
                  _this._objectRegistry.set(objectId, object);
                  object._remoteId = objectId;
                  _this._nextObjectId++;

                  return objectId;
                }), _asyncToGenerator(function* (objectId) {
                  return _this._objectRegistry.get(objectId);
                }));

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

      var returnVal = null;
      var returnType = _nuclideServiceParserLibBuiltinTypes.voidType;
      var callError = undefined;
      var hadError = false;

      // Track timings of all function calls, method calls, and object creations.
      // Note: for Observables we only track how long it takes to create the initial Observable.
      var timingTracker = null;

      try {
        switch (message.type) {
          case 'FunctionCall':
            timingTracker = (0, _nuclideAnalytics.startTracking)('service-framework:' + message['function']);

            // Transform arguments and call function.

            var _getFunctionImplemention2 = this._getFunctionImplemention(message['function']),
                fcLocalImplementation = _getFunctionImplemention2.localImplementation,
                fcType = _getFunctionImplemention2.type;

            var fcTransfomedArgs = yield Promise.all(message.args.map(function (arg, i) {
              return _this2._typeRegistry.unmarshal(arg, fcType.argumentTypes[i]);
            }));

            // Invoke function and return the results.
            (0, _assert2['default'])(fcType.returnType.kind === 'void' || fcType.returnType.kind === 'promise' || fcType.returnType.kind === 'observable');
            returnType = fcType.returnType;
            returnVal = fcLocalImplementation.apply(this, fcTransfomedArgs);
            break;
          case 'MethodCall':
            // Get the object.
            var mcObject = this._objectRegistry.get(message.objectId);
            (0, _assert2['default'])(mcObject != null);
            timingTracker = (0, _nuclideAnalytics.startTracking)('service-framework:' + mcObject._interface + '.' + message.method);

            // Get the method FunctionType description.
            var className = this._classesByName.get(mcObject._interface);
            (0, _assert2['default'])(className != null);
            var mcType = className.definition.instanceMethods.get(message.method);
            (0, _assert2['default'])(mcType != null);

            // Unmarshal arguments.
            var mcTransfomedArgs = yield Promise.all(message.args.map(function (arg, i) {
              return _this2._typeRegistry.unmarshal(arg, mcType.argumentTypes[i]);
            }));

            // Invoke message.
            (0, _assert2['default'])(mcType.returnType.kind === 'void' || mcType.returnType.kind === 'promise' || mcType.returnType.kind === 'observable');
            returnType = mcType.returnType;
            returnVal = mcObject[message.method].apply(mcObject, mcTransfomedArgs);
            break;
          case 'NewObject':
            timingTracker = (0, _nuclideAnalytics.startTracking)('service-framework:new:' + message['interface']);

            var classDefinition = this._classesByName.get(message['interface']);
            (0, _assert2['default'])(classDefinition != null);
            var noLocalImplementation = classDefinition.localImplementation,
                noDefinition = classDefinition.definition;

            // Transform arguments.
            var noTransfomedArgs = yield Promise.all(message.args.map(function (arg, i) {
              return _this2._typeRegistry.unmarshal(arg, noDefinition.constructorArgs[i]);
            }));

            // Create a new object and put it in the registry.
            var noObject = construct(noLocalImplementation, noTransfomedArgs);

            // Return the object, which will automatically be converted to an id through the
            // marshalling system.
            returnType = {
              kind: 'promise',
              type: {
                kind: 'named',
                name: message['interface'],
                location: _nuclideServiceParserLibBuiltinTypes.builtinLocation
              },
              location: _nuclideServiceParserLibBuiltinTypes.builtinLocation
            };
            returnVal = Promise.resolve(noObject);
            break;
          case 'DisposeObject':
            // Get the object.
            var doObject = this._objectRegistry.get(message.objectId);
            (0, _assert2['default'])(doObject != null);

            timingTracker = (0, _nuclideAnalytics.startTracking)('service-framework:dispose:' + doObject._interface);

            // Remove the object from the registry, and scrub it's id.
            doObject._remoteId = undefined;
            this._objectRegistry['delete'](message.objectId);

            // Call the object's local dispose function.
            returnType = {
              kind: 'promise',
              type: _nuclideServiceParserLibBuiltinTypes.voidType,
              location: _nuclideServiceParserLibBuiltinTypes.builtinLocation
            };
            yield doObject.dispose();

            // Return a void Promise
            returnVal = Promise.resolve();
            break;
          case 'DisposeObservable':
            // Dispose an in-progress observable, before it has naturally completed.
            var subscription = this._subscriptions.get(requestId);
            if (subscription != null) {
              subscription.dispose();
              this._subscriptions['delete'](requestId);
            }
            break;
          default:
            throw new Error('Unkown message type ' + message.type);
        }
      } catch (e) {
        logger.error(e != null ? e.message : e);
        callError = e;
        hadError = true;
      }

      switch (returnType.kind) {
        case 'void':
          if (timingTracker != null) {
            if (callError != null) {
              timingTracker.onError(callError);
            } else {
              timingTracker.onSuccess();
            }
          }
          break; // No need to send anything back to the user.
        case 'promise':
          // If there was an error executing the command, we send that back as a rejected promise.
          if (hadError) {
            returnVal = Promise.reject(callError);
          }

          // Ensure that the return value is a promise.
          if (!isThenable(returnVal)) {
            returnVal = Promise.reject(new Error('Expected a Promise, but the function returned something else.'));
          }

          // Marshal the result, to send over the network.
          (0, _assert2['default'])(returnVal != null);
          // $FlowIssue
          returnVal = returnVal.then(function (value) {
            return _this2._typeRegistry.marshal(value, returnType.type);
          });

          // Send the result of the promise across the socket.
          returnVal.then(function (result) {
            var resultMessage = {
              channel: 'service_framework3_rpc',
              type: 'PromiseMessage',
              requestId: requestId,
              result: result,
              hadError: false
            };
            client.sendSocketMessage(resultMessage);
            if (timingTracker != null) {
              timingTracker.onSuccess();
            }
          }, function (error) {
            var errorMessage = {
              channel: 'service_framework3_rpc',
              type: 'ErrorMessage',
              requestId: requestId,
              hadError: true,
              error: formatError(error)
            };
            client.sendSocketMessage(errorMessage);
            if (timingTracker != null) {
              timingTracker.onError(error);
            }
          });
          break;
        case 'observable':
          // If there was an error executing the command, we send that back as an error Observable.
          if (hadError) {
            returnVal = _rx.Observable['throw'](callError);
            if (timingTracker != null && callError != null) {
              timingTracker.onError(callError);
            }
          } else if (timingTracker != null) {
            timingTracker.onSuccess();
          }

          // Ensure that the return value is an observable.
          if (!isObservable(returnVal)) {
            returnVal = _rx.Observable['throw'](new Error('Expected an Observable, but the function returned something else.'));
          }
          var returnObservable = returnVal;

          // Marshal the result, to send over the network.
          returnObservable = returnObservable.concatMap(
          // $FlowIssue
          function (value) {
            return _this2._typeRegistry.marshal(value, returnType.type);
          });

          // Send the next, error, and completion events of the observable across the socket.
          var subscription = returnObservable.subscribe(function (data) {
            var eventMessage = {
              channel: 'service_framework3_rpc',
              type: 'ObservableMessage',
              requestId: requestId,
              hadError: false,
              result: {
                type: 'next',
                data: data
              }
            };
            client.sendSocketMessage(eventMessage);
          }, function (error) {
            var errorMessage = {
              channel: 'service_framework3_rpc',
              type: 'ErrorMessage',
              requestId: requestId,
              hadError: true,
              error: formatError(error)
            };
            client.sendSocketMessage(errorMessage);
            _this2._subscriptions['delete'](requestId);
          }, function (completed) {
            var eventMessage = {
              channel: 'service_framework3_rpc',
              type: 'ObservableMessage',
              requestId: requestId,
              hadError: false,
              result: { type: 'completed' }
            };
            client.sendSocketMessage(eventMessage);
            _this2._subscriptions['delete'](requestId);
          });
          this._subscriptions.set(requestId, subscription);
          break;
        default:
          throw new Error('Unkown return type ' + returnType.kind + '.');
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
//# sourceMappingURL=data:application/json;base64,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QUUsQ0FBRztHQUM3QztDQUNGIiwiZmlsZSI6IlNlcnZlckNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuaW1wb3J0IHtnZXREZWZpbml0aW9uc30gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1zZXJ2aWNlLXBhcnNlcic7XG5pbXBvcnQgVHlwZVJlZ2lzdHJ5IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtc2VydmljZS1wYXJzZXIvbGliL1R5cGVSZWdpc3RyeSc7XG5pbXBvcnQge2J1aWx0aW5Mb2NhdGlvbiwgdm9pZFR5cGV9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtc2VydmljZS1wYXJzZXIvbGliL2J1aWx0aW4tdHlwZXMnO1xuaW1wb3J0IHtzdGFydFRyYWNraW5nfSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQgdHlwZSB7VGltaW5nVHJhY2tlcn0gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHR5cGUge1xuICBWb2lkVHlwZSxcbiAgRnVuY3Rpb25UeXBlLFxuICBQcm9taXNlVHlwZSxcbiAgT2JzZXJ2YWJsZVR5cGUsXG4gIERlZmluaXRpb24sXG4gIEludGVyZmFjZURlZmluaXRpb24sXG4gIFR5cGUsXG59IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtc2VydmljZS1wYXJzZXIvbGliL3R5cGVzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB0eXBlIHtDb25maWdFbnRyeX0gZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCB0eXBlIHtSZXF1ZXN0TWVzc2FnZSwgRXJyb3JSZXNwb25zZU1lc3NhZ2UsIFByb21pc2VSZXNwb25zZU1lc3NhZ2UsXG4gIE9ic2VydmFibGVSZXNwb25zZU1lc3NhZ2V9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge1NvY2tldENsaWVudH0gZnJvbSAnLi4vU29ja2V0Q2xpZW50JztcblxuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbnR5cGUgRnVuY3Rpb25JbXBsZW1lbnRhdGlvbiA9IHtsb2NhbEltcGxlbWVudGF0aW9uOiBGdW5jdGlvbjsgdHlwZTogRnVuY3Rpb25UeXBlfTtcblxudHlwZSBSZW1vdGVPYmplY3QgPSB7XG4gIF9pbnRlcmZhY2U6IHN0cmluZztcbiAgX3JlbW90ZUlkOiA/bnVtYmVyO1xuICBkaXNwb3NlOiAoKSA9PiBtaXhlZDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcnZlckNvbXBvbmVudCB7XG4gIF90eXBlUmVnaXN0cnk6IFR5cGVSZWdpc3RyeTtcblxuICAvKipcbiAgICogU3RvcmUgYSBtYXBwaW5nIGZyb20gZnVuY3Rpb24gbmFtZSB0byBhIHN0cnVjdHVyZSBob2xkaW5nIGJvdGggdGhlIGxvY2FsIGltcGxlbWVudGF0aW9uIGFuZFxuICAgKiB0aGUgdHlwZSBkZWZpbml0aW9uIG9mIHRoZSBmdW5jdGlvbi5cbiAgICovXG4gIF9mdW5jdGlvbnNCeU5hbWU6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uSW1wbGVtZW50YXRpb24+O1xuXG4gIC8qKlxuICAgKiBTdG9yZSBhIG1hcHBpbmcgZnJvbSBhIGNsYXNzIG5hbWUgdG8gYSBzdHJ1Y3QgY29udGFpbmluZyBpdCdzIGxvY2FsIGNvbnN0cnVjdG9yIGFuZCBpdCdzXG4gICAqIGludGVyZmFjZSBkZWZpbml0aW9uLlxuICAgKi9cbiAgX2NsYXNzZXNCeU5hbWU6IE1hcDxzdHJpbmcsIHtsb2NhbEltcGxlbWVudGF0aW9uOiBhbnk7IGRlZmluaXRpb246IEludGVyZmFjZURlZmluaXRpb259PjtcblxuICBfb2JqZWN0UmVnaXN0cnk6IE1hcDxudW1iZXIsIFJlbW90ZU9iamVjdD47XG4gIF9uZXh0T2JqZWN0SWQ6IG51bWJlcjtcblxuICBfc3Vic2NyaXB0aW9uczogTWFwPG51bWJlciwgSURpc3Bvc2FibGU+O1xuXG4gIGNvbnN0cnVjdG9yKHNlcnZpY2VzOiBBcnJheTxDb25maWdFbnRyeT4pIHtcbiAgICB0aGlzLl90eXBlUmVnaXN0cnkgPSBuZXcgVHlwZVJlZ2lzdHJ5KCk7XG4gICAgdGhpcy5fZnVuY3Rpb25zQnlOYW1lID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2NsYXNzZXNCeU5hbWUgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9uZXh0T2JqZWN0SWQgPSAxO1xuICAgIHRoaXMuX29iamVjdFJlZ2lzdHJ5ID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE51Y2xpZGVVcmkgdHlwZSByZXF1aXJlcyBubyB0cmFuc2Zvcm1hdGlvbnMgKGl0IGlzIGRvbmUgb24gdGhlIGNsaWVudCBzaWRlKS5cbiAgICB0aGlzLl90eXBlUmVnaXN0cnkucmVnaXN0ZXJUeXBlKCdOdWNsaWRlVXJpJywgdXJpID0+IHVyaSwgcmVtb3RlUGF0aCA9PiByZW1vdGVQYXRoKTtcblxuICAgIHRoaXMuYWRkU2VydmljZXMoc2VydmljZXMpO1xuICB9XG5cbiAgYWRkU2VydmljZXMoc2VydmljZXM6IEFycmF5PENvbmZpZ0VudHJ5Pik6IHZvaWQge1xuICAgIHNlcnZpY2VzLmZvckVhY2godGhpcy5hZGRTZXJ2aWNlLCB0aGlzKTtcbiAgfVxuXG4gIGFkZFNlcnZpY2Uoc2VydmljZTogQ29uZmlnRW50cnkpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoYFJlZ2lzdGVyaW5nIDMuMCBzZXJ2aWNlICR7c2VydmljZS5uYW1lfS4uLmApO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkZWZzID0gZ2V0RGVmaW5pdGlvbnMoc2VydmljZS5kZWZpbml0aW9uKTtcbiAgICAgIC8vICRGbG93SXNzdWUgLSB0aGUgcGFyYW1ldGVyIHBhc3NlZCB0byByZXF1aXJlIG11c3QgYmUgYSBsaXRlcmFsIHN0cmluZy5cbiAgICAgIGNvbnN0IGxvY2FsSW1wbCA9IHJlcXVpcmUoc2VydmljZS5pbXBsZW1lbnRhdGlvbik7XG5cbiAgICAgIC8vIFJlZ2lzdGVyIHR5cGUgYWxpYXNlcy5cbiAgICAgIGRlZnMuZm9yRWFjaCgoZGVmaW5pdGlvbjogRGVmaW5pdGlvbikgPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gZGVmaW5pdGlvbi5uYW1lO1xuICAgICAgICBzd2l0Y2ggKGRlZmluaXRpb24ua2luZCkge1xuICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgUmVnaXN0ZXJpbmcgdHlwZSBhbGlhcyAke25hbWV9Li4uYCk7XG4gICAgICAgICAgICBpZiAoZGVmaW5pdGlvbi5kZWZpbml0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyQWxpYXMobmFtZSwgKGRlZmluaXRpb24uZGVmaW5pdGlvbjogVHlwZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgbW9kdWxlLWxldmVsIGZ1bmN0aW9ucy5cbiAgICAgICAgICAgIHRoaXMuX3JlZ2lzdGVyRnVuY3Rpb24oYCR7c2VydmljZS5uYW1lfS8ke25hbWV9YCwgbG9jYWxJbXBsW25hbWVdLCBkZWZpbml0aW9uLnR5cGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnaW50ZXJmYWNlJzpcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGludGVyZmFjZXMuXG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoYFJlZ2lzdGVyaW5nIGludGVyZmFjZSAke25hbWV9Li4uYCk7XG4gICAgICAgICAgICB0aGlzLl9jbGFzc2VzQnlOYW1lLnNldChuYW1lLCAge1xuICAgICAgICAgICAgICBsb2NhbEltcGxlbWVudGF0aW9uOiBsb2NhbEltcGxbbmFtZV0sXG4gICAgICAgICAgICAgIGRlZmluaXRpb24sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyVHlwZShuYW1lLCBhc3luYyBvYmplY3QgPT4ge1xuICAgICAgICAgICAgICAvLyBJZiB0aGUgb2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYXNzaWduZWQgYW4gaWQsIHJldHVybiB0aGF0IGlkLlxuICAgICAgICAgICAgICBpZiAob2JqZWN0Ll9yZW1vdGVJZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3QuX3JlbW90ZUlkO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gUHV0IHRoZSBvYmplY3QgaW4gdGhlIHJlZ2lzdHJ5LlxuICAgICAgICAgICAgICBvYmplY3QuX2ludGVyZmFjZSA9IG5hbWU7XG4gICAgICAgICAgICAgIGNvbnN0IG9iamVjdElkID0gdGhpcy5fbmV4dE9iamVjdElkO1xuICAgICAgICAgICAgICB0aGlzLl9vYmplY3RSZWdpc3RyeS5zZXQob2JqZWN0SWQsIG9iamVjdCk7XG4gICAgICAgICAgICAgIG9iamVjdC5fcmVtb3RlSWQgPSBvYmplY3RJZDtcbiAgICAgICAgICAgICAgdGhpcy5fbmV4dE9iamVjdElkKys7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdElkO1xuICAgICAgICAgICAgfSwgYXN5bmMgb2JqZWN0SWQgPT4gdGhpcy5fb2JqZWN0UmVnaXN0cnkuZ2V0KG9iamVjdElkKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGFsbCBvZiB0aGUgc3RhdGljIG1ldGhvZHMgYXMgcmVtb3RlIGZ1bmN0aW9ucy5cbiAgICAgICAgICAgIGRlZmluaXRpb24uc3RhdGljTWV0aG9kcy5mb3JFYWNoKChmdW5jVHlwZSwgZnVuY05hbWUpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJGdW5jdGlvbihgJHtuYW1lfS8ke2Z1bmNOYW1lfWAsIGxvY2FsSW1wbFtuYW1lXVtmdW5jTmFtZV0sIGZ1bmNUeXBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmVycm9yKGBGYWlsZWQgdG8gbG9hZCBzZXJ2aWNlICR7c2VydmljZS5uYW1lfS4gU3RhY2sgVHJhY2U6XFxuJHtlLnN0YWNrfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBfcmVnaXN0ZXJGdW5jdGlvbihuYW1lOiBzdHJpbmcsIGxvY2FsSW1wbDogRnVuY3Rpb24sIHR5cGU6IEZ1bmN0aW9uVHlwZSk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZyhgUmVnaXN0ZXJpbmcgZnVuY3Rpb24gJHtuYW1lfS4uLmApO1xuICAgIGlmICh0aGlzLl9mdW5jdGlvbnNCeU5hbWUuaGFzKG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBSUEMgZnVuY3Rpb246ICR7bmFtZX1gKTtcbiAgICB9XG4gICAgdGhpcy5fZnVuY3Rpb25zQnlOYW1lLnNldChuYW1lLCAge1xuICAgICAgbG9jYWxJbXBsZW1lbnRhdGlvbjogbG9jYWxJbXBsLFxuICAgICAgdHlwZSxcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZU1lc3NhZ2UoY2xpZW50OiBTb2NrZXRDbGllbnQsIG1lc3NhZ2U6IFJlcXVlc3RNZXNzYWdlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVxdWVzdElkID0gbWVzc2FnZS5yZXF1ZXN0SWQ7XG5cbiAgICBsZXQgcmV0dXJuVmFsOiA/KFByb21pc2UgfCBPYnNlcnZhYmxlKSA9IG51bGw7XG4gICAgbGV0IHJldHVyblR5cGU6IFByb21pc2VUeXBlIHwgT2JzZXJ2YWJsZVR5cGUgfCBWb2lkVHlwZSA9IHZvaWRUeXBlO1xuICAgIGxldCBjYWxsRXJyb3I7XG4gICAgbGV0IGhhZEVycm9yID0gZmFsc2U7XG5cbiAgICAvLyBUcmFjayB0aW1pbmdzIG9mIGFsbCBmdW5jdGlvbiBjYWxscywgbWV0aG9kIGNhbGxzLCBhbmQgb2JqZWN0IGNyZWF0aW9ucy5cbiAgICAvLyBOb3RlOiBmb3IgT2JzZXJ2YWJsZXMgd2Ugb25seSB0cmFjayBob3cgbG9uZyBpdCB0YWtlcyB0byBjcmVhdGUgdGhlIGluaXRpYWwgT2JzZXJ2YWJsZS5cbiAgICBsZXQgdGltaW5nVHJhY2tlcjogP1RpbWluZ1RyYWNrZXIgPSBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ0Z1bmN0aW9uQ2FsbCc6XG4gICAgICAgICAgdGltaW5nVHJhY2tlciA9IHN0YXJ0VHJhY2tpbmcoYHNlcnZpY2UtZnJhbWV3b3JrOiR7bWVzc2FnZS5mdW5jdGlvbn1gKTtcblxuICAgICAgICAgIC8vIFRyYW5zZm9ybSBhcmd1bWVudHMgYW5kIGNhbGwgZnVuY3Rpb24uXG4gICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgbG9jYWxJbXBsZW1lbnRhdGlvbjogZmNMb2NhbEltcGxlbWVudGF0aW9uLFxuICAgICAgICAgICAgdHlwZTogZmNUeXBlLFxuICAgICAgICAgIH0gPSB0aGlzLl9nZXRGdW5jdGlvbkltcGxlbWVudGlvbihtZXNzYWdlLmZ1bmN0aW9uKTtcbiAgICAgICAgICBjb25zdCBmY1RyYW5zZm9tZWRBcmdzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICBtZXNzYWdlLmFyZ3MubWFwKChhcmcsIGkpID0+IHRoaXMuX3R5cGVSZWdpc3RyeS51bm1hcnNoYWwoYXJnLCBmY1R5cGUuYXJndW1lbnRUeXBlc1tpXSkpXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIC8vIEludm9rZSBmdW5jdGlvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHRzLlxuICAgICAgICAgIGludmFyaWFudChmY1R5cGUucmV0dXJuVHlwZS5raW5kID09PSAndm9pZCcgfHxcbiAgICAgICAgICAgIGZjVHlwZS5yZXR1cm5UeXBlLmtpbmQgPT09ICdwcm9taXNlJyB8fFxuICAgICAgICAgICAgZmNUeXBlLnJldHVyblR5cGUua2luZCA9PT0gJ29ic2VydmFibGUnKTtcbiAgICAgICAgICByZXR1cm5UeXBlID0gKGZjVHlwZS5yZXR1cm5UeXBlOiBQcm9taXNlVHlwZSB8IE9ic2VydmFibGVUeXBlIHwgVm9pZFR5cGUpO1xuICAgICAgICAgIHJldHVyblZhbCA9IGZjTG9jYWxJbXBsZW1lbnRhdGlvbi5hcHBseSh0aGlzLCBmY1RyYW5zZm9tZWRBcmdzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnTWV0aG9kQ2FsbCc6XG4gICAgICAgICAgLy8gR2V0IHRoZSBvYmplY3QuXG4gICAgICAgICAgY29uc3QgbWNPYmplY3QgPSB0aGlzLl9vYmplY3RSZWdpc3RyeS5nZXQobWVzc2FnZS5vYmplY3RJZCk7XG4gICAgICAgICAgaW52YXJpYW50KG1jT2JqZWN0ICE9IG51bGwpO1xuICAgICAgICAgIHRpbWluZ1RyYWNrZXIgPSBzdGFydFRyYWNraW5nKFxuICAgICAgICAgICAgYHNlcnZpY2UtZnJhbWV3b3JrOiR7bWNPYmplY3QuX2ludGVyZmFjZX0uJHttZXNzYWdlLm1ldGhvZH1gXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIC8vIEdldCB0aGUgbWV0aG9kIEZ1bmN0aW9uVHlwZSBkZXNjcmlwdGlvbi5cbiAgICAgICAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLl9jbGFzc2VzQnlOYW1lLmdldChtY09iamVjdC5faW50ZXJmYWNlKTtcbiAgICAgICAgICBpbnZhcmlhbnQoY2xhc3NOYW1lICE9IG51bGwpO1xuICAgICAgICAgIGNvbnN0IG1jVHlwZSA9IGNsYXNzTmFtZS5kZWZpbml0aW9uLmluc3RhbmNlTWV0aG9kcy5nZXQobWVzc2FnZS5tZXRob2QpO1xuICAgICAgICAgIGludmFyaWFudChtY1R5cGUgIT0gbnVsbCk7XG5cbiAgICAgICAgICAvLyBVbm1hcnNoYWwgYXJndW1lbnRzLlxuICAgICAgICAgIGNvbnN0IG1jVHJhbnNmb21lZEFyZ3MgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIG1lc3NhZ2UuYXJncy5tYXAoKGFyZywgaSkgPT4gdGhpcy5fdHlwZVJlZ2lzdHJ5LnVubWFyc2hhbChhcmcsIG1jVHlwZS5hcmd1bWVudFR5cGVzW2ldKSlcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gSW52b2tlIG1lc3NhZ2UuXG4gICAgICAgICAgaW52YXJpYW50KG1jVHlwZS5yZXR1cm5UeXBlLmtpbmQgPT09ICd2b2lkJyB8fFxuICAgICAgICAgICAgbWNUeXBlLnJldHVyblR5cGUua2luZCA9PT0gJ3Byb21pc2UnIHx8XG4gICAgICAgICAgICBtY1R5cGUucmV0dXJuVHlwZS5raW5kID09PSAnb2JzZXJ2YWJsZScpO1xuICAgICAgICAgIHJldHVyblR5cGUgPSAobWNUeXBlLnJldHVyblR5cGU6IFByb21pc2VUeXBlIHwgT2JzZXJ2YWJsZVR5cGUgfCBWb2lkVHlwZSk7XG4gICAgICAgICAgcmV0dXJuVmFsID0gbWNPYmplY3RbbWVzc2FnZS5tZXRob2RdLmFwcGx5KG1jT2JqZWN0LCBtY1RyYW5zZm9tZWRBcmdzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnTmV3T2JqZWN0JzpcbiAgICAgICAgICB0aW1pbmdUcmFja2VyID0gc3RhcnRUcmFja2luZyhgc2VydmljZS1mcmFtZXdvcms6bmV3OiR7bWVzc2FnZS5pbnRlcmZhY2V9YCk7XG5cbiAgICAgICAgICBjb25zdCBjbGFzc0RlZmluaXRpb24gPSB0aGlzLl9jbGFzc2VzQnlOYW1lLmdldChtZXNzYWdlLmludGVyZmFjZSk7XG4gICAgICAgICAgaW52YXJpYW50KGNsYXNzRGVmaW5pdGlvbiAhPSBudWxsKTtcbiAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBsb2NhbEltcGxlbWVudGF0aW9uOiBub0xvY2FsSW1wbGVtZW50YXRpb24sXG4gICAgICAgICAgICBkZWZpbml0aW9uOiBub0RlZmluaXRpb24sXG4gICAgICAgICAgfSA9IGNsYXNzRGVmaW5pdGlvbjtcblxuICAgICAgICAgIC8vIFRyYW5zZm9ybSBhcmd1bWVudHMuXG4gICAgICAgICAgY29uc3Qgbm9UcmFuc2ZvbWVkQXJncyA9IGF3YWl0IFByb21pc2UuYWxsKG1lc3NhZ2UuYXJncy5tYXAoKGFyZywgaSkgPT5cbiAgICAgICAgICAgIHRoaXMuX3R5cGVSZWdpc3RyeS51bm1hcnNoYWwoYXJnLCBub0RlZmluaXRpb24uY29uc3RydWN0b3JBcmdzW2ldKSkpO1xuXG4gICAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IG9iamVjdCBhbmQgcHV0IGl0IGluIHRoZSByZWdpc3RyeS5cbiAgICAgICAgICBjb25zdCBub09iamVjdCA9IGNvbnN0cnVjdChub0xvY2FsSW1wbGVtZW50YXRpb24sIG5vVHJhbnNmb21lZEFyZ3MpO1xuXG4gICAgICAgICAgLy8gUmV0dXJuIHRoZSBvYmplY3QsIHdoaWNoIHdpbGwgYXV0b21hdGljYWxseSBiZSBjb252ZXJ0ZWQgdG8gYW4gaWQgdGhyb3VnaCB0aGVcbiAgICAgICAgICAvLyBtYXJzaGFsbGluZyBzeXN0ZW0uXG4gICAgICAgICAgcmV0dXJuVHlwZSA9IHtcbiAgICAgICAgICAgIGtpbmQ6ICdwcm9taXNlJyxcbiAgICAgICAgICAgIHR5cGU6IHtcbiAgICAgICAgICAgICAga2luZDogJ25hbWVkJyxcbiAgICAgICAgICAgICAgbmFtZTogbWVzc2FnZS5pbnRlcmZhY2UsXG4gICAgICAgICAgICAgIGxvY2F0aW9uOiBidWlsdGluTG9jYXRpb24sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9jYXRpb246IGJ1aWx0aW5Mb2NhdGlvbixcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVyblZhbCA9IFByb21pc2UucmVzb2x2ZShub09iamVjdCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0Rpc3Bvc2VPYmplY3QnOlxuICAgICAgICAgIC8vIEdldCB0aGUgb2JqZWN0LlxuICAgICAgICAgIGNvbnN0IGRvT2JqZWN0ID0gdGhpcy5fb2JqZWN0UmVnaXN0cnkuZ2V0KG1lc3NhZ2Uub2JqZWN0SWQpO1xuICAgICAgICAgIGludmFyaWFudChkb09iamVjdCAhPSBudWxsKTtcblxuICAgICAgICAgIHRpbWluZ1RyYWNrZXIgPSBzdGFydFRyYWNraW5nKGBzZXJ2aWNlLWZyYW1ld29yazpkaXNwb3NlOiR7ZG9PYmplY3QuX2ludGVyZmFjZX1gKTtcblxuICAgICAgICAgIC8vIFJlbW92ZSB0aGUgb2JqZWN0IGZyb20gdGhlIHJlZ2lzdHJ5LCBhbmQgc2NydWIgaXQncyBpZC5cbiAgICAgICAgICBkb09iamVjdC5fcmVtb3RlSWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgdGhpcy5fb2JqZWN0UmVnaXN0cnkuZGVsZXRlKG1lc3NhZ2Uub2JqZWN0SWQpO1xuXG4gICAgICAgICAgLy8gQ2FsbCB0aGUgb2JqZWN0J3MgbG9jYWwgZGlzcG9zZSBmdW5jdGlvbi5cbiAgICAgICAgICByZXR1cm5UeXBlID0ge1xuICAgICAgICAgICAga2luZDogJ3Byb21pc2UnLFxuICAgICAgICAgICAgdHlwZTogdm9pZFR5cGUsXG4gICAgICAgICAgICBsb2NhdGlvbjogYnVpbHRpbkxvY2F0aW9uLFxuICAgICAgICAgIH07XG4gICAgICAgICAgYXdhaXQgZG9PYmplY3QuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgLy8gUmV0dXJuIGEgdm9pZCBQcm9taXNlXG4gICAgICAgICAgcmV0dXJuVmFsID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0Rpc3Bvc2VPYnNlcnZhYmxlJzpcbiAgICAgICAgICAvLyBEaXNwb3NlIGFuIGluLXByb2dyZXNzIG9ic2VydmFibGUsIGJlZm9yZSBpdCBoYXMgbmF0dXJhbGx5IGNvbXBsZXRlZC5cbiAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9zdWJzY3JpcHRpb25zLmdldChyZXF1ZXN0SWQpO1xuICAgICAgICAgIGlmIChzdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rb3duIG1lc3NhZ2UgdHlwZSAke21lc3NhZ2UudHlwZX1gKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoZSAhPSBudWxsID8gZS5tZXNzYWdlIDogZSk7XG4gICAgICBjYWxsRXJyb3IgPSBlO1xuICAgICAgaGFkRXJyb3IgPSB0cnVlO1xuICAgIH1cblxuICAgIHN3aXRjaCAocmV0dXJuVHlwZS5raW5kKSB7XG4gICAgICBjYXNlICd2b2lkJzpcbiAgICAgICAgaWYgKHRpbWluZ1RyYWNrZXIgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChjYWxsRXJyb3IgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGltaW5nVHJhY2tlci5vbkVycm9yKGNhbGxFcnJvcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWluZ1RyYWNrZXIub25TdWNjZXNzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrOyAvLyBObyBuZWVkIHRvIHNlbmQgYW55dGhpbmcgYmFjayB0byB0aGUgdXNlci5cbiAgICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgICAgICAvLyBJZiB0aGVyZSB3YXMgYW4gZXJyb3IgZXhlY3V0aW5nIHRoZSBjb21tYW5kLCB3ZSBzZW5kIHRoYXQgYmFjayBhcyBhIHJlamVjdGVkIHByb21pc2UuXG4gICAgICAgIGlmIChoYWRFcnJvcikge1xuICAgICAgICAgIHJldHVyblZhbCA9IFByb21pc2UucmVqZWN0KGNhbGxFcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbnN1cmUgdGhhdCB0aGUgcmV0dXJuIHZhbHVlIGlzIGEgcHJvbWlzZS5cbiAgICAgICAgaWYgKCFpc1RoZW5hYmxlKHJldHVyblZhbCkpIHtcbiAgICAgICAgICByZXR1cm5WYWwgPSBQcm9taXNlLnJlamVjdChcbiAgICAgICAgICAgIG5ldyBFcnJvcignRXhwZWN0ZWQgYSBQcm9taXNlLCBidXQgdGhlIGZ1bmN0aW9uIHJldHVybmVkIHNvbWV0aGluZyBlbHNlLicpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1hcnNoYWwgdGhlIHJlc3VsdCwgdG8gc2VuZCBvdmVyIHRoZSBuZXR3b3JrLlxuICAgICAgICBpbnZhcmlhbnQocmV0dXJuVmFsICE9IG51bGwpO1xuICAgICAgICAvLyAkRmxvd0lzc3VlXG4gICAgICAgIHJldHVyblZhbCA9IHJldHVyblZhbC50aGVuKHZhbHVlID0+IHRoaXMuX3R5cGVSZWdpc3RyeS5tYXJzaGFsKHZhbHVlLCByZXR1cm5UeXBlLnR5cGUpKTtcblxuICAgICAgICAvLyBTZW5kIHRoZSByZXN1bHQgb2YgdGhlIHByb21pc2UgYWNyb3NzIHRoZSBzb2NrZXQuXG4gICAgICAgIHJldHVyblZhbC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0TWVzc2FnZTogUHJvbWlzZVJlc3BvbnNlTWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGNoYW5uZWw6ICdzZXJ2aWNlX2ZyYW1ld29yazNfcnBjJyxcbiAgICAgICAgICAgIHR5cGU6ICdQcm9taXNlTWVzc2FnZScsXG4gICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgICBoYWRFcnJvcjogZmFsc2UsXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjbGllbnQuc2VuZFNvY2tldE1lc3NhZ2UocmVzdWx0TWVzc2FnZSk7XG4gICAgICAgICAgaWYgKHRpbWluZ1RyYWNrZXIgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGltaW5nVHJhY2tlci5vblN1Y2Nlc3MoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2U6IEVycm9yUmVzcG9uc2VNZXNzYWdlID0ge1xuICAgICAgICAgICAgY2hhbm5lbDogJ3NlcnZpY2VfZnJhbWV3b3JrM19ycGMnLFxuICAgICAgICAgICAgdHlwZTogJ0Vycm9yTWVzc2FnZScsXG4gICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICBoYWRFcnJvcjogdHJ1ZSxcbiAgICAgICAgICAgIGVycm9yOiBmb3JtYXRFcnJvcihlcnJvciksXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjbGllbnQuc2VuZFNvY2tldE1lc3NhZ2UoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICBpZiAodGltaW5nVHJhY2tlciAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aW1pbmdUcmFja2VyLm9uRXJyb3IoZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb2JzZXJ2YWJsZSc6XG4gICAgICAgIC8vIElmIHRoZXJlIHdhcyBhbiBlcnJvciBleGVjdXRpbmcgdGhlIGNvbW1hbmQsIHdlIHNlbmQgdGhhdCBiYWNrIGFzIGFuIGVycm9yIE9ic2VydmFibGUuXG4gICAgICAgIGlmIChoYWRFcnJvcikge1xuICAgICAgICAgIHJldHVyblZhbCA9IE9ic2VydmFibGUudGhyb3coY2FsbEVycm9yKTtcbiAgICAgICAgICBpZiAodGltaW5nVHJhY2tlciAhPSBudWxsICYmIGNhbGxFcnJvciAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aW1pbmdUcmFja2VyLm9uRXJyb3IoY2FsbEVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGltaW5nVHJhY2tlciAhPSBudWxsKSB7XG4gICAgICAgICAgdGltaW5nVHJhY2tlci5vblN1Y2Nlc3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSByZXR1cm4gdmFsdWUgaXMgYW4gb2JzZXJ2YWJsZS5cbiAgICAgICAgaWYgKCFpc09ic2VydmFibGUocmV0dXJuVmFsKSkge1xuICAgICAgICAgIHJldHVyblZhbCA9IE9ic2VydmFibGUudGhyb3cobmV3IEVycm9yKFxuICAgICAgICAgICAgJ0V4cGVjdGVkIGFuIE9ic2VydmFibGUsIGJ1dCB0aGUgZnVuY3Rpb24gcmV0dXJuZWQgc29tZXRoaW5nIGVsc2UuJykpO1xuICAgICAgICB9XG4gICAgICAgIGxldCByZXR1cm5PYnNlcnZhYmxlOiBPYnNlcnZhYmxlID0gKHJldHVyblZhbCA6IGFueSk7XG5cbiAgICAgICAgLy8gTWFyc2hhbCB0aGUgcmVzdWx0LCB0byBzZW5kIG92ZXIgdGhlIG5ldHdvcmsuXG4gICAgICAgIHJldHVybk9ic2VydmFibGUgPSByZXR1cm5PYnNlcnZhYmxlLmNvbmNhdE1hcChcbiAgICAgICAgICAgIC8vICRGbG93SXNzdWVcbiAgICAgICAgICAgIHZhbHVlID0+IHRoaXMuX3R5cGVSZWdpc3RyeS5tYXJzaGFsKHZhbHVlLCByZXR1cm5UeXBlLnR5cGUpKTtcblxuICAgICAgICAvLyBTZW5kIHRoZSBuZXh0LCBlcnJvciwgYW5kIGNvbXBsZXRpb24gZXZlbnRzIG9mIHRoZSBvYnNlcnZhYmxlIGFjcm9zcyB0aGUgc29ja2V0LlxuICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSByZXR1cm5PYnNlcnZhYmxlLnN1YnNjcmliZShkYXRhID0+IHtcbiAgICAgICAgICBjb25zdCBldmVudE1lc3NhZ2U6IE9ic2VydmFibGVSZXNwb25zZU1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBjaGFubmVsOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICAgICAgICB0eXBlOiAnT2JzZXJ2YWJsZU1lc3NhZ2UnLFxuICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgaGFkRXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgcmVzdWx0OiB7XG4gICAgICAgICAgICAgIHR5cGU6ICduZXh0JyxcbiAgICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjbGllbnQuc2VuZFNvY2tldE1lc3NhZ2UoZXZlbnRNZXNzYWdlKTtcbiAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZTogRXJyb3JSZXNwb25zZU1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBjaGFubmVsOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICAgICAgICB0eXBlOiAnRXJyb3JNZXNzYWdlJyxcbiAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgIGhhZEVycm9yOiB0cnVlLFxuICAgICAgICAgICAgZXJyb3I6IGZvcm1hdEVycm9yKGVycm9yKSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGNsaWVudC5zZW5kU29ja2V0TWVzc2FnZShlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XG4gICAgICAgIH0sIGNvbXBsZXRlZCA9PiB7XG4gICAgICAgICAgY29uc3QgZXZlbnRNZXNzYWdlOiBPYnNlcnZhYmxlUmVzcG9uc2VNZXNzYWdlID0ge1xuICAgICAgICAgICAgY2hhbm5lbDogJ3NlcnZpY2VfZnJhbWV3b3JrM19ycGMnLFxuICAgICAgICAgICAgdHlwZTogJ09ic2VydmFibGVNZXNzYWdlJyxcbiAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgIGhhZEVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIHJlc3VsdDogeyB0eXBlOiAnY29tcGxldGVkJyB9LFxuICAgICAgICAgIH07XG4gICAgICAgICAgY2xpZW50LnNlbmRTb2NrZXRNZXNzYWdlKGV2ZW50TWVzc2FnZSk7XG4gICAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuc2V0KHJlcXVlc3RJZCwgc3Vic2NyaXB0aW9uKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua293biByZXR1cm4gdHlwZSAke3JldHVyblR5cGUua2luZH0uYCk7XG4gICAgfVxuICB9XG5cbiAgX2dldEZ1bmN0aW9uSW1wbGVtZW50aW9uKG5hbWU6IHN0cmluZyk6IEZ1bmN0aW9uSW1wbGVtZW50YXRpb24ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2Z1bmN0aW9uc0J5TmFtZS5nZXQobmFtZSk7XG4gICAgaW52YXJpYW50KHJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgbGV0J3MgdXMgJ2FwcGx5JyBhbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gYSBjb25zdHJ1Y3Rvci5cbiAqIEl0IHdvcmtzIGJ5IGNyZWF0aW5nIGEgbmV3IGNvbnN0cnVjdG9yIHRoYXQgaGFzIHRoZSBzYW1lIHByb3RvdHlwZSBhcyB0aGUgb3JpZ2luYWxcbiAqIGNvbnN0cnVjdG9yLCBhbmQgc2ltcGx5IGFwcGxpZXMgdGhlIG9yaWdpbmFsIGNvbnN0cnVjdG9yIGRpcmVjdGx5IHRvICd0aGlzJy5cbiAqIEByZXR1cm5zIEFuIGluc3RhbmNlIG9mIGNsYXNzT2JqZWN0LlxuICovXG5mdW5jdGlvbiBjb25zdHJ1Y3QoY2xhc3NPYmplY3QsIGFyZ3MpIHtcbiAgZnVuY3Rpb24gRigpIHtcbiAgICByZXR1cm4gY2xhc3NPYmplY3QuYXBwbHkodGhpcywgYXJncyk7XG4gIH1cbiAgRi5wcm90b3R5cGUgPSBjbGFzc09iamVjdC5wcm90b3R5cGU7XG4gIHJldHVybiBuZXcgRigpO1xufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgY2hlY2tzIGlmIGFuIG9iamVjdCBpcyB0aGVuYWJsZSAoUHJvbWlzZS1saWtlKS5cbiAqL1xuZnVuY3Rpb24gaXNUaGVuYWJsZShvYmplY3Q6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gQm9vbGVhbihvYmplY3QgJiYgb2JqZWN0LnRoZW4pO1xufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgY2hlY2tzIGlmIGFuIG9iamVjdCBpcyBhbiBPYnNlcnZhYmxlLlxuICovXG5mdW5jdGlvbiBpc09ic2VydmFibGUob2JqZWN0OiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIEJvb2xlYW4ob2JqZWN0ICYmIG9iamVjdC5jb25jYXRNYXAgJiYgb2JqZWN0LnN1YnNjcmliZSk7XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBlcnJvciBiZWZvcmUgc2VuZGluZyBvdmVyIHRoZSB3ZWIgc29ja2V0LlxuICogVE9ETzogVGhpcyBzaG91bGQgYmUgYSBjdXN0b20gbWFyc2hhbGxlciByZWdpc3RlcmVkIGluIHRoZSBUeXBlUmVnaXN0cnlcbiAqL1xuZnVuY3Rpb24gZm9ybWF0RXJyb3IoZXJyb3IpOiA/KE9iamVjdCB8IHN0cmluZykge1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIHJldHVybiB7XG4gICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgY29kZTogZXJyb3IuY29kZSxcbiAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICB9O1xuICB9IGVsc2UgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZXJyb3IudG9TdHJpbmcoKTtcbiAgfSBlbHNlIGlmIChlcnJvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYFVua25vd24gRXJyb3I6ICR7ZXJyb3IudG9TdHJpbmcoKX1gO1xuICB9XG59XG4iXX0=