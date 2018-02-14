'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Matcher = undefined;

var _QueryItem;

function _load_QueryItem() {
  return _QueryItem = _interopRequireDefault(require('./QueryItem'));
}

var _TopScores;

function _load_TopScores() {
  return _TopScores = _interopRequireDefault(require('./TopScores'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Fallback `Matcher` class compatible with the fuzzy-native implementation.
 * Note that the scores are different: 0 represents the best match while larger numbers are worse.
 */
class Matcher {

  constructor(candidates) {
    this.setCandidates(candidates);
  }

  /**
   * Note: caseSensitive, numThreads, and recordMatchIndexes will be ignored.
   */
  match(query, options = {}) {
    const topScores = new (_TopScores || _load_TopScores()).default(options.maxResults || 0);
    this._queryItems.forEach(item => {
      const score = item.score(query);
      if (score != null) {
        topScores.insert(score);
      }
    });
    return topScores.getTopScores();
  }

  addCandidates(candidates) {
    candidates.forEach(candidate => {
      this._queryItems.set(candidate, new (_QueryItem || _load_QueryItem()).default(candidate));
    });
  }

  removeCandidates(candidates) {
    candidates.forEach(candidate => {
      this._queryItems.delete(candidate);
    });
  }

  setCandidates(candidates) {
    this._queryItems = new Map();
    this.addCandidates(candidates);
  }
}
exports.Matcher = Matcher; /**
                            * Copyright (c) 2015-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the license found in the LICENSE file in
                            * the root directory of this source tree.
                            *
                            * 
                            * @format
                            */