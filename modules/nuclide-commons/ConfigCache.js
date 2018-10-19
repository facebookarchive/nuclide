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
    if (this._searchStrategy === 'eclipse') {
      const configDirs = await Promise.all(this._configPatterns.map(configFile => _fsPromise().default.findFurthestFile(configFile, path)));
      return configDirs.filter(Boolean).reduce((previous, configDir) => {
        if (previous == null || configDir.length < previous.length) {
          return configDir;
        }

        return previous;
      }, null);
    } else if (this._searchStrategy === 'thrift') {
      // Find the first occurrence of a config segment in the path.
      const pathSplit = _nuclideUri().default.split(path);

      return this._configPatterns.map(configPattern => {
        const configSplit = _nuclideUri().default.split(configPattern);

        const foundIndex = (0, _collection().findSubArrayIndex)(pathSplit, configSplit);
        return foundIndex !== -1 ? _nuclideUri().default.join(...pathSplit.slice(0, foundIndex + configSplit.length)) : null;
      }).find(Boolean);
    } else if (this._searchStrategy === 'ocaml') {
      // ocaml-language-server (the LSP server) is the same single LSP server binary
      // for all ocaml projects and for all versions of merlin.
      //
      // It uses initializationOptions.path.ocamlmerlin from the initialize request
      // (or just the string "ocamlmerlin" if that was absent) to determine what
      // command to use for spawning merlin. (merlin itself has no notion of project root).
      //
      // It also uses projectRoot, but solely to customize which merlin binary to launch:
      // if it finds projectRoot/node_modules/.cache/_esy/build/bin/command-exec[.bat]
      // then it will launch "command-exec <ocamlmerlin>"; otherwise it just launches <ocamlmerlin>
      // using projectRoot as the current working directory.
      //
      // Therefore: to find project root for a given file, we'll either use the nearest
      // containing parent such that directory parent/node_modules/.cache/_esy/build/bin exists,
      // or "/" otherwise.
      let dir = _nuclideUri().default.dirname(path);

      while (true) {
        const wrapper = _nuclideUri().default.join(dir, 'node_modules', '.cache', '_esy', 'build', 'bin'); // eslint-disable-next-line no-await-in-loop


        if (await _fsPromise().default.exists(wrapper)) {
          return dir;
        } else if (_nuclideUri().default.isRoot(dir)) {
          return dir;
        } else {
          dir = _nuclideUri().default.dirname(dir);
        }
      }
    } else if (this._searchStrategy === 'aurora') {
      const candidateDir = await _fsPromise().default.findNearestFile('.hhconfig', path);

      if (candidateDir != null && (await _fsPromise().default.exists(_nuclideUri().default.join(candidateDir, '.arcconfig')))) {
        return candidateDir;
      }

      return null;
    } else {
      this._searchStrategy; // Find the result with the greatest length (the closest match).

      const configDirs = await Promise.all(this._configPatterns.map(configFile => _fsPromise().default.findNearestFile(configFile, path)));
      return configDirs.filter(Boolean).reduce((previous, configDir) => {
        if (previous == null || configDir.length > previous.length) {
          return configDir;
        }

        return previous;
      }, null);
    }
  }

  dispose() {
    this._configCache.reset();
  }

}

exports.ConfigCache = ConfigCache;