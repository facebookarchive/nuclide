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

export type Cache<T> = {
  getOrCreate(key: string, callback: () => T): T,
};

export function createCache<T>(): Cache<T> {
  const store: Map<string, T> = new Map();
  return {
    getOrCreate(key: string, callback: () => T): T {
      let cached = store.get(key);
      if (cached === undefined) {
        cached = callback();
        store.set(key, cached);
      }
      return cached;
    },
  };
}
