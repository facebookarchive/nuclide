Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.stringifyError = stringifyError;
exports.maybeToString = maybeToString;
exports.relativeDate = relativeDate;
exports.countOccurrences = countOccurrences;
exports.shellParse = shellParse;
exports.removeCommonPrefix = removeCommonPrefix;
exports.removeCommonSuffix = removeCommonSuffix;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _shellQuote2;

function _shellQuote() {
  return _shellQuote2 = require('shell-quote');
}

function stringifyError(error) {
  return 'name: ' + error.name + ', message: ' + error.message + ', stack: ' + error.stack + '.';
}

// As of Flow v0.28, Flow does not alllow implicit string coercion of null or undefined. Use this to
// make it explicit.

function maybeToString(str) {
  // We don't want to encourage the use of this function directly because it coerces anything to a
  // string. We get stricter typechecking by using maybeToString, so it should generally be
  // preferred.
  return String(str);
}

/**
 * Originally adapted from https://github.com/azer/relative-date.
 * We're including it because of https://github.com/npm/npm/issues/12012
 */
var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;
var WEEK = 7 * DAY;
var YEAR = DAY * 365;
var MONTH = YEAR / 12;

var formats = [[0.7 * MINUTE, 'just now'], [1.5 * MINUTE, 'a minute ago'], [60 * MINUTE, 'minutes ago', MINUTE], [1.5 * HOUR, 'an hour ago'], [DAY, 'hours ago', HOUR], [2 * DAY, 'yesterday'], [7 * DAY, 'days ago', DAY], [1.5 * WEEK, 'a week ago'], [MONTH, 'weeks ago', WEEK], [1.5 * MONTH, 'a month ago'], [YEAR, 'months ago', MONTH], [1.5 * YEAR, 'a year ago'], [Number.MAX_VALUE, 'years ago', YEAR]];

function relativeDate(input_, reference_) {
  var input = input_;
  var reference = reference_;
  if (input instanceof Date) {
    input = input.getTime();
  }
  if (!reference) {
    reference = new Date().getTime();
  }
  if (reference instanceof Date) {
    reference = reference.getTime();
  }

  var delta = reference - input;

  for (var _ref3 of formats) {
    var _ref2 = _slicedToArray(_ref3, 3);

    var limit = _ref2[0];
    var relativeFormat = _ref2[1];
    var remainder = _ref2[2];

    if (delta < limit) {
      if (typeof remainder === 'number') {
        return Math.round(delta / remainder) + ' ' + relativeFormat;
      } else {
        return relativeFormat;
      }
    }
  }

  throw new Error('This should never be reached.');
}

/**
 * Count the number of occurrences of `char` in `str`.
 * `char` must be a string of length 1.
 */

function countOccurrences(haystack, char) {
  (0, (_assert2 || _assert()).default)(char.length === 1, 'char must be a string of length 1');

  var count = 0;
  var code = char.charCodeAt(0);
  for (var i = 0; i < haystack.length; i++) {
    if (haystack.charCodeAt(i) === code) {
      count++;
    }
  }
  return count;
}

/**
 * shell-quote's parse allows pipe operators.
 * Generally users don't care about this, so throw if we encounter any operators.
 */

function shellParse(str, env) {
  var result = (0, (_shellQuote2 || _shellQuote()).parse)(str, env);
  for (var i = 0; i < result.length; i++) {
    if (typeof result[i] !== 'string') {
      throw new Error('Unexpected operator "' + result[i].op + '" provided to shellParse');
    }
  }
  return result;
}

function removeCommonPrefix(a, b) {
  var i = 0;
  while (a[i] === b[i] && i < a.length && i < b.length) {
    i++;
  }
  return [a.substring(i), b.substring(i)];
}

function removeCommonSuffix(a, b) {
  var i = 0;
  while (a[a.length - 1 - i] === b[b.length - 1 - i] && i < a.length && i < b.length) {
    i++;
  }
  return [a.substring(0, a.length - i), b.substring(0, b.length - i)];
}