"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCache = createCache;
function createCache() {
  const store = new Map();
  return {
    getOrCreate(key, callback) {
      let cached = store.get(key);
      if (cached === undefined) {
        cached = callback();
        store.set(key, cached);
      }
      return cached;
    }
  };
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