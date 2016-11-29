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
class UniversalDisposable {

  constructor(...tearDowns) {
    this._tearDowns = new Set(tearDowns);
    this.wasDisposed = false;
  }

  add(...tearDowns) {
    if (this.wasDisposed) {
      return;
    }

    tearDowns.forEach(td => this._tearDowns.add(td));
  }

  remove(...tearDowns) {
    if (this.wasDisposed) {
      return;
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
}
exports.default = UniversalDisposable;
module.exports = exports['default'];