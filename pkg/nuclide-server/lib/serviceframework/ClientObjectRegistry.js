'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import invariant from 'assert';

// Handles lifetimes of marshalling wrappers remote objects.
// Proxies are local shims which marshal their calls across the RPC layer.
export class ClientObjectRegistry {
  _proxiesById: Map<number, Object>;
  _idsByProxy: Map<Object, Promise<number>>;

  constructor() {
    this._proxiesById = new Map();
    this._idsByProxy = new Map();
  }

  marshal(interfaceName: string, proxy: Object): Promise<number> {
    const result = this._idsByProxy.get(proxy);
    invariant(result != null);
    return result;
  }

  unmarshal(objectId: number, proxyClass?: Function): Object {
    const existingProxy = this._proxiesById.get(objectId);
    if (existingProxy != null) {
      return existingProxy;
    }
    invariant(proxyClass != null);

    // Generate the proxy by manually setting the prototype of the proxy to be the
    // prototype of the remote proxy constructor.
    const newProxy = Object.create(proxyClass.prototype);
    this.addProxy(newProxy, Promise.resolve(objectId));
    return newProxy;
  }

  async disposeProxy(proxy: Object): Promise<number> {
    invariant(this._idsByProxy.has(proxy));
    const objectId = await this._idsByProxy.get(proxy);
    this._idsByProxy.set(proxy, Promise.reject(new Error('This remote Object has been disposed')));
    return objectId;
  }

  async addProxy(proxy: Object, idPromise: Promise<number>): Promise<void> {
    invariant(!this._idsByProxy.has(proxy));
    this._idsByProxy.set(proxy, idPromise);

    const id = await idPromise;
    invariant(!this._proxiesById.has(id));
    this._proxiesById.set(id, proxy);
  }
}
