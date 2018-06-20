'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */

/**
 * Class for processing text at determining if the last character is inside a
 * certain parenthesis.
 */
class ParenthesisCounter {
  constructor() {
    this._count = 0;
  }

  process(text) {
    for (const c of text) {
      this._count += this._getParenthesisCount(c);
    }
  }

  _getParenthesisCount(char) {
    switch (char) {
      case '<':
      case '[':
      case '(':
        return +1;
      case '>':
      case ']':
      case ')':
        return -1;
      default:
        return 0;
    }
  }

  isInsideParenthesis() {
    return this._count !== 0;
  }
}
exports.ParenthesisCounter = ParenthesisCounter;