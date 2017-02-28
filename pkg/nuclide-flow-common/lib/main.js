'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JAVASCRIPT_WORD_REGEX = exports.JAVASCRIPT_WHOLE_STRING_IDENTIFIER_REGEX = exports.JAVASCRIPT_IDENTIFIER_REGEX = undefined;
exports.getReplacementPrefix = getReplacementPrefix;
exports.shouldFilter = shouldFilter;
exports.filterResultsByPrefix = filterResultsByPrefix;

var _fuzzaldrinPlus;

function _load_fuzzaldrinPlus() {
  return _fuzzaldrinPlus = _interopRequireDefault(require('fuzzaldrin-plus'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// A simple heuristic for identifier names in JavaScript.
const JAVASCRIPT_IDENTIFIER_REGEX = exports.JAVASCRIPT_IDENTIFIER_REGEX = /[$_a-zA-Z][$_\w]*/g; /**
                                                                                                 * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                 * All rights reserved.
                                                                                                 *
                                                                                                 * This source code is licensed under the license found in the LICENSE file in
                                                                                                 * the root directory of this source tree.
                                                                                                 *
                                                                                                 * 
                                                                                                 */

const JAVASCRIPT_WHOLE_STRING_IDENTIFIER_REGEX = exports.JAVASCRIPT_WHOLE_STRING_IDENTIFIER_REGEX = /^[$_a-zA-Z][$_\w]*$/;

const identifierOrNumber = '[a-zA-Z0-9_$]+';

function makeStrRegex(delimiter) {
  const d = delimiter;
  // Each run of four backslashes ends up as just one backslash. We need to escape once for the
  // string literal here, and once for the RegExp compilation.
  return `${d}(\\\\.|[^${d}\\\\])*${d}`;
}

const strRegexes = ['`', "'", '"'].map(makeStrRegex);

const regexStrings = [].concat(strRegexes, [identifierOrNumber]).map(s => `(${s})`);

const JAVASCRIPT_WORD_REGEX = exports.JAVASCRIPT_WORD_REGEX = new RegExp(regexStrings.join('|'), 'g');

function getReplacementPrefix(originalPrefix) {
  // Ignore prefix unless it's an identifier (this keeps us from eating leading
  // dots, colons, etc).
  return JAVASCRIPT_WHOLE_STRING_IDENTIFIER_REGEX.test(originalPrefix) ? originalPrefix : '';
}

function shouldFilter(lastRequest, currentRequest, charsSinceLastRequest) {
  const prefixIsIdentifier = JAVASCRIPT_WHOLE_STRING_IDENTIFIER_REGEX.test(currentRequest.prefix);
  const previousPrefixIsDot = /^\s*\.\s*$/.test(lastRequest.prefix);
  const prefixLengthDifference = currentRequest.prefix.length - lastRequest.prefix.length;
  const startsWithPrevious = currentRequest.prefix.startsWith(lastRequest.prefix);

  return prefixIsIdentifier && (previousPrefixIsDot && currentRequest.prefix.length === charsSinceLastRequest || startsWithPrevious && prefixLengthDifference === charsSinceLastRequest);
}

function filterResultsByPrefix(prefix, results) {
  if (results == null) {
    return null;
  }
  const replacementPrefix = getReplacementPrefix(prefix);
  const resultsWithCurrentPrefix = results.map(result => {
    return Object.assign({}, result, {
      replacementPrefix
    });
  });
  // fuzzaldrin-plus filters everything when the query is empty.
  if (replacementPrefix === '') {
    return resultsWithCurrentPrefix;
  }
  return (_fuzzaldrinPlus || _load_fuzzaldrinPlus()).default.filter(resultsWithCurrentPrefix, replacementPrefix, { key: 'displayText' });
}