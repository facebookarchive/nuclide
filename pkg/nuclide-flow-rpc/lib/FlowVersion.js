'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowVersion = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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
 * 
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

  satisfies(range) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const version = yield _this.getVersion();
      if (version == null) {
        return false;
      }
      return (_semver || _load_semver()).default.satisfies(version, range);
    })();
  }

  getVersion() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const lastVersion = _this2._lastVersion;
      if (lastVersion == null) {
        return _this2._queryAndSetVersion();
      }
      const msSinceReceived = Date.now() - lastVersion.receivedTime;
      if (msSinceReceived >= (_FlowConstants || _load_FlowConstants()).VERSION_TIMEOUT_MS) {
        return _this2._queryAndSetVersion();
      }
      return lastVersion.version;
    })();
  }

  _queryAndSetVersion() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const version = yield _this3._versionFn();
      _this3._lastVersion = {
        version,
        receivedTime: Date.now()
      };
      return version;
    })();
  }
}
exports.FlowVersion = FlowVersion;