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

var _serviceParser = require('../../../service-parser');

var _serviceParserLibTypeRegistry = require('../../../service-parser/lib/TypeRegistry');

var _serviceParserLibTypeRegistry2 = _interopRequireDefault(_serviceParserLibTypeRegistry);

var _serviceParserLibBuiltinTypes = require('../../../service-parser/lib/builtin-types');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var logger = require('../../../logging').getLogger();

var ServerComponent = (function () {
  function ServerComponent(server, services) {
    _classCallCheck(this, ServerComponent);

    this._server = server;

    this._typeRegistry = new _serviceParserLibTypeRegistry2['default']();
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
          var defs = (0, _serviceParser.getDefinitions)(service.definition);
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
      var returnType = _serviceParserLibBuiltinTypes.voidType;
      var callError = undefined;
      var hadError = false;

      try {
        switch (message.type) {
          case 'FunctionCall':
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
                location: _serviceParserLibBuiltinTypes.builtinLocation
              },
              location: _serviceParserLibBuiltinTypes.builtinLocation
            };
            returnVal = Promise.resolve(noObject);
            break;
          case 'DisposeObject':
            // Get the object.
            var doObject = this._objectRegistry.get(message.objectId);
            (0, _assert2['default'])(doObject != null);

            // Remove the object from the registry, and scrub it's id.
            doObject._remoteId = undefined;
            this._objectRegistry['delete'](message.objectId);

            // Call the object's local dispose function.
            returnType = {
              kind: 'promise',
              type: _serviceParserLibBuiltinTypes.voidType,
              location: _serviceParserLibBuiltinTypes.builtinLocation
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
            _this2._server._sendSocketMessage(client, resultMessage);
          }, function (error) {
            var errorMessage = {
              channel: 'service_framework3_rpc',
              type: 'ErrorMessage',
              requestId: requestId,
              hadError: true,
              error: formatError(error)
            };
            _this2._server._sendSocketMessage(client, errorMessage);
          });
          break;
        case 'observable':
          // If there was an error executing the command, we send that back as an error Observable.
          if (hadError) {
            returnVal = _rx.Observable['throw'](callError);
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
            _this2._server._sendSocketMessage(client, eventMessage);
          }, function (error) {
            var errorMessage = {
              channel: 'service_framework3_rpc',
              type: 'ErrorMessage',
              requestId: requestId,
              hadError: true,
              error: formatError(error)
            };
            _this2._server._sendSocketMessage(client, errorMessage);
            _this2._subscriptions['delete'](requestId);
          }, function (completed) {
            var eventMessage = {
              channel: 'service_framework3_rpc',
              type: 'ObservableMessage',
              requestId: requestId,
              hadError: false,
              result: { type: 'completed' }
            };
            _this2._server._sendSocketMessage(client, eventMessage);
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
//# sourceMappingURL=data:application/json;base64,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RUFBRTtBQUMxQixXQUFPO0FBQ0wsYUFBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO0FBQ3RCLFVBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtBQUNoQixXQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7S0FDbkIsQ0FBQztHQUNILE1BQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7QUFDcEMsV0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7R0FDekIsTUFBTSxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7QUFDOUIsV0FBTyxTQUFTLENBQUM7R0FDbEIsTUFBTTtBQUNMLCtCQUF5QixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUc7R0FDN0M7Q0FDRiIsImZpbGUiOiJTZXJ2ZXJDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4JztcbmltcG9ydCB7Z2V0RGVmaW5pdGlvbnN9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2UtcGFyc2VyJztcbmltcG9ydCB0eXBlIE51Y2xpZGVTZXJ2ZXIgZnJvbSAnLi4vTnVjbGlkZVNlcnZlcic7XG5pbXBvcnQgVHlwZVJlZ2lzdHJ5IGZyb20gJy4uLy4uLy4uL3NlcnZpY2UtcGFyc2VyL2xpYi9UeXBlUmVnaXN0cnknO1xuaW1wb3J0IHtidWlsdGluTG9jYXRpb24sIHZvaWRUeXBlfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlLXBhcnNlci9saWIvYnVpbHRpbi10eXBlcyc7XG5pbXBvcnQgdHlwZSB7XG4gIFZvaWRUeXBlLFxuICBGdW5jdGlvblR5cGUsXG4gIFByb21pc2VUeXBlLFxuICBPYnNlcnZhYmxlVHlwZSxcbiAgRGVmaW5pdGlvbixcbiAgSW50ZXJmYWNlRGVmaW5pdGlvbixcbiAgVHlwZSxcbn0gZnJvbSAnLi4vLi4vLi4vc2VydmljZS1wYXJzZXIvbGliL3R5cGVzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB0eXBlIHtDb25maWdFbnRyeX0gZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCB0eXBlIHtSZXF1ZXN0TWVzc2FnZSwgRXJyb3JSZXNwb25zZU1lc3NhZ2UsIFByb21pc2VSZXNwb25zZU1lc3NhZ2UsXG4gIE9ic2VydmFibGVSZXNwb25zZU1lc3NhZ2V9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge1NvY2tldENsaWVudH0gZnJvbSAnLi4vTnVjbGlkZVNlcnZlcic7XG5cbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxudHlwZSBGdW5jdGlvbkltcGxlbWVudGF0aW9uID0ge2xvY2FsSW1wbGVtZW50YXRpb246IEZ1bmN0aW9uOyB0eXBlOiBGdW5jdGlvblR5cGV9O1xuXG50eXBlIFJlbW90ZU9iamVjdCA9IHtcbiAgX2ludGVyZmFjZTogc3RyaW5nO1xuICBfcmVtb3RlSWQ6ID9udW1iZXI7XG4gIGRpc3Bvc2U6ICgpID0+IG1peGVkO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VydmVyQ29tcG9uZW50IHtcbiAgX3R5cGVSZWdpc3RyeTogVHlwZVJlZ2lzdHJ5O1xuXG4gIC8qKlxuICAgKiBTdG9yZSBhIG1hcHBpbmcgZnJvbSBmdW5jdGlvbiBuYW1lIHRvIGEgc3RydWN0dXJlIGhvbGRpbmcgYm90aCB0aGUgbG9jYWwgaW1wbGVtZW50YXRpb24gYW5kXG4gICAqIHRoZSB0eXBlIGRlZmluaXRpb24gb2YgdGhlIGZ1bmN0aW9uLlxuICAgKi9cbiAgX2Z1bmN0aW9uc0J5TmFtZTogTWFwPHN0cmluZywgRnVuY3Rpb25JbXBsZW1lbnRhdGlvbj47XG5cbiAgLyoqXG4gICAqIFN0b3JlIGEgbWFwcGluZyBmcm9tIGEgY2xhc3MgbmFtZSB0byBhIHN0cnVjdCBjb250YWluaW5nIGl0J3MgbG9jYWwgY29uc3RydWN0b3IgYW5kIGl0J3NcbiAgICogaW50ZXJmYWNlIGRlZmluaXRpb24uXG4gICAqL1xuICBfY2xhc3Nlc0J5TmFtZTogTWFwPHN0cmluZywge2xvY2FsSW1wbGVtZW50YXRpb246IGFueTsgZGVmaW5pdGlvbjogSW50ZXJmYWNlRGVmaW5pdGlvbn0+O1xuXG4gIF9vYmplY3RSZWdpc3RyeTogTWFwPG51bWJlciwgUmVtb3RlT2JqZWN0PjtcbiAgX25leHRPYmplY3RJZDogbnVtYmVyO1xuXG4gIF9zdWJzY3JpcHRpb25zOiBNYXA8bnVtYmVyLCByeCRJRGlzcG9zYWJsZT47XG5cbiAgX3NlcnZlcjogTnVjbGlkZVNlcnZlcjtcblxuICBjb25zdHJ1Y3RvcihzZXJ2ZXI6IE51Y2xpZGVTZXJ2ZXIsIHNlcnZpY2VzOiBBcnJheTxDb25maWdFbnRyeT4pIHtcbiAgICB0aGlzLl9zZXJ2ZXIgPSBzZXJ2ZXI7XG5cbiAgICB0aGlzLl90eXBlUmVnaXN0cnkgPSBuZXcgVHlwZVJlZ2lzdHJ5KCk7XG4gICAgdGhpcy5fZnVuY3Rpb25zQnlOYW1lID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2NsYXNzZXNCeU5hbWUgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9uZXh0T2JqZWN0SWQgPSAxO1xuICAgIHRoaXMuX29iamVjdFJlZ2lzdHJ5ID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE51Y2xpZGVVcmkgdHlwZSByZXF1aXJlcyBubyB0cmFuc2Zvcm1hdGlvbnMgKGl0IGlzIGRvbmUgb24gdGhlIGNsaWVudCBzaWRlKS5cbiAgICB0aGlzLl90eXBlUmVnaXN0cnkucmVnaXN0ZXJUeXBlKCdOdWNsaWRlVXJpJywgdXJpID0+IHVyaSwgcmVtb3RlUGF0aCA9PiByZW1vdGVQYXRoKTtcblxuICAgIHRoaXMuYWRkU2VydmljZXMoc2VydmljZXMpO1xuICB9XG5cbiAgYWRkU2VydmljZXMoc2VydmljZXM6IEFycmF5PENvbmZpZ0VudHJ5Pik6IHZvaWQge1xuICAgIHNlcnZpY2VzLmZvckVhY2godGhpcy5hZGRTZXJ2aWNlLCB0aGlzKTtcbiAgfVxuXG4gIGFkZFNlcnZpY2Uoc2VydmljZTogQ29uZmlnRW50cnkpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoYFJlZ2lzdGVyaW5nIDMuMCBzZXJ2aWNlICR7c2VydmljZS5uYW1lfS4uLmApO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkZWZzID0gZ2V0RGVmaW5pdGlvbnMoc2VydmljZS5kZWZpbml0aW9uKTtcbiAgICAgIC8vICRGbG93SXNzdWUgLSB0aGUgcGFyYW1ldGVyIHBhc3NlZCB0byByZXF1aXJlIG11c3QgYmUgYSBsaXRlcmFsIHN0cmluZy5cbiAgICAgIGNvbnN0IGxvY2FsSW1wbCA9IHJlcXVpcmUoc2VydmljZS5pbXBsZW1lbnRhdGlvbik7XG5cbiAgICAgIC8vIFJlZ2lzdGVyIHR5cGUgYWxpYXNlcy5cbiAgICAgIGRlZnMuZm9yRWFjaCgoZGVmaW5pdGlvbjogRGVmaW5pdGlvbikgPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gZGVmaW5pdGlvbi5uYW1lO1xuICAgICAgICBzd2l0Y2ggKGRlZmluaXRpb24ua2luZCkge1xuICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgUmVnaXN0ZXJpbmcgdHlwZSBhbGlhcyAke25hbWV9Li4uYCk7XG4gICAgICAgICAgICBpZiAoZGVmaW5pdGlvbi5kZWZpbml0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyQWxpYXMobmFtZSwgKGRlZmluaXRpb24uZGVmaW5pdGlvbjogVHlwZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgbW9kdWxlLWxldmVsIGZ1bmN0aW9ucy5cbiAgICAgICAgICAgIHRoaXMuX3JlZ2lzdGVyRnVuY3Rpb24oYCR7c2VydmljZS5uYW1lfS8ke25hbWV9YCwgbG9jYWxJbXBsW25hbWVdLCBkZWZpbml0aW9uLnR5cGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnaW50ZXJmYWNlJzpcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGludGVyZmFjZXMuXG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoYFJlZ2lzdGVyaW5nIGludGVyZmFjZSAke25hbWV9Li4uYCk7XG4gICAgICAgICAgICB0aGlzLl9jbGFzc2VzQnlOYW1lLnNldChuYW1lLCAge1xuICAgICAgICAgICAgICBsb2NhbEltcGxlbWVudGF0aW9uOiBsb2NhbEltcGxbbmFtZV0sXG4gICAgICAgICAgICAgIGRlZmluaXRpb24sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyVHlwZShuYW1lLCBhc3luYyBvYmplY3QgPT4ge1xuICAgICAgICAgICAgICAvLyBJZiB0aGUgb2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYXNzaWduZWQgYW4gaWQsIHJldHVybiB0aGF0IGlkLlxuICAgICAgICAgICAgICBpZiAob2JqZWN0Ll9yZW1vdGVJZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3QuX3JlbW90ZUlkO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gUHV0IHRoZSBvYmplY3QgaW4gdGhlIHJlZ2lzdHJ5LlxuICAgICAgICAgICAgICBvYmplY3QuX2ludGVyZmFjZSA9IG5hbWU7XG4gICAgICAgICAgICAgIGNvbnN0IG9iamVjdElkID0gdGhpcy5fbmV4dE9iamVjdElkO1xuICAgICAgICAgICAgICB0aGlzLl9vYmplY3RSZWdpc3RyeS5zZXQob2JqZWN0SWQsIG9iamVjdCk7XG4gICAgICAgICAgICAgIG9iamVjdC5fcmVtb3RlSWQgPSBvYmplY3RJZDtcbiAgICAgICAgICAgICAgdGhpcy5fbmV4dE9iamVjdElkKys7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdElkO1xuICAgICAgICAgICAgfSwgYXN5bmMgb2JqZWN0SWQgPT4gdGhpcy5fb2JqZWN0UmVnaXN0cnkuZ2V0KG9iamVjdElkKSk7XG5cbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGFsbCBvZiB0aGUgc3RhdGljIG1ldGhvZHMgYXMgcmVtb3RlIGZ1bmN0aW9ucy5cbiAgICAgICAgICAgIGRlZmluaXRpb24uc3RhdGljTWV0aG9kcy5mb3JFYWNoKChmdW5jVHlwZSwgZnVuY05hbWUpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJGdW5jdGlvbihgJHtuYW1lfS8ke2Z1bmNOYW1lfWAsIGxvY2FsSW1wbFtuYW1lXVtmdW5jTmFtZV0sIGZ1bmNUeXBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmVycm9yKGBGYWlsZWQgdG8gbG9hZCBzZXJ2aWNlICR7c2VydmljZS5uYW1lfS4gU3RhY2sgVHJhY2U6XFxuJHtlLnN0YWNrfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBfcmVnaXN0ZXJGdW5jdGlvbihuYW1lOiBzdHJpbmcsIGxvY2FsSW1wbDogRnVuY3Rpb24sIHR5cGU6IEZ1bmN0aW9uVHlwZSk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZyhgUmVnaXN0ZXJpbmcgZnVuY3Rpb24gJHtuYW1lfS4uLmApO1xuICAgIGlmICh0aGlzLl9mdW5jdGlvbnNCeU5hbWUuaGFzKG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBSUEMgZnVuY3Rpb246ICR7bmFtZX1gKTtcbiAgICB9XG4gICAgdGhpcy5fZnVuY3Rpb25zQnlOYW1lLnNldChuYW1lLCAge1xuICAgICAgbG9jYWxJbXBsZW1lbnRhdGlvbjogbG9jYWxJbXBsLFxuICAgICAgdHlwZSxcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZU1lc3NhZ2UoY2xpZW50OiBTb2NrZXRDbGllbnQsIG1lc3NhZ2U6IFJlcXVlc3RNZXNzYWdlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVxdWVzdElkID0gbWVzc2FnZS5yZXF1ZXN0SWQ7XG5cbiAgICBsZXQgcmV0dXJuVmFsOiA/KFByb21pc2UgfCBPYnNlcnZhYmxlKSA9IG51bGw7XG4gICAgbGV0IHJldHVyblR5cGU6IFByb21pc2VUeXBlIHwgT2JzZXJ2YWJsZVR5cGUgfCBWb2lkVHlwZSA9IHZvaWRUeXBlO1xuICAgIGxldCBjYWxsRXJyb3I7XG4gICAgbGV0IGhhZEVycm9yID0gZmFsc2U7XG5cbiAgICB0cnkge1xuICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnRnVuY3Rpb25DYWxsJzpcbiAgICAgICAgICAvLyBUcmFuc2Zvcm0gYXJndW1lbnRzIGFuZCBjYWxsIGZ1bmN0aW9uLlxuICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIGxvY2FsSW1wbGVtZW50YXRpb246IGZjTG9jYWxJbXBsZW1lbnRhdGlvbixcbiAgICAgICAgICAgIHR5cGU6IGZjVHlwZSxcbiAgICAgICAgICB9ID0gdGhpcy5fZ2V0RnVuY3Rpb25JbXBsZW1lbnRpb24obWVzc2FnZS5mdW5jdGlvbik7XG4gICAgICAgICAgY29uc3QgZmNUcmFuc2ZvbWVkQXJncyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICAgICAgbWVzc2FnZS5hcmdzLm1hcCgoYXJnLCBpKSA9PiB0aGlzLl90eXBlUmVnaXN0cnkudW5tYXJzaGFsKGFyZywgZmNUeXBlLmFyZ3VtZW50VHlwZXNbaV0pKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAvLyBJbnZva2UgZnVuY3Rpb24gYW5kIHJldHVybiB0aGUgcmVzdWx0cy5cbiAgICAgICAgICBpbnZhcmlhbnQoZmNUeXBlLnJldHVyblR5cGUua2luZCA9PT0gJ3ZvaWQnIHx8XG4gICAgICAgICAgICBmY1R5cGUucmV0dXJuVHlwZS5raW5kID09PSAncHJvbWlzZScgfHxcbiAgICAgICAgICAgIGZjVHlwZS5yZXR1cm5UeXBlLmtpbmQgPT09ICdvYnNlcnZhYmxlJyk7XG4gICAgICAgICAgcmV0dXJuVHlwZSA9IChmY1R5cGUucmV0dXJuVHlwZTogUHJvbWlzZVR5cGUgfCBPYnNlcnZhYmxlVHlwZSB8IFZvaWRUeXBlKTtcbiAgICAgICAgICByZXR1cm5WYWwgPSBmY0xvY2FsSW1wbGVtZW50YXRpb24uYXBwbHkodGhpcywgZmNUcmFuc2ZvbWVkQXJncyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ01ldGhvZENhbGwnOlxuICAgICAgICAgIC8vIEdldCB0aGUgb2JqZWN0LlxuICAgICAgICAgIGNvbnN0IG1jT2JqZWN0ID0gdGhpcy5fb2JqZWN0UmVnaXN0cnkuZ2V0KG1lc3NhZ2Uub2JqZWN0SWQpO1xuICAgICAgICAgIGludmFyaWFudChtY09iamVjdCAhPSBudWxsKTtcblxuICAgICAgICAgIC8vIEdldCB0aGUgbWV0aG9kIEZ1bmN0aW9uVHlwZSBkZXNjcmlwdGlvbi5cbiAgICAgICAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLl9jbGFzc2VzQnlOYW1lLmdldChtY09iamVjdC5faW50ZXJmYWNlKTtcbiAgICAgICAgICBpbnZhcmlhbnQoY2xhc3NOYW1lICE9IG51bGwpO1xuICAgICAgICAgIGNvbnN0IG1jVHlwZSA9IGNsYXNzTmFtZS5kZWZpbml0aW9uLmluc3RhbmNlTWV0aG9kcy5nZXQobWVzc2FnZS5tZXRob2QpO1xuICAgICAgICAgIGludmFyaWFudChtY1R5cGUgIT0gbnVsbCk7XG5cbiAgICAgICAgICAvLyBVbm1hcnNoYWwgYXJndW1lbnRzLlxuICAgICAgICAgIGNvbnN0IG1jVHJhbnNmb21lZEFyZ3MgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIG1lc3NhZ2UuYXJncy5tYXAoKGFyZywgaSkgPT4gdGhpcy5fdHlwZVJlZ2lzdHJ5LnVubWFyc2hhbChhcmcsIG1jVHlwZS5hcmd1bWVudFR5cGVzW2ldKSlcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gSW52b2tlIG1lc3NhZ2UuXG4gICAgICAgICAgaW52YXJpYW50KG1jVHlwZS5yZXR1cm5UeXBlLmtpbmQgPT09ICd2b2lkJyB8fFxuICAgICAgICAgICAgbWNUeXBlLnJldHVyblR5cGUua2luZCA9PT0gJ3Byb21pc2UnIHx8XG4gICAgICAgICAgICBtY1R5cGUucmV0dXJuVHlwZS5raW5kID09PSAnb2JzZXJ2YWJsZScpO1xuICAgICAgICAgIHJldHVyblR5cGUgPSAobWNUeXBlLnJldHVyblR5cGU6IFByb21pc2VUeXBlIHwgT2JzZXJ2YWJsZVR5cGUgfCBWb2lkVHlwZSk7XG4gICAgICAgICAgcmV0dXJuVmFsID0gbWNPYmplY3RbbWVzc2FnZS5tZXRob2RdLmFwcGx5KG1jT2JqZWN0LCBtY1RyYW5zZm9tZWRBcmdzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnTmV3T2JqZWN0JzpcbiAgICAgICAgICBjb25zdCBjbGFzc0RlZmluaXRpb24gPSB0aGlzLl9jbGFzc2VzQnlOYW1lLmdldChtZXNzYWdlLmludGVyZmFjZSk7XG4gICAgICAgICAgaW52YXJpYW50KGNsYXNzRGVmaW5pdGlvbiAhPSBudWxsKTtcbiAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBsb2NhbEltcGxlbWVudGF0aW9uOiBub0xvY2FsSW1wbGVtZW50YXRpb24sXG4gICAgICAgICAgICBkZWZpbml0aW9uOiBub0RlZmluaXRpb24sXG4gICAgICAgICAgfSA9IGNsYXNzRGVmaW5pdGlvbjtcblxuICAgICAgICAgIC8vIFRyYW5zZm9ybSBhcmd1bWVudHMuXG4gICAgICAgICAgY29uc3Qgbm9UcmFuc2ZvbWVkQXJncyA9IGF3YWl0IFByb21pc2UuYWxsKG1lc3NhZ2UuYXJncy5tYXAoKGFyZywgaSkgPT5cbiAgICAgICAgICAgIHRoaXMuX3R5cGVSZWdpc3RyeS51bm1hcnNoYWwoYXJnLCBub0RlZmluaXRpb24uY29uc3RydWN0b3JBcmdzW2ldKSkpO1xuXG4gICAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IG9iamVjdCBhbmQgcHV0IGl0IGluIHRoZSByZWdpc3RyeS5cbiAgICAgICAgICBjb25zdCBub09iamVjdCA9IGNvbnN0cnVjdChub0xvY2FsSW1wbGVtZW50YXRpb24sIG5vVHJhbnNmb21lZEFyZ3MpO1xuXG4gICAgICAgICAgLy8gUmV0dXJuIHRoZSBvYmplY3QsIHdoaWNoIHdpbGwgYXV0b21hdGljYWxseSBiZSBjb252ZXJ0ZWQgdG8gYW4gaWQgdGhyb3VnaCB0aGVcbiAgICAgICAgICAvLyBtYXJzaGFsbGluZyBzeXN0ZW0uXG4gICAgICAgICAgcmV0dXJuVHlwZSA9IHtcbiAgICAgICAgICAgIGtpbmQ6ICdwcm9taXNlJyxcbiAgICAgICAgICAgIHR5cGU6IHtcbiAgICAgICAgICAgICAga2luZDogJ25hbWVkJyxcbiAgICAgICAgICAgICAgbmFtZTogbWVzc2FnZS5pbnRlcmZhY2UsXG4gICAgICAgICAgICAgIGxvY2F0aW9uOiBidWlsdGluTG9jYXRpb24sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9jYXRpb246IGJ1aWx0aW5Mb2NhdGlvbixcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVyblZhbCA9IFByb21pc2UucmVzb2x2ZShub09iamVjdCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0Rpc3Bvc2VPYmplY3QnOlxuICAgICAgICAgIC8vIEdldCB0aGUgb2JqZWN0LlxuICAgICAgICAgIGNvbnN0IGRvT2JqZWN0ID0gdGhpcy5fb2JqZWN0UmVnaXN0cnkuZ2V0KG1lc3NhZ2Uub2JqZWN0SWQpO1xuICAgICAgICAgIGludmFyaWFudChkb09iamVjdCAhPSBudWxsKTtcblxuICAgICAgICAgIC8vIFJlbW92ZSB0aGUgb2JqZWN0IGZyb20gdGhlIHJlZ2lzdHJ5LCBhbmQgc2NydWIgaXQncyBpZC5cbiAgICAgICAgICBkb09iamVjdC5fcmVtb3RlSWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgdGhpcy5fb2JqZWN0UmVnaXN0cnkuZGVsZXRlKG1lc3NhZ2Uub2JqZWN0SWQpO1xuXG4gICAgICAgICAgLy8gQ2FsbCB0aGUgb2JqZWN0J3MgbG9jYWwgZGlzcG9zZSBmdW5jdGlvbi5cbiAgICAgICAgICByZXR1cm5UeXBlID0ge1xuICAgICAgICAgICAga2luZDogJ3Byb21pc2UnLFxuICAgICAgICAgICAgdHlwZTogdm9pZFR5cGUsXG4gICAgICAgICAgICBsb2NhdGlvbjogYnVpbHRpbkxvY2F0aW9uLFxuICAgICAgICAgIH07XG4gICAgICAgICAgYXdhaXQgZG9PYmplY3QuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgLy8gUmV0dXJuIGEgdm9pZCBQcm9taXNlXG4gICAgICAgICAgcmV0dXJuVmFsID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0Rpc3Bvc2VPYnNlcnZhYmxlJzpcbiAgICAgICAgICAvLyBEaXNwb3NlIGFuIGluLXByb2dyZXNzIG9ic2VydmFibGUsIGJlZm9yZSBpdCBoYXMgbmF0dXJhbGx5IGNvbXBsZXRlZC5cbiAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9zdWJzY3JpcHRpb25zLmdldChyZXF1ZXN0SWQpO1xuICAgICAgICAgIGlmIChzdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rb3duIG1lc3NhZ2UgdHlwZSAke21lc3NhZ2UudHlwZX1gKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoZSAhPSBudWxsID8gZS5tZXNzYWdlIDogZSk7XG4gICAgICBjYWxsRXJyb3IgPSBlO1xuICAgICAgaGFkRXJyb3IgPSB0cnVlO1xuICAgIH1cblxuICAgIHN3aXRjaCAocmV0dXJuVHlwZS5raW5kKSB7XG4gICAgICBjYXNlICd2b2lkJzpcbiAgICAgICAgYnJlYWs7IC8vIE5vIG5lZWQgdG8gc2VuZCBhbnl0aGluZyBiYWNrIHRvIHRoZSB1c2VyLlxuICAgICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICAgIC8vIElmIHRoZXJlIHdhcyBhbiBlcnJvciBleGVjdXRpbmcgdGhlIGNvbW1hbmQsIHdlIHNlbmQgdGhhdCBiYWNrIGFzIGEgcmVqZWN0ZWQgcHJvbWlzZS5cbiAgICAgICAgaWYgKGhhZEVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuVmFsID0gUHJvbWlzZS5yZWplY3QoY2FsbEVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSByZXR1cm4gdmFsdWUgaXMgYSBwcm9taXNlLlxuICAgICAgICBpZiAoIWlzVGhlbmFibGUocmV0dXJuVmFsKSkge1xuICAgICAgICAgIHJldHVyblZhbCA9IFByb21pc2UucmVqZWN0KFxuICAgICAgICAgICAgbmV3IEVycm9yKCdFeHBlY3RlZCBhIFByb21pc2UsIGJ1dCB0aGUgZnVuY3Rpb24gcmV0dXJuZWQgc29tZXRoaW5nIGVsc2UuJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWFyc2hhbCB0aGUgcmVzdWx0LCB0byBzZW5kIG92ZXIgdGhlIG5ldHdvcmsuXG4gICAgICAgIGludmFyaWFudChyZXR1cm5WYWwgIT0gbnVsbCk7XG4gICAgICAgIC8vICRGbG93SXNzdWVcbiAgICAgICAgcmV0dXJuVmFsID0gcmV0dXJuVmFsLnRoZW4odmFsdWUgPT4gdGhpcy5fdHlwZVJlZ2lzdHJ5Lm1hcnNoYWwodmFsdWUsIHJldHVyblR5cGUudHlwZSkpO1xuXG4gICAgICAgIC8vIFNlbmQgdGhlIHJlc3VsdCBvZiB0aGUgcHJvbWlzZSBhY3Jvc3MgdGhlIHNvY2tldC5cbiAgICAgICAgcmV0dXJuVmFsLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICBjb25zdCByZXN1bHRNZXNzYWdlOiBQcm9taXNlUmVzcG9uc2VNZXNzYWdlID0ge1xuICAgICAgICAgICAgY2hhbm5lbDogJ3NlcnZpY2VfZnJhbWV3b3JrM19ycGMnLFxuICAgICAgICAgICAgdHlwZTogJ1Byb21pc2VNZXNzYWdlJyxcbiAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgIHJlc3VsdCxcbiAgICAgICAgICAgIGhhZEVycm9yOiBmYWxzZSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMuX3NlcnZlci5fc2VuZFNvY2tldE1lc3NhZ2UoY2xpZW50LCByZXN1bHRNZXNzYWdlKTtcbiAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZTogRXJyb3JSZXNwb25zZU1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBjaGFubmVsOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICAgICAgICB0eXBlOiAnRXJyb3JNZXNzYWdlJyxcbiAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgIGhhZEVycm9yOiB0cnVlLFxuICAgICAgICAgICAgZXJyb3I6IGZvcm1hdEVycm9yKGVycm9yKSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMuX3NlcnZlci5fc2VuZFNvY2tldE1lc3NhZ2UoY2xpZW50LCBlcnJvck1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgICAgLy8gSWYgdGhlcmUgd2FzIGFuIGVycm9yIGV4ZWN1dGluZyB0aGUgY29tbWFuZCwgd2Ugc2VuZCB0aGF0IGJhY2sgYXMgYW4gZXJyb3IgT2JzZXJ2YWJsZS5cbiAgICAgICAgaWYgKGhhZEVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuVmFsID0gT2JzZXJ2YWJsZS50aHJvdyhjYWxsRXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIHJldHVybiB2YWx1ZSBpcyBhbiBvYnNlcnZhYmxlLlxuICAgICAgICBpZiAoIWlzT2JzZXJ2YWJsZShyZXR1cm5WYWwpKSB7XG4gICAgICAgICAgcmV0dXJuVmFsID0gT2JzZXJ2YWJsZS50aHJvdyhuZXcgRXJyb3IoXG4gICAgICAgICAgICAnRXhwZWN0ZWQgYW4gT2JzZXJ2YWJsZSwgYnV0IHRoZSBmdW5jdGlvbiByZXR1cm5lZCBzb21ldGhpbmcgZWxzZS4nKSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJldHVybk9ic2VydmFibGU6IE9ic2VydmFibGUgPSAocmV0dXJuVmFsIDogYW55KTtcblxuICAgICAgICAvLyBNYXJzaGFsIHRoZSByZXN1bHQsIHRvIHNlbmQgb3ZlciB0aGUgbmV0d29yay5cbiAgICAgICAgcmV0dXJuT2JzZXJ2YWJsZSA9IHJldHVybk9ic2VydmFibGUuY29uY2F0TWFwKFxuICAgICAgICAgICAgLy8gJEZsb3dJc3N1ZVxuICAgICAgICAgICAgdmFsdWUgPT4gdGhpcy5fdHlwZVJlZ2lzdHJ5Lm1hcnNoYWwodmFsdWUsIHJldHVyblR5cGUudHlwZSkpO1xuXG4gICAgICAgIC8vIFNlbmQgdGhlIG5leHQsIGVycm9yLCBhbmQgY29tcGxldGlvbiBldmVudHMgb2YgdGhlIG9ic2VydmFibGUgYWNyb3NzIHRoZSBzb2NrZXQuXG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHJldHVybk9ic2VydmFibGUuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgICAgICAgIGNvbnN0IGV2ZW50TWVzc2FnZTogT2JzZXJ2YWJsZVJlc3BvbnNlTWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGNoYW5uZWw6ICdzZXJ2aWNlX2ZyYW1ld29yazNfcnBjJyxcbiAgICAgICAgICAgIHR5cGU6ICdPYnNlcnZhYmxlTWVzc2FnZScsXG4gICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICBoYWRFcnJvcjogZmFsc2UsXG4gICAgICAgICAgICByZXN1bHQ6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ25leHQnLFxuICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMuX3NlcnZlci5fc2VuZFNvY2tldE1lc3NhZ2UoY2xpZW50LCBldmVudE1lc3NhZ2UpO1xuICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlOiBFcnJvclJlc3BvbnNlTWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGNoYW5uZWw6ICdzZXJ2aWNlX2ZyYW1ld29yazNfcnBjJyxcbiAgICAgICAgICAgIHR5cGU6ICdFcnJvck1lc3NhZ2UnLFxuICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgaGFkRXJyb3I6IHRydWUsXG4gICAgICAgICAgICBlcnJvcjogZm9ybWF0RXJyb3IoZXJyb3IpLFxuICAgICAgICAgIH07XG4gICAgICAgICAgdGhpcy5fc2VydmVyLl9zZW5kU29ja2V0TWVzc2FnZShjbGllbnQsIGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcbiAgICAgICAgfSwgY29tcGxldGVkID0+IHtcbiAgICAgICAgICBjb25zdCBldmVudE1lc3NhZ2U6IE9ic2VydmFibGVSZXNwb25zZU1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBjaGFubmVsOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICAgICAgICB0eXBlOiAnT2JzZXJ2YWJsZU1lc3NhZ2UnLFxuICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgaGFkRXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgcmVzdWx0OiB7IHR5cGU6ICdjb21wbGV0ZWQnIH0sXG4gICAgICAgICAgfTtcbiAgICAgICAgICB0aGlzLl9zZXJ2ZXIuX3NlbmRTb2NrZXRNZXNzYWdlKGNsaWVudCwgZXZlbnRNZXNzYWdlKTtcbiAgICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5zZXQocmVxdWVzdElkLCBzdWJzY3JpcHRpb24pO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rb3duIHJldHVybiB0eXBlICR7cmV0dXJuVHlwZS5raW5kfS5gKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0RnVuY3Rpb25JbXBsZW1lbnRpb24obmFtZTogc3RyaW5nKTogRnVuY3Rpb25JbXBsZW1lbnRhdGlvbiB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZnVuY3Rpb25zQnlOYW1lLmdldChuYW1lKTtcbiAgICBpbnZhcmlhbnQocmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbi8qKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdGhhdCBsZXQncyB1cyAnYXBwbHknIGFuIGFycmF5IG9mIGFyZ3VtZW50cyB0byBhIGNvbnN0cnVjdG9yLlxuICogSXQgd29ya3MgYnkgY3JlYXRpbmcgYSBuZXcgY29uc3RydWN0b3IgdGhhdCBoYXMgdGhlIHNhbWUgcHJvdG90eXBlIGFzIHRoZSBvcmlnaW5hbFxuICogY29uc3RydWN0b3IsIGFuZCBzaW1wbHkgYXBwbGllcyB0aGUgb3JpZ2luYWwgY29uc3RydWN0b3IgZGlyZWN0bHkgdG8gJ3RoaXMnLlxuICogQHJldHVybnMgQW4gaW5zdGFuY2Ugb2YgY2xhc3NPYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGNvbnN0cnVjdChjbGFzc09iamVjdCwgYXJncykge1xuICBmdW5jdGlvbiBGKCkge1xuICAgIHJldHVybiBjbGFzc09iamVjdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuICBGLnByb3RvdHlwZSA9IGNsYXNzT2JqZWN0LnByb3RvdHlwZTtcbiAgcmV0dXJuIG5ldyBGKCk7XG59XG5cbi8qKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdGhhdCBjaGVja3MgaWYgYW4gb2JqZWN0IGlzIHRoZW5hYmxlIChQcm9taXNlLWxpa2UpLlxuICovXG5mdW5jdGlvbiBpc1RoZW5hYmxlKG9iamVjdDogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBCb29sZWFuKG9iamVjdCAmJiBvYmplY3QudGhlbik7XG59XG5cbi8qKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdGhhdCBjaGVja3MgaWYgYW4gb2JqZWN0IGlzIGFuIE9ic2VydmFibGUuXG4gKi9cbmZ1bmN0aW9uIGlzT2JzZXJ2YWJsZShvYmplY3Q6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gQm9vbGVhbihvYmplY3QgJiYgb2JqZWN0LmNvbmNhdE1hcCAmJiBvYmplY3Quc3Vic2NyaWJlKTtcbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIGVycm9yIGJlZm9yZSBzZW5kaW5nIG92ZXIgdGhlIHdlYiBzb2NrZXQuXG4gKiBUT0RPOiBUaGlzIHNob3VsZCBiZSBhIGN1c3RvbSBtYXJzaGFsbGVyIHJlZ2lzdGVyZWQgaW4gdGhlIFR5cGVSZWdpc3RyeVxuICovXG5mdW5jdGlvbiBmb3JtYXRFcnJvcihlcnJvcik6ID8oT2JqZWN0IHwgc3RyaW5nKSB7XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICBjb2RlOiBlcnJvci5jb2RlLFxuICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgIH07XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVycm9yID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBlcnJvci50b1N0cmluZygpO1xuICB9IGVsc2UgaWYgKGVycm9yID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBgVW5rbm93biBFcnJvcjogJHtlcnJvci50b1N0cmluZygpfWA7XG4gIH1cbn1cbiJdfQ==