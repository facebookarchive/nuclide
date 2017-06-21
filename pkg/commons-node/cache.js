"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

/**
 * Tiny class that is useful to cache simple values.
 * It's quite useful for promises with a Cache<Promise<T>> which allows reusing the same promise.
 */

class Cache {

  constructor() {
    this.store = new Map();
  }

  getOrCreate(key, callback) {
    if (this.store.has(key)) {
      // We need this cast because of undefined
      return this.store.get(key);
    }
    const value = callback();
    this.store.set(key, value);
    return value;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}
exports.Cache = Cache;