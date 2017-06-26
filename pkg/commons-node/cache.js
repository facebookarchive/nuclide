/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

/**
 * Tiny class that is useful to cache simple values.
 * It's quite useful for promises with a Cache<Promise<T>> which allows reusing the same promise.
 */

type DisposeCallback<T> = (value: T) => void;

export class Cache<T> {
  store: Map<string, T> = new Map();
  _dispose: ?DisposeCallback<T>;

  constructor(dispose?: DisposeCallback<T>) {
    if (dispose != null) {
      this._dispose = dispose;
    }
  }

  _getWhenExists(key: string): T {
    return ((this.store.get(key): any): T);
  }

  getOrCreate(key: string, factory: () => T): T {
    if (this.store.has(key)) {
      return this._getWhenExists(key);
    }
    const value = factory();
    this.store.set(key, value);
    return value;
  }

  delete(key: string): void {
    if (this._dispose != null) {
      this.ifHas(key, this._dispose);
    }
    this.store.delete(key);
  }

  clear(): void {
    if (this._dispose != null) {
      this.store.forEach(this._dispose);
    }
    this.store.clear();
  }

  get(key: string): ?T {
    return this.store.get(key);
  }

  set(key: string, value: T): void {
    this.store.set(key, value);
  }

  ifHas(key: string, callback: (value: T) => void) {
    if (this.store.has(key)) {
      callback(this._getWhenExists(key));
    }
  }
}
