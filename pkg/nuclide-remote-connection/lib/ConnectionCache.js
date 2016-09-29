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
import {Cache} from '../../commons-node/cache';


// A cache of values by ServerConnection.
// Will lazily create the values when requested for each connection.
// Note that an entry is added for local with connection == null.
export class ConnectionCache<T: IDisposable> extends Cache<?ServerConnection, Promise<T>> {
  _subscriptions: UniversalDisposable;

  // If lazy is true, then entries will only be created when get() is called.
  // Otherwise, entries will be created as soon as ServerConnection's are
  // established.
  constructor(factory: (connection: ?ServerConnection) => Promise<T>, lazy: bool = false) {
    super(factory, valuePromise => valuePromise.then(value => value.dispose()));
    this._subscriptions = new UniversalDisposable();
    this._subscriptions.add(
      ServerConnection.onDidCloseServerConnection(async connection => {
        const value = this.get(connection);
        if (value != null) {
          this.delete(connection);
          (await value).dispose();
        }
      }));

    if (!lazy) {
      this.get(null);
      this._subscriptions.add(
        ServerConnection.observeConnections(connection => { this.get(connection); }));
    }
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
    super.dispose();
    this._subscriptions.dispose();
  }
}
