'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _range;

function _load_range() {
  return _range = require('nuclide-commons-atom/range');
}

var _UnescapedUnicodeDatatipComponent;

function _load_UnescapedUnicodeDatatipComponent() {
  return _UnescapedUnicodeDatatipComponent = _interopRequireDefault(require('./UnescapedUnicodeDatatipComponent'));
}

var _Unicode;

function _load_Unicode() {
  return _Unicode = require('./Unicode');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Our "word" for the datatip is a contiguous alphanumeric string
// containing at least one Unicode escape: \uXXXX, \UXXXXXXXX, or
// \u{XXXX}.
//
// eslint-disable-next-line max-len
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const WORD_REGEX = /[a-zA-Z0-9_-]*(?:\\u[0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}|\\u{[0-9a-fA-F]{1,8}})+(?:\\u[0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}|\\u{[0-9a-fA-F]{1,8}}|[a-zA-Z0-9_-])*/g;

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (editor, position) {
    const extractedWord = (0, (_range || _load_range()).wordAtPosition)(editor, position, WORD_REGEX);
    if (extractedWord == null) {
      return null;
    }
    const extractedCodePoints = (0, (_Unicode || _load_Unicode()).extractCodePoints)(extractedWord.wordMatch[0]);
    const codePoints = (0, (_Unicode || _load_Unicode()).decodeSurrogateCodePoints)(extractedCodePoints);
    return {
      component: (0, (_UnescapedUnicodeDatatipComponent || _load_UnescapedUnicodeDatatipComponent()).default)(codePoints),
      range: extractedWord.range
    };
  });

  function unescapedUnicodeDatatip(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return unescapedUnicodeDatatip;
})();