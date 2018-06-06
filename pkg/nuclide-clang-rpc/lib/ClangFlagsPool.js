'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

// Currently handles are just indices into the flag pool.
function flagsAreEqual(left, right) {
  return left.directory === right.directory && left.flagsFile === right.flagsFile && (0, (_collection || _load_collection()).arrayEqual)(left.flags, right.flags);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

class ClangFlagsPool {
  constructor() {
    this._pool = [];
    this._totalFlags = 0;
  }

  getHandle(flags) {
    this._totalFlags++;
    const index = this._pool.findIndex(candidate => flagsAreEqual(flags, candidate));
    if (index !== -1) {
      return index;
    } else {
      this._pool.push(flags);
      return this._pool.length - 1;
    }
  }

  getFlags(handle) {
    // Remark: out of bounds array access will return `undefined.`
    return this._pool[handle];
  }

  trackStats() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-clang.flag-pool', {
      totalFlags: this._totalFlags,
      totalHandles: this._pool.length
    });
  }

  reset() {
    // This method of clearing the pool only works because the clang flags
    // manager also clears its Handle references at the same time.
    // Ideally we would include a version token in the Handle struct during
    // getHandle and match that against an internal version in getFlags.
    this._pool = [];
    this._totalFlags = 0;
  }
}
exports.default = ClangFlagsPool;