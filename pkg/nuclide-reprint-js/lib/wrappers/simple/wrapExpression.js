function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsFlatten2;

function _utilsFlatten() {
  return _utilsFlatten2 = _interopRequireDefault(require('../../utils/flatten'));
}

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../../constants/markers'));
}

var _utilsUnwrapMarkers2;

function _utilsUnwrapMarkers() {
  return _utilsUnwrapMarkers2 = _interopRequireDefault(require('../../utils/unwrapMarkers'));
}

/**
 * Adds parenthesis and the appropriate markers to a set of lines. It also moves
 * any leading and trailing markers outside of the parenthesis.
 */
function wrapExpression(print, node, lines) {
  lines = (0, (_utilsFlatten2 || _utilsFlatten()).default)(lines);
  if (node.parenthesizedExpression) {
    lines = (0, (_utilsUnwrapMarkers2 || _utilsUnwrapMarkers()).default)(['(', (_constantsMarkers2 || _constantsMarkers()).default.openScope, (_constantsMarkers2 || _constantsMarkers()).default.scopeIndent, (_constantsMarkers2 || _constantsMarkers()).default.scopeBreak], lines, [(_constantsMarkers2 || _constantsMarkers()).default.scopeBreak, (_constantsMarkers2 || _constantsMarkers()).default.scopeDedent, (_constantsMarkers2 || _constantsMarkers()).default.closeScope, ')']);
  }
  return lines;
}

module.exports = wrapExpression;