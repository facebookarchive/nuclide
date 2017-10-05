'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfigCache = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('./fsPromise'));
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
 * 
 * @format
 */

class ConfigCache {

  constructor(configFileNames) {
    this._configFileNames = configFileNames;
    this._configCache = (0, (_lruCache || _load_lruCache()).default)({
      max: 200, // Want this to exceed the maximum expected number of open files + dirs.
      maxAge: 1000 * 30 });
  }

  getConfigDir(path) {
    let result = this._configCache.get(path);
    if (result == null) {
      result = this._findConfigDir(path);
      this._configCache.set(path, result);
    }
    return result;
  }

  _findConfigDir(path) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const configDirs = yield Promise.all(_this._configFileNames.map(function (configFile) {
        return (_fsPromise || _load_fsPromise()).default.findNearestFile(configFile, path);
      }));
      // Find the result with the greatest length (the closest match).
      return configDirs.filter(Boolean).reduce(function (previous, configDir) {
        if (previous == null || configDir.length > previous.length) {
          return configDir;
        }
        return previous;
      }, null);
    })();
  }

  dispose() {
    this._configCache.reset();
  }
}
exports.ConfigCache = ConfigCache;