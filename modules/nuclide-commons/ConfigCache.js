"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfigCache = void 0;

function _lruCache() {
  const data = _interopRequireDefault(require("lru-cache"));

  _lruCache = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("./collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("./fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("./nuclideUri"));

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
class ConfigCache {
  constructor(configPatterns, searchStrategy = 'nearest') {
    this._configPatterns = configPatterns;
    this._searchStrategy = searchStrategy;
    this._configCache = (0, _lruCache().default)({
      max: 200,
      // Want this to exceed the maximum expected number of open files + dirs.
      maxAge: 1000 * 30 // 30 seconds

    });
  }

  getConfigDir(path) {
    let result = this._configCache.get(path);

    if (result == null) {
      result = this._findConfigDir(path);

      this._configCache.set(path, result);
    }

    return result;
  }

  async _findConfigDir(path) {
    const configDirs = await Promise.all(this._configPatterns.map(configFile => {
      if (this._searchStrategy === 'furthest') {
        return _fsPromise().default.findFurthestFile(configFile, path);
      } else {
        return _fsPromise().default.findNearestFile(configFile, path);
      }
    }));

    if (this._searchStrategy === 'nearest') {
      // Find the result with the greatest length (the closest match).
      return configDirs.filter(Boolean).reduce((previous, configDir) => {
        if (previous == null || configDir.length > previous.length) {
          return configDir;
        }

        return previous;
      }, null);
    } else if (this._searchStrategy === 'furthest') {
      return configDirs.filter(Boolean).reduce((previous, configDir) => {
        if (previous == null || configDir.length < previous.length) {
          return configDir;
        }

        return previous;
      }, null);
    } else if (this._searchStrategy === 'pathMatch') {
      // Find the first occurrence of a config segment in the path.
      const pathSplit = _nuclideUri().default.split(path);

      return this._configPatterns.map(configPattern => {
        const configSplit = _nuclideUri().default.split(configPattern);

        const foundIndex = (0, _collection().findSubArrayIndex)(pathSplit, configSplit);
        return foundIndex !== -1 ? _nuclideUri().default.join(...pathSplit.slice(0, foundIndex + configSplit.length)) : null;
      }).find(Boolean);
    } else {
      // Find the first match.
      return configDirs.find(Boolean);
    }
  }

  dispose() {
    this._configCache.reset();
  }

}

exports.ConfigCache = ConfigCache;