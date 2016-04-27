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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideLogging = require('../../../nuclide-logging');

var logger = (0, _nuclideLogging.getLogger)();

// All remotable objects have some set of named functions,
// and they also have a dispose method.

// Handles lifetimes of marshalling wrappers remote objects.
//
// Object passed by reference over RPC are assigned an ID.
// Positive IDs represent objects which live on the server,
// negative IDs represent objects which live on the client.

var ObjectRegistry = (function () {
  function ObjectRegistry(kind) {
    _classCallCheck(this, ObjectRegistry);

    this._delta = kind === 'server' ? 1 : -1;
    this._nextObjectId = this._delta;
    this._registrationsById = new Map();
    this._registrationsByObject = new Map();
    this._subscriptions = new Map();
    this._proxiesById = new Map();
    this._idsByProxy = new Map();
  }

  _createClass(ObjectRegistry, [{
    key: 'unmarshal',
    value: function unmarshal(id, proxyClass) {
      if (this._isLocalId(id)) {
        return this._unmarshalLocalObject(id);
      } else {
        (0, _assert2['default'])(proxyClass != null);
        return this._unmarshalRemoteObject(id, proxyClass);
      }
    }
  }, {
    key: '_unmarshalLocalObject',
    value: function _unmarshalLocalObject(id) {
      return this._getRegistration(id).object;
    }
  }, {
    key: '_unmarshalRemoteObject',
    value: function _unmarshalRemoteObject(remoteId, proxyClass) {
      var existingProxy = this._proxiesById.get(remoteId);
      if (existingProxy != null) {
        return existingProxy;
      }
      (0, _assert2['default'])(proxyClass != null);

      // Generate the proxy by manually setting the prototype of the proxy to be the
      // prototype of the remote proxy constructor.
      var newProxy = Object.create(proxyClass.prototype);
      this.addProxy(newProxy, Promise.resolve(remoteId));
      return newProxy;
    }
  }, {
    key: '_getRegistration',
    value: function _getRegistration(remoteId) {
      var result = this._registrationsById.get(remoteId);
      (0, _assert2['default'])(result != null);
      return result;
    }
  }, {
    key: 'getInterface',
    value: function getInterface(remoteId) {
      return this._getRegistration(remoteId)['interface'];
    }
  }, {
    key: 'disposeObject',
    value: _asyncToGenerator(function* (remoteId) {
      var registration = this._getRegistration(remoteId);
      var object = registration.object;

      this._registrationsById['delete'](remoteId);
      this._registrationsByObject['delete'](object);

      // Call the object's local dispose function.
      yield object.dispose();
    })
  }, {
    key: 'disposeSubscription',
    value: function disposeSubscription(requestId) {
      var subscription = this.removeSubscription(requestId);
      if (subscription != null) {
        subscription.unsubscribe();
      }
    }

    // Put the object in the registry.
  }, {
    key: 'marshal',
    value: function marshal(interfaceName, object) {
      if (this._isRemoteObject(object)) {
        return this._marshalRemoteObject(object);
      } else {
        return this._marshalLocalObject(interfaceName, object);
      }
    }
  }, {
    key: '_marshalRemoteObject',
    value: function _marshalRemoteObject(proxy) {
      var result = this._idsByProxy.get(proxy);
      (0, _assert2['default'])(result != null);
      return result;
    }
  }, {
    key: '_marshalLocalObject',
    value: function _marshalLocalObject(interfaceName, object) {
      var existingRegistration = this._registrationsByObject.get(object);
      if (existingRegistration != null) {
        (0, _assert2['default'])(existingRegistration['interface'] === interfaceName);
        return existingRegistration.remoteId;
      }

      var objectId = this._nextObjectId;
      this._nextObjectId += this._delta;

      var registration = {
        'interface': interfaceName,
        remoteId: objectId,
        object: object
      };

      this._registrationsById.set(objectId, registration);
      this._registrationsByObject.set(object, registration);

      return objectId;
    }
  }, {
    key: 'addSubscription',
    value: function addSubscription(requestId, subscription) {
      this._subscriptions.set(requestId, subscription);
    }
  }, {
    key: 'removeSubscription',
    value: function removeSubscription(requestId) {
      var subscription = this._subscriptions.get(requestId);
      if (subscription != null) {
        this._subscriptions['delete'](requestId);
      }
      return subscription;
    }

    // Disposes all object in the registry
  }, {
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      var _this = this;

      var ids = Array.from(this._registrationsById.keys());
      logger.info('Disposing ' + ids.length + ' registrations');

      yield Promise.all(ids.map(_asyncToGenerator(function* (id) {
        try {
          yield _this.disposeObject(id);
        } catch (e) {
          logger.error('Error disposing marshalled object.', e);
        }
      })));

      var subscriptions = Array.from(this._subscriptions.keys());
      logger.info('Disposing ' + subscriptions.length + ' subscriptions');
      for (var _id of subscriptions) {
        try {

          this.disposeSubscription(_id);
        } catch (e) {
          logger.error('Error disposing subscription', e);
        }
      }
    })

    // Returns null if the object is already disposed.
  }, {
    key: 'disposeProxy',
    value: _asyncToGenerator(function* (proxy) {
      (0, _assert2['default'])(this._idsByProxy.has(proxy));
      var objectId = this._idsByProxy.get(proxy);
      if (objectId != null) {
        this._idsByProxy.set(proxy, null);
        return yield objectId;
      } else {
        return null;
      }
    })
  }, {
    key: 'addProxy',
    value: _asyncToGenerator(function* (proxy, idPromise) {
      (0, _assert2['default'])(!this._idsByProxy.has(proxy));
      this._idsByProxy.set(proxy, idPromise);

      var id = yield idPromise;
      (0, _assert2['default'])(!this._proxiesById.has(id));
      this._proxiesById.set(id, proxy);
    })
  }, {
    key: '_isRemoteObject',
    value: function _isRemoteObject(object) {
      return this._idsByProxy.has(object);
    }
  }, {
    key: '_isLocalId',
    value: function _isLocalId(id) {
      return id * this._delta > 0;
    }
  }]);

  return ObjectRegistry;
})();

exports.ObjectRegistry = ObjectRegistry;

// These members handle local objects which have been marshalled remotely.

// These members handle remote objects.

// null means the proxy has been disposed.