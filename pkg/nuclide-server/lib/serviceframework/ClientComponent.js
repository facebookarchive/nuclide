Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _config = require('../config');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _events = require('events');

var _NuclideSocket = require('../NuclideSocket');

var _NuclideSocket2 = _interopRequireDefault(_NuclideSocket);

var _rx = require('rx');

var _nuclideServiceParserLibTypeRegistry = require('../../../nuclide-service-parser/lib/TypeRegistry');

var _nuclideServiceParserLibTypeRegistry2 = _interopRequireDefault(_nuclideServiceParserLibTypeRegistry);

var _nuclideServiceParser = require('../../../nuclide-service-parser');

var logger = require('../../../nuclide-logging').getLogger();

var ClientComponent = (function () {
  function ClientComponent(socket, services) {
    var _this = this;

    _classCallCheck(this, ClientComponent);

    this._emitter = new _events.EventEmitter();
    this._socket = socket;
    this._rpcRequestId = 1;

    this._typeRegistry = new _nuclideServiceParserLibTypeRegistry2['default']();
    this._objectRegistry = new Map();

    this.addServices(services);
    this._socket.on('message', function (message) {
      return _this._handleSocketMessage(message);
    });
  }

  // TODO: This should be a custom marshaller registered in the TypeRegistry

  _createClass(ClientComponent, [{
    key: 'addServices',
    value: function addServices(services) {
      services.forEach(this.addService, this);
    }
  }, {
    key: 'addService',
    value: function addService(service) {
      var _this2 = this;

      logger.debug('Registering 3.0 service ' + service.name + '...');
      try {
        (function () {
          var defs = (0, _nuclideServiceParser.getDefinitions)(service.definition);
          var proxy = (0, _nuclideServiceParser.getProxy)(service.name, service.definition, _this2);

          defs.forEach(function (definition) {
            var name = definition.name;
            switch (definition.kind) {
              case 'alias':
                logger.debug('Registering type alias ' + name + '...');
                if (definition.definition != null) {
                  _this2._typeRegistry.registerAlias(name, definition.definition);
                }
                break;
              case 'interface':
                logger.debug('Registering interface ' + name + '.');
                _this2._typeRegistry.registerType(name, function (object) {
                  return object._idPromise;
                }, function (objectId) {
                  // Return a cached proxy, if one already exists, for this object.
                  if (_this2._objectRegistry.has(objectId)) {
                    return _this2._objectRegistry.get(objectId);
                  }

                  // Generate the proxy by manually setting the prototype of the object to be the
                  // prototype of the remote proxy constructor.
                  var object = { _idPromise: Promise.resolve(objectId) };
                  // $FlowIssue - T9254210 add Object.setPrototypeOf typing
                  Object.setPrototypeOf(object, proxy[name].prototype);
                  _this2._objectRegistry.set(objectId, object);
                  return object;
                });
                break;
            }
          });
        })();
      } catch (e) {
        logger.error('Failed to load service ' + service.name + '. Stack Trace:\n' + e.stack);
      }
    }

    // Delegate marshalling to the type registry.
  }, {
    key: 'marshal',
    value: function marshal() {
      var _typeRegistry;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_typeRegistry = this._typeRegistry).marshal.apply(_typeRegistry, [this._objectRegistry].concat(_toConsumableArray(args)));
    }
  }, {
    key: 'unmarshal',
    value: function unmarshal() {
      var _typeRegistry2;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_typeRegistry2 = this._typeRegistry).unmarshal.apply(_typeRegistry2, [this._objectRegistry].concat(_toConsumableArray(args)));
    }
  }, {
    key: 'registerType',
    value: function registerType() {
      var _typeRegistry3;

      return (_typeRegistry3 = this._typeRegistry).registerType.apply(_typeRegistry3, arguments);
    }

    /**
     * Call a remote function, through the service framework.
     * @param functionName - The name of the remote function to invoke.
     * @param returnType - The type of object that this function returns, so the the transport
     *   layer can register the appropriate listeners.
     * @param args - The serialized arguments to invoke the remote function with.
     */
  }, {
    key: 'callRemoteFunction',
    value: function callRemoteFunction(functionName, returnType, args) {
      var message = {
        protocol: 'service_framework3_rpc',
        type: 'FunctionCall',
        'function': functionName,
        requestId: this._generateRequestId(),
        args: args
      };
      return this._sendMessageAndListenForResult(message, returnType, 'Calling function ' + functionName);
    }

    /**
     * Call a method of a remote object, through the service framework.
     * @param objectId - The id of the remote object.
     * @param methodName - The name of the method to invoke.
     * @param returnType - The type of object that this function returns, so the the transport
     *   layer can register the appropriate listeners.
     * @param args - The serialized arguments to invoke the remote method with.
     */
  }, {
    key: 'callRemoteMethod',
    value: function callRemoteMethod(objectId, methodName, returnType, args) {
      var message = {
        protocol: 'service_framework3_rpc',
        type: 'MethodCall',
        method: methodName,
        objectId: objectId,
        requestId: this._generateRequestId(),
        args: args
      };
      return this._sendMessageAndListenForResult(message, returnType, 'Calling remote method ' + methodName + '.');
    }

    /**
     * Call a remote constructor, returning an id that eventually resolves to a unique identifier
     * for the object.
     * @param interfaceName - The name of the remote class for which to construct an object.
     * @param args - Serialized arguments to pass to the remote constructor.
     */
  }, {
    key: 'createRemoteObject',
    value: function createRemoteObject(interfaceName, args) {
      var message = {
        protocol: 'service_framework3_rpc',
        type: 'NewObject',
        'interface': interfaceName,
        requestId: this._generateRequestId(),
        args: args
      };
      return this._sendMessageAndListenForResult(message, 'promise', 'Creating instance of ' + interfaceName);
    }

    /**
     * Dispose a remote object. This makes it's proxies unsuable, and calls the `dispose` method on
     * the remote object.
     * @param objectId - The numerical id that identifies the remote object.
     * @returns A Promise that resolves when the object disposal has completed.
     */
  }, {
    key: 'disposeRemoteObject',
    value: function disposeRemoteObject(objectId) {
      var message = {
        protocol: 'service_framework3_rpc',
        type: 'DisposeObject',
        requestId: this._generateRequestId(),
        objectId: objectId
      };
      return this._sendMessageAndListenForResult(message, 'promise', 'Disposing object ' + objectId);
    }

    /**
     * Helper function that listens for a result for the given requestId.
     * @param returnType - Determines the type of messages we should subscribe to, and what this
     *   function should return.
     * @param requestId - The id of the request who's result we are listening for.
     * @returns Depending on the expected return type, this function either returns undefined, a
     *   Promise, or an Observable.
     */
  }, {
    key: '_sendMessageAndListenForResult',
    value: function _sendMessageAndListenForResult(message, returnType, timeoutMessage) {
      var _this3 = this;

      switch (returnType) {
        case 'void':
          this._socket.send(message);
          return; // No values to return.
        case 'promise':
          // Listen for a single message, and resolve or reject a promise on that message.
          return new Promise(function (resolve, reject) {
            _this3._socket.send(message);
            _this3._emitter.once(message.requestId.toString(), function (hadError, error, result) {
              hadError ? reject(decodeError(error)) : resolve(result);
            });

            setTimeout(function () {
              _this3._emitter.removeAllListeners(message.requestId.toString());
              reject(new Error('Timeout after ' + _config.SERVICE_FRAMEWORK_RPC_TIMEOUT_MS + ' for requestId: ' + (message.requestId + ', ' + timeoutMessage + '.')));
            }, _config.SERVICE_FRAMEWORK_RPC_TIMEOUT_MS);
          });
        case 'observable':
          var observable = _rx.Observable.create(function (observer) {
            _this3._socket.send(message);

            // Listen for 'next', 'error', and 'completed' events.
            _this3._emitter.on(message.requestId.toString(), function (hadError, error, result) {
              if (hadError) {
                observer.onError(decodeError(error));
              } else {
                (0, _assert2['default'])(result);
                if (result.type === 'completed') {
                  observer.onCompleted();
                } else if (result.type === 'next') {
                  observer.onNext(result.data);
                }
              }
            });

            // Observable dispose function, which is called on subscription dipsose, on stream
            // completion, and on stream error.
            return function () {
              _this3._emitter.removeAllListeners(message.requestId.toString());

              // Send a message to server to call the dispose function of
              // the remote Observable subscription.
              var disposeMessage = {
                protocol: 'service_framework3_rpc',
                type: 'DisposeObservable',
                requestId: message.requestId
              };
              _this3._socket.send(disposeMessage);
            };
          });

          return observable;
        default:
          throw new Error('Unkown return type: ' + returnType + '.');
      }
    }
  }, {
    key: 'getSocket',
    value: function getSocket() {
      return this._socket;
    }
  }, {
    key: '_handleSocketMessage',
    value: function _handleSocketMessage(message) {
      var channel = message.channel;

      (0, _assert2['default'])(channel === _config.SERVICE_FRAMEWORK3_CHANNEL);
      var requestId = message.requestId;
      var hadError = message.hadError;
      var error = message.error;
      var result = message.result;

      this._emitter.emit(requestId.toString(), hadError, error, result);
    }
  }, {
    key: '_generateRequestId',
    value: function _generateRequestId() {
      return this._rpcRequestId++;
    }

    // Resolves if the connection looks healthy.
    // Will reject quickly if the connection looks unhealthy.
  }, {
    key: 'testConnection',
    value: function testConnection() {
      return this._socket.testConnection();
    }
  }, {
    key: 'close',
    value: function close() {
      this._socket.close();
    }
  }]);

  return ClientComponent;
})();

exports['default'] = ClientComponent;
function decodeError(encodedError) {
  if (encodedError != null && typeof encodedError === 'object') {
    var resultError = new Error();
    resultError.message = encodedError.message;
    // $FlowIssue - some Errors (notably file operations) have a code.
    resultError.code = encodedError.code;
    resultError.stack = encodedError.stack;
    return resultError;
  } else {
    return encodedError;
  }
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxDQUFDO0tBQ25FOzs7V0FFaUIsOEJBQVc7QUFDM0IsYUFBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDN0I7Ozs7OztXQUlhLDBCQUFrQjtBQUM5QixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdEM7OztXQUVJLGlCQUFTO0FBQ1osVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUN0Qjs7O1NBdFFrQixlQUFlOzs7cUJBQWYsZUFBZTtBQTBRcEMsU0FBUyxXQUFXLENBQUMsWUFBZ0MsRUFBcUI7QUFDeEUsTUFBSSxZQUFZLElBQUksSUFBSSxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRTtBQUM1RCxRQUFNLFdBQVcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ2hDLGVBQVcsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQzs7QUFFM0MsZUFBVyxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDO0FBQ3JDLGVBQVcsQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztBQUN2QyxXQUFPLFdBQVcsQ0FBQztHQUNwQixNQUFNO0FBQ0wsV0FBTyxZQUFZLENBQUM7R0FDckI7Q0FDRiIsImZpbGUiOiJDbGllbnRDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1NFUlZJQ0VfRlJBTUVXT1JLM19DSEFOTkVMfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHR5cGUge0NvbmZpZ0VudHJ5fSBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgTnVjbGlkZVNvY2tldCBmcm9tICcuLi9OdWNsaWRlU29ja2V0JztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuaW1wb3J0IHtTRVJWSUNFX0ZSQU1FV09SS19SUENfVElNRU9VVF9NU30gZnJvbSAnLi4vY29uZmlnJztcblxuaW1wb3J0IFR5cGVSZWdpc3RyeSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLXNlcnZpY2UtcGFyc2VyL2xpYi9UeXBlUmVnaXN0cnknO1xuaW1wb3J0IHtnZXRQcm94eSwgZ2V0RGVmaW5pdGlvbnN9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtc2VydmljZS1wYXJzZXInO1xuXG5pbXBvcnQgdHlwZSB7UmVxdWVzdE1lc3NhZ2UsIENhbGxSZW1vdGVGdW5jdGlvbk1lc3NhZ2UsIENyZWF0ZVJlbW90ZU9iamVjdE1lc3NhZ2UsXG4gIENhbGxSZW1vdGVNZXRob2RNZXNzYWdlLCBEaXNwb3NlUmVtb3RlT2JqZWN0TWVzc2FnZSwgRGlzcG9zZU9ic2VydmFibGVNZXNzYWdlLFxuICBSZXR1cm5UeXBlLCBPYnNlcnZhYmxlUmVzdWx0fSBmcm9tICcuL3R5cGVzJztcblxuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbnR5cGUgTWFyc2hhbGxpbmdDb250ZXh0ID0gTWFwPG51bWJlciwgYW55PjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xpZW50Q29tcG9uZW50IHtcbiAgX3JwY1JlcXVlc3RJZDogbnVtYmVyO1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfc29ja2V0OiBOdWNsaWRlU29ja2V0O1xuXG4gIF90eXBlUmVnaXN0cnk6IFR5cGVSZWdpc3RyeTxNYXJzaGFsbGluZ0NvbnRleHQ+O1xuICBfb2JqZWN0UmVnaXN0cnk6IE1hcnNoYWxsaW5nQ29udGV4dDtcblxuICBjb25zdHJ1Y3Rvcihzb2NrZXQ6IE51Y2xpZGVTb2NrZXQsIHNlcnZpY2VzOiBBcnJheTxDb25maWdFbnRyeT4pIHtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX3NvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLl9ycGNSZXF1ZXN0SWQgPSAxO1xuXG4gICAgdGhpcy5fdHlwZVJlZ2lzdHJ5ID0gbmV3IFR5cGVSZWdpc3RyeSgpO1xuICAgIHRoaXMuX29iamVjdFJlZ2lzdHJ5ID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5hZGRTZXJ2aWNlcyhzZXJ2aWNlcyk7XG4gICAgdGhpcy5fc29ja2V0Lm9uKCdtZXNzYWdlJywgbWVzc2FnZSA9PiB0aGlzLl9oYW5kbGVTb2NrZXRNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxuXG4gIGFkZFNlcnZpY2VzKHNlcnZpY2VzOiBBcnJheTxDb25maWdFbnRyeT4pOiB2b2lkIHtcbiAgICBzZXJ2aWNlcy5mb3JFYWNoKHRoaXMuYWRkU2VydmljZSwgdGhpcyk7XG4gIH1cblxuICBhZGRTZXJ2aWNlKHNlcnZpY2U6IENvbmZpZ0VudHJ5KTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKGBSZWdpc3RlcmluZyAzLjAgc2VydmljZSAke3NlcnZpY2UubmFtZX0uLi5gKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGVmcyA9IGdldERlZmluaXRpb25zKHNlcnZpY2UuZGVmaW5pdGlvbik7XG4gICAgICBjb25zdCBwcm94eSA9IGdldFByb3h5KHNlcnZpY2UubmFtZSwgc2VydmljZS5kZWZpbml0aW9uLCB0aGlzKTtcblxuICAgICAgZGVmcy5mb3JFYWNoKGRlZmluaXRpb24gPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gZGVmaW5pdGlvbi5uYW1lO1xuICAgICAgICBzd2l0Y2ggKGRlZmluaXRpb24ua2luZCkge1xuICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgUmVnaXN0ZXJpbmcgdHlwZSBhbGlhcyAke25hbWV9Li4uYCk7XG4gICAgICAgICAgICBpZiAoZGVmaW5pdGlvbi5kZWZpbml0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyQWxpYXMobmFtZSwgZGVmaW5pdGlvbi5kZWZpbml0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2ludGVyZmFjZSc6XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoYFJlZ2lzdGVyaW5nIGludGVyZmFjZSAke25hbWV9LmApO1xuICAgICAgICAgICAgdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyVHlwZShuYW1lLCBvYmplY3QgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0Ll9pZFByb21pc2U7XG4gICAgICAgICAgICB9LCBvYmplY3RJZCA9PiB7XG4gICAgICAgICAgICAgIC8vIFJldHVybiBhIGNhY2hlZCBwcm94eSwgaWYgb25lIGFscmVhZHkgZXhpc3RzLCBmb3IgdGhpcyBvYmplY3QuXG4gICAgICAgICAgICAgIGlmICh0aGlzLl9vYmplY3RSZWdpc3RyeS5oYXMob2JqZWN0SWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29iamVjdFJlZ2lzdHJ5LmdldChvYmplY3RJZCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSB0aGUgcHJveHkgYnkgbWFudWFsbHkgc2V0dGluZyB0aGUgcHJvdG90eXBlIG9mIHRoZSBvYmplY3QgdG8gYmUgdGhlXG4gICAgICAgICAgICAgIC8vIHByb3RvdHlwZSBvZiB0aGUgcmVtb3RlIHByb3h5IGNvbnN0cnVjdG9yLlxuICAgICAgICAgICAgICBjb25zdCBvYmplY3QgPSB7IF9pZFByb21pc2U6IFByb21pc2UucmVzb2x2ZShvYmplY3RJZCkgfTtcbiAgICAgICAgICAgICAgLy8gJEZsb3dJc3N1ZSAtIFQ5MjU0MjEwIGFkZCBPYmplY3Quc2V0UHJvdG90eXBlT2YgdHlwaW5nXG4gICAgICAgICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihvYmplY3QsIHByb3h5W25hbWVdLnByb3RvdHlwZSk7XG4gICAgICAgICAgICAgIHRoaXMuX29iamVjdFJlZ2lzdHJ5LnNldChvYmplY3RJZCwgb2JqZWN0KTtcbiAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgRmFpbGVkIHRvIGxvYWQgc2VydmljZSAke3NlcnZpY2UubmFtZX0uIFN0YWNrIFRyYWNlOlxcbiR7ZS5zdGFja31gKTtcbiAgICB9XG4gIH1cblxuICAvLyBEZWxlZ2F0ZSBtYXJzaGFsbGluZyB0byB0aGUgdHlwZSByZWdpc3RyeS5cbiAgbWFyc2hhbCguLi5hcmdzOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl90eXBlUmVnaXN0cnkubWFyc2hhbCh0aGlzLl9vYmplY3RSZWdpc3RyeSwgLi4uYXJncyk7XG4gIH1cbiAgdW5tYXJzaGFsKC4uLmFyZ3M6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVSZWdpc3RyeS51bm1hcnNoYWwodGhpcy5fb2JqZWN0UmVnaXN0cnksIC4uLmFyZ3MpO1xuICB9XG4gIHJlZ2lzdGVyVHlwZSguLi5hcmdzOiBhbnkpOiB2b2lkIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyVHlwZSguLi5hcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIGEgcmVtb3RlIGZ1bmN0aW9uLCB0aHJvdWdoIHRoZSBzZXJ2aWNlIGZyYW1ld29yay5cbiAgICogQHBhcmFtIGZ1bmN0aW9uTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSByZW1vdGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICAgKiBAcGFyYW0gcmV0dXJuVHlwZSAtIFRoZSB0eXBlIG9mIG9iamVjdCB0aGF0IHRoaXMgZnVuY3Rpb24gcmV0dXJucywgc28gdGhlIHRoZSB0cmFuc3BvcnRcbiAgICogICBsYXllciBjYW4gcmVnaXN0ZXIgdGhlIGFwcHJvcHJpYXRlIGxpc3RlbmVycy5cbiAgICogQHBhcmFtIGFyZ3MgLSBUaGUgc2VyaWFsaXplZCBhcmd1bWVudHMgdG8gaW52b2tlIHRoZSByZW1vdGUgZnVuY3Rpb24gd2l0aC5cbiAgICovXG4gIGNhbGxSZW1vdGVGdW5jdGlvbihmdW5jdGlvbk5hbWU6IHN0cmluZywgcmV0dXJuVHlwZTogUmV0dXJuVHlwZSwgYXJnczogQXJyYXk8YW55Pik6IGFueSB7XG4gICAgY29uc3QgbWVzc2FnZTogQ2FsbFJlbW90ZUZ1bmN0aW9uTWVzc2FnZSA9IHtcbiAgICAgIHByb3RvY29sOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICB0eXBlOiAnRnVuY3Rpb25DYWxsJyxcbiAgICAgIGZ1bmN0aW9uOiBmdW5jdGlvbk5hbWUsXG4gICAgICByZXF1ZXN0SWQ6IHRoaXMuX2dlbmVyYXRlUmVxdWVzdElkKCksXG4gICAgICBhcmdzLFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuX3NlbmRNZXNzYWdlQW5kTGlzdGVuRm9yUmVzdWx0KFxuICAgICAgbWVzc2FnZSxcbiAgICAgIHJldHVyblR5cGUsXG4gICAgICBgQ2FsbGluZyBmdW5jdGlvbiAke2Z1bmN0aW9uTmFtZX1gXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIGEgbWV0aG9kIG9mIGEgcmVtb3RlIG9iamVjdCwgdGhyb3VnaCB0aGUgc2VydmljZSBmcmFtZXdvcmsuXG4gICAqIEBwYXJhbSBvYmplY3RJZCAtIFRoZSBpZCBvZiB0aGUgcmVtb3RlIG9iamVjdC5cbiAgICogQHBhcmFtIG1ldGhvZE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHRvIGludm9rZS5cbiAgICogQHBhcmFtIHJldHVyblR5cGUgLSBUaGUgdHlwZSBvZiBvYmplY3QgdGhhdCB0aGlzIGZ1bmN0aW9uIHJldHVybnMsIHNvIHRoZSB0aGUgdHJhbnNwb3J0XG4gICAqICAgbGF5ZXIgY2FuIHJlZ2lzdGVyIHRoZSBhcHByb3ByaWF0ZSBsaXN0ZW5lcnMuXG4gICAqIEBwYXJhbSBhcmdzIC0gVGhlIHNlcmlhbGl6ZWQgYXJndW1lbnRzIHRvIGludm9rZSB0aGUgcmVtb3RlIG1ldGhvZCB3aXRoLlxuICAgKi9cbiAgY2FsbFJlbW90ZU1ldGhvZChcbiAgICBvYmplY3RJZDogbnVtYmVyLFxuICAgIG1ldGhvZE5hbWU6IHN0cmluZyxcbiAgICByZXR1cm5UeXBlOiBSZXR1cm5UeXBlLFxuICAgIGFyZ3M6IEFycmF5PGFueT5cbiAgKTogYW55IHtcbiAgICBjb25zdCBtZXNzYWdlOiBDYWxsUmVtb3RlTWV0aG9kTWVzc2FnZSA9IHtcbiAgICAgIHByb3RvY29sOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICB0eXBlOiAnTWV0aG9kQ2FsbCcsXG4gICAgICBtZXRob2Q6IG1ldGhvZE5hbWUsXG4gICAgICBvYmplY3RJZCxcbiAgICAgIHJlcXVlc3RJZDogdGhpcy5fZ2VuZXJhdGVSZXF1ZXN0SWQoKSxcbiAgICAgIGFyZ3MsXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5fc2VuZE1lc3NhZ2VBbmRMaXN0ZW5Gb3JSZXN1bHQoXG4gICAgICBtZXNzYWdlLFxuICAgICAgcmV0dXJuVHlwZSxcbiAgICAgIGBDYWxsaW5nIHJlbW90ZSBtZXRob2QgJHttZXRob2ROYW1lfS5gXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIGEgcmVtb3RlIGNvbnN0cnVjdG9yLCByZXR1cm5pbmcgYW4gaWQgdGhhdCBldmVudHVhbGx5IHJlc29sdmVzIHRvIGEgdW5pcXVlIGlkZW50aWZpZXJcbiAgICogZm9yIHRoZSBvYmplY3QuXG4gICAqIEBwYXJhbSBpbnRlcmZhY2VOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHJlbW90ZSBjbGFzcyBmb3Igd2hpY2ggdG8gY29uc3RydWN0IGFuIG9iamVjdC5cbiAgICogQHBhcmFtIGFyZ3MgLSBTZXJpYWxpemVkIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSByZW1vdGUgY29uc3RydWN0b3IuXG4gICAqL1xuICBjcmVhdGVSZW1vdGVPYmplY3QoaW50ZXJmYWNlTmFtZTogc3RyaW5nLCBhcmdzOiBBcnJheTxhbnk+KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBtZXNzYWdlOiBDcmVhdGVSZW1vdGVPYmplY3RNZXNzYWdlID0ge1xuICAgICAgcHJvdG9jb2w6ICdzZXJ2aWNlX2ZyYW1ld29yazNfcnBjJyxcbiAgICAgIHR5cGU6ICdOZXdPYmplY3QnLFxuICAgICAgaW50ZXJmYWNlOiBpbnRlcmZhY2VOYW1lLFxuICAgICAgcmVxdWVzdElkOiB0aGlzLl9nZW5lcmF0ZVJlcXVlc3RJZCgpLFxuICAgICAgYXJncyxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLl9zZW5kTWVzc2FnZUFuZExpc3RlbkZvclJlc3VsdChcbiAgICAgIG1lc3NhZ2UsXG4gICAgICAncHJvbWlzZScsXG4gICAgICBgQ3JlYXRpbmcgaW5zdGFuY2Ugb2YgJHtpbnRlcmZhY2VOYW1lfWBcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2UgYSByZW1vdGUgb2JqZWN0LiBUaGlzIG1ha2VzIGl0J3MgcHJveGllcyB1bnN1YWJsZSwgYW5kIGNhbGxzIHRoZSBgZGlzcG9zZWAgbWV0aG9kIG9uXG4gICAqIHRoZSByZW1vdGUgb2JqZWN0LlxuICAgKiBAcGFyYW0gb2JqZWN0SWQgLSBUaGUgbnVtZXJpY2FsIGlkIHRoYXQgaWRlbnRpZmllcyB0aGUgcmVtb3RlIG9iamVjdC5cbiAgICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgb2JqZWN0IGRpc3Bvc2FsIGhhcyBjb21wbGV0ZWQuXG4gICAqL1xuICBkaXNwb3NlUmVtb3RlT2JqZWN0KG9iamVjdElkOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtZXNzYWdlOiBEaXNwb3NlUmVtb3RlT2JqZWN0TWVzc2FnZSA9IHtcbiAgICAgIHByb3RvY29sOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICB0eXBlOiAnRGlzcG9zZU9iamVjdCcsXG4gICAgICByZXF1ZXN0SWQ6IHRoaXMuX2dlbmVyYXRlUmVxdWVzdElkKCksXG4gICAgICBvYmplY3RJZCxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLl9zZW5kTWVzc2FnZUFuZExpc3RlbkZvclJlc3VsdChtZXNzYWdlLCAncHJvbWlzZScsIGBEaXNwb3Npbmcgb2JqZWN0ICR7b2JqZWN0SWR9YCk7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgbGlzdGVucyBmb3IgYSByZXN1bHQgZm9yIHRoZSBnaXZlbiByZXF1ZXN0SWQuXG4gICAqIEBwYXJhbSByZXR1cm5UeXBlIC0gRGV0ZXJtaW5lcyB0aGUgdHlwZSBvZiBtZXNzYWdlcyB3ZSBzaG91bGQgc3Vic2NyaWJlIHRvLCBhbmQgd2hhdCB0aGlzXG4gICAqICAgZnVuY3Rpb24gc2hvdWxkIHJldHVybi5cbiAgICogQHBhcmFtIHJlcXVlc3RJZCAtIFRoZSBpZCBvZiB0aGUgcmVxdWVzdCB3aG8ncyByZXN1bHQgd2UgYXJlIGxpc3RlbmluZyBmb3IuXG4gICAqIEByZXR1cm5zIERlcGVuZGluZyBvbiB0aGUgZXhwZWN0ZWQgcmV0dXJuIHR5cGUsIHRoaXMgZnVuY3Rpb24gZWl0aGVyIHJldHVybnMgdW5kZWZpbmVkLCBhXG4gICAqICAgUHJvbWlzZSwgb3IgYW4gT2JzZXJ2YWJsZS5cbiAgICovXG4gIF9zZW5kTWVzc2FnZUFuZExpc3RlbkZvclJlc3VsdChcbiAgICBtZXNzYWdlOiBSZXF1ZXN0TWVzc2FnZSxcbiAgICByZXR1cm5UeXBlOiBSZXR1cm5UeXBlLFxuICAgIHRpbWVvdXRNZXNzYWdlOiBzdHJpbmdcbiAgKTogYW55IHtcbiAgICBzd2l0Y2ggKHJldHVyblR5cGUpIHtcbiAgICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChtZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuOyAvLyBObyB2YWx1ZXMgdG8gcmV0dXJuLlxuICAgICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICAgIC8vIExpc3RlbiBmb3IgYSBzaW5nbGUgbWVzc2FnZSwgYW5kIHJlc29sdmUgb3IgcmVqZWN0IGEgcHJvbWlzZSBvbiB0aGF0IG1lc3NhZ2UuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQobWVzc2FnZSk7XG4gICAgICAgICAgdGhpcy5fZW1pdHRlci5vbmNlKG1lc3NhZ2UucmVxdWVzdElkLnRvU3RyaW5nKCksIChoYWRFcnJvciwgZXJyb3IsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaGFkRXJyb3IgPyByZWplY3QoZGVjb2RlRXJyb3IoZXJyb3IpKSA6IHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMobWVzc2FnZS5yZXF1ZXN0SWQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFxuICAgICAgICAgICAgICBgVGltZW91dCBhZnRlciAke1NFUlZJQ0VfRlJBTUVXT1JLX1JQQ19USU1FT1VUX01TfSBmb3IgcmVxdWVzdElkOiBgICtcbiAgICAgICAgICAgICAgYCR7bWVzc2FnZS5yZXF1ZXN0SWR9LCAke3RpbWVvdXRNZXNzYWdlfS5gXG4gICAgICAgICAgICApKTtcbiAgICAgICAgICB9LCBTRVJWSUNFX0ZSQU1FV09SS19SUENfVElNRU9VVF9NUyk7XG4gICAgICAgIH0pO1xuICAgICAgY2FzZSAnb2JzZXJ2YWJsZSc6XG4gICAgICAgIGNvbnN0IG9ic2VydmFibGUgPSBPYnNlcnZhYmxlLmNyZWF0ZShvYnNlcnZlciA9PiB7XG4gICAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQobWVzc2FnZSk7XG5cbiAgICAgICAgICAvLyBMaXN0ZW4gZm9yICduZXh0JywgJ2Vycm9yJywgYW5kICdjb21wbGV0ZWQnIGV2ZW50cy5cbiAgICAgICAgICB0aGlzLl9lbWl0dGVyLm9uKFxuICAgICAgICAgICAgbWVzc2FnZS5yZXF1ZXN0SWQudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIChoYWRFcnJvcjogYm9vbGVhbiwgZXJyb3I6ID9FcnJvciwgcmVzdWx0OiA/T2JzZXJ2YWJsZVJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoaGFkRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5vbkVycm9yKGRlY29kZUVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW52YXJpYW50KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC50eXBlID09PSAnY29tcGxldGVkJykge1xuICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdC50eXBlID09PSAnbmV4dCcpIHtcbiAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm9uTmV4dChyZXN1bHQuZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIE9ic2VydmFibGUgZGlzcG9zZSBmdW5jdGlvbiwgd2hpY2ggaXMgY2FsbGVkIG9uIHN1YnNjcmlwdGlvbiBkaXBzb3NlLCBvbiBzdHJlYW1cbiAgICAgICAgICAvLyBjb21wbGV0aW9uLCBhbmQgb24gc3RyZWFtIGVycm9yLlxuICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9lbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycyhtZXNzYWdlLnJlcXVlc3RJZC50b1N0cmluZygpKTtcblxuICAgICAgICAgICAgLy8gU2VuZCBhIG1lc3NhZ2UgdG8gc2VydmVyIHRvIGNhbGwgdGhlIGRpc3Bvc2UgZnVuY3Rpb24gb2ZcbiAgICAgICAgICAgIC8vIHRoZSByZW1vdGUgT2JzZXJ2YWJsZSBzdWJzY3JpcHRpb24uXG4gICAgICAgICAgICBjb25zdCBkaXNwb3NlTWVzc2FnZTogRGlzcG9zZU9ic2VydmFibGVNZXNzYWdlID0ge1xuICAgICAgICAgICAgICBwcm90b2NvbDogJ3NlcnZpY2VfZnJhbWV3b3JrM19ycGMnLFxuICAgICAgICAgICAgICB0eXBlOiAnRGlzcG9zZU9ic2VydmFibGUnLFxuICAgICAgICAgICAgICByZXF1ZXN0SWQ6IG1lc3NhZ2UucmVxdWVzdElkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKGRpc3Bvc2VNZXNzYWdlKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rb3duIHJldHVybiB0eXBlOiAke3JldHVyblR5cGV9LmApO1xuICAgIH1cbiAgfVxuXG4gIGdldFNvY2tldCgpOiBOdWNsaWRlU29ja2V0IHtcbiAgICByZXR1cm4gdGhpcy5fc29ja2V0O1xuICB9XG5cbiAgX2hhbmRsZVNvY2tldE1lc3NhZ2UobWVzc2FnZTogYW55KTogdm9pZCB7XG4gICAgY29uc3Qge2NoYW5uZWx9ID0gbWVzc2FnZTtcbiAgICBpbnZhcmlhbnQoY2hhbm5lbCA9PT0gU0VSVklDRV9GUkFNRVdPUkszX0NIQU5ORUwpO1xuICAgIGNvbnN0IHtyZXF1ZXN0SWQsIGhhZEVycm9yLCBlcnJvciwgcmVzdWx0fSA9IG1lc3NhZ2U7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KHJlcXVlc3RJZC50b1N0cmluZygpLCBoYWRFcnJvciwgZXJyb3IsIHJlc3VsdCk7XG4gIH1cblxuICBfZ2VuZXJhdGVSZXF1ZXN0SWQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcnBjUmVxdWVzdElkKys7XG4gIH1cblxuICAvLyBSZXNvbHZlcyBpZiB0aGUgY29ubmVjdGlvbiBsb29rcyBoZWFsdGh5LlxuICAvLyBXaWxsIHJlamVjdCBxdWlja2x5IGlmIHRoZSBjb25uZWN0aW9uIGxvb2tzIHVuaGVhbHRoeS5cbiAgdGVzdENvbm5lY3Rpb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NvY2tldC50ZXN0Q29ubmVjdGlvbigpO1xuICB9XG5cbiAgY2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc29ja2V0LmNsb3NlKCk7XG4gIH1cbn1cblxuLy8gVE9ETzogVGhpcyBzaG91bGQgYmUgYSBjdXN0b20gbWFyc2hhbGxlciByZWdpc3RlcmVkIGluIHRoZSBUeXBlUmVnaXN0cnlcbmZ1bmN0aW9uIGRlY29kZUVycm9yKGVuY29kZWRFcnJvcjogPyhPYmplY3QgfCBzdHJpbmcpKTogPyhFcnJvciB8IHN0cmluZykge1xuICBpZiAoZW5jb2RlZEVycm9yICE9IG51bGwgJiYgdHlwZW9mIGVuY29kZWRFcnJvciA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCByZXN1bHRFcnJvciA9IG5ldyBFcnJvcigpO1xuICAgIHJlc3VsdEVycm9yLm1lc3NhZ2UgPSBlbmNvZGVkRXJyb3IubWVzc2FnZTtcbiAgICAvLyAkRmxvd0lzc3VlIC0gc29tZSBFcnJvcnMgKG5vdGFibHkgZmlsZSBvcGVyYXRpb25zKSBoYXZlIGEgY29kZS5cbiAgICByZXN1bHRFcnJvci5jb2RlID0gZW5jb2RlZEVycm9yLmNvZGU7XG4gICAgcmVzdWx0RXJyb3Iuc3RhY2sgPSBlbmNvZGVkRXJyb3Iuc3RhY2s7XG4gICAgcmV0dXJuIHJlc3VsdEVycm9yO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBlbmNvZGVkRXJyb3I7XG4gIH1cbn1cbiJdfQ==