Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var JS_GRAMMARS = Object.freeze(['source.js', 'source.js.jsx']);

exports.JS_GRAMMARS = JS_GRAMMARS;
var identifierOrNumber = '[a-zA-Z0-9_$]+';

function makeStrRegex(delimiter) {
  var d = delimiter;
  // Each run of four backslashes ends up as just one backslash. We need to escape once for the
  // string literal here, and once for the RegExp compilation.
  return d + '(\\\\.|[^' + d + '\\\\])*' + d;
}

var strRegexes = ['`', "'", '"'].map(makeStrRegex);

var regexStrings = [].concat(strRegexes, [identifierOrNumber]).map(function (s) {
  return '(' + s + ')';
});

var JAVASCRIPT_WORD_REGEX = new RegExp(regexStrings.join('|'), 'g');

exports.JAVASCRIPT_WORD_REGEX = JAVASCRIPT_WORD_REGEX;
// A simple heuristic for identifier names in JavaScript.
var JAVASCRIPT_IDENTIFIER_REGEX = /[\$_a-zA-Z][\$_\w]*/gi;
exports.JAVASCRIPT_IDENTIFIER_REGEX = JAVASCRIPT_IDENTIFIER_REGEX;