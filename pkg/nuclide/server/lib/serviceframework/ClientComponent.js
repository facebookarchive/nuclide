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
//# sourceMappingURL=data:application/json;base64,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SUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUN0Qzs7O1dBRUksaUJBQVM7QUFDWixVQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3RCOzs7U0F0UWtCLGVBQWU7OztxQkFBZixlQUFlO0FBMFFwQyxTQUFTLFdBQVcsQ0FBQyxZQUFnQyxFQUFxQjtBQUN4RSxNQUFJLFlBQVksSUFBSSxJQUFJLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFO0FBQzVELFFBQU0sV0FBVyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDaEMsZUFBVyxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDOztBQUUzQyxlQUFXLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7QUFDckMsZUFBVyxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO0FBQ3ZDLFdBQU8sV0FBVyxDQUFDO0dBQ3BCLE1BQU07QUFDTCxXQUFPLFlBQVksQ0FBQztHQUNyQjtDQUNGIiwiZmlsZSI6IkNsaWVudENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7U0VSVklDRV9GUkFNRVdPUkszX0NIQU5ORUx9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgdHlwZSB7Q29uZmlnRW50cnl9IGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBOdWNsaWRlU29ja2V0IGZyb20gJy4uL051Y2xpZGVTb2NrZXQnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5pbXBvcnQge1NFUlZJQ0VfRlJBTUVXT1JLX1JQQ19USU1FT1VUX01TfSBmcm9tICcuLi9jb25maWcnO1xuXG5pbXBvcnQgVHlwZVJlZ2lzdHJ5IGZyb20gJy4uLy4uLy4uL3NlcnZpY2UtcGFyc2VyL2xpYi9UeXBlUmVnaXN0cnknO1xuaW1wb3J0IHtnZXRQcm94eSwgZ2V0RGVmaW5pdGlvbnN9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2UtcGFyc2VyJztcblxuaW1wb3J0IHR5cGUge1JlcXVlc3RNZXNzYWdlLCBDYWxsUmVtb3RlRnVuY3Rpb25NZXNzYWdlLCBDcmVhdGVSZW1vdGVPYmplY3RNZXNzYWdlLFxuICBDYWxsUmVtb3RlTWV0aG9kTWVzc2FnZSwgRGlzcG9zZVJlbW90ZU9iamVjdE1lc3NhZ2UsIERpc3Bvc2VPYnNlcnZhYmxlTWVzc2FnZSxcbiAgUmV0dXJuVHlwZSwgT2JzZXJ2YWJsZVJlc3VsdH0gZnJvbSAnLi90eXBlcyc7XG5cbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xpZW50Q29tcG9uZW50IHtcbiAgX3JwY1JlcXVlc3RJZDogbnVtYmVyO1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfc29ja2V0OiBOdWNsaWRlU29ja2V0O1xuXG4gIF90eXBlUmVnaXN0cnk6IFR5cGVSZWdpc3RyeTtcbiAgX29iamVjdFJlZ2lzdHJ5OiBNYXA8bnVtYmVyLCBhbnk+O1xuXG4gIGNvbnN0cnVjdG9yKHNvY2tldDogTnVjbGlkZVNvY2tldCwgc2VydmljZXM6IEFycmF5PENvbmZpZ0VudHJ5Pikge1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5fc29ja2V0ID0gc29ja2V0O1xuICAgIHRoaXMuX3JwY1JlcXVlc3RJZCA9IDE7XG5cbiAgICB0aGlzLl90eXBlUmVnaXN0cnkgPSBuZXcgVHlwZVJlZ2lzdHJ5KCk7XG4gICAgdGhpcy5fb2JqZWN0UmVnaXN0cnkgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLmFkZFNlcnZpY2VzKHNlcnZpY2VzKTtcbiAgICB0aGlzLl9zb2NrZXQub24oJ21lc3NhZ2UnLCBtZXNzYWdlID0+IHRoaXMuX2hhbmRsZVNvY2tldE1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cbiAgYWRkU2VydmljZXMoc2VydmljZXM6IEFycmF5PENvbmZpZ0VudHJ5Pik6IHZvaWQge1xuICAgIHNlcnZpY2VzLmZvckVhY2godGhpcy5hZGRTZXJ2aWNlLCB0aGlzKTtcbiAgfVxuXG4gIGFkZFNlcnZpY2Uoc2VydmljZTogQ29uZmlnRW50cnkpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoYFJlZ2lzdGVyaW5nIDMuMCBzZXJ2aWNlICR7c2VydmljZS5uYW1lfS4uLmApO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkZWZzID0gZ2V0RGVmaW5pdGlvbnMoc2VydmljZS5kZWZpbml0aW9uKTtcbiAgICAgIGNvbnN0IHByb3h5ID0gZ2V0UHJveHkoc2VydmljZS5uYW1lLCBzZXJ2aWNlLmRlZmluaXRpb24sIHRoaXMpO1xuXG4gICAgICBkZWZzLmZvckVhY2goZGVmaW5pdGlvbiA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBkZWZpbml0aW9uLm5hbWU7XG4gICAgICAgIHN3aXRjaCAoZGVmaW5pdGlvbi5raW5kKSB7XG4gICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGBSZWdpc3RlcmluZyB0eXBlIGFsaWFzICR7bmFtZX0uLi5gKTtcbiAgICAgICAgICAgIGlmIChkZWZpbml0aW9uLmRlZmluaXRpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgICB0aGlzLl90eXBlUmVnaXN0cnkucmVnaXN0ZXJBbGlhcyhuYW1lLCBkZWZpbml0aW9uLmRlZmluaXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnaW50ZXJmYWNlJzpcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgUmVnaXN0ZXJpbmcgaW50ZXJmYWNlICR7bmFtZX0uYCk7XG4gICAgICAgICAgICB0aGlzLl90eXBlUmVnaXN0cnkucmVnaXN0ZXJUeXBlKG5hbWUsIGFzeW5jIG9iamVjdCA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBhd2FpdCBvYmplY3QuX2lkUHJvbWlzZTtcbiAgICAgICAgICAgIH0sIGFzeW5jIG9iamVjdElkID0+IHtcbiAgICAgICAgICAgICAgLy8gUmV0dXJuIGEgY2FjaGVkIHByb3h5LCBpZiBvbmUgYWxyZWFkeSBleGlzdHMsIGZvciB0aGlzIG9iamVjdC5cbiAgICAgICAgICAgICAgaWYgKHRoaXMuX29iamVjdFJlZ2lzdHJ5LmhhcyhvYmplY3RJZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb2JqZWN0UmVnaXN0cnkuZ2V0KG9iamVjdElkKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRoZSBwcm94eSBieSBtYW51YWxseSBzZXR0aW5nIHRoZSBwcm90b3R5cGUgb2YgdGhlIG9iamVjdCB0byBiZSB0aGVcbiAgICAgICAgICAgICAgLy8gcHJvdG90eXBlIG9mIHRoZSByZW1vdGUgcHJveHkgY29uc3RydWN0b3IuXG4gICAgICAgICAgICAgIGNvbnN0IG9iamVjdCA9IHsgX2lkUHJvbWlzZTogUHJvbWlzZS5yZXNvbHZlKG9iamVjdElkKSB9O1xuICAgICAgICAgICAgICAvLyAkRmxvd0lzc3VlIC0gVDkyNTQyMTAgYWRkIE9iamVjdC5zZXRQcm90b3R5cGVPZiB0eXBpbmdcbiAgICAgICAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKG9iamVjdCwgcHJveHlbbmFtZV0ucHJvdG90eXBlKTtcbiAgICAgICAgICAgICAgdGhpcy5fb2JqZWN0UmVnaXN0cnkuc2V0KG9iamVjdElkLCBvYmplY3QpO1xuICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmVycm9yKGBGYWlsZWQgdG8gbG9hZCBzZXJ2aWNlICR7c2VydmljZS5uYW1lfS4gU3RhY2sgVHJhY2U6XFxuJHtlLnN0YWNrfWApO1xuICAgIH1cbiAgfVxuXG4gIC8vIERlbGVnYXRlIG1hcnNoYWxsaW5nIHRvIHRoZSB0eXBlIHJlZ2lzdHJ5LlxuICBtYXJzaGFsKC4uLmFyZ3M6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVSZWdpc3RyeS5tYXJzaGFsKC4uLmFyZ3MpO1xuICB9XG4gIHVubWFyc2hhbCguLi5hcmdzOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl90eXBlUmVnaXN0cnkudW5tYXJzaGFsKC4uLmFyZ3MpO1xuICB9XG4gIHJlZ2lzdGVyVHlwZSguLi5hcmdzOiBhbnkpOiB2b2lkIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyVHlwZSguLi5hcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIGEgcmVtb3RlIGZ1bmN0aW9uLCB0aHJvdWdoIHRoZSBzZXJ2aWNlIGZyYW1ld29yay5cbiAgICogQHBhcmFtIGZ1bmN0aW9uTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSByZW1vdGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICAgKiBAcGFyYW0gcmV0dXJuVHlwZSAtIFRoZSB0eXBlIG9mIG9iamVjdCB0aGF0IHRoaXMgZnVuY3Rpb24gcmV0dXJucywgc28gdGhlIHRoZSB0cmFuc3BvcnRcbiAgICogICBsYXllciBjYW4gcmVnaXN0ZXIgdGhlIGFwcHJvcHJpYXRlIGxpc3RlbmVycy5cbiAgICogQHBhcmFtIGFyZ3MgLSBUaGUgc2VyaWFsaXplZCBhcmd1bWVudHMgdG8gaW52b2tlIHRoZSByZW1vdGUgZnVuY3Rpb24gd2l0aC5cbiAgICovXG4gIGNhbGxSZW1vdGVGdW5jdGlvbihmdW5jdGlvbk5hbWU6IHN0cmluZywgcmV0dXJuVHlwZTogUmV0dXJuVHlwZSwgYXJnczogQXJyYXk8YW55Pik6IGFueSB7XG4gICAgY29uc3QgbWVzc2FnZTogQ2FsbFJlbW90ZUZ1bmN0aW9uTWVzc2FnZSA9IHtcbiAgICAgIHByb3RvY29sOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICB0eXBlOiAnRnVuY3Rpb25DYWxsJyxcbiAgICAgIGZ1bmN0aW9uOiBmdW5jdGlvbk5hbWUsXG4gICAgICByZXF1ZXN0SWQ6IHRoaXMuX2dlbmVyYXRlUmVxdWVzdElkKCksXG4gICAgICBhcmdzLFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuX3NlbmRNZXNzYWdlQW5kTGlzdGVuRm9yUmVzdWx0KFxuICAgICAgbWVzc2FnZSxcbiAgICAgIHJldHVyblR5cGUsXG4gICAgICBgQ2FsbGluZyBmdW5jdGlvbiAke2Z1bmN0aW9uTmFtZX1gXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIGEgbWV0aG9kIG9mIGEgcmVtb3RlIG9iamVjdCwgdGhyb3VnaCB0aGUgc2VydmljZSBmcmFtZXdvcmsuXG4gICAqIEBwYXJhbSBvYmplY3RJZCAtIFRoZSBpZCBvZiB0aGUgcmVtb3RlIG9iamVjdC5cbiAgICogQHBhcmFtIG1ldGhvZE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHRvIGludm9rZS5cbiAgICogQHBhcmFtIHJldHVyblR5cGUgLSBUaGUgdHlwZSBvZiBvYmplY3QgdGhhdCB0aGlzIGZ1bmN0aW9uIHJldHVybnMsIHNvIHRoZSB0aGUgdHJhbnNwb3J0XG4gICAqICAgbGF5ZXIgY2FuIHJlZ2lzdGVyIHRoZSBhcHByb3ByaWF0ZSBsaXN0ZW5lcnMuXG4gICAqIEBwYXJhbSBhcmdzIC0gVGhlIHNlcmlhbGl6ZWQgYXJndW1lbnRzIHRvIGludm9rZSB0aGUgcmVtb3RlIG1ldGhvZCB3aXRoLlxuICAgKi9cbiAgY2FsbFJlbW90ZU1ldGhvZChcbiAgICBvYmplY3RJZDogbnVtYmVyLFxuICAgIG1ldGhvZE5hbWU6IHN0cmluZyxcbiAgICByZXR1cm5UeXBlOiBSZXR1cm5UeXBlLFxuICAgIGFyZ3M6IEFycmF5PGFueT5cbiAgKTogYW55IHtcbiAgICBjb25zdCBtZXNzYWdlOiBDYWxsUmVtb3RlTWV0aG9kTWVzc2FnZSA9IHtcbiAgICAgIHByb3RvY29sOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICB0eXBlOiAnTWV0aG9kQ2FsbCcsXG4gICAgICBtZXRob2Q6IG1ldGhvZE5hbWUsXG4gICAgICBvYmplY3RJZCxcbiAgICAgIHJlcXVlc3RJZDogdGhpcy5fZ2VuZXJhdGVSZXF1ZXN0SWQoKSxcbiAgICAgIGFyZ3MsXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5fc2VuZE1lc3NhZ2VBbmRMaXN0ZW5Gb3JSZXN1bHQoXG4gICAgICBtZXNzYWdlLFxuICAgICAgcmV0dXJuVHlwZSxcbiAgICAgIGBDYWxsaW5nIHJlbW90ZSBtZXRob2QgJHttZXRob2ROYW1lfS5gXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIGEgcmVtb3RlIGNvbnN0cnVjdG9yLCByZXR1cm5pbmcgYW4gaWQgdGhhdCBldmVudHVhbGx5IHJlc29sdmVzIHRvIGEgdW5pcXVlIGlkZW50aWZpZXJcbiAgICogZm9yIHRoZSBvYmplY3QuXG4gICAqIEBwYXJhbSBpbnRlcmZhY2VOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHJlbW90ZSBjbGFzcyBmb3Igd2hpY2ggdG8gY29uc3RydWN0IGFuIG9iamVjdC5cbiAgICogQHBhcmFtIGFyZ3MgLSBTZXJpYWxpemVkIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSByZW1vdGUgY29uc3RydWN0b3IuXG4gICAqL1xuICBjcmVhdGVSZW1vdGVPYmplY3QoaW50ZXJmYWNlTmFtZTogc3RyaW5nLCBhcmdzOiBBcnJheTxhbnk+KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBtZXNzYWdlOiBDcmVhdGVSZW1vdGVPYmplY3RNZXNzYWdlID0ge1xuICAgICAgcHJvdG9jb2w6ICdzZXJ2aWNlX2ZyYW1ld29yazNfcnBjJyxcbiAgICAgIHR5cGU6ICdOZXdPYmplY3QnLFxuICAgICAgaW50ZXJmYWNlOiBpbnRlcmZhY2VOYW1lLFxuICAgICAgcmVxdWVzdElkOiB0aGlzLl9nZW5lcmF0ZVJlcXVlc3RJZCgpLFxuICAgICAgYXJncyxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLl9zZW5kTWVzc2FnZUFuZExpc3RlbkZvclJlc3VsdChcbiAgICAgIG1lc3NhZ2UsXG4gICAgICAncHJvbWlzZScsXG4gICAgICBgQ3JlYXRpbmcgaW5zdGFuY2Ugb2YgJHtpbnRlcmZhY2VOYW1lfWBcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2UgYSByZW1vdGUgb2JqZWN0LiBUaGlzIG1ha2VzIGl0J3MgcHJveGllcyB1bnN1YWJsZSwgYW5kIGNhbGxzIHRoZSBgZGlzcG9zZWAgbWV0aG9kIG9uXG4gICAqIHRoZSByZW1vdGUgb2JqZWN0LlxuICAgKiBAcGFyYW0gb2JqZWN0SWQgLSBUaGUgbnVtZXJpY2FsIGlkIHRoYXQgaWRlbnRpZmllcyB0aGUgcmVtb3RlIG9iamVjdC5cbiAgICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgb2JqZWN0IGRpc3Bvc2FsIGhhcyBjb21wbGV0ZWQuXG4gICAqL1xuICBkaXNwb3NlUmVtb3RlT2JqZWN0KG9iamVjdElkOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtZXNzYWdlOiBEaXNwb3NlUmVtb3RlT2JqZWN0TWVzc2FnZSA9IHtcbiAgICAgIHByb3RvY29sOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICB0eXBlOiAnRGlzcG9zZU9iamVjdCcsXG4gICAgICByZXF1ZXN0SWQ6IHRoaXMuX2dlbmVyYXRlUmVxdWVzdElkKCksXG4gICAgICBvYmplY3RJZCxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLl9zZW5kTWVzc2FnZUFuZExpc3RlbkZvclJlc3VsdChtZXNzYWdlLCAncHJvbWlzZScsIGBEaXNwb3Npbmcgb2JqZWN0ICR7b2JqZWN0SWR9YCk7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgbGlzdGVucyBmb3IgYSByZXN1bHQgZm9yIHRoZSBnaXZlbiByZXF1ZXN0SWQuXG4gICAqIEBwYXJhbSByZXR1cm5UeXBlIC0gRGV0ZXJtaW5lcyB0aGUgdHlwZSBvZiBtZXNzYWdlcyB3ZSBzaG91bGQgc3Vic2NyaWJlIHRvLCBhbmQgd2hhdCB0aGlzXG4gICAqICAgZnVuY3Rpb24gc2hvdWxkIHJldHVybi5cbiAgICogQHBhcmFtIHJlcXVlc3RJZCAtIFRoZSBpZCBvZiB0aGUgcmVxdWVzdCB3aG8ncyByZXN1bHQgd2UgYXJlIGxpc3RlbmluZyBmb3IuXG4gICAqIEByZXR1cm5zIERlcGVuZGluZyBvbiB0aGUgZXhwZWN0ZWQgcmV0dXJuIHR5cGUsIHRoaXMgZnVuY3Rpb24gZWl0aGVyIHJldHVybnMgdW5kZWZpbmVkLCBhXG4gICAqICAgUHJvbWlzZSwgb3IgYW4gT2JzZXJ2YWJsZS5cbiAgICovXG4gIF9zZW5kTWVzc2FnZUFuZExpc3RlbkZvclJlc3VsdChcbiAgICBtZXNzYWdlOiBSZXF1ZXN0TWVzc2FnZSxcbiAgICByZXR1cm5UeXBlOiBSZXR1cm5UeXBlLFxuICAgIHRpbWVvdXRNZXNzYWdlOiBzdHJpbmdcbiAgKTogYW55IHtcbiAgICBzd2l0Y2ggKHJldHVyblR5cGUpIHtcbiAgICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChtZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuOyAvLyBObyB2YWx1ZXMgdG8gcmV0dXJuLlxuICAgICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICAgIC8vIExpc3RlbiBmb3IgYSBzaW5nbGUgbWVzc2FnZSwgYW5kIHJlc29sdmUgb3IgcmVqZWN0IGEgcHJvbWlzZSBvbiB0aGF0IG1lc3NhZ2UuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQobWVzc2FnZSk7XG4gICAgICAgICAgdGhpcy5fZW1pdHRlci5vbmNlKG1lc3NhZ2UucmVxdWVzdElkLnRvU3RyaW5nKCksIChoYWRFcnJvciwgZXJyb3IsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaGFkRXJyb3IgPyByZWplY3QoZGVjb2RlRXJyb3IoZXJyb3IpKSA6IHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMobWVzc2FnZS5yZXF1ZXN0SWQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFxuICAgICAgICAgICAgICBgVGltZW91dCBhZnRlciAke1NFUlZJQ0VfRlJBTUVXT1JLX1JQQ19USU1FT1VUX01TfSBmb3IgcmVxdWVzdElkOiBgICtcbiAgICAgICAgICAgICAgYCR7bWVzc2FnZS5yZXF1ZXN0SWR9LCAke3RpbWVvdXRNZXNzYWdlfS5gXG4gICAgICAgICAgICApKTtcbiAgICAgICAgICB9LCBTRVJWSUNFX0ZSQU1FV09SS19SUENfVElNRU9VVF9NUyk7XG4gICAgICAgIH0pO1xuICAgICAgY2FzZSAnb2JzZXJ2YWJsZSc6XG4gICAgICAgIGNvbnN0IG9ic2VydmFibGUgPSBPYnNlcnZhYmxlLmNyZWF0ZShvYnNlcnZlciA9PiB7XG4gICAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQobWVzc2FnZSk7XG5cbiAgICAgICAgICAvLyBMaXN0ZW4gZm9yICduZXh0JywgJ2Vycm9yJywgYW5kICdjb21wbGV0ZWQnIGV2ZW50cy5cbiAgICAgICAgICB0aGlzLl9lbWl0dGVyLm9uKFxuICAgICAgICAgICAgbWVzc2FnZS5yZXF1ZXN0SWQudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIChoYWRFcnJvcjogYm9vbGVhbiwgZXJyb3I6ID9FcnJvciwgcmVzdWx0OiA/T2JzZXJ2YWJsZVJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoaGFkRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5vbkVycm9yKGRlY29kZUVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW52YXJpYW50KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC50eXBlID09PSAnY29tcGxldGVkJykge1xuICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdC50eXBlID09PSAnbmV4dCcpIHtcbiAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm9uTmV4dChyZXN1bHQuZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIE9ic2VydmFibGUgZGlzcG9zZSBmdW5jdGlvbiwgd2hpY2ggaXMgY2FsbGVkIG9uIHN1YnNjcmlwdGlvbiBkaXBzb3NlLCBvbiBzdHJlYW1cbiAgICAgICAgICAvLyBjb21wbGV0aW9uLCBhbmQgb24gc3RyZWFtIGVycm9yLlxuICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9lbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycyhtZXNzYWdlLnJlcXVlc3RJZC50b1N0cmluZygpKTtcblxuICAgICAgICAgICAgLy8gU2VuZCBhIG1lc3NhZ2UgdG8gc2VydmVyIHRvIGNhbGwgdGhlIGRpc3Bvc2UgZnVuY3Rpb24gb2ZcbiAgICAgICAgICAgIC8vIHRoZSByZW1vdGUgT2JzZXJ2YWJsZSBzdWJzY3JpcHRpb24uXG4gICAgICAgICAgICBjb25zdCBkaXNwb3NlTWVzc2FnZTogRGlzcG9zZU9ic2VydmFibGVNZXNzYWdlID0ge1xuICAgICAgICAgICAgICBwcm90b2NvbDogJ3NlcnZpY2VfZnJhbWV3b3JrM19ycGMnLFxuICAgICAgICAgICAgICB0eXBlOiAnRGlzcG9zZU9ic2VydmFibGUnLFxuICAgICAgICAgICAgICByZXF1ZXN0SWQ6IG1lc3NhZ2UucmVxdWVzdElkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKGRpc3Bvc2VNZXNzYWdlKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rb3duIHJldHVybiB0eXBlOiAke3JldHVyblR5cGV9LmApO1xuICAgIH1cbiAgfVxuXG4gIGdldFNvY2tldCgpOiBOdWNsaWRlU29ja2V0IHtcbiAgICByZXR1cm4gdGhpcy5fc29ja2V0O1xuICB9XG5cbiAgX2hhbmRsZVNvY2tldE1lc3NhZ2UobWVzc2FnZTogYW55KTogdm9pZCB7XG4gICAgY29uc3Qge2NoYW5uZWx9ID0gbWVzc2FnZTtcbiAgICBpbnZhcmlhbnQoY2hhbm5lbCA9PT0gU0VSVklDRV9GUkFNRVdPUkszX0NIQU5ORUwpO1xuICAgIGNvbnN0IHtyZXF1ZXN0SWQsIGhhZEVycm9yLCBlcnJvciwgcmVzdWx0fSA9IG1lc3NhZ2U7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KHJlcXVlc3RJZC50b1N0cmluZygpLCBoYWRFcnJvciwgZXJyb3IsIHJlc3VsdCk7XG4gIH1cblxuICBfZ2VuZXJhdGVSZXF1ZXN0SWQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcnBjUmVxdWVzdElkKys7XG4gIH1cblxuICAvLyBSZXNvbHZlcyBpZiB0aGUgY29ubmVjdGlvbiBsb29rcyBoZWFsdGh5LlxuICAvLyBXaWxsIHJlamVjdCBxdWlja2x5IGlmIHRoZSBjb25uZWN0aW9uIGxvb2tzIHVuaGVhbHRoeS5cbiAgdGVzdENvbm5lY3Rpb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NvY2tldC50ZXN0Q29ubmVjdGlvbigpO1xuICB9XG5cbiAgY2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc29ja2V0LmNsb3NlKCk7XG4gIH1cbn1cblxuLy8gVE9ETzogVGhpcyBzaG91bGQgYmUgYSBjdXN0b20gbWFyc2hhbGxlciByZWdpc3RlcmVkIGluIHRoZSBUeXBlUmVnaXN0cnlcbmZ1bmN0aW9uIGRlY29kZUVycm9yKGVuY29kZWRFcnJvcjogPyhPYmplY3QgfCBzdHJpbmcpKTogPyhFcnJvciB8IHN0cmluZykge1xuICBpZiAoZW5jb2RlZEVycm9yICE9IG51bGwgJiYgdHlwZW9mIGVuY29kZWRFcnJvciA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCByZXN1bHRFcnJvciA9IG5ldyBFcnJvcigpO1xuICAgIHJlc3VsdEVycm9yLm1lc3NhZ2UgPSBlbmNvZGVkRXJyb3IubWVzc2FnZTtcbiAgICAvLyAkRmxvd0lzc3VlIC0gc29tZSBFcnJvcnMgKG5vdGFibHkgZmlsZSBvcGVyYXRpb25zKSBoYXZlIGEgY29kZS5cbiAgICByZXN1bHRFcnJvci5jb2RlID0gZW5jb2RlZEVycm9yLmNvZGU7XG4gICAgcmVzdWx0RXJyb3Iuc3RhY2sgPSBlbmNvZGVkRXJyb3Iuc3RhY2s7XG4gICAgcmV0dXJuIHJlc3VsdEVycm9yO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBlbmNvZGVkRXJyb3I7XG4gIH1cbn1cbiJdfQ==