'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var Heap = require('heap');

import type {Score} from './Score';

var {
  scoreComparator,
  inverseScoreComparator,
} = require('./utils');

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
  _capacity: number;
  _full: boolean;
  _min: ?Score;

  constructor(capacity: number) {
    this._capacity = capacity;
    this._full = false;
    this._heap = new Heap(scoreComparator);
    this._min = null;
  }

  insert(score: Score) {
    if (this._full) {
      var cmp = scoreComparator(score, this._min);
      if (cmp > 0) {
        this._doInsert(score);
      }
    } else {
      this._doInsert(score);
    }
  }

  _doInsert(score: Score) {
    if (this._full) {
      this._heap.replace(score);
    } else {
      this._heap.insert(score);
      this._full = this._heap.size() === this._capacity;
    }
    this._min = this._heap.peek();
  }

  /**
   * @return an Array where Scores will be sorted in descending order.
   */
  getTopScores(): Array<Score> {
    var array = this._heap.toArray();
    array.sort(inverseScoreComparator);
    return array;
  }
}

module.exports = TopScores;
