"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Matcher = void 0;

function _QueryItem() {
  const data = _interopRequireDefault(require("./QueryItem"));

  _QueryItem = function () {
    return data;
  };

  return data;
}

function _TopScores() {
  const data = _interopRequireDefault(require("./TopScores"));

  _TopScores = function () {
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
 *  strict-local
 * @format
 */

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
    const topScores = new (_TopScores().default)(options.maxResults || 0);

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
      this._queryItems.set(candidate, new (_QueryItem().default)(candidate));
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

exports.Matcher = Matcher;