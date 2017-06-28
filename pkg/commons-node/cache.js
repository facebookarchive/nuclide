"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class Cache {

  constructor(dispose) {
    this.store = new Map();

    if (dispose != null) {
      this._dispose = dispose;
    }
  }

  _getWhenExists(key) {
    return this.store.get(key);
  }

  getOrCreate(key, factory) {
    if (this.store.has(key)) {
      return this._getWhenExists(key);
    }
    const value = factory();
    this.store.set(key, value);
    return value;
  }

  delete(key) {
    if (this._dispose != null) {
      this.ifHas(key, this._dispose);
    }
    this.store.delete(key);
  }

  clear() {
    if (this._dispose != null) {
      this.store.forEach(this._dispose);
    }
    this.store.clear();
  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value) {
    this.store.set(key, value);
  }

  ifHas(key, callback) {
    if (this.store.has(key)) {
      callback(this._getWhenExists(key));
    }
  }
}
exports.Cache = Cache; /**
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