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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomRange;

function _load_commonsAtomRange() {
  return _commonsAtomRange = require('../../commons-atom/range');
}

var _UnescapedUnicodeDatatipComponent;

function _load_UnescapedUnicodeDatatipComponent() {
  return _UnescapedUnicodeDatatipComponent = _interopRequireDefault(require('./UnescapedUnicodeDatatipComponent'));
}

var _Unicode;

function _load_Unicode() {
  return _Unicode = require('./Unicode');
}

// Our "word" for the datatip is a contiguous alphanumeric string
// containing at least one Unicode escape: \uXXXX, \UXXXXXXXX, or
// \u{XXXX}.
//
// eslint-disable-next-line max-len
var WORD_REGEX = /[a-zA-Z0-9_-]*(?:\\u[0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}|\\u{[0-9a-fA-F]{1,8}})+(?:\\u[0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}|\\u{[0-9a-fA-F]{1,8}}|[a-zA-Z0-9_-])*/g;

exports.default = _asyncToGenerator(function* (editor, position) {
  var extractedWord = (0, (_commonsAtomRange || _load_commonsAtomRange()).wordAtPosition)(editor, position, WORD_REGEX);
  if (extractedWord == null) {
    return null;
  }
  var extractedCodePoints = (0, (_Unicode || _load_Unicode()).extractCodePoints)(extractedWord.wordMatch[0]);
  var codePoints = (0, (_Unicode || _load_Unicode()).decodeSurrogateCodePoints)(extractedCodePoints);
  return {
    component: (0, (_UnescapedUnicodeDatatipComponent || _load_UnescapedUnicodeDatatipComponent()).default)(codePoints),
    range: extractedWord.range
  };
});
module.exports = exports.default;