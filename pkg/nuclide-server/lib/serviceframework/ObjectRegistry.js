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

export type RemoteObject = {
  _interface: string;
  _remoteId: ?number;
  dispose: () => mixed;
};

// Handles lifetimes of marshalling wrappers remote objects.
export class ObjectRegistry {
  _objectRegistry: Map<number, RemoteObject>;
  _nextObjectId: number;
  _subscriptions: Map<number, IDisposable>;

  constructor() {
    this._nextObjectId = 1;
    this._objectRegistry = new Map();
    this._subscriptions = new Map();
  }

  get(remoteId: number): RemoteObject {
    const result = this._objectRegistry.get(remoteId);
    invariant(result != null);
    return result;
  }

  async disposeObject(remoteId: number): Promise<void> {
    const doObject = this._objectRegistry.get(remoteId);
    invariant(doObject != null);

    // Remove the object from the registry, and scrub it's id.
    doObject._remoteId = undefined;
    this._objectRegistry.delete(remoteId);

    // Call the object's local dispose function.
    await doObject.dispose();
  }

  disposeSubscription(requestId: number): void {
    const subscription = this.removeSubscription(requestId);
    if (subscription != null) {
      subscription.dispose();
    }
  }

  // Put the object in the registry.
  add(interfaceName: string, object: Object): number {
    if (object._remoteId != null) {
      invariant(object._interface === interfaceName);
      return object._remoteId;
    }

    const objectId = this._nextObjectId;
    this._nextObjectId++;

    object._interface = interfaceName;
    object._remoteId = objectId;

    this._objectRegistry.set(objectId, object);

    return objectId;
  }

  addSubscription(requestId: number, subscription: IDisposable): void {
    this._subscriptions.set(requestId, subscription);
  }

  removeSubscription(requestId: number): ?IDisposable {
    const subscription = this._subscriptions.get(requestId);
    if (subscription != null) {
      this._subscriptions.delete(requestId);
    }
    return subscription;
  }
}
