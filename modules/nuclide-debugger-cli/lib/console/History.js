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
 *  strict
 * @format
 */
class History {
  constructor(maxItems, removeDups) {
    this._maxItems = maxItems;
    this._removeDups = removeDups;
    this._items = [];
    this._nextItem = 0;
  }

  addItem(s) {
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

  resetSearch() {
    this._nextItem = this._items.length;
  }

  previousItem() {
    if (this._nextItem > 0) {
      --this._nextItem;
      return this._items[this._nextItem];
    }

    return null;
  }

  nextItem() {
    if (this._nextItem < this._items.length) {
      this._nextItem++;
      return this._items[this._nextItem];
    }

    return null;
  }

}

exports.default = History;