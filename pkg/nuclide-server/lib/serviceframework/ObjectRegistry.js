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

type ObjectRegistration = {
  interface: string;
  remoteId: number;
  object: RemoteObject;
};

// All remotable objects have some set of named functions,
// and they also have a dispose method.
export type RemoteObject = {
  [id:string]: Function;
  dispose: () => void;
};

// Handles lifetimes of marshalling wrappers remote objects.
export class ObjectRegistry {
  _registrationsById: Map<number, ObjectRegistration>;
  _registrationsByObject: Map<RemoteObject, ObjectRegistration>;
  _nextObjectId: number;
  _subscriptions: Map<number, IDisposable>;

  constructor() {
    this._nextObjectId = 1;
    this._registrationsById = new Map();
    this._registrationsByObject = new Map();
    this._subscriptions = new Map();
  }

  get(remoteId: number): RemoteObject {
    return this._getRegistration(remoteId).object;
  }

  _getRegistration(remoteId: number): ObjectRegistration {
    const result = this._registrationsById.get(remoteId);
    invariant(result != null);
    return result;
  }

  getInterface(remoteId: number): string {
    return this._getRegistration(remoteId).interface;
  }

  async disposeObject(remoteId: number): Promise<void> {
    const registration = this._getRegistration(remoteId);
    const object = registration.object;

    this._registrationsById.delete(remoteId);
    this._registrationsByObject.delete(object);

    // Call the object's local dispose function.
    await object.dispose();
  }

  disposeSubscription(requestId: number): void {
    const subscription = this.removeSubscription(requestId);
    if (subscription != null) {
      subscription.dispose();
    }
  }

  // Put the object in the registry.
  add(interfaceName: string, object: Object): number {
    const existingRegistration = this._registrationsByObject.get(object);
    if (existingRegistration != null) {
      invariant(existingRegistration.interface === interfaceName);
      return existingRegistration.remoteId;
    }

    const objectId = this._nextObjectId;
    this._nextObjectId++;

    const registration = {
      interface: interfaceName,
      remoteId: objectId,
      object,
    };

    this._registrationsById.set(objectId, registration);
    this._registrationsByObject.set(object, registration);

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
