

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

function printSwitchCase(print, node) {
  var consequentParts = (0, (_utilsFlatten2 || _utilsFlatten()).default)(node.consequent.map(function (nodePart) {
    return print(nodePart);
  }));
  if (node.consequent.length > 0) {
    // We want a new line separating cases if they had a consequent.
    consequentParts.push((_constantsMarkers2 || _constantsMarkers()).default.multiHardBreak);
    consequentParts.push((_constantsMarkers2 || _constantsMarkers()).default.multiHardBreak);
  }
  if (!node.test) {
    return (0, (_utilsFlatten2 || _utilsFlatten()).default)(['default:', (_constantsMarkers2 || _constantsMarkers()).default.hardBreak, (_constantsMarkers2 || _constantsMarkers()).default.indent, consequentParts, (_constantsMarkers2 || _constantsMarkers()).default.dedent]);
  } else {
    var test = node.test;
    return (0, (_utilsFlatten2 || _utilsFlatten()).default)(['case', (_constantsMarkers2 || _constantsMarkers()).default.space, print(test), ':', (_constantsMarkers2 || _constantsMarkers()).default.hardBreak, (_constantsMarkers2 || _constantsMarkers()).default.indent, consequentParts, (_constantsMarkers2 || _constantsMarkers()).default.dedent]);
  }
}

module.exports = printSwitchCase;