'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectionCache = undefined;

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('./ServerConnection');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _cache;

function _load_cache() {
  return _cache = require('nuclide-commons/cache');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// A cache of values by ServerConnection.
// Will lazily create the values when requested for each connection.
// Note that an entry is added for local with connection == null.
class ConnectionCache extends (_cache || _load_cache()).Cache {

  // If lazy is true, then entries will only be created when get() is called.
  // Otherwise, entries will be created as soon as ServerConnection's are
  // established.
  constructor(factory, lazy = false) {
    super(factory, valuePromise => valuePromise.then(value => value.dispose()));
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._subscriptions.add((_ServerConnection || _load_ServerConnection()).ServerConnection.onDidCloseServerConnection(connection => {
      if (this.has(connection)) {
        const value = this.get(connection);
        this.delete(connection);
        value.then(element => element.dispose());
      }
    }));

    if (!lazy) {
      this.get(null);
      this._subscriptions.add((_ServerConnection || _load_ServerConnection()).ServerConnection.observeConnections(connection => {
        this.get(connection);
      }));
    }
  }

  getForUri(filePath) {
    const connection = connectionOfUri(filePath);
    if (connection == null) {
      return null;
    }
    return this.get(connection.connection);
  }

  getExistingForUri(filePath) {
    const connection = connectionOfUri(filePath);
    if (connection == null) {
      return null;
    }
    return this.has(connection.connection) ? this.get(connection.connection) : null;
  }

  dispose() {
    super.dispose();
    this._subscriptions.dispose();
  }
}

exports.ConnectionCache = ConnectionCache; // Returns null if there's no valid connection for the given filePath
// Returns {connection: null} for a valid local filePath.
// Returns {connection: non-null} for a valid remote filePath.
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

function connectionOfUri(filePath) {
  if (filePath == null) {
    return null;
  }

  const connection = (_ServerConnection || _load_ServerConnection()).ServerConnection.getForUri(filePath);
  // During startup & shutdown of connections we can have a remote uri
  // without the corresponding connection.
  if (connection == null && (_nuclideUri || _load_nuclideUri()).default.isRemote(filePath)) {
    return null;
  }

  return { connection };
}