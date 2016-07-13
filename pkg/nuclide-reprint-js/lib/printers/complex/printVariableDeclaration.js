

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsFlatten2;

function _utilsFlatten() {
  return _utilsFlatten2 = _interopRequireDefault(require('../../utils/flatten'));
}

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../../constants/markers'));
}

function printVariableDeclaration(print, node, context) {
  var last = context.path.last();

  var parts = [node.kind, (_constantsMarkers2 || _constantsMarkers()).default.space, (0, (_utilsFlatten2 || _utilsFlatten()).default)(node.declarations.map(function (declNode, i) {
    if (i === 0) {
      return print(declNode);
    } else {
      // $FlowFixMe(kad)
      return [',', (_constantsMarkers2 || _constantsMarkers()).default.space, print(declNode)];
    }
  }))];

  // For these node types we shouldn't break or add a semicolon.
  var nonBreakingParents = new Set(['ForInStatement', 'ForOfStatement', 'ForStatement']);

  if (!last || nonBreakingParents.has(last.type)) {
    return (0, (_utilsFlatten2 || _utilsFlatten()).default)(parts);
  } else {
    return (0, (_utilsFlatten2 || _utilsFlatten()).default)([parts, (_constantsMarkers2 || _constantsMarkers()).default.noBreak, ';', (_constantsMarkers2 || _constantsMarkers()).default.hardBreak]);
  }
}

module.exports = printVariableDeclaration;