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

function printSwitchCase(print, node) {
  var consequentParts = (0, _utilsFlatten2.default)(node.consequent.map(function (nodePart) {
    return print(nodePart);
  }));
  if (node.consequent.length > 0) {
    // We want a new line separating cases if they had a consequent.
    consequentParts.push(_constantsMarkers2.default.multiHardBreak);
    consequentParts.push(_constantsMarkers2.default.multiHardBreak);
  }
  if (!node.test) {
    return (0, _utilsFlatten2.default)(['default:', _constantsMarkers2.default.hardBreak, _constantsMarkers2.default.indent, consequentParts, _constantsMarkers2.default.dedent]);
  } else {
    var test = node.test;
    return (0, _utilsFlatten2.default)(['case', _constantsMarkers2.default.space, print(test), ':', _constantsMarkers2.default.hardBreak, _constantsMarkers2.default.indent, consequentParts, _constantsMarkers2.default.dedent]);
  }
}

module.exports = printSwitchCase;