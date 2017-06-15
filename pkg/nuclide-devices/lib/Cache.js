"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCache = createCache;
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

class Cache {
  constructor() {
    this.store = new Map();
  }

  getOrCreate(key, callback) {
    let cached = this.store.get(key);
    if (cached === undefined) {
      cached = callback();
      this.store.set(key, cached);
    }
    return cached;
  }
}

exports.Cache = Cache;
function createCache() {
  return new Cache();
}