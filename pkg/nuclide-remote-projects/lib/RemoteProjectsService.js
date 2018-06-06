'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _openConnection;

function _load_openConnection() {
  return _openConnection = require('./open-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RemoteProjectsService {

  constructor() {
    this._subject = new _rxjsBundlesRxMinJs.ReplaySubject(1);
  }

  dispose() {
    this._subject.complete();
  }

  _reloadFinished(projects) {
    this._subject.next(projects);
    this._subject.complete();
  }

  waitForRemoteProjectReload(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._subject.subscribe(callback));
  }

  async createRemoteConnection(remoteProjectConfig) {
    const {
      host,
      path,
      displayTitle,
      promptReconnectOnFailure = true
    } = remoteProjectConfig;
    const connection = await (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.reconnect(host, path, displayTitle, promptReconnectOnFailure);
    if (connection != null) {
      return connection;
    }
    if (promptReconnectOnFailure === false) {
      return null;
    }
    // If connection fails using saved config, open connect dialog.
    return (0, (_openConnection || _load_openConnection()).openConnectionDialog)({
      initialServer: host,
      initialCwd: path
    });
  }

  openConnectionDialog(options) {
    return (0, (_openConnection || _load_openConnection()).openConnectionDialog)(options);
  }

  async findOrCreate(config) {
    return (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.findOrCreate(config);
  }
}
exports.default = RemoteProjectsService; /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          *  strict-local
                                          * @format
                                          */