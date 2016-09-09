'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';

import {ServerConnection} from './ServerConnection';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import nuclideUri from '../../commons-node/nuclideUri';

// A cache of values by ServerConnection.
// Will lazily create the values when requested for each connection.
// Note that an entry is added for local with connection == null.
export class ConnectionCache<T: IDisposable> {
  _values: Map<?ServerConnection, Promise<T>>;
  _factory: (connection: ?ServerConnection) => Promise<T>;
  _subscriptions: UniversalDisposable;

  // If lazy is true, then entries will only be created when get() is called.
  // Otherwise, entries will be created as soon as ServerConnection's are
  // established.
  constructor(factory: (connection: ?ServerConnection) => Promise<T>, lazy: bool = false) {
    this._values = new Map();
    this._factory = factory;
    this._subscriptions = new UniversalDisposable();
    this._subscriptions.add(
      ServerConnection.onDidCloseServerConnection(async connection => {
        const value = this._values.get(connection);
        if (value != null) {
          this._values.delete(connection);
          (await value).dispose();
        }
      }));

    if (!lazy) {
      this.get(null);
      this._subscriptions.add(
        ServerConnection.observeConnections(connection => { this.get(connection); }));
    }
  }

  get(connection: ?ServerConnection): Promise<T> {
    const existingValue = this._values.get(connection);
    if (existingValue != null) {
      return existingValue;
    }

    const newValue = this._factory(connection);
    this._values.set(connection, newValue);
    return newValue;
  }

  getForUri(filePath: ?NuclideUri): ?Promise<T> {
    if (filePath == null) {
      return null;
    }

    const connection = ServerConnection.getForUri(filePath);
    // During startup & shutdown of connections we can have a remote uri
    // without the corresponding connection.
    if (connection == null && nuclideUri.isRemote(filePath)) {
      return null;
    }
    return this.get(connection);
  }

  dispose(): void {
    this._subscriptions.dispose();
    Array.from(this._values.values())
      .forEach(valuePromise => valuePromise.then(value => value.dispose()));
    this._values.clear();
  }
}
