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

export class Cache<T> {
  store: Map<string, T> = new Map();

  constructor() {}

  getOrCreate(key: string, callback: () => T): T {
    if (this.store.has(key)) {
      // We need this cast because of undefined
      return ((this.store.get(key): any): T);
    }
    const value = callback();
    this.store.set(key, value);
    return value;
  }
}
