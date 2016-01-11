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

var _config = require('../config');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _events = require('events');

var _NuclideSocket = require('../NuclideSocket');

var _NuclideSocket2 = _interopRequireDefault(_NuclideSocket);

var _rx = require('rx');

var _serviceParserLibTypeRegistry = require('../../../service-parser/lib/TypeRegistry');

var _serviceParserLibTypeRegistry2 = _interopRequireDefault(_serviceParserLibTypeRegistry);

var _serviceParser = require('../../../service-parser');

var logger = require('../../../logging').getLogger();

var ClientComponent = (function () {
  function ClientComponent(socket, services) {
    var _this = this;

    _classCallCheck(this, ClientComponent);

    this._emitter = new _events.EventEmitter();
    this._socket = socket;
    this._rpcRequestId = 1;

    this._typeRegistry = new _serviceParserLibTypeRegistry2['default']();
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
          var defs = (0, _serviceParser.getDefinitions)(service.definition);
          var proxy = (0, _serviceParser.getProxy)(service.name, service.definition, _this2);

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
                _this2._typeRegistry.registerType(name, _asyncToGenerator(function* (object) {
                  return yield object._idPromise;
                }), _asyncToGenerator(function* (objectId) {
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
                }));
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

      return (_typeRegistry = this._typeRegistry).marshal.apply(_typeRegistry, arguments);
    }
  }, {
    key: 'unmarshal',
    value: function unmarshal() {
      var _typeRegistry2;

      return (_typeRegistry2 = this._typeRegistry).unmarshal.apply(_typeRegistry2, arguments);
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
              reject('Timeout after ' + _config.SERVICE_FRAMEWORK_RPC_TIMEOUT_MS + ' for requestId: ' + (message.requestId + ', ' + timeoutMessage + '.'));
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
//# sourceMappingURL=data:application/json;base64,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Y0FBYyxFQUFFLENBQUM7S0FDdEM7OztXQUVJLGlCQUFTO0FBQ1osVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUN0Qjs7O1NBdFFrQixlQUFlOzs7cUJBQWYsZUFBZTtBQTBRcEMsU0FBUyxXQUFXLENBQUMsWUFBZ0MsRUFBcUI7QUFDeEUsTUFBSSxZQUFZLElBQUksSUFBSSxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRTtBQUM1RCxRQUFNLFdBQVcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ2hDLGVBQVcsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQzs7QUFFM0MsZUFBVyxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDO0FBQ3JDLGVBQVcsQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztBQUN2QyxXQUFPLFdBQVcsQ0FBQztHQUNwQixNQUFNO0FBQ0wsV0FBTyxZQUFZLENBQUM7R0FDckI7Q0FDRiIsImZpbGUiOiJDbGllbnRDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1NFUlZJQ0VfRlJBTUVXT1JLM19DSEFOTkVMfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHR5cGUge0NvbmZpZ0VudHJ5fSBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgTnVjbGlkZVNvY2tldCBmcm9tICcuLi9OdWNsaWRlU29ja2V0JztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuaW1wb3J0IHtTRVJWSUNFX0ZSQU1FV09SS19SUENfVElNRU9VVF9NU30gZnJvbSAnLi4vY29uZmlnJztcblxuaW1wb3J0IFR5cGVSZWdpc3RyeSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlLXBhcnNlci9saWIvVHlwZVJlZ2lzdHJ5JztcbmltcG9ydCB7Z2V0UHJveHksIGdldERlZmluaXRpb25zfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlLXBhcnNlcic7XG5cbmltcG9ydCB0eXBlIHtSZXF1ZXN0TWVzc2FnZSwgQ2FsbFJlbW90ZUZ1bmN0aW9uTWVzc2FnZSwgQ3JlYXRlUmVtb3RlT2JqZWN0TWVzc2FnZSxcbiAgQ2FsbFJlbW90ZU1ldGhvZE1lc3NhZ2UsIERpc3Bvc2VSZW1vdGVPYmplY3RNZXNzYWdlLCBEaXNwb3NlT2JzZXJ2YWJsZU1lc3NhZ2UsXG4gIFJldHVyblR5cGUsIE9ic2VydmFibGVSZXN1bHR9IGZyb20gJy4vdHlwZXMnO1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsaWVudENvbXBvbmVudCB7XG4gIF9ycGNSZXF1ZXN0SWQ6IG51bWJlcjtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX3NvY2tldDogTnVjbGlkZVNvY2tldDtcblxuICBfdHlwZVJlZ2lzdHJ5OiBUeXBlUmVnaXN0cnk7XG4gIF9vYmplY3RSZWdpc3RyeTogTWFwPG51bWJlciwgYW55PjtcblxuICBjb25zdHJ1Y3Rvcihzb2NrZXQ6IE51Y2xpZGVTb2NrZXQsIHNlcnZpY2VzOiBBcnJheTxDb25maWdFbnRyeT4pIHtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX3NvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLl9ycGNSZXF1ZXN0SWQgPSAxO1xuXG4gICAgdGhpcy5fdHlwZVJlZ2lzdHJ5ID0gbmV3IFR5cGVSZWdpc3RyeSgpO1xuICAgIHRoaXMuX29iamVjdFJlZ2lzdHJ5ID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5hZGRTZXJ2aWNlcyhzZXJ2aWNlcyk7XG4gICAgdGhpcy5fc29ja2V0Lm9uKCdtZXNzYWdlJywgKG1lc3NhZ2UpID0+IHRoaXMuX2hhbmRsZVNvY2tldE1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cbiAgYWRkU2VydmljZXMoc2VydmljZXM6IEFycmF5PENvbmZpZ0VudHJ5Pik6IHZvaWQge1xuICAgIHNlcnZpY2VzLmZvckVhY2godGhpcy5hZGRTZXJ2aWNlLCB0aGlzKTtcbiAgfVxuXG4gIGFkZFNlcnZpY2Uoc2VydmljZTogQ29uZmlnRW50cnkpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoYFJlZ2lzdGVyaW5nIDMuMCBzZXJ2aWNlICR7c2VydmljZS5uYW1lfS4uLmApO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkZWZzID0gZ2V0RGVmaW5pdGlvbnMoc2VydmljZS5kZWZpbml0aW9uKTtcbiAgICAgIGNvbnN0IHByb3h5ID0gZ2V0UHJveHkoc2VydmljZS5uYW1lLCBzZXJ2aWNlLmRlZmluaXRpb24sIHRoaXMpO1xuXG4gICAgICBkZWZzLmZvckVhY2goZGVmaW5pdGlvbiA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBkZWZpbml0aW9uLm5hbWU7XG4gICAgICAgIHN3aXRjaCAoZGVmaW5pdGlvbi5raW5kKSB7XG4gICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGBSZWdpc3RlcmluZyB0eXBlIGFsaWFzICR7bmFtZX0uLi5gKTtcbiAgICAgICAgICAgIGlmIChkZWZpbml0aW9uLmRlZmluaXRpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgICB0aGlzLl90eXBlUmVnaXN0cnkucmVnaXN0ZXJBbGlhcyhuYW1lLCBkZWZpbml0aW9uLmRlZmluaXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnaW50ZXJmYWNlJzpcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgUmVnaXN0ZXJpbmcgaW50ZXJmYWNlICR7bmFtZX0uYCk7XG4gICAgICAgICAgICB0aGlzLl90eXBlUmVnaXN0cnkucmVnaXN0ZXJUeXBlKG5hbWUsIGFzeW5jIG9iamVjdCA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBhd2FpdCBvYmplY3QuX2lkUHJvbWlzZTtcbiAgICAgICAgICAgIH0sIGFzeW5jIG9iamVjdElkID0+IHtcbiAgICAgICAgICAgICAgLy8gUmV0dXJuIGEgY2FjaGVkIHByb3h5LCBpZiBvbmUgYWxyZWFkeSBleGlzdHMsIGZvciB0aGlzIG9iamVjdC5cbiAgICAgICAgICAgICAgaWYgKHRoaXMuX29iamVjdFJlZ2lzdHJ5LmhhcyhvYmplY3RJZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb2JqZWN0UmVnaXN0cnkuZ2V0KG9iamVjdElkKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRoZSBwcm94eSBieSBtYW51YWxseSBzZXR0aW5nIHRoZSBwcm90b3R5cGUgb2YgdGhlIG9iamVjdCB0byBiZSB0aGVcbiAgICAgICAgICAgICAgLy8gcHJvdG90eXBlIG9mIHRoZSByZW1vdGUgcHJveHkgY29uc3RydWN0b3IuXG4gICAgICAgICAgICAgIGNvbnN0IG9iamVjdCA9IHsgX2lkUHJvbWlzZTogUHJvbWlzZS5yZXNvbHZlKG9iamVjdElkKSB9O1xuICAgICAgICAgICAgICAvLyAkRmxvd0lzc3VlIC0gVDkyNTQyMTAgYWRkIE9iamVjdC5zZXRQcm90b3R5cGVPZiB0eXBpbmdcbiAgICAgICAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKG9iamVjdCwgcHJveHlbbmFtZV0ucHJvdG90eXBlKTtcbiAgICAgICAgICAgICAgdGhpcy5fb2JqZWN0UmVnaXN0cnkuc2V0KG9iamVjdElkLCBvYmplY3QpO1xuICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmVycm9yKGBGYWlsZWQgdG8gbG9hZCBzZXJ2aWNlICR7c2VydmljZS5uYW1lfS4gU3RhY2sgVHJhY2U6XFxuJHtlLnN0YWNrfWApO1xuICAgIH1cbiAgfVxuXG4gIC8vIERlbGVnYXRlIG1hcnNoYWxsaW5nIHRvIHRoZSB0eXBlIHJlZ2lzdHJ5LlxuICBtYXJzaGFsKC4uLmFyZ3M6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVSZWdpc3RyeS5tYXJzaGFsKC4uLmFyZ3MpO1xuICB9XG4gIHVubWFyc2hhbCguLi5hcmdzOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl90eXBlUmVnaXN0cnkudW5tYXJzaGFsKC4uLmFyZ3MpO1xuICB9XG4gIHJlZ2lzdGVyVHlwZSguLi5hcmdzOiBhbnkpOiB2b2lkIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyVHlwZSguLi5hcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIGEgcmVtb3RlIGZ1bmN0aW9uLCB0aHJvdWdoIHRoZSBzZXJ2aWNlIGZyYW1ld29yay5cbiAgICogQHBhcmFtIGZ1bmN0aW9uTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSByZW1vdGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICAgKiBAcGFyYW0gcmV0dXJuVHlwZSAtIFRoZSB0eXBlIG9mIG9iamVjdCB0aGF0IHRoaXMgZnVuY3Rpb24gcmV0dXJucywgc28gdGhlIHRoZSB0cmFuc3BvcnRcbiAgICogICBsYXllciBjYW4gcmVnaXN0ZXIgdGhlIGFwcHJvcHJpYXRlIGxpc3RlbmVycy5cbiAgICogQHBhcmFtIGFyZ3MgLSBUaGUgc2VyaWFsaXplZCBhcmd1bWVudHMgdG8gaW52b2tlIHRoZSByZW1vdGUgZnVuY3Rpb24gd2l0aC5cbiAgICovXG4gIGNhbGxSZW1vdGVGdW5jdGlvbihmdW5jdGlvbk5hbWU6IHN0cmluZywgcmV0dXJuVHlwZTogUmV0dXJuVHlwZSwgYXJnczogQXJyYXk8YW55Pik6IGFueSB7XG4gICAgY29uc3QgbWVzc2FnZTogQ2FsbFJlbW90ZUZ1bmN0aW9uTWVzc2FnZSA9IHtcbiAgICAgIHByb3RvY29sOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICB0eXBlOiAnRnVuY3Rpb25DYWxsJyxcbiAgICAgIGZ1bmN0aW9uOiBmdW5jdGlvbk5hbWUsXG4gICAgICByZXF1ZXN0SWQ6IHRoaXMuX2dlbmVyYXRlUmVxdWVzdElkKCksXG4gICAgICBhcmdzLFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuX3NlbmRNZXNzYWdlQW5kTGlzdGVuRm9yUmVzdWx0KFxuICAgICAgbWVzc2FnZSxcbiAgICAgIHJldHVyblR5cGUsXG4gICAgICBgQ2FsbGluZyBmdW5jdGlvbiAke2Z1bmN0aW9uTmFtZX1gXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIGEgbWV0aG9kIG9mIGEgcmVtb3RlIG9iamVjdCwgdGhyb3VnaCB0aGUgc2VydmljZSBmcmFtZXdvcmsuXG4gICAqIEBwYXJhbSBvYmplY3RJZCAtIFRoZSBpZCBvZiB0aGUgcmVtb3RlIG9iamVjdC5cbiAgICogQHBhcmFtIG1ldGhvZE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHRvIGludm9rZS5cbiAgICogQHBhcmFtIHJldHVyblR5cGUgLSBUaGUgdHlwZSBvZiBvYmplY3QgdGhhdCB0aGlzIGZ1bmN0aW9uIHJldHVybnMsIHNvIHRoZSB0aGUgdHJhbnNwb3J0XG4gICAqICAgbGF5ZXIgY2FuIHJlZ2lzdGVyIHRoZSBhcHByb3ByaWF0ZSBsaXN0ZW5lcnMuXG4gICAqIEBwYXJhbSBhcmdzIC0gVGhlIHNlcmlhbGl6ZWQgYXJndW1lbnRzIHRvIGludm9rZSB0aGUgcmVtb3RlIG1ldGhvZCB3aXRoLlxuICAgKi9cbiAgY2FsbFJlbW90ZU1ldGhvZChcbiAgICBvYmplY3RJZDogbnVtYmVyLFxuICAgIG1ldGhvZE5hbWU6IHN0cmluZyxcbiAgICByZXR1cm5UeXBlOiBSZXR1cm5UeXBlLFxuICAgIGFyZ3M6IEFycmF5PGFueT5cbiAgKTogYW55IHtcbiAgICBjb25zdCBtZXNzYWdlOiBDYWxsUmVtb3RlTWV0aG9kTWVzc2FnZSA9IHtcbiAgICAgIHByb3RvY29sOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICB0eXBlOiAnTWV0aG9kQ2FsbCcsXG4gICAgICBtZXRob2Q6IG1ldGhvZE5hbWUsXG4gICAgICBvYmplY3RJZCxcbiAgICAgIHJlcXVlc3RJZDogdGhpcy5fZ2VuZXJhdGVSZXF1ZXN0SWQoKSxcbiAgICAgIGFyZ3MsXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5fc2VuZE1lc3NhZ2VBbmRMaXN0ZW5Gb3JSZXN1bHQoXG4gICAgICBtZXNzYWdlLFxuICAgICAgcmV0dXJuVHlwZSxcbiAgICAgIGBDYWxsaW5nIHJlbW90ZSBtZXRob2QgJHttZXRob2ROYW1lfS5gXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIGEgcmVtb3RlIGNvbnN0cnVjdG9yLCByZXR1cm5pbmcgYW4gaWQgdGhhdCBldmVudHVhbGx5IHJlc29sdmVzIHRvIGEgdW5pcXVlIGlkZW50aWZpZXJcbiAgICogZm9yIHRoZSBvYmplY3QuXG4gICAqIEBwYXJhbSBpbnRlcmZhY2VOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHJlbW90ZSBjbGFzcyBmb3Igd2hpY2ggdG8gY29uc3RydWN0IGFuIG9iamVjdC5cbiAgICogQHBhcmFtIGFyZ3MgLSBTZXJpYWxpemVkIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSByZW1vdGUgY29uc3RydWN0b3IuXG4gICAqL1xuICBjcmVhdGVSZW1vdGVPYmplY3QoaW50ZXJmYWNlTmFtZTogc3RyaW5nLCBhcmdzOiBBcnJheTxhbnk+KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBtZXNzYWdlOiBDcmVhdGVSZW1vdGVPYmplY3RNZXNzYWdlID0ge1xuICAgICAgcHJvdG9jb2w6ICdzZXJ2aWNlX2ZyYW1ld29yazNfcnBjJyxcbiAgICAgIHR5cGU6ICdOZXdPYmplY3QnLFxuICAgICAgaW50ZXJmYWNlOiBpbnRlcmZhY2VOYW1lLFxuICAgICAgcmVxdWVzdElkOiB0aGlzLl9nZW5lcmF0ZVJlcXVlc3RJZCgpLFxuICAgICAgYXJncyxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLl9zZW5kTWVzc2FnZUFuZExpc3RlbkZvclJlc3VsdChcbiAgICAgIG1lc3NhZ2UsXG4gICAgICAncHJvbWlzZScsXG4gICAgICBgQ3JlYXRpbmcgaW5zdGFuY2Ugb2YgJHtpbnRlcmZhY2VOYW1lfWBcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2UgYSByZW1vdGUgb2JqZWN0LiBUaGlzIG1ha2VzIGl0J3MgcHJveGllcyB1bnN1YWJsZSwgYW5kIGNhbGxzIHRoZSBgZGlzcG9zZWAgbWV0aG9kIG9uXG4gICAqIHRoZSByZW1vdGUgb2JqZWN0LlxuICAgKiBAcGFyYW0gb2JqZWN0SWQgLSBUaGUgbnVtZXJpY2FsIGlkIHRoYXQgaWRlbnRpZmllcyB0aGUgcmVtb3RlIG9iamVjdC5cbiAgICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgb2JqZWN0IGRpc3Bvc2FsIGhhcyBjb21wbGV0ZWQuXG4gICAqL1xuICBkaXNwb3NlUmVtb3RlT2JqZWN0KG9iamVjdElkOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtZXNzYWdlOiBEaXNwb3NlUmVtb3RlT2JqZWN0TWVzc2FnZSA9IHtcbiAgICAgIHByb3RvY29sOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICB0eXBlOiAnRGlzcG9zZU9iamVjdCcsXG4gICAgICByZXF1ZXN0SWQ6IHRoaXMuX2dlbmVyYXRlUmVxdWVzdElkKCksXG4gICAgICBvYmplY3RJZCxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLl9zZW5kTWVzc2FnZUFuZExpc3RlbkZvclJlc3VsdChtZXNzYWdlLCAncHJvbWlzZScsIGBEaXNwb3Npbmcgb2JqZWN0ICR7b2JqZWN0SWR9YCk7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgbGlzdGVucyBmb3IgYSByZXN1bHQgZm9yIHRoZSBnaXZlbiByZXF1ZXN0SWQuXG4gICAqIEBwYXJhbSByZXR1cm5UeXBlIC0gRGV0ZXJtaW5lcyB0aGUgdHlwZSBvZiBtZXNzYWdlcyB3ZSBzaG91bGQgc3Vic2NyaWJlIHRvLCBhbmQgd2hhdCB0aGlzXG4gICAqICAgZnVuY3Rpb24gc2hvdWxkIHJldHVybi5cbiAgICogQHBhcmFtIHJlcXVlc3RJZCAtIFRoZSBpZCBvZiB0aGUgcmVxdWVzdCB3aG8ncyByZXN1bHQgd2UgYXJlIGxpc3RlbmluZyBmb3IuXG4gICAqIEByZXR1cm5zIERlcGVuZGluZyBvbiB0aGUgZXhwZWN0ZWQgcmV0dXJuIHR5cGUsIHRoaXMgZnVuY3Rpb24gZWl0aGVyIHJldHVybnMgdW5kZWZpbmVkLCBhXG4gICAqICAgUHJvbWlzZSwgb3IgYW4gT2JzZXJ2YWJsZS5cbiAgICovXG4gIF9zZW5kTWVzc2FnZUFuZExpc3RlbkZvclJlc3VsdChcbiAgICBtZXNzYWdlOiBSZXF1ZXN0TWVzc2FnZSxcbiAgICByZXR1cm5UeXBlOiBSZXR1cm5UeXBlLFxuICAgIHRpbWVvdXRNZXNzYWdlOiBzdHJpbmdcbiAgKTogYW55IHtcbiAgICBzd2l0Y2ggKHJldHVyblR5cGUpIHtcbiAgICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChtZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuOyAvLyBObyB2YWx1ZXMgdG8gcmV0dXJuLlxuICAgICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICAgIC8vIExpc3RlbiBmb3IgYSBzaW5nbGUgbWVzc2FnZSwgYW5kIHJlc29sdmUgb3IgcmVqZWN0IGEgcHJvbWlzZSBvbiB0aGF0IG1lc3NhZ2UuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQobWVzc2FnZSk7XG4gICAgICAgICAgdGhpcy5fZW1pdHRlci5vbmNlKG1lc3NhZ2UucmVxdWVzdElkLnRvU3RyaW5nKCksIChoYWRFcnJvciwgZXJyb3IsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaGFkRXJyb3IgPyByZWplY3QoZGVjb2RlRXJyb3IoZXJyb3IpKSA6IHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMobWVzc2FnZS5yZXF1ZXN0SWQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICByZWplY3QoXG4gICAgICAgICAgICAgIGBUaW1lb3V0IGFmdGVyICR7U0VSVklDRV9GUkFNRVdPUktfUlBDX1RJTUVPVVRfTVN9IGZvciByZXF1ZXN0SWQ6IGAgK1xuICAgICAgICAgICAgICBgJHttZXNzYWdlLnJlcXVlc3RJZH0sICR7dGltZW91dE1lc3NhZ2V9LmBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSwgU0VSVklDRV9GUkFNRVdPUktfUlBDX1RJTUVPVVRfTVMpO1xuICAgICAgICB9KTtcbiAgICAgIGNhc2UgJ29ic2VydmFibGUnOlxuICAgICAgICBjb25zdCBvYnNlcnZhYmxlID0gT2JzZXJ2YWJsZS5jcmVhdGUob2JzZXJ2ZXIgPT4ge1xuICAgICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKG1lc3NhZ2UpO1xuXG4gICAgICAgICAgLy8gTGlzdGVuIGZvciAnbmV4dCcsICdlcnJvcicsIGFuZCAnY29tcGxldGVkJyBldmVudHMuXG4gICAgICAgICAgdGhpcy5fZW1pdHRlci5vbihcbiAgICAgICAgICAgIG1lc3NhZ2UucmVxdWVzdElkLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAoaGFkRXJyb3I6IGJvb2xlYW4sIGVycm9yOiA/RXJyb3IsIHJlc3VsdDogP09ic2VydmFibGVSZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGhhZEVycm9yKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIub25FcnJvcihkZWNvZGVFcnJvcihlcnJvcikpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGludmFyaWFudChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQudHlwZSA9PT0gJ2NvbXBsZXRlZCcpIHtcbiAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXN1bHQudHlwZSA9PT0gJ25leHQnKSB7XG4gICAgICAgICAgICAgICAgICBvYnNlcnZlci5vbk5leHQocmVzdWx0LmRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBPYnNlcnZhYmxlIGRpc3Bvc2UgZnVuY3Rpb24sIHdoaWNoIGlzIGNhbGxlZCBvbiBzdWJzY3JpcHRpb24gZGlwc29zZSwgb24gc3RyZWFtXG4gICAgICAgICAgLy8gY29tcGxldGlvbiwgYW5kIG9uIHN0cmVhbSBlcnJvci5cbiAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMobWVzc2FnZS5yZXF1ZXN0SWQudG9TdHJpbmcoKSk7XG5cbiAgICAgICAgICAgIC8vIFNlbmQgYSBtZXNzYWdlIHRvIHNlcnZlciB0byBjYWxsIHRoZSBkaXNwb3NlIGZ1bmN0aW9uIG9mXG4gICAgICAgICAgICAvLyB0aGUgcmVtb3RlIE9ic2VydmFibGUgc3Vic2NyaXB0aW9uLlxuICAgICAgICAgICAgY29uc3QgZGlzcG9zZU1lc3NhZ2U6IERpc3Bvc2VPYnNlcnZhYmxlTWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgcHJvdG9jb2w6ICdzZXJ2aWNlX2ZyYW1ld29yazNfcnBjJyxcbiAgICAgICAgICAgICAgdHlwZTogJ0Rpc3Bvc2VPYnNlcnZhYmxlJyxcbiAgICAgICAgICAgICAgcmVxdWVzdElkOiBtZXNzYWdlLnJlcXVlc3RJZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChkaXNwb3NlTWVzc2FnZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGU7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua293biByZXR1cm4gdHlwZTogJHtyZXR1cm5UeXBlfS5gKTtcbiAgICB9XG4gIH1cblxuICBnZXRTb2NrZXQoKTogTnVjbGlkZVNvY2tldCB7XG4gICAgcmV0dXJuIHRoaXMuX3NvY2tldDtcbiAgfVxuXG4gIF9oYW5kbGVTb2NrZXRNZXNzYWdlKG1lc3NhZ2U6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHtjaGFubmVsfSA9IG1lc3NhZ2U7XG4gICAgaW52YXJpYW50KGNoYW5uZWwgPT09IFNFUlZJQ0VfRlJBTUVXT1JLM19DSEFOTkVMKTtcbiAgICBjb25zdCB7cmVxdWVzdElkLCBoYWRFcnJvciwgZXJyb3IsIHJlc3VsdH0gPSBtZXNzYWdlO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChyZXF1ZXN0SWQudG9TdHJpbmcoKSwgaGFkRXJyb3IsIGVycm9yLCByZXN1bHQpO1xuICB9XG5cbiAgX2dlbmVyYXRlUmVxdWVzdElkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3JwY1JlcXVlc3RJZCsrO1xuICB9XG5cbiAgLy8gUmVzb2x2ZXMgaWYgdGhlIGNvbm5lY3Rpb24gbG9va3MgaGVhbHRoeS5cbiAgLy8gV2lsbCByZWplY3QgcXVpY2tseSBpZiB0aGUgY29ubmVjdGlvbiBsb29rcyB1bmhlYWx0aHkuXG4gIHRlc3RDb25uZWN0aW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQudGVzdENvbm5lY3Rpb24oKTtcbiAgfVxuXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3NvY2tldC5jbG9zZSgpO1xuICB9XG59XG5cbi8vIFRPRE86IFRoaXMgc2hvdWxkIGJlIGEgY3VzdG9tIG1hcnNoYWxsZXIgcmVnaXN0ZXJlZCBpbiB0aGUgVHlwZVJlZ2lzdHJ5XG5mdW5jdGlvbiBkZWNvZGVFcnJvcihlbmNvZGVkRXJyb3I6ID8oT2JqZWN0IHwgc3RyaW5nKSk6ID8oRXJyb3IgfCBzdHJpbmcpIHtcbiAgaWYgKGVuY29kZWRFcnJvciAhPSBudWxsICYmIHR5cGVvZiBlbmNvZGVkRXJyb3IgPT09ICdvYmplY3QnKSB7XG4gICAgY29uc3QgcmVzdWx0RXJyb3IgPSBuZXcgRXJyb3IoKTtcbiAgICByZXN1bHRFcnJvci5tZXNzYWdlID0gZW5jb2RlZEVycm9yLm1lc3NhZ2U7XG4gICAgLy8gJEZsb3dJc3N1ZSAtIHNvbWUgRXJyb3JzIChub3RhYmx5IGZpbGUgb3BlcmF0aW9ucykgaGF2ZSBhIGNvZGUuXG4gICAgcmVzdWx0RXJyb3IuY29kZSA9IGVuY29kZWRFcnJvci5jb2RlO1xuICAgIHJlc3VsdEVycm9yLnN0YWNrID0gZW5jb2RlZEVycm9yLnN0YWNrO1xuICAgIHJldHVybiByZXN1bHRFcnJvcjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZW5jb2RlZEVycm9yO1xuICB9XG59XG4iXX0=