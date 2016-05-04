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

function printVariableDeclaration(print, node, context) {
  var last = context.path.last();

  var parts = [node.kind, _constantsMarkers2.default.space, (0, _utilsFlatten2.default)(node.declarations.map(function (declNode, i) {
    if (i === 0) {
      return print(declNode);
    } else {
      return [',', _constantsMarkers2.default.space, print(declNode)];
    }
  }))];

  // For these node types we shouldn't break or add a semicolon.
  var nonBreakingParents = new Set(['ForInStatement', 'ForOfStatement', 'ForStatement']);

  if (!last || nonBreakingParents.has(last.type)) {
    return (0, _utilsFlatten2.default)(parts);
  } else {
    return (0, _utilsFlatten2.default)([parts, _constantsMarkers2.default.noBreak, ';', _constantsMarkers2.default.hardBreak]);
  }
}

module.exports = printVariableDeclaration;