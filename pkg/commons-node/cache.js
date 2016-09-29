'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


// A Cache mapping keys to values which creates entries as they are requested.
export class Cache<KeyType, ValueType> {
  _values: Map<KeyType, ValueType>;
  _factory: (key: KeyType) => ValueType;
  _disposeValue: (value: ValueType) => mixed;

  constructor(
    factory: (key: KeyType) => ValueType,
    disposeValue: (value: ValueType) => mixed = value => {},
  ) {
    this._values = new Map();
    this._factory = factory;
    this._disposeValue = disposeValue;
  }

  has(key: KeyType): boolean {
    return this._values.has(key);
  }

  get(key: KeyType): ValueType {
    if (!this._values.has(key)) {
      const newValue = this._factory(key);
      this._values.set(key, newValue);
      return newValue;
    } else {
      // Cannot use invariant as ValueType may include null/undefined.
      return (this._values.get(key): any);
    }
  }

  values(): Iterator<ValueType> {
    return this._values.values();
  }

  delete(key: KeyType): boolean {
    if (this.has(key)) {
      const value = this.get(key);
      this._values.delete(key);
      this._disposeValue(value);
      return true;
    } else {
      return false;
    }
  }

  clear(): void {
    // Defend against a dispose call removing elements from the Cache.
    const values = this._values;
    this._values = new Map();
    for (const value of values.values()) {
      this._disposeValue(value);
    }
  }

  dispose(): void {
    this.clear();
  }
}

// Useful for optional second parameter to Cache constructor.
export const DISPOSE_VALUE = (value: IDisposable) => { value.dispose; };
