"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _heap() {
  const data = _interopRequireDefault(require("heap"));

  _heap = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

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
class TopScores {
  constructor(capacity) {
    this._capacity = capacity;
    this._full = false;
    this._heap = new (_heap().default)(_utils().inverseScoreComparator);
    this._min = null;
  }

  insert(score) {
    if (this._full && this._min) {
      const cmp = (0, _utils().scoreComparator)(score, this._min);

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

    array.sort(_utils().scoreComparator);
    return array;
  }

}

exports.default = TopScores;