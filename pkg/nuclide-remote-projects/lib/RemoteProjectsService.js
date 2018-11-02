"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _startConnectFlow() {
  const data = _interopRequireDefault(require("./startConnectFlow"));

  _startConnectFlow = function () {
    return data;
  };

  return data;
}

function _SimpleConnect() {
  const data = require("./SimpleConnect");

  _SimpleConnect = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
class RemoteProjectsService {
  constructor() {
    this.createRemoteConnection = config => {
      return this._connect(config, false);
    };

    this._subject = new _rxjsCompatUmdMin.ReplaySubject(1);
  }

  dispose() {
    this._subject.complete();
  }

  _reloadFinished(projects) {
    this._subject.next(projects);

    this._subject.complete();
  }

  waitForRemoteProjectReload(callback) {
    return new (_UniversalDisposable().default)(this._subject.subscribe(callback));
  }

  /**
   * This function intentially returns `void` and handles errors because it's intended to
   * encapsulate the entire workflow.
   */
  connect(config) {
    this._connect(config, true).catch(err => {
      atom.notifications.addError('There was an error connecting to the remote project.', {
        detail: err.message
      });
      (0, _log4js().getLogger)('nuclide-remote-projects').error(err);
    });
  }

  async _connect(remoteProjectConfig, attemptImmediateConnection) {
    const {
      host,
      path,
      displayTitle,
      promptReconnectOnFailure = true
    } = remoteProjectConfig;
    const connection = await _nuclideRemoteConnection().RemoteConnection.reconnect(host, path, displayTitle, promptReconnectOnFailure);

    if (connection != null) {
      return connection;
    }

    if (promptReconnectOnFailure === false) {
      return null;
    } // If connection fails using saved config, open connect dialog.


    return (0, _startConnectFlow().default)({
      initialServer: host,
      initialCwd: path,
      attemptImmediateConnection
    });
  }

  connectToServer(config) {
    return (0, _SimpleConnect().connectToServer)(config);
  }

  openConnectionDialog(options) {
    return (0, _startConnectFlow().default)(options);
  }

  async findOrCreate(config) {
    return _nuclideRemoteConnection().RemoteConnection.findOrCreate(config);
  }

}

exports.default = RemoteProjectsService;