'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _heap;

function _load_heap() {
  return _heap = _interopRequireDefault(require('heap'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This data structure is designed to hold the top K scores from a collection of
 * N scores where scores become available one at a time. The expectation is that
 * N will be much, much greater than K.
 *
 * insert() is O(lg K)
 * getTopScores() is O(K lg K)
 *
 * Therefore, finding the top K scores from a collection of N elements should be
 * O(N lg K).
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class TopScores {

  constructor(capacity) {
    this._capacity = capacity;
    this._full = false;
    this._heap = new (_heap || _load_heap()).default((_utils || _load_utils()).inverseScoreComparator);
    this._min = null;
  }

  insert(score) {
    if (this._full && this._min) {
      const cmp = (0, (_utils || _load_utils()).scoreComparator)(score, this._min);
      if (cmp < 0) {
        this._doInsert(score);
      }
    } else {
      this._doInsert(score);
    }
  }

  _doInsert(score) {
    if (this._full) {
      this._heap.replace(score);
    } else {
      this._heap.insert(score);
      this._full = this._heap.size() === this._capacity;
    }
    this._min = this._heap.peek();
  }

  getSize() {
    return this._heap.size();
  }

  /**
   * @return an Array where Scores will be sorted in ascending order.
   */
  getTopScores() {
    const array = this._heap.toArray();
    array.sort((_utils || _load_utils()).scoreComparator);
    return array;
  }
}
exports.default = TopScores;