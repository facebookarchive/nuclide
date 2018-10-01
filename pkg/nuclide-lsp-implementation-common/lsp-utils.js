"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lspPositionToAtomPoint = lspPositionToAtomPoint;
exports.atomPointToLSPPosition = atomPointToLSPPosition;
exports.lspRangeToAtomRange = lspRangeToAtomRange;
exports.atomRangeToLSPRange = atomRangeToLSPRange;
exports.compareLspPosition = compareLspPosition;
exports.compareLspRange = compareLspRange;

function _simpleTextBuffer() {
  const data = require("simple-text-buffer");

  _simpleTextBuffer = function () {
    return data;
  };

  return data;
}

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
// flowlint-next-line untyped-type-import:off
function lspPositionToAtomPoint(lspPosition) {
  return new (_simpleTextBuffer().Point)(lspPosition.line, lspPosition.character);
}

function atomPointToLSPPosition(atomPoint) {
  return {
    line: atomPoint.row,
    character: atomPoint.column
  };
}

function lspRangeToAtomRange(lspRange) {
  return {
    start: lspPositionToAtomPoint(lspRange.start),
    end: lspPositionToAtomPoint(lspRange.end)
  };
}

function atomRangeToLSPRange(atomRange) {
  return {
    start: atomPointToLSPPosition(atomRange.start),
    end: atomPointToLSPPosition(atomRange.end)
  };
}

function compareLspPosition(a, b) {
  return a.line - b.line || a.character - b.character;
}

function compareLspRange(a, b) {
  return compareLspPosition(a.start, b.start) || compareLspPosition(a.end, b.end);
}