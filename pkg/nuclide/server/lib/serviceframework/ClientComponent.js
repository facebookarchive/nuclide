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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsaWVudENvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFXeUMsV0FBVzs7c0JBRzlCLFFBQVE7Ozs7c0JBQ0gsUUFBUTs7NkJBQ1Qsa0JBQWtCOzs7O2tCQUNuQixJQUFJOzs0Q0FHSiwwQ0FBMEM7Ozs7NkJBQzVCLHlCQUF5Qjs7QUFNaEUsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7O0lBRWxDLGVBQWU7QUFRdkIsV0FSUSxlQUFlLENBUXRCLE1BQXFCLEVBQUUsUUFBNEIsRUFBRTs7OzBCQVI5QyxlQUFlOztBQVNoQyxRQUFJLENBQUMsUUFBUSxHQUFHLDBCQUFrQixDQUFDO0FBQ25DLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDOztBQUV2QixRQUFJLENBQUMsYUFBYSxHQUFHLCtDQUFrQixDQUFDO0FBQ3hDLFFBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7QUFFakMsUUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQixRQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBQSxPQUFPO2FBQUksTUFBSyxvQkFBb0IsQ0FBQyxPQUFPLENBQUM7S0FBQSxDQUFDLENBQUM7R0FDM0U7Ozs7ZUFsQmtCLGVBQWU7O1dBb0J2QixxQkFBQyxRQUE0QixFQUFRO0FBQzlDLGNBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUN6Qzs7O1dBRVMsb0JBQUMsT0FBb0IsRUFBUTs7O0FBQ3JDLFlBQU0sQ0FBQyxLQUFLLDhCQUE0QixPQUFPLENBQUMsSUFBSSxTQUFNLENBQUM7QUFDM0QsVUFBSTs7QUFDRixjQUFNLElBQUksR0FBRyxtQ0FBZSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDaEQsY0FBTSxLQUFLLEdBQUcsNkJBQVMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsVUFBVSxTQUFPLENBQUM7O0FBRS9ELGNBQUksQ0FBQyxPQUFPLENBQUMsVUFBQSxVQUFVLEVBQUk7QUFDekIsZ0JBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFDN0Isb0JBQVEsVUFBVSxDQUFDLElBQUk7QUFDckIsbUJBQUssT0FBTztBQUNWLHNCQUFNLENBQUMsS0FBSyw2QkFBMkIsSUFBSSxTQUFNLENBQUM7QUFDbEQsb0JBQUksVUFBVSxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDakMseUJBQUssYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUMvRDtBQUNELHNCQUFNO0FBQUEsQUFDUixtQkFBSyxXQUFXO0FBQ2Qsc0JBQU0sQ0FBQyxLQUFLLDRCQUEwQixJQUFJLE9BQUksQ0FBQztBQUMvQyx1QkFBSyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksb0JBQUUsV0FBTSxNQUFNLEVBQUk7QUFDcEQseUJBQU8sTUFBTSxNQUFNLENBQUMsVUFBVSxDQUFDO2lCQUNoQyxxQkFBRSxXQUFNLFFBQVEsRUFBSTs7QUFFbkIsc0JBQUksT0FBSyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ3RDLDJCQUFPLE9BQUssZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzttQkFDM0M7Ozs7QUFJRCxzQkFBTSxNQUFNLEdBQUcsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDOztBQUV6RCx3QkFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3JELHlCQUFLLGVBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzNDLHlCQUFPLE1BQU0sQ0FBQztpQkFDZixFQUFDLENBQUM7QUFDSCxzQkFBTTtBQUFBLGFBQ1Q7V0FDRixDQUFDLENBQUM7O09BQ0osQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGNBQU0sQ0FBQyxLQUFLLDZCQUEyQixPQUFPLENBQUMsSUFBSSx3QkFBbUIsQ0FBQyxDQUFDLEtBQUssQ0FBRyxDQUFDO09BQ2xGO0tBQ0Y7Ozs7O1dBR00sbUJBQW9COzs7QUFDekIsYUFBTyxpQkFBQSxJQUFJLENBQUMsYUFBYSxFQUFDLE9BQU8sTUFBQSwwQkFBUyxDQUFDO0tBQzVDOzs7V0FDUSxxQkFBb0I7OztBQUMzQixhQUFPLGtCQUFBLElBQUksQ0FBQyxhQUFhLEVBQUMsU0FBUyxNQUFBLDJCQUFTLENBQUM7S0FDOUM7OztXQUNXLHdCQUFxQjs7O0FBQy9CLGFBQU8sa0JBQUEsSUFBSSxDQUFDLGFBQWEsRUFBQyxZQUFZLE1BQUEsMkJBQVMsQ0FBQztLQUNqRDs7Ozs7Ozs7Ozs7V0FTaUIsNEJBQUMsWUFBb0IsRUFBRSxVQUFzQixFQUFFLElBQWdCLEVBQU87QUFDdEYsVUFBTSxPQUFrQyxHQUFHO0FBQ3pDLGdCQUFRLEVBQUUsd0JBQXdCO0FBQ2xDLFlBQUksRUFBRSxjQUFjO0FBQ3BCLG9CQUFVLFlBQVk7QUFDdEIsaUJBQVMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7QUFDcEMsWUFBSSxFQUFKLElBQUk7T0FDTCxDQUFDO0FBQ0YsYUFBTyxJQUFJLENBQUMsOEJBQThCLENBQ3hDLE9BQU8sRUFDUCxVQUFVLHdCQUNVLFlBQVksQ0FDakMsQ0FBQztLQUNIOzs7Ozs7Ozs7Ozs7V0FVZSwwQkFDZCxRQUFnQixFQUNoQixVQUFrQixFQUNsQixVQUFzQixFQUN0QixJQUFnQixFQUNYO0FBQ0wsVUFBTSxPQUFnQyxHQUFHO0FBQ3ZDLGdCQUFRLEVBQUUsd0JBQXdCO0FBQ2xDLFlBQUksRUFBRSxZQUFZO0FBQ2xCLGNBQU0sRUFBRSxVQUFVO0FBQ2xCLGdCQUFRLEVBQVIsUUFBUTtBQUNSLGlCQUFTLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQ3BDLFlBQUksRUFBSixJQUFJO09BQ0wsQ0FBQztBQUNGLGFBQU8sSUFBSSxDQUFDLDhCQUE4QixDQUN4QyxPQUFPLEVBQ1AsVUFBVSw2QkFDZSxVQUFVLE9BQ3BDLENBQUM7S0FDSDs7Ozs7Ozs7OztXQVFpQiw0QkFBQyxhQUFxQixFQUFFLElBQWdCLEVBQW1CO0FBQzNFLFVBQU0sT0FBa0MsR0FBRztBQUN6QyxnQkFBUSxFQUFFLHdCQUF3QjtBQUNsQyxZQUFJLEVBQUUsV0FBVztBQUNqQixxQkFBVyxhQUFhO0FBQ3hCLGlCQUFTLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQ3BDLFlBQUksRUFBSixJQUFJO09BQ0wsQ0FBQztBQUNGLGFBQU8sSUFBSSxDQUFDLDhCQUE4QixDQUN4QyxPQUFPLEVBQ1AsU0FBUyw0QkFDZSxhQUFhLENBQ3RDLENBQUM7S0FDSDs7Ozs7Ozs7OztXQVFrQiw2QkFBQyxRQUFnQixFQUFpQjtBQUNuRCxVQUFNLE9BQW1DLEdBQUc7QUFDMUMsZ0JBQVEsRUFBRSx3QkFBd0I7QUFDbEMsWUFBSSxFQUFFLGVBQWU7QUFDckIsaUJBQVMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7QUFDcEMsZ0JBQVEsRUFBUixRQUFRO09BQ1QsQ0FBQztBQUNGLGFBQU8sSUFBSSxDQUFDLDhCQUE4QixDQUFDLE9BQU8sRUFBRSxTQUFTLHdCQUFzQixRQUFRLENBQUcsQ0FBQztLQUNoRzs7Ozs7Ozs7Ozs7O1dBVTZCLHdDQUM1QixPQUF1QixFQUN2QixVQUFzQixFQUN0QixjQUFzQixFQUNqQjs7O0FBQ0wsY0FBUSxVQUFVO0FBQ2hCLGFBQUssTUFBTTtBQUNULGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNCLGlCQUFPO0FBQ1QsYUFBSyxTQUFTOztBQUVaLGlCQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxtQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNCLG1CQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxVQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFLO0FBQzVFLHNCQUFRLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN6RCxDQUFDLENBQUM7O0FBRUgsc0JBQVUsQ0FBQyxZQUFNO0FBQ2YscUJBQUssUUFBUSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUMvRCxvQkFBTSxDQUNKLG9GQUNHLE9BQU8sQ0FBQyxTQUFTLFVBQUssY0FBYyxPQUFHLENBQzNDLENBQUM7YUFDSCwyQ0FBbUMsQ0FBQztXQUN0QyxDQUFDLENBQUM7QUFBQSxBQUNMLGFBQUssWUFBWTtBQUNmLGNBQU0sVUFBVSxHQUFHLGVBQVcsTUFBTSxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQy9DLG1CQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7OztBQUczQixtQkFBSyxRQUFRLENBQUMsRUFBRSxDQUNkLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQzVCLFVBQUMsUUFBUSxFQUFXLEtBQUssRUFBVSxNQUFNLEVBQXdCO0FBQy9ELGtCQUFJLFFBQVEsRUFBRTtBQUNaLHdCQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2VBQ3RDLE1BQU07QUFDTCx5Q0FBVSxNQUFNLENBQUMsQ0FBQztBQUNsQixvQkFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRTtBQUMvQiwwQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO2lCQUN4QixNQUFNLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDakMsMEJBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUM5QjtlQUNGO2FBQ0YsQ0FBQyxDQUFDOzs7O0FBSUwsbUJBQU8sWUFBTTtBQUNYLHFCQUFLLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Ozs7QUFJL0Qsa0JBQU0sY0FBd0MsR0FBRztBQUMvQyx3QkFBUSxFQUFFLHdCQUF3QjtBQUNsQyxvQkFBSSxFQUFFLG1CQUFtQjtBQUN6Qix5QkFBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO2VBQzdCLENBQUM7QUFDRixxQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQ25DLENBQUM7V0FDSCxDQUFDLENBQUM7O0FBRUgsaUJBQU8sVUFBVSxDQUFDO0FBQUEsQUFDcEI7QUFDRSxnQkFBTSxJQUFJLEtBQUssMEJBQXdCLFVBQVUsT0FBSSxDQUFDO0FBQUEsT0FDekQ7S0FDRjs7O1dBRVEscUJBQWtCO0FBQ3pCLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztLQUNyQjs7O1dBRW1CLDhCQUFDLE9BQVksRUFBUTtVQUNoQyxPQUFPLEdBQUksT0FBTyxDQUFsQixPQUFPOztBQUNkLCtCQUFVLE9BQU8sdUNBQStCLENBQUMsQ0FBQztVQUMzQyxTQUFTLEdBQTZCLE9BQU8sQ0FBN0MsU0FBUztVQUFFLFFBQVEsR0FBbUIsT0FBTyxDQUFsQyxRQUFRO1VBQUUsS0FBSyxHQUFZLE9BQU8sQ0FBeEIsS0FBSztVQUFFLE1BQU0sR0FBSSxPQUFPLENBQWpCLE1BQU07O0FBQ3pDLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ25FOzs7V0FFaUIsOEJBQVc7QUFDM0IsYUFBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDN0I7Ozs7OztXQUlhLDBCQUFrQjtBQUM5QixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdEM7OztXQUVJLGlCQUFTO0FBQ1osVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUN0Qjs7O1NBdFFrQixlQUFlOzs7cUJBQWYsZUFBZTtBQTBRcEMsU0FBUyxXQUFXLENBQUMsWUFBZ0MsRUFBcUI7QUFDeEUsTUFBSSxZQUFZLElBQUksSUFBSSxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRTtBQUM1RCxRQUFNLFdBQVcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ2hDLGVBQVcsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQzs7QUFFM0MsZUFBVyxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDO0FBQ3JDLGVBQVcsQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztBQUN2QyxXQUFPLFdBQVcsQ0FBQztHQUNwQixNQUFNO0FBQ0wsV0FBTyxZQUFZLENBQUM7R0FDckI7Q0FDRiIsImZpbGUiOiJDbGllbnRDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1NFUlZJQ0VfRlJBTUVXT1JLM19DSEFOTkVMfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHR5cGUge0NvbmZpZ0VudHJ5fSBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgTnVjbGlkZVNvY2tldCBmcm9tICcuLi9OdWNsaWRlU29ja2V0JztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuaW1wb3J0IHtTRVJWSUNFX0ZSQU1FV09SS19SUENfVElNRU9VVF9NU30gZnJvbSAnLi4vY29uZmlnJztcblxuaW1wb3J0IFR5cGVSZWdpc3RyeSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlLXBhcnNlci9saWIvVHlwZVJlZ2lzdHJ5JztcbmltcG9ydCB7Z2V0UHJveHksIGdldERlZmluaXRpb25zfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlLXBhcnNlcic7XG5cbmltcG9ydCB0eXBlIHtSZXF1ZXN0TWVzc2FnZSwgQ2FsbFJlbW90ZUZ1bmN0aW9uTWVzc2FnZSwgQ3JlYXRlUmVtb3RlT2JqZWN0TWVzc2FnZSxcbiAgQ2FsbFJlbW90ZU1ldGhvZE1lc3NhZ2UsIERpc3Bvc2VSZW1vdGVPYmplY3RNZXNzYWdlLCBEaXNwb3NlT2JzZXJ2YWJsZU1lc3NhZ2UsXG4gIFJldHVyblR5cGUsIE9ic2VydmFibGVSZXN1bHR9IGZyb20gJy4vdHlwZXMnO1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsaWVudENvbXBvbmVudCB7XG4gIF9ycGNSZXF1ZXN0SWQ6IG51bWJlcjtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX3NvY2tldDogTnVjbGlkZVNvY2tldDtcblxuICBfdHlwZVJlZ2lzdHJ5OiBUeXBlUmVnaXN0cnk7XG4gIF9vYmplY3RSZWdpc3RyeTogTWFwPG51bWJlciwgYW55PjtcblxuICBjb25zdHJ1Y3Rvcihzb2NrZXQ6IE51Y2xpZGVTb2NrZXQsIHNlcnZpY2VzOiBBcnJheTxDb25maWdFbnRyeT4pIHtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX3NvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLl9ycGNSZXF1ZXN0SWQgPSAxO1xuXG4gICAgdGhpcy5fdHlwZVJlZ2lzdHJ5ID0gbmV3IFR5cGVSZWdpc3RyeSgpO1xuICAgIHRoaXMuX29iamVjdFJlZ2lzdHJ5ID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5hZGRTZXJ2aWNlcyhzZXJ2aWNlcyk7XG4gICAgdGhpcy5fc29ja2V0Lm9uKCdtZXNzYWdlJywgbWVzc2FnZSA9PiB0aGlzLl9oYW5kbGVTb2NrZXRNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxuXG4gIGFkZFNlcnZpY2VzKHNlcnZpY2VzOiBBcnJheTxDb25maWdFbnRyeT4pOiB2b2lkIHtcbiAgICBzZXJ2aWNlcy5mb3JFYWNoKHRoaXMuYWRkU2VydmljZSwgdGhpcyk7XG4gIH1cblxuICBhZGRTZXJ2aWNlKHNlcnZpY2U6IENvbmZpZ0VudHJ5KTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKGBSZWdpc3RlcmluZyAzLjAgc2VydmljZSAke3NlcnZpY2UubmFtZX0uLi5gKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGVmcyA9IGdldERlZmluaXRpb25zKHNlcnZpY2UuZGVmaW5pdGlvbik7XG4gICAgICBjb25zdCBwcm94eSA9IGdldFByb3h5KHNlcnZpY2UubmFtZSwgc2VydmljZS5kZWZpbml0aW9uLCB0aGlzKTtcblxuICAgICAgZGVmcy5mb3JFYWNoKGRlZmluaXRpb24gPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gZGVmaW5pdGlvbi5uYW1lO1xuICAgICAgICBzd2l0Y2ggKGRlZmluaXRpb24ua2luZCkge1xuICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgUmVnaXN0ZXJpbmcgdHlwZSBhbGlhcyAke25hbWV9Li4uYCk7XG4gICAgICAgICAgICBpZiAoZGVmaW5pdGlvbi5kZWZpbml0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyQWxpYXMobmFtZSwgZGVmaW5pdGlvbi5kZWZpbml0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2ludGVyZmFjZSc6XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoYFJlZ2lzdGVyaW5nIGludGVyZmFjZSAke25hbWV9LmApO1xuICAgICAgICAgICAgdGhpcy5fdHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyVHlwZShuYW1lLCBhc3luYyBvYmplY3QgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgb2JqZWN0Ll9pZFByb21pc2U7XG4gICAgICAgICAgICB9LCBhc3luYyBvYmplY3RJZCA9PiB7XG4gICAgICAgICAgICAgIC8vIFJldHVybiBhIGNhY2hlZCBwcm94eSwgaWYgb25lIGFscmVhZHkgZXhpc3RzLCBmb3IgdGhpcyBvYmplY3QuXG4gICAgICAgICAgICAgIGlmICh0aGlzLl9vYmplY3RSZWdpc3RyeS5oYXMob2JqZWN0SWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29iamVjdFJlZ2lzdHJ5LmdldChvYmplY3RJZCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSB0aGUgcHJveHkgYnkgbWFudWFsbHkgc2V0dGluZyB0aGUgcHJvdG90eXBlIG9mIHRoZSBvYmplY3QgdG8gYmUgdGhlXG4gICAgICAgICAgICAgIC8vIHByb3RvdHlwZSBvZiB0aGUgcmVtb3RlIHByb3h5IGNvbnN0cnVjdG9yLlxuICAgICAgICAgICAgICBjb25zdCBvYmplY3QgPSB7IF9pZFByb21pc2U6IFByb21pc2UucmVzb2x2ZShvYmplY3RJZCkgfTtcbiAgICAgICAgICAgICAgLy8gJEZsb3dJc3N1ZSAtIFQ5MjU0MjEwIGFkZCBPYmplY3Quc2V0UHJvdG90eXBlT2YgdHlwaW5nXG4gICAgICAgICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihvYmplY3QsIHByb3h5W25hbWVdLnByb3RvdHlwZSk7XG4gICAgICAgICAgICAgIHRoaXMuX29iamVjdFJlZ2lzdHJ5LnNldChvYmplY3RJZCwgb2JqZWN0KTtcbiAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgRmFpbGVkIHRvIGxvYWQgc2VydmljZSAke3NlcnZpY2UubmFtZX0uIFN0YWNrIFRyYWNlOlxcbiR7ZS5zdGFja31gKTtcbiAgICB9XG4gIH1cblxuICAvLyBEZWxlZ2F0ZSBtYXJzaGFsbGluZyB0byB0aGUgdHlwZSByZWdpc3RyeS5cbiAgbWFyc2hhbCguLi5hcmdzOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl90eXBlUmVnaXN0cnkubWFyc2hhbCguLi5hcmdzKTtcbiAgfVxuICB1bm1hcnNoYWwoLi4uYXJnczogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZVJlZ2lzdHJ5LnVubWFyc2hhbCguLi5hcmdzKTtcbiAgfVxuICByZWdpc3RlclR5cGUoLi4uYXJnczogYW55KTogdm9pZCB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVSZWdpc3RyeS5yZWdpc3RlclR5cGUoLi4uYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBhIHJlbW90ZSBmdW5jdGlvbiwgdGhyb3VnaCB0aGUgc2VydmljZSBmcmFtZXdvcmsuXG4gICAqIEBwYXJhbSBmdW5jdGlvbk5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgcmVtb3RlIGZ1bmN0aW9uIHRvIGludm9rZS5cbiAgICogQHBhcmFtIHJldHVyblR5cGUgLSBUaGUgdHlwZSBvZiBvYmplY3QgdGhhdCB0aGlzIGZ1bmN0aW9uIHJldHVybnMsIHNvIHRoZSB0aGUgdHJhbnNwb3J0XG4gICAqICAgbGF5ZXIgY2FuIHJlZ2lzdGVyIHRoZSBhcHByb3ByaWF0ZSBsaXN0ZW5lcnMuXG4gICAqIEBwYXJhbSBhcmdzIC0gVGhlIHNlcmlhbGl6ZWQgYXJndW1lbnRzIHRvIGludm9rZSB0aGUgcmVtb3RlIGZ1bmN0aW9uIHdpdGguXG4gICAqL1xuICBjYWxsUmVtb3RlRnVuY3Rpb24oZnVuY3Rpb25OYW1lOiBzdHJpbmcsIHJldHVyblR5cGU6IFJldHVyblR5cGUsIGFyZ3M6IEFycmF5PGFueT4pOiBhbnkge1xuICAgIGNvbnN0IG1lc3NhZ2U6IENhbGxSZW1vdGVGdW5jdGlvbk1lc3NhZ2UgPSB7XG4gICAgICBwcm90b2NvbDogJ3NlcnZpY2VfZnJhbWV3b3JrM19ycGMnLFxuICAgICAgdHlwZTogJ0Z1bmN0aW9uQ2FsbCcsXG4gICAgICBmdW5jdGlvbjogZnVuY3Rpb25OYW1lLFxuICAgICAgcmVxdWVzdElkOiB0aGlzLl9nZW5lcmF0ZVJlcXVlc3RJZCgpLFxuICAgICAgYXJncyxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLl9zZW5kTWVzc2FnZUFuZExpc3RlbkZvclJlc3VsdChcbiAgICAgIG1lc3NhZ2UsXG4gICAgICByZXR1cm5UeXBlLFxuICAgICAgYENhbGxpbmcgZnVuY3Rpb24gJHtmdW5jdGlvbk5hbWV9YFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBhIG1ldGhvZCBvZiBhIHJlbW90ZSBvYmplY3QsIHRocm91Z2ggdGhlIHNlcnZpY2UgZnJhbWV3b3JrLlxuICAgKiBAcGFyYW0gb2JqZWN0SWQgLSBUaGUgaWQgb2YgdGhlIHJlbW90ZSBvYmplY3QuXG4gICAqIEBwYXJhbSBtZXRob2ROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB0byBpbnZva2UuXG4gICAqIEBwYXJhbSByZXR1cm5UeXBlIC0gVGhlIHR5cGUgb2Ygb2JqZWN0IHRoYXQgdGhpcyBmdW5jdGlvbiByZXR1cm5zLCBzbyB0aGUgdGhlIHRyYW5zcG9ydFxuICAgKiAgIGxheWVyIGNhbiByZWdpc3RlciB0aGUgYXBwcm9wcmlhdGUgbGlzdGVuZXJzLlxuICAgKiBAcGFyYW0gYXJncyAtIFRoZSBzZXJpYWxpemVkIGFyZ3VtZW50cyB0byBpbnZva2UgdGhlIHJlbW90ZSBtZXRob2Qgd2l0aC5cbiAgICovXG4gIGNhbGxSZW1vdGVNZXRob2QoXG4gICAgb2JqZWN0SWQ6IG51bWJlcixcbiAgICBtZXRob2ROYW1lOiBzdHJpbmcsXG4gICAgcmV0dXJuVHlwZTogUmV0dXJuVHlwZSxcbiAgICBhcmdzOiBBcnJheTxhbnk+XG4gICk6IGFueSB7XG4gICAgY29uc3QgbWVzc2FnZTogQ2FsbFJlbW90ZU1ldGhvZE1lc3NhZ2UgPSB7XG4gICAgICBwcm90b2NvbDogJ3NlcnZpY2VfZnJhbWV3b3JrM19ycGMnLFxuICAgICAgdHlwZTogJ01ldGhvZENhbGwnLFxuICAgICAgbWV0aG9kOiBtZXRob2ROYW1lLFxuICAgICAgb2JqZWN0SWQsXG4gICAgICByZXF1ZXN0SWQ6IHRoaXMuX2dlbmVyYXRlUmVxdWVzdElkKCksXG4gICAgICBhcmdzLFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuX3NlbmRNZXNzYWdlQW5kTGlzdGVuRm9yUmVzdWx0KFxuICAgICAgbWVzc2FnZSxcbiAgICAgIHJldHVyblR5cGUsXG4gICAgICBgQ2FsbGluZyByZW1vdGUgbWV0aG9kICR7bWV0aG9kTmFtZX0uYFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBhIHJlbW90ZSBjb25zdHJ1Y3RvciwgcmV0dXJuaW5nIGFuIGlkIHRoYXQgZXZlbnR1YWxseSByZXNvbHZlcyB0byBhIHVuaXF1ZSBpZGVudGlmaWVyXG4gICAqIGZvciB0aGUgb2JqZWN0LlxuICAgKiBAcGFyYW0gaW50ZXJmYWNlTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSByZW1vdGUgY2xhc3MgZm9yIHdoaWNoIHRvIGNvbnN0cnVjdCBhbiBvYmplY3QuXG4gICAqIEBwYXJhbSBhcmdzIC0gU2VyaWFsaXplZCBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgcmVtb3RlIGNvbnN0cnVjdG9yLlxuICAgKi9cbiAgY3JlYXRlUmVtb3RlT2JqZWN0KGludGVyZmFjZU5hbWU6IHN0cmluZywgYXJnczogQXJyYXk8YW55Pik6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgbWVzc2FnZTogQ3JlYXRlUmVtb3RlT2JqZWN0TWVzc2FnZSA9IHtcbiAgICAgIHByb3RvY29sOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICB0eXBlOiAnTmV3T2JqZWN0JyxcbiAgICAgIGludGVyZmFjZTogaW50ZXJmYWNlTmFtZSxcbiAgICAgIHJlcXVlc3RJZDogdGhpcy5fZ2VuZXJhdGVSZXF1ZXN0SWQoKSxcbiAgICAgIGFyZ3MsXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5fc2VuZE1lc3NhZ2VBbmRMaXN0ZW5Gb3JSZXN1bHQoXG4gICAgICBtZXNzYWdlLFxuICAgICAgJ3Byb21pc2UnLFxuICAgICAgYENyZWF0aW5nIGluc3RhbmNlIG9mICR7aW50ZXJmYWNlTmFtZX1gXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlIGEgcmVtb3RlIG9iamVjdC4gVGhpcyBtYWtlcyBpdCdzIHByb3hpZXMgdW5zdWFibGUsIGFuZCBjYWxscyB0aGUgYGRpc3Bvc2VgIG1ldGhvZCBvblxuICAgKiB0aGUgcmVtb3RlIG9iamVjdC5cbiAgICogQHBhcmFtIG9iamVjdElkIC0gVGhlIG51bWVyaWNhbCBpZCB0aGF0IGlkZW50aWZpZXMgdGhlIHJlbW90ZSBvYmplY3QuXG4gICAqIEByZXR1cm5zIEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIG9iamVjdCBkaXNwb3NhbCBoYXMgY29tcGxldGVkLlxuICAgKi9cbiAgZGlzcG9zZVJlbW90ZU9iamVjdChvYmplY3RJZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbWVzc2FnZTogRGlzcG9zZVJlbW90ZU9iamVjdE1lc3NhZ2UgPSB7XG4gICAgICBwcm90b2NvbDogJ3NlcnZpY2VfZnJhbWV3b3JrM19ycGMnLFxuICAgICAgdHlwZTogJ0Rpc3Bvc2VPYmplY3QnLFxuICAgICAgcmVxdWVzdElkOiB0aGlzLl9nZW5lcmF0ZVJlcXVlc3RJZCgpLFxuICAgICAgb2JqZWN0SWQsXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5fc2VuZE1lc3NhZ2VBbmRMaXN0ZW5Gb3JSZXN1bHQobWVzc2FnZSwgJ3Byb21pc2UnLCBgRGlzcG9zaW5nIG9iamVjdCAke29iamVjdElkfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGxpc3RlbnMgZm9yIGEgcmVzdWx0IGZvciB0aGUgZ2l2ZW4gcmVxdWVzdElkLlxuICAgKiBAcGFyYW0gcmV0dXJuVHlwZSAtIERldGVybWluZXMgdGhlIHR5cGUgb2YgbWVzc2FnZXMgd2Ugc2hvdWxkIHN1YnNjcmliZSB0bywgYW5kIHdoYXQgdGhpc1xuICAgKiAgIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4uXG4gICAqIEBwYXJhbSByZXF1ZXN0SWQgLSBUaGUgaWQgb2YgdGhlIHJlcXVlc3Qgd2hvJ3MgcmVzdWx0IHdlIGFyZSBsaXN0ZW5pbmcgZm9yLlxuICAgKiBAcmV0dXJucyBEZXBlbmRpbmcgb24gdGhlIGV4cGVjdGVkIHJldHVybiB0eXBlLCB0aGlzIGZ1bmN0aW9uIGVpdGhlciByZXR1cm5zIHVuZGVmaW5lZCwgYVxuICAgKiAgIFByb21pc2UsIG9yIGFuIE9ic2VydmFibGUuXG4gICAqL1xuICBfc2VuZE1lc3NhZ2VBbmRMaXN0ZW5Gb3JSZXN1bHQoXG4gICAgbWVzc2FnZTogUmVxdWVzdE1lc3NhZ2UsXG4gICAgcmV0dXJuVHlwZTogUmV0dXJuVHlwZSxcbiAgICB0aW1lb3V0TWVzc2FnZTogc3RyaW5nXG4gICk6IGFueSB7XG4gICAgc3dpdGNoIChyZXR1cm5UeXBlKSB7XG4gICAgICBjYXNlICd2b2lkJzpcbiAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQobWVzc2FnZSk7XG4gICAgICAgIHJldHVybjsgLy8gTm8gdmFsdWVzIHRvIHJldHVybi5cbiAgICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgICAgICAvLyBMaXN0ZW4gZm9yIGEgc2luZ2xlIG1lc3NhZ2UsIGFuZCByZXNvbHZlIG9yIHJlamVjdCBhIHByb21pc2Ugb24gdGhhdCBtZXNzYWdlLlxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3NvY2tldC5zZW5kKG1lc3NhZ2UpO1xuICAgICAgICAgIHRoaXMuX2VtaXR0ZXIub25jZShtZXNzYWdlLnJlcXVlc3RJZC50b1N0cmluZygpLCAoaGFkRXJyb3IsIGVycm9yLCByZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGhhZEVycm9yID8gcmVqZWN0KGRlY29kZUVycm9yKGVycm9yKSkgOiByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2VtaXR0ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKG1lc3NhZ2UucmVxdWVzdElkLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgcmVqZWN0KFxuICAgICAgICAgICAgICBgVGltZW91dCBhZnRlciAke1NFUlZJQ0VfRlJBTUVXT1JLX1JQQ19USU1FT1VUX01TfSBmb3IgcmVxdWVzdElkOiBgICtcbiAgICAgICAgICAgICAgYCR7bWVzc2FnZS5yZXF1ZXN0SWR9LCAke3RpbWVvdXRNZXNzYWdlfS5gXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0sIFNFUlZJQ0VfRlJBTUVXT1JLX1JQQ19USU1FT1VUX01TKTtcbiAgICAgICAgfSk7XG4gICAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgICAgY29uc3Qgb2JzZXJ2YWJsZSA9IE9ic2VydmFibGUuY3JlYXRlKG9ic2VydmVyID0+IHtcbiAgICAgICAgICB0aGlzLl9zb2NrZXQuc2VuZChtZXNzYWdlKTtcblxuICAgICAgICAgIC8vIExpc3RlbiBmb3IgJ25leHQnLCAnZXJyb3InLCBhbmQgJ2NvbXBsZXRlZCcgZXZlbnRzLlxuICAgICAgICAgIHRoaXMuX2VtaXR0ZXIub24oXG4gICAgICAgICAgICBtZXNzYWdlLnJlcXVlc3RJZC50b1N0cmluZygpLFxuICAgICAgICAgICAgKGhhZEVycm9yOiBib29sZWFuLCBlcnJvcjogP0Vycm9yLCByZXN1bHQ6ID9PYnNlcnZhYmxlUmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgIGlmIChoYWRFcnJvcikge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm9uRXJyb3IoZGVjb2RlRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnZhcmlhbnQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnR5cGUgPT09ICdjb21wbGV0ZWQnKSB7XG4gICAgICAgICAgICAgICAgICBvYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0LnR5cGUgPT09ICduZXh0Jykge1xuICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIub25OZXh0KHJlc3VsdC5kYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gT2JzZXJ2YWJsZSBkaXNwb3NlIGZ1bmN0aW9uLCB3aGljaCBpcyBjYWxsZWQgb24gc3Vic2NyaXB0aW9uIGRpcHNvc2UsIG9uIHN0cmVhbVxuICAgICAgICAgIC8vIGNvbXBsZXRpb24sIGFuZCBvbiBzdHJlYW0gZXJyb3IuXG4gICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2VtaXR0ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKG1lc3NhZ2UucmVxdWVzdElkLnRvU3RyaW5nKCkpO1xuXG4gICAgICAgICAgICAvLyBTZW5kIGEgbWVzc2FnZSB0byBzZXJ2ZXIgdG8gY2FsbCB0aGUgZGlzcG9zZSBmdW5jdGlvbiBvZlxuICAgICAgICAgICAgLy8gdGhlIHJlbW90ZSBPYnNlcnZhYmxlIHN1YnNjcmlwdGlvbi5cbiAgICAgICAgICAgIGNvbnN0IGRpc3Bvc2VNZXNzYWdlOiBEaXNwb3NlT2JzZXJ2YWJsZU1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgIHByb3RvY29sOiAnc2VydmljZV9mcmFtZXdvcmszX3JwYycsXG4gICAgICAgICAgICAgIHR5cGU6ICdEaXNwb3NlT2JzZXJ2YWJsZScsXG4gICAgICAgICAgICAgIHJlcXVlc3RJZDogbWVzc2FnZS5yZXF1ZXN0SWQsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5fc29ja2V0LnNlbmQoZGlzcG9zZU1lc3NhZ2UpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBvYnNlcnZhYmxlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtvd24gcmV0dXJuIHR5cGU6ICR7cmV0dXJuVHlwZX0uYCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0U29ja2V0KCk6IE51Y2xpZGVTb2NrZXQge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQ7XG4gIH1cblxuICBfaGFuZGxlU29ja2V0TWVzc2FnZShtZXNzYWdlOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCB7Y2hhbm5lbH0gPSBtZXNzYWdlO1xuICAgIGludmFyaWFudChjaGFubmVsID09PSBTRVJWSUNFX0ZSQU1FV09SSzNfQ0hBTk5FTCk7XG4gICAgY29uc3Qge3JlcXVlc3RJZCwgaGFkRXJyb3IsIGVycm9yLCByZXN1bHR9ID0gbWVzc2FnZTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQocmVxdWVzdElkLnRvU3RyaW5nKCksIGhhZEVycm9yLCBlcnJvciwgcmVzdWx0KTtcbiAgfVxuXG4gIF9nZW5lcmF0ZVJlcXVlc3RJZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9ycGNSZXF1ZXN0SWQrKztcbiAgfVxuXG4gIC8vIFJlc29sdmVzIGlmIHRoZSBjb25uZWN0aW9uIGxvb2tzIGhlYWx0aHkuXG4gIC8vIFdpbGwgcmVqZWN0IHF1aWNrbHkgaWYgdGhlIGNvbm5lY3Rpb24gbG9va3MgdW5oZWFsdGh5LlxuICB0ZXN0Q29ubmVjdGlvbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fc29ja2V0LnRlc3RDb25uZWN0aW9uKCk7XG4gIH1cblxuICBjbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zb2NrZXQuY2xvc2UoKTtcbiAgfVxufVxuXG4vLyBUT0RPOiBUaGlzIHNob3VsZCBiZSBhIGN1c3RvbSBtYXJzaGFsbGVyIHJlZ2lzdGVyZWQgaW4gdGhlIFR5cGVSZWdpc3RyeVxuZnVuY3Rpb24gZGVjb2RlRXJyb3IoZW5jb2RlZEVycm9yOiA/KE9iamVjdCB8IHN0cmluZykpOiA/KEVycm9yIHwgc3RyaW5nKSB7XG4gIGlmIChlbmNvZGVkRXJyb3IgIT0gbnVsbCAmJiB0eXBlb2YgZW5jb2RlZEVycm9yID09PSAnb2JqZWN0Jykge1xuICAgIGNvbnN0IHJlc3VsdEVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgcmVzdWx0RXJyb3IubWVzc2FnZSA9IGVuY29kZWRFcnJvci5tZXNzYWdlO1xuICAgIC8vICRGbG93SXNzdWUgLSBzb21lIEVycm9ycyAobm90YWJseSBmaWxlIG9wZXJhdGlvbnMpIGhhdmUgYSBjb2RlLlxuICAgIHJlc3VsdEVycm9yLmNvZGUgPSBlbmNvZGVkRXJyb3IuY29kZTtcbiAgICByZXN1bHRFcnJvci5zdGFjayA9IGVuY29kZWRFcnJvci5zdGFjaztcbiAgICByZXR1cm4gcmVzdWx0RXJyb3I7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGVuY29kZWRFcnJvcjtcbiAgfVxufVxuIl19