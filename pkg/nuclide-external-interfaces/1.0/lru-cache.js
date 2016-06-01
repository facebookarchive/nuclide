/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

declare module 'lru-cache' {

  declare type LRUCache<K, V> = {
    set: (key: K, value: V, maxAge?: number) => void;
    get: (key: K) => V;
    peek: (key: K) => V;
    del: (key: K) => void;
    reset: () => void;
    has: (key: K) => boolean;
    // TODO add the rest of the things documented at https://www.npmjs.com/package/lru-cache
  };

  declare type Options<K, V> = {
    max?: number;
    maxAge?: number;
    length?: (value: V, key: K) => number;
    dispose?: (key: K, value: V) => void;
    stale?: boolean;
  };

  declare var exports: <K, V>(options: Options<K, V>) => LRUCache<K, V>;
}
