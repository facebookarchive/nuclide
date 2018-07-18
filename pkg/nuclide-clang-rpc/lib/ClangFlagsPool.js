"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
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
 * 
 * @format
 */
function flagsAreEqual(left, right) {
  return left.directory === right.directory && left.flagsFile === right.flagsFile && (0, _collection().arrayEqual)(left.flags, right.flags);
}

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
    (0, _nuclideAnalytics().track)('nuclide-clang.flag-pool', {
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