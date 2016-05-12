Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjs2;

function _rxjs() {
  return _rxjs2 = require('rxjs');
}

var _builtinTypes2;

function _builtinTypes() {
  return _builtinTypes2 = require('./builtin-types');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _config2;

function _config() {
  return _config2 = require('./config');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _ObjectRegistry2;

function _ObjectRegistry() {
  return _ObjectRegistry2 = require('./ObjectRegistry');
}

var logger = require('../../nuclide-logging').getLogger();

// Per-Client state on the Server for the RPC framework

var ClientConnection = (function () {
  function ClientConnection(serverComponent, transport) {
    var _this = this;

    _classCallCheck(this, ClientConnection);

    this._objectRegistry = new (_ObjectRegistry2 || _ObjectRegistry()).ObjectRegistry('server');
    this._serverComponent = serverComponent;
    this._transport = transport;
    serverComponent.getServices().forEach(function (service) {
      // TODO: Remove the any cast once we have bi-directional marshalling.
      _this._objectRegistry.addService(service.name, service.factory(_this));
    });
    transport.onMessage(function (message) {
      _this._handleMessage(message);
    });
  }

  _createClass(ClientConnection, [{
    key: '_returnPromise',
    value: function _returnPromise(requestId, timingTracker, candidate, type) {
      var _this2 = this;

      var returnVal = candidate;
      // Ensure that the return value is a promise.
      if (!isThenable(returnVal)) {
        returnVal = Promise.reject(new Error('Expected a Promise, but the function returned something else.'));
      }

      // Marshal the result, to send over the network.
      (0, (_assert2 || _assert()).default)(returnVal != null);
      returnVal = returnVal.then(function (value) {
        return _this2._getTypeRegistry().marshal(_this2._objectRegistry, value, type);
      });

      // Send the result of the promise across the socket.
      returnVal.then(function (result) {
        _this2._transport.send(createPromiseMessage(requestId, result));
        timingTracker.onSuccess();
      }, function (error) {
        _this2._transport.send(createErrorMessage(requestId, error));
        timingTracker.onError(error == null ? new Error() : error);
      });
    }
  }, {
    key: '_returnObservable',
    value: function _returnObservable(requestId, returnVal, elementType) {
      var _this3 = this;

      var result = undefined;
      // Ensure that the return value is an observable.
      if (!isObservable(returnVal)) {
        result = (_rxjs2 || _rxjs()).Observable.throw(new Error('Expected an Observable, but the function returned something else.'));
      } else {
        result = returnVal;
      }

      // Marshal the result, to send over the network.
      result = result.concatMap(function (value) {
        return _this3._getTypeRegistry().marshal(_this3._objectRegistry, value, elementType);
      });

      // Send the next, error, and completion events of the observable across the socket.
      var subscription = result.subscribe(function (data) {
        _this3._transport.send(createNextMessage(requestId, data));
      }, function (error) {
        _this3._transport.send(createErrorMessage(requestId, error));
        _this3._objectRegistry.removeSubscription(requestId);
      }, function (completed) {
        _this3._transport.send(createCompletedMessage(requestId));
        _this3._objectRegistry.removeSubscription(requestId);
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
    key: '_handleMessage',
    value: _asyncToGenerator(function* (message) {
      (0, (_assert2 || _assert()).default)(message.protocol && message.protocol === (_config2 || _config()).SERVICE_FRAMEWORK3_CHANNEL);

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
        this._transport.send(createErrorMessage(requestId, e));
      }
    })
  }, {
    key: '_getTypeRegistry',
    value: function _getTypeRegistry() {
      return this._serverComponent.getTypeRegistry();
    }
  }, {
    key: '_getFunctionImplemention',
    value: function _getFunctionImplemention(name) {
      return this._serverComponent.getFunctionImplemention(name);
    }
  }, {
    key: '_getClassDefinition',
    value: function _getClassDefinition(className) {
      return this._serverComponent.getClassDefinition(className);
    }
  }, {
    key: 'getMarshallingContext',
    value: function getMarshallingContext() {
      return this._objectRegistry;
    }
  }, {
    key: 'getTransport',
    value: function getTransport() {
      return this._transport;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._transport.close();
      this._objectRegistry.dispose();
    }
  }]);

  return ClientConnection;
})();

exports.ClientConnection = ClientConnection;

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

function createPromiseMessage(requestId, result) {
  return {
    channel: (_config2 || _config()).SERVICE_FRAMEWORK3_CHANNEL,
    type: 'PromiseMessage',
    requestId: requestId,
    result: result,
    hadError: false
  };
}

function createNextMessage(requestId, data) {
  return {
    channel: (_config2 || _config()).SERVICE_FRAMEWORK3_CHANNEL,
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
    channel: (_config2 || _config()).SERVICE_FRAMEWORK3_CHANNEL,
    type: 'ObservableMessage',
    requestId: requestId,
    hadError: false,
    result: { type: 'completed' }
  };
}

function createErrorMessage(requestId, error) {
  return {
    channel: (_config2 || _config()).SERVICE_FRAMEWORK3_CHANNEL,
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