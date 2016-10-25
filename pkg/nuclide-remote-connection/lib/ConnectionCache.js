'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectionCache = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('./ServerConnection');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _cache;

function _load_cache() {
  return _cache = require('../../commons-node/cache');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// A cache of values by ServerConnection.
// Will lazily create the values when requested for each connection.
// Note that an entry is added for local with connection == null.
let ConnectionCache = exports.ConnectionCache = class ConnectionCache extends (_cache || _load_cache()).Cache {

  // If lazy is true, then entries will only be created when get() is called.
  // Otherwise, entries will be created as soon as ServerConnection's are
  // established.
  constructor(factory) {
    var _this;

    let lazy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _this = super(factory, valuePromise => valuePromise.then(value => value.dispose()));
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._subscriptions.add((_ServerConnection || _load_ServerConnection()).ServerConnection.onDidCloseServerConnection((() => {
      var _ref = (0, _asyncToGenerator.default)(function* (connection) {
        const value = _this.get(connection);
        if (value != null) {
          _this.delete(connection);
          (yield value).dispose();
        }
      });

      return function (_x2) {
        return _ref.apply(this, arguments);
      };
    })()));

    if (!lazy) {
      this.get(null);
      this._subscriptions.add((_ServerConnection || _load_ServerConnection()).ServerConnection.observeConnections(connection => {
        this.get(connection);
      }));
    }
  }

  getForUri(filePath) {
    if (filePath == null) {
      return null;
    }

    const connection = (_ServerConnection || _load_ServerConnection()).ServerConnection.getForUri(filePath);
    // During startup & shutdown of connections we can have a remote uri
    // without the corresponding connection.
    if (connection == null && (_nuclideUri || _load_nuclideUri()).default.isRemote(filePath)) {
      return null;
    }
    return this.get(connection);
  }

  dispose() {
    super.dispose();
    this._subscriptions.dispose();
  }
};