'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowVersion = undefined;

var _semver;

function _load_semver() {
  return _semver = _interopRequireDefault(require('semver'));
}

var _FlowConstants;

function _load_FlowConstants() {
  return _FlowConstants = require('./FlowConstants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Queries Flow for its version and caches the results. The version is a best guess: it is not 100%
 * guaranteed to be reliable due to caching, but will nearly always be correct.
 */
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

class FlowVersion {

  constructor(versionFn) {
    this._versionFn = versionFn;
    this._lastVersion = null;
  }

  invalidateVersion() {
    this._lastVersion = null;
  }

  async satisfies(range) {
    const version = await this.getVersion();
    if (version == null) {
      return false;
    }
    return (_semver || _load_semver()).default.satisfies(version, range);
  }

  async getVersion() {
    const lastVersion = this._lastVersion;
    if (lastVersion == null) {
      return this._queryAndSetVersion();
    }
    const msSinceReceived = Date.now() - lastVersion.receivedTime;
    if (msSinceReceived >= (_FlowConstants || _load_FlowConstants()).VERSION_TIMEOUT_MS) {
      return this._queryAndSetVersion();
    }
    return lastVersion.version;
  }

  async _queryAndSetVersion() {
    const version = await this._versionFn();
    this._lastVersion = {
      version,
      receivedTime: Date.now()
    };
    return version;
  }
}
exports.FlowVersion = FlowVersion;