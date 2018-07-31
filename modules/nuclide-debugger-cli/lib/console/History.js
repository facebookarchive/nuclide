/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */
export default class History {
  _maxItems: ?number;
  _removeDups: boolean;
  _items: string[];
  _nextItem: number;

  constructor(maxItems: ?number, removeDups: boolean) {
    this._maxItems = maxItems;
    this._removeDups = removeDups;
    this._items = [];
    this._nextItem = 0;
  }

  addItem(s: string): void {
    if (this._removeDups) {
      const existing = this._items.indexOf(s);
      if (existing !== -1) {
        // reorder the history so the one copy of the current item is the most
        // recent
        this._items.push(this._items.splice(existing, 1)[0]);
        return;
      }
    }

    if (this._items.length === this._maxItems) {
      this._items.shift();
    }
    this._items.push(s);
  }

  resetSearch(): void {
    this._nextItem = this._items.length;
  }

  previousItem(): ?string {
    if (this._nextItem > 0) {
      --this._nextItem;
      return this._items[this._nextItem];
    }
    return null;
  }

  nextItem(): ?string {
    if (this._nextItem < this._items.length) {
      this._nextItem++;
      return this._items[this._nextItem];
    }
    return null;
  }
}
