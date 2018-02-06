/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

/**
 * Class for processing text at determining if the last character is inside a
 * certain parenthesis.
 */
export class ParenthesisCounter {
  _count = 0;

  process(text: string) {
    for (const c of text) {
      this._count += this._getParenthesisCount(c);
    }
  }

  _getParenthesisCount(char: string): number {
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

  isInsideParenthesis(): boolean {
    return this._count !== 0;
  }
}
