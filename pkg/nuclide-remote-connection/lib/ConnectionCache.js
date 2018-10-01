"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectionCache = void 0;

function _ServerConnection() {
  const data = require("./ServerConnection");

  _ServerConnection = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _cache() {
  const data = require("../../../modules/nuclide-commons/cache");

  _cache = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
// A cache of values by ServerConnection.
// Will lazily create the values when requested for each connection.
// Note that an entry is added for local with connection == null.
class ConnectionCache extends _cache().Cache {
  // If lazy is true, then entries will only be created when get() is called.
  // Otherwise, entries will be created as soon as ServerConnection's are
  // established.
  constructor(factory, lazy = false) {
    super(factory, valuePromise => valuePromise.then(value => value.dispose()));
    this._subscriptions = new (_UniversalDisposable().default)();

    this._subscriptions.add(_ServerConnection().ServerConnection.onDidCloseServerConnection(connection => {
      if (this.has(connection)) {
        const value = this.get(connection);
        this.delete(connection);
        value.then(element => element.dispose());
      }
    }));

    if (!lazy) {
      this.get(null);

      this._subscriptions.add(_ServerConnection().ServerConnection.observeConnections(connection => {
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

} // Returns null if there's no valid connection for the given filePath
// Returns {connection: null} for a valid local filePath.
// Returns {connection: non-null} for a valid remote filePath.


exports.ConnectionCache = ConnectionCache;

function connectionOfUri(filePath) {
  if (filePath == null) {
    return null;
  }

  const connection = _ServerConnection().ServerConnection.getForUri(filePath); // During startup & shutdown of connections we can have a remote uri
  // without the corresponding connection.


  if (connection == null && _nuclideUri().default.isRemote(filePath)) {
    return null;
  }

  return {
    connection
  };
}