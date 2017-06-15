'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ObjectRegistry = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-rpc');

// All remotable objects have some set of named functions,
// and they also have a dispose method.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

// Handles lifetimes of marshalling wrappers remote objects.
//
// Object passed by reference over RPC are assigned an ID.
// Positive IDs represent objects which live on the server,
// negative IDs represent objects which live on the client.
class ObjectRegistry {
  // null means the proxy has been disposed.

  // These members handle local objects which have been marshalled remotely.
  constructor(kind, serviceRegistry, context) {
    this._delta = kind === 'server' ? 1 : -1;
    this._nextObjectId = this._delta;
    this._registrationsById = new Map();
    this._registrationsByObject = new Map();
    this._subscriptions = new Map();
    this._proxiesById = new Map();
    this._idsByProxy = new Map();
    this._serviceRegistry = serviceRegistry;
    this._services = new Map();
    this._context = context;
  }
  // Maps service name to proxy

  // These members handle remote objects.


  hasService(serviceName) {
    return this._serviceRegistry.hasService(serviceName);
  }

  getService(serviceName) {
    let service = this._services.get(serviceName);
    if (service == null) {
      service = this._serviceRegistry.getService(serviceName).factory(this._context);
      this._services.set(serviceName, service);
    }
    return service;
  }

  unmarshal(id, interfaceName, proxyClass) {
    if (this._isLocalId(id)) {
      return this._unmarshalLocalObject(id);
    } else {
      if (!(proxyClass != null)) {
        throw new Error('Invariant violation: "proxyClass != null"');
      }

      if (!(interfaceName != null)) {
        throw new Error('Invariant violation: "interfaceName != null"');
      }

      return this._unmarshalRemoteObject(id, interfaceName, proxyClass);
    }
  }

  _unmarshalLocalObject(id) {
    return this._getRegistration(id).object;
  }

  _unmarshalRemoteObject(remoteId, interfaceName, proxyClass) {
    const existingProxy = this._proxiesById.get(remoteId);
    if (existingProxy != null) {
      return existingProxy.object;
    }

    if (!(proxyClass != null)) {
      throw new Error('Invariant violation: "proxyClass != null"');
    }

    // Generate the proxy by manually setting the prototype of the proxy to be the
    // prototype of the remote proxy constructor.


    const newProxy = Object.create(proxyClass.prototype);
    this.addProxy(newProxy, interfaceName, Promise.resolve(remoteId));
    return newProxy;
  }

  _getRegistration(id) {
    const result = this._isLocalId(id) ? this._registrationsById.get(id) : this._proxiesById.get(id);

    if (!(result != null)) {
      throw new Error('Invariant violation: "result != null"');
    }

    return result;
  }

  getInterface(id) {
    return this._getRegistration(id).interface;
  }

  disposeObject(remoteId) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const registration = _this._getRegistration(remoteId);
      const object = registration.object;

      _this._registrationsById.delete(remoteId);
      _this._registrationsByObject.delete(object);

      // Call the object's local dispose function.
      yield object.dispose();
    })();
  }

  disposeSubscription(id) {
    const subscription = this.removeSubscription(id);
    if (subscription != null) {
      subscription.unsubscribe();
    }
  }

  // Put the object in the registry.
  marshal(interfaceName, object) {
    if (this._isRemoteObject(object)) {
      return this._marshalRemoteObject(object);
    } else {
      return this._marshalLocalObject(interfaceName, object);
    }
  }

  _marshalRemoteObject(proxy) {
    const result = this._idsByProxy.get(proxy);

    if (!(result != null)) {
      throw new Error('Invariant violation: "result != null"');
    }

    return result;
  }

  _marshalLocalObject(interfaceName, object) {
    const existingRegistration = this._registrationsByObject.get(object);
    if (existingRegistration != null) {
      if (!(existingRegistration.interface === interfaceName)) {
        throw new Error('Invariant violation: "existingRegistration.interface === interfaceName"');
      }

      return existingRegistration.remoteId;
    }

    const objectId = this._nextObjectId;
    this._nextObjectId += this._delta;

    const registration = {
      interface: interfaceName,
      remoteId: objectId,
      object
    };

    this._registrationsById.set(objectId, registration);
    this._registrationsByObject.set(object, registration);

    return objectId;
  }

  addSubscription(id, subscription) {
    this._subscriptions.set(id, subscription);
  }

  removeSubscription(id) {
    const subscription = this._subscriptions.get(id);
    if (subscription != null) {
      this._subscriptions.delete(id);
    }
    return subscription;
  }

  // Disposes all object in the registry
  dispose() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const ids = Array.from(_this2._registrationsById.keys());
      logger.info(`Disposing ${ids.length} registrations`);

      yield Promise.all(ids.map((() => {
        var _ref = (0, _asyncToGenerator.default)(function* (id) {
          try {
            yield _this2.disposeObject(id);
          } catch (e) {
            logger.error('Error disposing marshalled object.', e);
          }
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })()));

      const subscriptions = Array.from(_this2._subscriptions.keys());
      logger.info(`Disposing ${subscriptions.length} subscriptions`);
      for (const id of subscriptions) {
        try {
          _this2.disposeSubscription(id);
        } catch (e) {
          logger.error('Error disposing subscription', e);
        }
      }
    })();
  }

  // Returns null if the object is already disposed.
  disposeProxy(proxy) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this3._idsByProxy.has(proxy)) {
        throw new Error('Invariant violation: "this._idsByProxy.has(proxy)"');
      }

      const objectId = _this3._idsByProxy.get(proxy);
      if (objectId != null) {
        _this3._idsByProxy.set(proxy, null);
        return objectId;
      } else {
        return null;
      }
    })();
  }

  addProxy(proxy, interfaceName, idPromise) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!!_this4._idsByProxy.has(proxy)) {
        throw new Error('Invariant violation: "!this._idsByProxy.has(proxy)"');
      }

      _this4._idsByProxy.set(proxy, idPromise);

      const id = yield idPromise;

      if (!!_this4._proxiesById.has(id)) {
        throw new Error('Invariant violation: "!this._proxiesById.has(id)"');
      }

      _this4._proxiesById.set(id, {
        interface: interfaceName,
        remoteId: id,
        object: proxy
      });
    })();
  }

  _isRemoteObject(object) {
    return this._idsByProxy.has(object);
  }

  _isLocalId(id) {
    return id * this._delta > 0;
  }
}
exports.ObjectRegistry = ObjectRegistry;