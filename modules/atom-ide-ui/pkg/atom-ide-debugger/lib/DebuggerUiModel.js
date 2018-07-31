"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.WORKSPACE_VIEW_URI = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const WORKSPACE_VIEW_URI = 'atom://nuclide/debugger';
exports.WORKSPACE_VIEW_URI = WORKSPACE_VIEW_URI;
const CONNECTIONS_UPDATED_EVENT = 'CONNECTIONS_UPDATED_EVENT';
const PROVIDERS_UPDATED_EVENT = 'PROVIDERS_UPDATED_EVENT';
/**
 * Atom ViewProvider compatible model object.
 */

class DebuggerModel {
  // Debugger providers
  constructor(service) {
    this._service = service;
    this._emitter = new _atom.Emitter();
    this._debuggerProviders = new Set(); // There is always a local connection.

    this._connections = ['local'];
    this._disposables = new (_UniversalDisposable().default)(this._listenForProjectChange());
  }

  _listenForProjectChange() {
    return atom.project.onDidChangePaths(() => {
      this._updateConnections();
    });
  }
  /**
   * Utility for getting refreshed connections.
   * TODO: refresh connections when new directories are removed/added in file-tree.
   */


  _updateConnections() {
    const connections = this._getRemoteConnections(); // Always have one single local connection.


    connections.push('local');
    this._connections = connections;

    this._emitter.emit(CONNECTIONS_UPDATED_EVENT);
  }
  /**
   * Get remote connections without duplication.
   */


  _getRemoteConnections() {
    // TODO: move this logic into RemoteConnection package.
    return atom.project.getPaths().filter(path => {
      return _nuclideUri().default.isRemote(path);
    }).map(remotePath => {
      const {
        hostname
      } = _nuclideUri().default.parseRemoteUri(remotePath);

      return _nuclideUri().default.createRemoteUri(hostname, '/');
    }).filter((path, index, inputArray) => {
      return inputArray.indexOf(path) === index;
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  addDebuggerProvider(provider) {
    this._debuggerProviders.add(provider);

    this._emitter.emit(PROVIDERS_UPDATED_EVENT);
  }

  removeDebuggerProvider(provider) {
    this._debuggerProviders.delete(provider);
  }
  /**
   * Subscribe to new connection updates from DebuggerActions.
   */


  onConnectionsUpdated(callback) {
    return this._emitter.on(CONNECTIONS_UPDATED_EVENT, callback);
  }

  onProvidersUpdated(callback) {
    return this._emitter.on(PROVIDERS_UPDATED_EVENT, callback);
  }

  getConnections() {
    return this._connections;
  }
  /**
   * Return available launch/attach provider for input connection.
   * Caller is responsible for disposing the results.
   */


  getLaunchAttachProvidersForConnection(connection) {
    const availableLaunchAttachProviders = [];

    for (const provider of this._debuggerProviders) {
      const launchAttachProvider = provider.getLaunchAttachProvider(connection);

      if (launchAttachProvider != null) {
        availableLaunchAttachProviders.push(launchAttachProvider);
      }
    }

    return availableLaunchAttachProviders;
  }

}

exports.default = DebuggerModel;