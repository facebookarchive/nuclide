'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DISPOSE_VALUE = exports.Cache = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

// A Cache mapping keys to values which creates entries as they are requested.
class Cache {

  constructor(factory, disposeValue = value => {}) {
    this._values = new Map();
    this._factory = factory;
    this._disposeValue = disposeValue;
    this._entriesSubject = new _rxjsBundlesRxMinJs.Subject();
  }

  has(key) {
    return this._values.has(key);
  }

  get(key) {
    if (!this._values.has(key)) {
      const newValue = this._factory(key);
      this._values.set(key, newValue);
      this._entriesSubject.next([key, newValue]);
      return newValue;
    } else {
      // Cannot use invariant as ValueType may include null/undefined.
      return this._values.get(key);
    }
  }

  // After this method this._values.keys() === newKeys.
  // deletes all keys not in newKeys
  // gets all keys in newKeys
  setKeys(newKeys) {
    for (const existingKey of this._values.keys()) {
      if (!newKeys.has(existingKey)) {
        this.delete(existingKey);
      }
    }

    for (const newKey of newKeys) {
      this.get(newKey);
    }
  }

  keys() {
    return this._values.keys();
  }

  values() {
    return this._values.values();
  }

  observeValues() {
    return this.observeEntries().map(entry => entry[1]);
  }

  observeEntries() {
    return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.from(this._values.entries()), this._entriesSubject);
  }

  observeKeys() {
    return this.observeEntries().map(entry => entry[0]);
  }

  delete(key) {
    if (this.has(key)) {
      const value = this.get(key);
      this._values.delete(key);
      this._disposeValue(value);
      return true;
    } else {
      return false;
    }
  }

  clear() {
    // Defend against a dispose call removing elements from the Cache.
    const values = this._values;
    this._values = new Map();
    for (const value of values.values()) {
      this._disposeValue(value);
    }
  }

  dispose() {
    this.clear();
    this._entriesSubject.complete();
  }
}

exports.Cache = Cache; // Useful for optional second parameter to Cache constructor.
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const DISPOSE_VALUE = exports.DISPOSE_VALUE = value => {
  value.dispose();
};