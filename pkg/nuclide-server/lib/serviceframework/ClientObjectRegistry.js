'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


// Handles lifetimes of marshalling wrappers remote objects.
export class ClientObjectRegistry {
  _proxies: Map<number, Object>;

  constructor() {
    this._proxies = new Map();
  }

  marshal(object: Object): Promise<number> {
    return object._idPromise;
  }

  unmarshal(objectId: number, proxyClass: Function): Object {
    // Return a cached proxy, if one already exists, for this object.
    const existingProxy = this._proxies.get(objectId);
    if (existingProxy != null) {
      return existingProxy;
    }

    // Generate the proxy by manually setting the prototype of the object to be the
    // prototype of the remote proxy constructor.
    const object = { _idPromise: Promise.resolve(objectId) };
    // $FlowIssue - T9254210 add Object.setPrototypeOf typing
    Object.setPrototypeOf(object, proxyClass.prototype);
    this._proxies.set(objectId, object);
    return object;
  }

  async disposeRemoteObject(object: Object): Promise<number> {
    const objectId = await object._idPromise;
    object._idPromise = Promise.reject(new Error('This remote Object has been disposed'));
    return objectId;
  }
}
