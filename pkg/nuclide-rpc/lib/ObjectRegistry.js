"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ObjectRegistry = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _eventKit() {
  const data = require("event-kit");

  _eventKit = function () {
    return data;
  };

  return data;
}

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
const logger = (0, _log4js().getLogger)('nuclide-rpc');

// Handles lifetimes of marshalling wrappers remote objects.
//
// Object passed by reference over RPC are assigned an ID.
// Positive IDs represent objects which live on the server,
// negative IDs represent objects which live on the client.
class ObjectRegistry {
  // These members handle local objects which have been marshalled remotely.
  // These members handle remote objects.
  // null means the proxy has been disposed.
  // Maps service name to proxy
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
    this._emitter = new (_eventKit().Emitter)();
  }

  onRegisterLocal(callback) {
    return this._emitter.on('register-local', callback);
  }

  onUnregisterLocal(callback) {
    return this._emitter.on('unregister-local', callback);
  }

  onRegisterRemote(callback) {
    return this._emitter.on('register-remote', callback);
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
        throw new Error("Invariant violation: \"proxyClass != null\"");
      }

      if (!(interfaceName != null)) {
        throw new Error("Invariant violation: \"interfaceName != null\"");
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
      throw new Error("Invariant violation: \"proxyClass != null\"");
    } // Generate the proxy by manually setting the prototype of the proxy to be the
    // prototype of the remote proxy constructor.


    const newProxy = Object.create(proxyClass.prototype);

    this._addProxy(newProxy, interfaceName, remoteId);

    return newProxy;
  }

  _getRegistration(id) {
    const result = this._isLocalId(id) ? this._registrationsById.get(id) : this._proxiesById.get(id);

    if (!(result != null)) {
      throw new Error(`Unknown registration ${id}`);
    }

    return result;
  }

  getInterface(id) {
    return this._getRegistration(id).interface;
  }

  async disposeObject(remoteId) {
    this._emitter.emit('unregister-local', remoteId);

    const registration = this._getRegistration(remoteId);

    const object = registration.object;

    this._registrationsById.delete(remoteId);

    this._registrationsByObject.delete(object); // Call the object's local dispose function.


    await object.dispose();
  }

  disposeSubscription(id) {
    const subscription = this.removeSubscription(id);

    if (subscription != null) {
      subscription.unsubscribe();
    }
  } // Put the object in the registry.


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
      throw new Error("Invariant violation: \"result != null\"");
    }

    return result;
  }

  _marshalLocalObject(interfaceName, object) {
    const existingRegistration = this._registrationsByObject.get(object);

    if (existingRegistration != null) {
      if (!(existingRegistration.interface === interfaceName)) {
        throw new Error("Invariant violation: \"existingRegistration.interface === interfaceName\"");
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

    this._emitter.emit('register-local', objectId);

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
  } // Disposes all object in the registry


  async dispose() {
    const ids = Array.from(this._registrationsById.keys());
    logger.info(`Disposing ${ids.length} registrations`);
    await Promise.all(ids.map(async id => {
      try {
        await this.disposeObject(id);
      } catch (e) {
        logger.error('Error disposing marshalled object.', e);
      }
    }));
    const subscriptions = Array.from(this._subscriptions.keys());
    logger.info(`Disposing ${subscriptions.length} subscriptions`);

    for (const id of subscriptions) {
      try {
        this.disposeSubscription(id);
      } catch (e) {
        logger.error('Error disposing subscription', e);
      }
    }
  } // Returns null if the object is already disposed.


  disposeProxy(proxy) {
    const objectId = this._idsByProxy.get(proxy);

    if (objectId != null) {
      this._idsByProxy.set(proxy, null);

      return objectId;
    } else {
      return null;
    }
  }

  _addProxy(proxy, interfaceName, id) {
    if (!!this._idsByProxy.has(proxy)) {
      throw new Error("Invariant violation: \"!this._idsByProxy.has(proxy)\"");
    }

    this._idsByProxy.set(proxy, id);

    if (!!this._proxiesById.has(id)) {
      throw new Error("Invariant violation: \"!this._proxiesById.has(id)\"");
    }

    this._emitter.emit('register-remote', id);

    this._proxiesById.set(id, {
      interface: interfaceName,
      remoteId: id,
      object: proxy
    });
  }

  isRegistered(object) {
    return this._registrationsByObject.has(object);
  }

  _isRemoteObject(object) {
    return this._idsByProxy.has(object);
  }

  _isLocalId(id) {
    return id * this._delta > 0;
  }

}

exports.ObjectRegistry = ObjectRegistry;