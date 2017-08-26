"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class Cache {

  constructor(config = {}) {
    this.store = new Map();

    if (config.dispose != null) {
      this._dispose = config.dispose;
    }
    this._keyFactory = config.keyFactory != null ? config.keyFactory : keyArgs => keyArgs;
  }

  _getUnsafe(key) {
    return this.store.get(key);
  }

  getOrCreate(keyArgs, factory) {
    const key = this._keyFactory(keyArgs);
    if (this.store.has(key)) {
      return this._getUnsafe(key);
    }
    const value = factory();
    this.store.set(key, value);
    return value;
  }

  delete(keyArgs) {
    const key = this._keyFactory(keyArgs);
    if (this._dispose != null) {
      this._ifHas(key, this._dispose);
    }
    this.store.delete(key);
  }

  clear() {
    if (this._dispose != null) {
      this.store.forEach(this._dispose);
    }
    this.store.clear();
  }

  get(keyArgs) {
    return this.store.get(this._keyFactory(keyArgs));
  }

  set(keyArgs, value) {
    this.store.set(this._keyFactory(keyArgs), value);
  }

  ifHas(keyArgs, callback) {
    this._ifHas(this._keyFactory(keyArgs), callback);
  }

  _ifHas(key, callback) {
    if (this.store.has(key)) {
      callback(this._getUnsafe(key));
    }
  }

  keyForArgs(keyArgs) {
    return this._keyFactory(keyArgs);
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