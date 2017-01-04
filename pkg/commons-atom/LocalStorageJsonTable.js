'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LocalStorageJsonTable = undefined;

var _observable;

function _load_observable() {
  return _observable = require('../commons-node/observable');
}

class LocalStorageJsonTable {

  constructor(localStorageKey) {
    this._localStorageKey = localStorageKey;
  }

  _open() {
    if (this._db == null) {
      const json = localStorage.getItem(this._localStorageKey);
      let db;
      if (json != null && json !== '') {
        try {
          db = JSON.parse(json);
        } catch (err) {}
      }
      this._db = Array.isArray(db) ? db : [];
      // Clear the cache after this frame. We have to do this because other windows might be
      // interacting with the database too.
      if (this._clearCacheSubscription == null) {
        this._clearCacheSubscription = (_observable || _load_observable()).nextAnimationFrame.subscribe(() => {
          this._db = null;
          this._clearCacheSubscription = null;
        });
      }
    }
    return this._db;
  }

  dispose() {
    if (this._clearCacheSubscription != null) {
      this._clearCacheSubscription.unsubscribe();
    }
  }

  setItem(key, value) {
    let db = this._open();
    const matchIndex = db.findIndex(({ key: k }) => k === key);
    // If nothing changed, we don't have to do anything.
    if (matchIndex !== -1 && matchIndex === db.length - 1) {
      const previousValue = db[matchIndex].value;
      if (value === previousValue) {
        return;
      }
    }
    db.splice(matchIndex, 1);
    db.push({ key, value });
    db = db.slice(-100); // Only keep the most recent 100 entries.
    localStorage.setItem(this._localStorageKey, JSON.stringify(db));
  }

  getItem(key) {
    const db = this._open();
    const entry = db.find(({ key: k }) => key === k);
    return entry == null ? null : entry.value;
  }

  getEntries() {
    return this._open().slice();
  }
}
exports.LocalStorageJsonTable = LocalStorageJsonTable; /**
                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                        * All rights reserved.
                                                        *
                                                        * This source code is licensed under the license found in the LICENSE file in
                                                        * the root directory of this source tree.
                                                        *
                                                        * 
                                                        */

/* global localStorage */