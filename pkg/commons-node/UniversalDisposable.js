'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});


/**
 * Like a CompositeDisposable, but in addition to Disposable instances it can
 * also accept plain functions and Rx subscriptions.
 */
let UniversalDisposable = class UniversalDisposable {

  constructor() {
    for (var _len = arguments.length, tearDowns = Array(_len), _key = 0; _key < _len; _key++) {
      tearDowns[_key] = arguments[_key];
    }

    this._tearDowns = new Set(tearDowns);
    this.wasDisposed = false;
  }

  add() {
    if (this.wasDisposed) {
      return;
    }

    for (var _len2 = arguments.length, tearDowns = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      tearDowns[_key2] = arguments[_key2];
    }

    tearDowns.forEach(td => this._tearDowns.add(td));
  }

  remove() {
    if (this.wasDisposed) {
      return;
    }

    for (var _len3 = arguments.length, tearDowns = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      tearDowns[_key3] = arguments[_key3];
    }

    tearDowns.forEach(td => this._tearDowns.delete(td));
  }

  dispose() {
    if (this.wasDisposed) {
      return;
    }

    this._tearDowns.forEach(t => {
      if (typeof t === 'function') {
        t();
      } else if (typeof t.dispose === 'function') {
        t.dispose();
      } else if (typeof t.unsubscribe === 'function') {
        t.unsubscribe();
      }
    });
    this._tearDowns.clear();
    this.wasDisposed = true;
  }

  unsubscribe() {
    this.dispose();
  }

  clear() {
    if (this.wasDisposed) {
      return;
    }

    this._tearDowns.clear();
  }
};
exports.default = UniversalDisposable;
module.exports = exports['default'];