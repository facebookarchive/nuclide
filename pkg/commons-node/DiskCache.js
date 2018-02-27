'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A simple cache that has the ability to persist itself from/to disk.
 * Values must be JSON-serializable.
 */
class DiskCache {
  // Use a plain object for faster loading/saving.
  // We'll be careful to use an Object without a prototype below.
  constructor(cachePath, cacheKeyFunc) {
    // Flow (rightfully) does not consider Object.create(null) as a real Object.
    // Fortunately we don't need to make use of any Object.prototype methods here.
    // $FlowIgnore
    this._cache = Object.create(null);
    this._cacheKeyFunc = cacheKeyFunc;
    this._cachePath = cachePath;
    this._byteSize = 0;
  }

  getPath() {
    return this._cachePath;
  }

  /**
   * Returns the size, in bytes, of the most recently serialized value.
   */
  getByteSize() {
    return this._byteSize;
  }

  /**
   * Attempts to load the cache from disk.
   * Returns false if the cache no longer exists, or is corrupt.
   */
  load() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        const data = yield (_fsPromise || _load_fsPromise()).default.readFile(_this._cachePath, 'utf8');
        _this._byteSize = data.length;
        // Make sure we don't pick up any Object prototype methods.
        _this._cache = Object.assign(Object.create(null), JSON.parse(data));
        return true;
      } catch (err) {
        return false;
      }
    })();
  }

  save() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        const data = JSON.stringify(_this2._cache);
        _this2._byteSize = data.length;
        yield (_fsPromise || _load_fsPromise()).default.writeFileAtomic(_this2._cachePath, data);
        return true;
      } catch (err) {
        return false;
      }
    })();
  }

  get(key) {
    return this._cache[this._cacheKeyFunc(key)];
  }

  set(key, value) {
    this._cache[this._cacheKeyFunc(key)] = value;
  }
}
exports.default = DiskCache; /**
                              * Copyright (c) 2015-present, Facebook, Inc.
                              * All rights reserved.
                              *
                              * This source code is licensed under the license found in the LICENSE file in
                              * the root directory of this source tree.
                              *
                              * 
                              * @format
                              */