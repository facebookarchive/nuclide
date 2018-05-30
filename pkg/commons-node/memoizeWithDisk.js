'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = memoizeWithDisk;

var _crypto = _interopRequireDefault(require('crypto'));

var _fs = _interopRequireDefault(require('fs'));

var _fsPlus;

function _load_fsPlus() {
  return _fsPlus = _interopRequireDefault(require('fs-plus'));
}

var _os = _interopRequireDefault(require('os'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../modules/nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CACHE_DIR = 'nuclide-cache'; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    * @format
                                    */

function getCachePath(key, cacheDir) {
  const sha1 = _crypto.default.createHash('sha1').update(key).digest('hex');
  if (cacheDir != null) {
    return (_nuclideUri || _load_nuclideUri()).default.join(cacheDir, sha1 + '.json');
  }
  return (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), CACHE_DIR, sha1 + '.json');
}

/**
 * Similar to lodash.memoize in that it caches the result of a function, but it'll work on disk.
 * Note that this is synchronous to preserve the original function signature, but there could
 * be an asynchronous version as well (though race conditions are tricky).
 *
 * Requirements:
 * - T must be JSON-serializable/deserializable.
 * - ArgsType must be either be JSON-serializable, or a keySelector must be provided which
 *   *does* return a JSON-serializable value.
 *   Unlike lodash.memoize, this uses the result of JSON.stringify(args) if no
 *   keySelector is provided.
 */
function memoizeWithDisk(func, keySelector, cacheDir) {
  return (...args) => {
    const key = keySelector != null ? keySelector(...args) : args;
    // Include the function string as well to prevent collisions from multiple functions.
    const fullKey = JSON.stringify([func.toString(), key]);
    const cachePath = getCachePath(fullKey, cacheDir);
    try {
      const cacheContents = _fs.default.readFileSync(cachePath, 'utf8');
      return JSON.parse(cacheContents);
    } catch (err) {
      // An error implies that the cached value does not exist.
      const result = func(...args);
      try {
        // fsPlus.writeFileSync creates the directory if necessary.
        (_fsPlus || _load_fsPlus()).default.writeFileSync(cachePath, JSON.stringify(result), 'utf8');
      } catch (_) {
        // Ignore errors here.
      }
      return result;
    }
  };
}