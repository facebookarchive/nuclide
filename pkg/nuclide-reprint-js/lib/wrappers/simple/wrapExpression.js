function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsFlatten = require('../../utils/flatten');

var _utilsFlatten2 = _interopRequireDefault(_utilsFlatten);

var _constantsMarkers = require('../../constants/markers');

var _constantsMarkers2 = _interopRequireDefault(_constantsMarkers);

var _utilsUnwrapMarkers = require('../../utils/unwrapMarkers');

var _utilsUnwrapMarkers2 = _interopRequireDefault(_utilsUnwrapMarkers);

/**
 * Adds parenthesis and the appropriate markers to a set of lines. It also moves
 * any leading and trailing markers outside of the parenthesis.
 */
function wrapExpression(print, node, lines) {
  lines = (0, _utilsFlatten2.default)(lines);
  if (node.parenthesizedExpression) {
    lines = (0, _utilsUnwrapMarkers2.default)(['(', _constantsMarkers2.default.openScope, _constantsMarkers2.default.scopeIndent, _constantsMarkers2.default.scopeBreak], lines, [_constantsMarkers2.default.scopeBreak, _constantsMarkers2.default.scopeDedent, _constantsMarkers2.default.closeScope, ')']);
  }
  return lines;
}

module.exports = wrapExpression;