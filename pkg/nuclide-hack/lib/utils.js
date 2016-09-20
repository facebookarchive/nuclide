Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getIdentifierAndRange = getIdentifierAndRange;
exports.getIdentifierAtPosition = getIdentifierAtPosition;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsAtomRange2;

function _commonsAtomRange() {
  return _commonsAtomRange2 = require('../../commons-atom/range');
}

var HACK_WORD_REGEX = /[a-zA-Z0-9_$]+/g;

function getIdentifierAndRange(editor, position) {
  var matchData = (0, (_commonsAtomRange2 || _commonsAtomRange()).wordAtPosition)(editor, position, HACK_WORD_REGEX);
  return matchData == null || matchData.wordMatch.length === 0 ? null : { id: matchData.wordMatch[0], range: matchData.range };
}

function getIdentifierAtPosition(editor, position) {
  var result = getIdentifierAndRange(editor, position);
  return result == null ? null : result.id;
}