Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = debounce;

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

function debounce(func, wait) {
  var immediate = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  // Taken from: https://github.com/jashkenas/underscore/blob/b10b2e6d72/underscore.js#L815.
  var timeout = undefined;
  var args = undefined;
  var context = undefined;
  var timestamp = 0;
  var result = undefined;

  var later = function later() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        (0, (_assert2 || _assert()).default)(args);
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      }
    }
  };

  // $FlowIssue -- Flow's type system isn't expressive enough to type debounce.
  return function () {
    context = this; // eslint-disable-line consistent-this
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

module.exports = exports.default;