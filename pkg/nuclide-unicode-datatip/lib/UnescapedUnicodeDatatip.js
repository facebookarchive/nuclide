"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _range() {
  const data = require("../../../modules/nuclide-commons-atom/range");

  _range = function () {
    return data;
  };

  return data;
}

function _UnescapedUnicodeDatatipComponent() {
  const data = _interopRequireDefault(require("./UnescapedUnicodeDatatipComponent"));

  _UnescapedUnicodeDatatipComponent = function () {
    return data;
  };

  return data;
}

function _Unicode() {
  const data = require("./Unicode");

  _Unicode = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
// Our "word" for the datatip is a contiguous alphanumeric string
// containing at least one Unicode escape: \uXXXX, \UXXXXXXXX, or
// \u{XXXX}.
// TODO(hansonw): Remove the "[u]" workaround: https://github.com/atom/superstring/issues/52
//
// eslint-disable-next-line max-len
const WORD_REGEX = /[a-zA-Z0-9_-]*(?:\\[u][0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}|\\[u]{[0-9a-fA-F]{1,8}})+(?:\\[u][0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}|\\[u]{[0-9a-fA-F]{1,8}}|[a-zA-Z0-9_-])*/g;

var unescapedUnicodeDatatip = async function unescapedUnicodeDatatip(editor, position) {
  const extractedWord = (0, _range().wordAtPosition)(editor, position, WORD_REGEX);

  if (extractedWord == null) {
    return null;
  }

  const extractedCodePoints = (0, _Unicode().extractCodePoints)(extractedWord.wordMatch[0]);
  const codePoints = (0, _Unicode().decodeSurrogateCodePoints)(extractedCodePoints);
  return {
    component: (0, _UnescapedUnicodeDatatipComponent().default)(codePoints),
    range: extractedWord.range
  };
};

exports.default = unescapedUnicodeDatatip;