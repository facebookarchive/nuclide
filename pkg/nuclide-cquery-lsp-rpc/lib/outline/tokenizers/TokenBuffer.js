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

import type {TextToken} from 'nuclide-commons/tokenized-text';

import {keyword, whitespace, plain} from 'nuclide-commons/tokenized-text';

/**
 * An class that has useful methods for constructing the tokens to be displayed
 * in the outline tree.
 */
export class TokenBuffer {
  _tokens: TextToken[];

  constructor(tokens: TextToken[] = []) {
    this._tokens = [...tokens];
  }

  append(...token: TextToken[]): TokenBuffer {
    this._tokens.push(...token);
    return this;
  }

  appendBreak(text: string): TokenBuffer {
    this._tokens.push(text === ' ' ? whitespace(text) : plain(text));
    return this;
  }

  appendKeyword(text: string): TokenBuffer {
    this._tokens.push(keyword(text));
    return this;
  }

  toArray(): TextToken[] {
    return this._tokens;
  }

  appendObjcParams(tokens: TextToken[]): TokenBuffer {
    return this.appendBreak(':').append(...tokens);
  }
}
