'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lspPositionToAtomPoint = lspPositionToAtomPoint;
exports.atomPointToLSPPosition = atomPointToLSPPosition;
exports.babelLocationToAtomRange = babelLocationToAtomRange;
exports.atomRangeToLSPRange = atomRangeToLSPRange;
exports.lspRangeToAtomRange = lspRangeToAtomRange;
exports.compareLspPosition = compareLspPosition;
exports.compareLspRange = compareLspRange;

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

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

// flowlint-next-line untyped-type-import:off
function lspPositionToAtomPoint(lspPosition) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(lspPosition.line, lspPosition.character);
}

function atomPointToLSPPosition(atomPoint) {
  return {
    line: atomPoint.row,
    character: atomPoint.column
  };
}

function babelLocationToAtomRange(location) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(location.start.line - 1, location.start.col), new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(location.end.line - 1, location.end.col));
}

function atomRangeToLSPRange(atomRange) {
  return {
    start: atomPointToLSPPosition(atomRange.start),
    end: atomPointToLSPPosition(atomRange.end)
  };
}

function lspRangeToAtomRange(lspRange) {
  return {
    start: lspPositionToAtomPoint(lspRange.start),
    end: lspPositionToAtomPoint(lspRange.end)
  };
}

function compareLspPosition(a, b) {
  return a.line - b.line || a.character - b.character;
}

function compareLspRange(a, b) {
  return compareLspPosition(a.start, b.start) || compareLspPosition(a.end, b.end);
}