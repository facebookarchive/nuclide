"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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

/**
 * Like a CompositeDisposable, but in addition to Disposable instances it can
 * also accept plain functions and Rx subscriptions.
 */
class UniversalDisposable {
  constructor(...teardowns) {
    this.teardowns = new Set();
    this.disposed = false;

    if (teardowns.length) {
      this.add(...teardowns);
    }
  }

  add(...teardowns) {
    if (this.disposed) {
      throw new Error('Cannot add to an already disposed UniversalDisposable!');
    }

    for (let i = 0; i < teardowns.length; i++) {
      assertTeardown(teardowns[i]);
      this.teardowns.add(teardowns[i]);
    }
  }
  /**
   * Adds a list of teardowns but also ties them to the lifetime of `destructible`.
   * When `destructible` is destroyed (or `this.dispose()` gets called, whichever comes first),
   * all `teardowns` provided are also disposed.
   *
   * This is a subtle pattern to get right because of two factors:
   * - we need to make sure that all teardowns are also removed on destroy
   * - we also need to ensure that we don't leak the onDidDestroy disposable
   */


  addUntilDestroyed(destructible, ...teardowns) {
    if (this.disposed) {
      throw new Error('Cannot add to an already disposed UniversalDisposable!');
    }

    const destroyDisposable = new UniversalDisposable(...teardowns, destructible.onDidDestroy(() => {
      destroyDisposable.dispose();
      this.remove(destroyDisposable);
    }));
    this.add(destroyDisposable);
  }

  remove(teardown) {
    if (!this.disposed) {
      this.teardowns.delete(teardown);
    }
  }

  dispose() {
    if (!this.disposed) {
      this.disposed = true;
      this.teardowns.forEach(teardown => {
        if (typeof teardown.dispose === 'function') {
          teardown.dispose();
        } else if (typeof teardown.unsubscribe === 'function') {
          teardown.unsubscribe();
        } else if (typeof teardown.destroy === 'function') {
          teardown.destroy();
        } else if (typeof teardown === 'function') {
          teardown();
        }
      });
      this.teardowns = null;
    }
  }

  unsubscribe() {
    this.dispose();
  }

  clear() {
    if (!this.disposed) {
      this.teardowns.clear();
    }
  }

}

exports.default = UniversalDisposable;

function assertTeardown(teardown) {
  if (typeof teardown.dispose === 'function' || typeof teardown.unsubscribe === 'function' || typeof teardown.destroy === 'function' || typeof teardown === 'function') {
    return;
  }

  throw new TypeError('Arguments to UniversalDisposable.add must be disposable');
}