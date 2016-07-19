'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Get a hash for the provider object. Hashes are unique per-hasher, so if you have two different
 * hashers, there is no guarantee that they will give the same hash for the same object.
 *
 * One use case for this is with lists of React elements. Just create a hasher and use the hash as
 * a key:
 *
 *    class MyComponent extends React.Component {
 *      constructor(props) {
 *        super(props);
 *        this._hasher = new Hasher();
 *      }
 *      render() {
 *        return this.props.items.map(item => (
 *          <ItemView key={this._hasher.getHash(item)} model={item} />
 *        ));
 *      }
 *    }
 */
export default class Hasher<K> {
  _hashes: WeakMap<K, number>;
  _nextHash: number;

  constructor() {
    this._hashes = new WeakMap();
    this._nextHash = 0;
  }

  getHash(item: K): number {
    let hash = this._hashes.get(item);
    if (hash == null) {
      hash = this._nextHash;
      this._hashes.set(item, hash);
      this._nextHash = hash + 1 === Number.MAX_SAFE_INTEGER ? Number.MIN_SAFE_INTEGER : hash + 1;
    }
    return hash;
  }
}
