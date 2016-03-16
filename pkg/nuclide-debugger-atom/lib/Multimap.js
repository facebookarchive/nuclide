'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// TODO: pull this into nuclide-commons.
class Multimap<K, V> {
  /**
   * Invariant: the Set values are never empty.
   */
  _storage: Map<K, Set<V>>;

  constructor() {
    this._storage = new Map();
  }

  has(key: K): boolean {
    return this._storage.has(key);
  }

  hasEntry(key: K, value: V): boolean {
    const values = this._storage.get(key);
    if (values) {
      return values.has(value);
    }
    return false;
  }

  get(key: K): Set<V> {
    const set = this._storage.get(key);
    return new Set(set) || new Set();
  }

  delete(key: K, value: V): boolean {
    const set = this._storage.get(key);
    if (set) {
      const deleted = set.delete(value);
      if (set.size === 0) {
        this._storage.delete(key);
      }
      return deleted;
    }
    return false;
  }

  deleteAll(key: K): boolean {
    return this._storage.delete(key);
  }

  set(key: K, value: V): Multimap<K, V> {
    const set = this._storage.get(key);
    if (set) {
      set.add(value);
    } else {
      this._storage.set(key, new Set([value]));
    }
    return this;
  }

  forEach(callback: (value: V, key: K, obj: Multimap<K, V>) => void): void {
    this._storage.forEach((values, key) => values.forEach(value => callback(value, key, this)));
  }
}

module.exports = Multimap;
