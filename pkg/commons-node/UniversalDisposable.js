'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type AnyTeardown = (() => mixed) | rxjs$ISubscription | IDisposable;

/**
 * Like a CompositeDisposable, but in addition to Disposable instances it can
 * also accept plain functions and Rx subscriptions.
 */
export default class UniversalDisposable {
  _tearDowns: Set<AnyTeardown>;
  wasDisposed: boolean;

  constructor(...tearDowns: Array<AnyTeardown>) {
    this._tearDowns = new Set(tearDowns);
    this.wasDisposed = false;
  }

  add(...tearDowns: Array<AnyTeardown>): void {
    if (this.wasDisposed) {
      return;
    }

    tearDowns.forEach(td => this._tearDowns.add(td));
  }

  remove(...tearDowns: Array<AnyTeardown>): void {
    if (this.wasDisposed) {
      return;
    }

    tearDowns.forEach(td => this._tearDowns.delete(td));
  }

  dispose(): void {
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

  unsubscribe(): void {
    this.dispose();
  }

  clear(): void {
    if (this.wasDisposed) {
      return;
    }

    this._tearDowns.clear();
  }
}
