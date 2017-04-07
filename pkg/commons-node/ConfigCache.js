'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfigCache = undefined;

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
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class ConfigCache {

  constructor(configFileName) {
    this._configFileName = configFileName;
    this._configCache = (0, (_lruCache || _load_lruCache()).default)({
      max: 200, // Want this to exceed the maximum expected number of open files + dirs.
      maxAge: 1000 * 30 });
  }

  getConfigDir(path) {
    if (!this._configCache.has(path)) {
      const result = (_fsPromise || _load_fsPromise()).default.findNearestFile(this._configFileName, path);
      this._configCache.set(path, result);
      return result;
    }
    return this._configCache.get(path);
  }

  dispose() {
    this._configCache.reset();
  }
}
exports.ConfigCache = ConfigCache;