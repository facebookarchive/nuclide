"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

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

function _openConnection() {
  const data = require("./open-connection");

  _openConnection = function () {
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
    this._subject = new _RxMin.ReplaySubject(1);
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

  async createRemoteConnection(remoteProjectConfig) {
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


    return (0, _openConnection().openConnectionDialog)({
      initialServer: host,
      initialCwd: path
    });
  }

  openConnectionDialog(options) {
    return (0, _openConnection().openConnectionDialog)(options);
  }

  async findOrCreate(config) {
    return _nuclideRemoteConnection().RemoteConnection.findOrCreate(config);
  }

}

exports.default = RemoteProjectsService;