'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenBuffer = undefined;

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('../../../../../modules/nuclide-commons/tokenized-text');
}

/**
 * An class that has useful methods for constructing the tokens to be displayed
 * in the outline tree.
 */
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

class TokenBuffer {

  constructor(tokens = []) {
    this._tokens = [...tokens];
  }

  append(...token) {
    this._tokens.push(...token);
    return this;
  }

  appendBreak(text) {
    this._tokens.push(text === ' ' ? (0, (_tokenizedText || _load_tokenizedText()).whitespace)(text) : (0, (_tokenizedText || _load_tokenizedText()).plain)(text));
    return this;
  }

  appendKeyword(text) {
    this._tokens.push((0, (_tokenizedText || _load_tokenizedText()).keyword)(text));
    return this;
  }

  toArray() {
    return this._tokens;
  }

  appendObjcParams(tokens) {
    return this.appendBreak(':').append(...tokens);
  }
}
exports.TokenBuffer = TokenBuffer;