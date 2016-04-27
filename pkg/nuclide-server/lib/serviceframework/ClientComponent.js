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

var _rxjs = require('rxjs');

var _nuclideServiceParserLibTypeRegistry = require('../../../nuclide-service-parser/lib/TypeRegistry');

var _nuclideServiceParserLibTypeRegistry2 = _interopRequireDefault(_nuclideServiceParserLibTypeRegistry);

var _nuclideServiceParser = require('../../../nuclide-service-parser');

var _ObjectRegistry = require('./ObjectRegistry');

var logger = require('../../../nuclide-logging').getLogger();

var ClientComponent = (function () {
  function ClientComponent(socket, services) {
    var _this = this;

    _classCallCheck(this, ClientComponent);

    this._emitter = new _events.EventEmitter();
    this._socket = socket;
    this._rpcRequestId = 1;

    this._typeRegistry = new _nuclideServiceParserLibTypeRegistry2['default']();
    this._objectRegistry = new _ObjectRegistry.ObjectRegistry('client');

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
                _this2._typeRegistry.registerType(name, function (object, context) {
                  return context.marshal(name, object);
                }, function (objectId, context) {
                  return context.unmarshal(objectId, proxy[name]);
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
    value: function marshal(value, type) {
      return this._typeRegistry.marshal(this._objectRegistry, value, type);
    }
  }, {
    key: 'unmarshal',
    value: function unmarshal(value, type) {
      return this._typeRegistry.unmarshal(this._objectRegistry, value, type);
    }
  }, {
    key: 'registerType',
    value: function registerType() {
      var _typeRegistry;

      return (_typeRegistry = this._typeRegistry).registerType.apply(_typeRegistry, arguments);
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
     * @param thisArg - The newly created proxy object.
     * @param unmarshalledArgs - Unmarshalled arguments to pass to the remote constructor.
     * @param argTypes - Types of arguments.
     */
  }, {
    key: 'createRemoteObject',
    value: function createRemoteObject(interfaceName, thisArg, unmarshalledArgs, argTypes) {
      var _this3 = this;

      var idPromise = _asyncToGenerator(function* () {
        var marshalledArgs = yield _this3._typeRegistry.marshalArguments(_this3._objectRegistry, unmarshalledArgs, argTypes);
        var message = {
          protocol: 'service_framework3_rpc',
          type: 'NewObject',
          'interface': interfaceName,
          requestId: _this3._generateRequestId(),
          args: marshalledArgs
        };
        return _this3._sendMessageAndListenForResult(message, 'promise', 'Creating instance of ' + interfaceName);
      })();
      this._objectRegistry.addProxy(thisArg, idPromise);
    }

    /**
     * Dispose a remote object. This makes it's proxies unsuable, and calls the `dispose` method on
     * the remote object.
     * @param object - The remote object.
     * @returns A Promise that resolves when the object disposal has completed.
     */
  }, {
    key: 'disposeRemoteObject',
    value: _asyncToGenerator(function* (object) {
      var objectId = yield this._objectRegistry.disposeProxy(object);
      if (objectId != null) {
        var message = {
          protocol: 'service_framework3_rpc',
          type: 'DisposeObject',
          requestId: this._generateRequestId(),
          objectId: objectId
        };
        return yield this._sendMessageAndListenForResult(message, 'promise', 'Disposing object ' + objectId);
      }
    })

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
      var _this4 = this;

      switch (returnType) {
        case 'void':
          this._socket.send(message);
          return; // No values to return.
        case 'promise':
          // Listen for a single message, and resolve or reject a promise on that message.
          return new Promise(function (resolve, reject) {
            _this4._socket.send(message);
            _this4._emitter.once(message.requestId.toString(), function (hadError, error, result) {
              hadError ? reject(decodeError(message, error)) : resolve(result);
            });

            setTimeout(function () {
              _this4._emitter.removeAllListeners(message.requestId.toString());
              reject(new Error('Timeout after ' + _config.SERVICE_FRAMEWORK_RPC_TIMEOUT_MS + ' for requestId: ' + (message.requestId + ', ' + timeoutMessage + '.')));
            }, _config.SERVICE_FRAMEWORK_RPC_TIMEOUT_MS);
          });
        case 'observable':
          var observable = _rxjs.Observable.create(function (observer) {
            _this4._socket.send(message);

            // Listen for 'next', 'error', and 'completed' events.
            _this4._emitter.on(message.requestId.toString(), function (hadError, error, result) {
              if (hadError) {
                observer.error(decodeError(message, error));
              } else {
                (0, _assert2['default'])(result);
                if (result.type === 'completed') {
                  observer.complete();
                } else if (result.type === 'next') {
                  observer.next(result.data);
                }
              }
            });

            // Observable dispose function, which is called on subscription dipsose, on stream
            // completion, and on stream error.
            return {
              unsubscribe: function unsubscribe() {
                _this4._emitter.removeAllListeners(message.requestId.toString());

                // Send a message to server to call the dispose function of
                // the remote Observable subscription.
                var disposeMessage = {
                  protocol: 'service_framework3_rpc',
                  type: 'DisposeObservable',
                  requestId: message.requestId
                };
                _this4._socket.send(disposeMessage);
              }
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
function decodeError(message, encodedError) {
  if (encodedError != null && typeof encodedError === 'object') {
    var resultError = new Error();
    resultError.message = 'Remote Error: ' + encodedError.message + ' processing message ' + JSON.stringify(message) + '\n' + JSON.stringify(encodedError.stack);
    // $FlowIssue - some Errors (notably file operations) have a code.
    resultError.code = encodedError.code;
    resultError.stack = encodedError.stack;
    return resultError;
  } else {
    return encodedError;
  }
}
module.exports = exports['default'];