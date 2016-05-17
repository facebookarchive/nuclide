Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _config2;

function _config() {
  return _config2 = require('./config');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _events2;

function _events() {
  return _events2 = require('events');
}

var _rxjs2;

function _rxjs() {
  return _rxjs2 = require('rxjs');
}

var _ServiceRegistry2;

function _ServiceRegistry() {
  return _ServiceRegistry2 = require('./ServiceRegistry');
}

var _ObjectRegistry2;

function _ObjectRegistry() {
  return _ObjectRegistry2 = require('./ObjectRegistry');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = require('../../nuclide-remote-uri');
}

var _messages2;

function _messages() {
  return _messages2 = require('./messages');
}

var _builtinTypes2;

function _builtinTypes() {
  return _builtinTypes2 = require('./builtin-types');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var logger = require('../../nuclide-logging').getLogger();
var SERVICE_FRAMEWORK_RPC_TIMEOUT_MS = 60 * 1000;

var RpcConnection = (function () {
  function RpcConnection(kind, serviceRegistry, transport) {
    var _this = this;

    _classCallCheck(this, RpcConnection);

    this._emitter = new (_events2 || _events()).EventEmitter();
    this._transport = transport;
    this._rpcRequestId = 1;
    this._serviceRegistry = serviceRegistry;
    this._objectRegistry = new (_ObjectRegistry2 || _ObjectRegistry()).ObjectRegistry(kind, this._serviceRegistry, this);
    this._transport.onMessage(function (message) {
      _this._handleMessage(message);
    });
  }

  _createClass(RpcConnection, [{
    key: 'getService',
    value: function getService(serviceName) {
      var service = this._objectRegistry.getService(serviceName);
      (0, (_assert2 || _assert()).default)(service != null, 'No config found for service ' + serviceName);
      return service;
    }
  }, {
    key: 'addServices',
    value: function addServices(services) {
      services.forEach(this.addService, this);
    }
  }, {
    key: 'addService',
    value: function addService(service) {
      this._serviceRegistry.addService(service);
    }

    // Delegate marshalling to the type registry.
  }, {
    key: 'marshal',
    value: function marshal(value, type) {
      return this._getTypeRegistry().marshal(this._objectRegistry, value, type);
    }
  }, {
    key: 'unmarshal',
    value: function unmarshal(value, type) {
      return this._getTypeRegistry().unmarshal(this._objectRegistry, value, type);
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
      return this._sendMessageAndListenForResult((0, (_messages2 || _messages()).createCallFunctionMessage)(functionName, this._generateRequestId(), args), returnType, 'Calling function ' + functionName);
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
      return this._sendMessageAndListenForResult((0, (_messages2 || _messages()).createCallMethodMessage)(methodName, objectId, this._generateRequestId(), args), returnType, 'Calling remote method ' + methodName + '.');
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
      var _this2 = this;

      var idPromise = _asyncToGenerator(function* () {
        var marshalledArgs = yield _this2._getTypeRegistry().marshalArguments(_this2._objectRegistry, unmarshalledArgs, argTypes);
        return _this2._sendMessageAndListenForResult((0, (_messages2 || _messages()).createNewObjectMessage)(interfaceName, _this2._generateRequestId(), marshalledArgs), 'promise', 'Creating instance of ' + interfaceName);
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
          protocol: (_config2 || _config()).SERVICE_FRAMEWORK3_PROTOCOL,
          type: 'DisposeObject',
          requestId: this._generateRequestId(),
          objectId: objectId
        };
        return yield this._sendMessageAndListenForResult(message, 'promise', 'Disposing object ' + objectId);
      } else {
        logger.info('Duplicate dispose call on remote proxy');
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
      var _this3 = this;

      switch (returnType) {
        case 'void':
          this._transport.send(message);
          return; // No values to return.
        case 'promise':
          // Listen for a single message, and resolve or reject a promise on that message.
          return new Promise(function (resolve, reject) {
            _this3._transport.send(message);
            _this3._emitter.once(message.requestId.toString(), function (hadError, error, result) {
              hadError ? reject((0, (_messages2 || _messages()).decodeError)(message, error)) : resolve(result);
            });

            setTimeout(function () {
              _this3._emitter.removeAllListeners(message.requestId.toString());
              reject(new Error('Timeout after ' + SERVICE_FRAMEWORK_RPC_TIMEOUT_MS + ' for requestId: ' + (message.requestId + ', ' + timeoutMessage + '.')));
            }, SERVICE_FRAMEWORK_RPC_TIMEOUT_MS);
          });
        case 'observable':
          var observable = (_rxjs2 || _rxjs()).Observable.create(function (observer) {
            _this3._transport.send(message);

            // Listen for 'next', 'error', and 'completed' events.
            _this3._emitter.on(message.requestId.toString(), function (hadError, error, result) {
              if (hadError) {
                observer.error((0, (_messages2 || _messages()).decodeError)(message, error));
              } else {
                (0, (_assert2 || _assert()).default)(result);
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
                _this3._emitter.removeAllListeners(message.requestId.toString());

                // Send a message to server to call the dispose function of
                // the remote Observable subscription.
                _this3._transport.send((0, (_messages2 || _messages()).createDisposeMessage)(message.requestId));
              }
            };
          });

          return observable;
        default:
          throw new Error('Unkown return type: ' + returnType + '.');
      }
    }
  }, {
    key: '_returnPromise',
    value: function _returnPromise(requestId, timingTracker, candidate, type) {
      var _this4 = this;

      var returnVal = candidate;
      // Ensure that the return value is a promise.
      if (!isThenable(returnVal)) {
        returnVal = Promise.reject(new Error('Expected a Promise, but the function returned something else.'));
      }

      // Marshal the result, to send over the network.
      (0, (_assert2 || _assert()).default)(returnVal != null);
      returnVal = returnVal.then(function (value) {
        return _this4._getTypeRegistry().marshal(_this4._objectRegistry, value, type);
      });

      // Send the result of the promise across the socket.
      returnVal.then(function (result) {
        _this4._transport.send((0, (_messages2 || _messages()).createPromiseMessage)(requestId, result));
        timingTracker.onSuccess();
      }, function (error) {
        _this4._transport.send((0, (_messages2 || _messages()).createErrorMessage)(requestId, error));
        timingTracker.onError(error == null ? new Error() : error);
      });
    }
  }, {
    key: '_returnObservable',
    value: function _returnObservable(requestId, returnVal, elementType) {
      var _this5 = this;

      var result = undefined;
      // Ensure that the return value is an observable.
      if (!isObservable(returnVal)) {
        result = (_rxjs2 || _rxjs()).Observable.throw(new Error('Expected an Observable, but the function returned something else.'));
      } else {
        result = returnVal;
      }

      // Marshal the result, to send over the network.
      result = result.concatMap(function (value) {
        return _this5._getTypeRegistry().marshal(_this5._objectRegistry, value, elementType);
      });

      // Send the next, error, and completion events of the observable across the socket.
      var subscription = result.subscribe(function (data) {
        _this5._transport.send((0, (_messages2 || _messages()).createNextMessage)(requestId, data));
      }, function (error) {
        _this5._transport.send((0, (_messages2 || _messages()).createErrorMessage)(requestId, error));
        _this5._objectRegistry.removeSubscription(requestId);
      }, function (completed) {
        _this5._transport.send((0, (_messages2 || _messages()).createCompletedMessage)(requestId));
        _this5._objectRegistry.removeSubscription(requestId);
      });
      this._objectRegistry.addSubscription(requestId, subscription);
    }

    // Returns true if a promise was returned.
  }, {
    key: '_returnValue',
    value: function _returnValue(requestId, timingTracker, value, type) {
      switch (type.kind) {
        case 'void':
          break; // No need to send anything back to the user.
        case 'promise':
          this._returnPromise(requestId, timingTracker, value, type.type);
          return true;
        case 'observable':
          this._returnObservable(requestId, value, type.type);
          break;
        default:
          throw new Error('Unkown return type ' + type.kind + '.');
      }
      return false;
    }
  }, {
    key: '_callFunction',
    value: _asyncToGenerator(function* (requestId, timingTracker, call) {
      var _getFunctionImplemention2 = this._getFunctionImplemention(call.function);

      var localImplementation = _getFunctionImplemention2.localImplementation;
      var type = _getFunctionImplemention2.type;

      var marshalledArgs = yield this._getTypeRegistry().unmarshalArguments(this._objectRegistry, call.args, type.argumentTypes);

      return this._returnValue(requestId, timingTracker, localImplementation.apply(this, marshalledArgs), type.returnType);
    })
  }, {
    key: '_callMethod',
    value: _asyncToGenerator(function* (requestId, timingTracker, call) {
      var object = this._objectRegistry.unmarshal(call.objectId);
      (0, (_assert2 || _assert()).default)(object != null);

      var interfaceName = this._objectRegistry.getInterface(call.objectId);
      var classDefinition = this._getClassDefinition(interfaceName);
      (0, (_assert2 || _assert()).default)(classDefinition != null);
      var type = classDefinition.definition.instanceMethods.get(call.method);
      (0, (_assert2 || _assert()).default)(type != null);

      var marshalledArgs = yield this._getTypeRegistry().unmarshalArguments(this._objectRegistry, call.args, type.argumentTypes);

      return this._returnValue(requestId, timingTracker, object[call.method].apply(object, marshalledArgs), type.returnType);
    })
  }, {
    key: '_callConstructor',
    value: _asyncToGenerator(function* (requestId, timingTracker, constructorMessage) {
      var classDefinition = this._getClassDefinition(constructorMessage.interface);
      (0, (_assert2 || _assert()).default)(classDefinition != null);
      var localImplementation = classDefinition.localImplementation;
      var definition = classDefinition.definition;

      var marshalledArgs = yield this._getTypeRegistry().unmarshalArguments(this._objectRegistry, constructorMessage.args, definition.constructorArgs);

      // Create a new object and put it in the registry.
      var newObject = construct(localImplementation, marshalledArgs);

      // Return the object, which will automatically be converted to an id through the
      // marshalling system.
      this._returnPromise(requestId, timingTracker, Promise.resolve(newObject), {
        kind: 'named',
        name: constructorMessage.interface,
        location: (_builtinTypes2 || _builtinTypes()).builtinLocation
      });
    })
  }, {
    key: 'getTransport',
    value: function getTransport() {
      return this._transport;
    }
  }, {
    key: '_handleMessage',
    value: function _handleMessage(message) {
      // TODO: advinsky uncomment after version 0.136 and below are phased out
      // invariant(message.protocol === SERVICE_FRAMEWORK3_PROTOCOL);

      switch (message.type) {
        case 'PromiseMessage':
        case 'ObservableMessage':
        case 'ErrorMessage':
          this._handleResponseMessage(message);
          break;
        case 'FunctionCall':
        case 'MethodCall':
        case 'NewObject':
        case 'DisposeObject':
        case 'DisposeObservable':
          this._handleRequestMessage(message);
          break;
        default:
          throw new Error('Unexpected message type');
      }
    }
  }, {
    key: '_handleResponseMessage',
    value: function _handleResponseMessage(message) {
      var requestId = message.requestId;
      switch (message.type) {
        case 'PromiseMessage':
          {
            var result = message.result;

            this._emitter.emit(requestId.toString(), false, null, result);
            break;
          }
        case 'ObservableMessage':
          {
            var result = message.result;

            this._emitter.emit(requestId.toString(), false, null, result);
            break;
          }
        case 'ErrorMessage':
          {
            var error = message.error;

            this._emitter.emit(requestId.toString(), true, error, undefined);
            break;
          }
        default:
          throw new Error('Unexpected message type ' + JSON.stringify(message));
      }
    }
  }, {
    key: '_handleRequestMessage',
    value: _asyncToGenerator(function* (message) {
      var requestId = message.requestId;

      // Track timings of all function calls, method calls, and object creations.
      // Note: for Observables we only track how long it takes to create the initial Observable.
      // while for Promises we track the length of time it takes to resolve or reject.
      // For returning void, we track the time for the call to complete.
      var timingTracker = (0, (_nuclideAnalytics2 || _nuclideAnalytics()).startTracking)(trackingIdOfMessage(this._objectRegistry, message));

      // Here's the main message handler ...
      try {
        var returnedPromise = false;
        switch (message.type) {
          case 'FunctionCall':
            returnedPromise = yield this._callFunction(requestId, timingTracker, message);
            break;
          case 'MethodCall':
            returnedPromise = yield this._callMethod(requestId, timingTracker, message);
            break;
          case 'NewObject':
            yield this._callConstructor(requestId, timingTracker, message);
            returnedPromise = true;
            break;
          case 'DisposeObject':
            yield this._objectRegistry.disposeObject(message.objectId);
            this._returnPromise(requestId, timingTracker, Promise.resolve(), (_builtinTypes2 || _builtinTypes()).voidType);
            returnedPromise = true;
            break;
          case 'DisposeObservable':
            this._objectRegistry.disposeSubscription(requestId);
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
        this._transport.send((0, (_messages2 || _messages()).createErrorMessage)(requestId, e));
      }
    })
  }, {
    key: '_getFunctionImplemention',
    value: function _getFunctionImplemention(name) {
      return this._serviceRegistry.getFunctionImplemention(name);
    }
  }, {
    key: '_getClassDefinition',
    value: function _getClassDefinition(className) {
      return this._serviceRegistry.getClassDefinition(className);
    }
  }, {
    key: '_generateRequestId',
    value: function _generateRequestId() {
      return this._rpcRequestId++;
    }
  }, {
    key: '_getTypeRegistry',
    value: function _getTypeRegistry() {
      return this._serviceRegistry.getTypeRegistry();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._transport.close();
      this._objectRegistry.dispose();
    }
  }], [{
    key: 'createRemote',
    value: function createRemote(hostname, port, transport, services) {
      return new RpcConnection('client', new (_ServiceRegistry2 || _ServiceRegistry()).ServiceRegistry(function (remoteUri) {
        return (0, (_nuclideRemoteUri2 || _nuclideRemoteUri()).getPath)(remoteUri);
      }, function (path) {
        return (0, (_nuclideRemoteUri2 || _nuclideRemoteUri()).createRemoteUri)(hostname, port, path);
      }, services), transport);
    }
  }, {
    key: 'createLocal',
    value: function createLocal(transport, services) {
      return new RpcConnection('client', new (_ServiceRegistry2 || _ServiceRegistry()).ServiceRegistry(function (remoteUri) {
        return remoteUri;
      }, function (path) {
        return path;
      }, services), transport);
    }
  }]);

  return RpcConnection;
})();

exports.RpcConnection = RpcConnection;

function trackingIdOfMessage(registry, message) {
  switch (message.type) {
    case 'FunctionCall':
      return 'service-framework:' + message.function;
    case 'MethodCall':
      var callInterface = registry.getInterface(message.objectId);
      return 'service-framework:' + callInterface + '.' + message.method;
    case 'NewObject':
      return 'service-framework:new:' + message.interface;
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