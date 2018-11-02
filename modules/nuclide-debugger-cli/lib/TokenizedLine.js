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
class TokenizedLine {
  constructor(line) {
    this._line = line;

    this._tokenize(line);
  } // return all tokens, with start indices


  tokens() {
    return this._tokens;
  } // return just string tokens


  stringTokens() {
    return this._tokens.map(t => t.token);
  } // return the rest of the line, starting with the indexed token


  rest(idx) {
    if (idx >= this._tokens.length) {
      return '';
    }

    return this._line.substr(this._tokens[idx].start);
  }

  str() {
    return `Line: [${this._line}]\nTokens:\n${this._tokens.map(t => `[${t.token}]@${t.start}`).join('\n')}`;
  }

  _tokenize(line) {
    this._tokens = [];
    let token = '';
    let quoted = false;
    let start = 0;

    for (let i = 0; i < line.length; i++) {
      const c = line.substr(i, 1);

      if (c === "'") {
        if (quoted) {
          if (token !== '') {
            this._tokens.push({
              start: start - 1,
              token
            });
          }

          token = '';
          quoted = false;
          continue;
        }

        if (token !== '') {
          this._tokens.push({
            start,
            token
          });

          token = '';
        }

        quoted = true;
        start = i + 1;
        continue;
      }

      if (quoted) {
        token += c;
        continue;
      }

      if (c === ' ' || c === '\t') {
        if (token !== '') {
          this._tokens.push({
            start,
            token
          });

          token = '';
        }

        start = i + 1;
        continue;
      }

      token += c;
    }

    if (token !== '') {
      this._tokens.push({
        start,
        token
      });
    }
  }

}

exports.default = TokenizedLine;