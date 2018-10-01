"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _passesGK() {
  const data = require("../../commons-node/passesGK");

  _passesGK = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

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
const CONNECTION_EVENT = 'nuclide-remote-connection';

class ConnectionTracker {
  constructor(config) {
    this._config = config;
    this._expired = false;
    this._connectionStartTime = Date.now();
    this._promptYubikeyTime = 0;
    this._finishYubikeyTime = 0;
  }

  trackPromptYubikeyInput() {
    this._promptYubikeyTime = Date.now();
  }

  trackFinishYubikeyInput() {
    this._finishYubikeyTime = Date.now();
  }

  trackSuccess() {
    this._trackConnectionResult(true);
  }

  trackFailure(errorType, e) {
    this._trackConnectionResult(false, errorType, e);
  }

  _trackConnectionResult(succeed, errorType, e) {
    if (this._expired) {
      return;
    }

    const preYubikeyDuration = this._promptYubikeyTime > 0 ? this._promptYubikeyTime - this._connectionStartTime : 0;
    const postYubikeyDuration = this._finishYubikeyTime > 0 ? Date.now() - this._finishYubikeyTime : 0;
    const realDuration = preYubikeyDuration > 0 && postYubikeyDuration > 0 ? preYubikeyDuration + postYubikeyDuration : 0;
    (0, _nuclideAnalytics().track)(CONNECTION_EVENT, {
      error: succeed ? '0' : '1',
      errorType: errorType || '',
      exception: e ? (0, _string().stringifyError)(e) : '',
      duration: (Date.now() - this._connectionStartTime).toString(),
      preYubikeyDuration: preYubikeyDuration.toString(),
      postYubikeyDuration: postYubikeyDuration.toString(),
      realDuration: realDuration.toString(),
      host: this._config.host,
      sshPort: this._config.sshPort.toString(),
      username: this._config.username,
      remoteServerCommand: this._config.remoteServerCommand,
      cwd: this._config.cwd,
      authMethod: this._config.authMethod,
      // We already checked this GK to get here, so no need to await.
      isBigDig: (0, _passesGK().isGkEnabled)('nuclide_big_dig')
    });
    this._expired = true;
  }

}

exports.default = ConnectionTracker;