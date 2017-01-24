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
 * 
 */

// A simple heuristic for identifier names in JavaScript.
const JAVASCRIPT_IDENTIFIER_REGEX = exports.JAVASCRIPT_IDENTIFIER_REGEX = /[$_a-zA-Z][$_\w]*/g;

const JAVASCRIPT_WHOLE_STRING_IDENTIFIER_REGEX = exports.JAVASCRIPT_WHOLE_STRING_IDENTIFIER_REGEX = /^[$_a-zA-Z][$_\w]*$/;

const identifierOrNumber = '[a-zA-Z0-9_$]+';

function makeStrRegex(delimiter) {
  const d = delimiter;
  // Each run of four backslashes ends up as just one backslash. We need to escape once for the
  // string literal here, and once for the RegExp compilation.
  return `${ d }(\\\\.|[^${ d }\\\\])*${ d }`;
}

const strRegexes = ['`', "'", '"'].map(makeStrRegex);

const regexStrings = [].concat(strRegexes, [identifierOrNumber]).map(s => `(${ s })`);

const JAVASCRIPT_WORD_REGEX = exports.JAVASCRIPT_WORD_REGEX = new RegExp(regexStrings.join('|'), 'g');