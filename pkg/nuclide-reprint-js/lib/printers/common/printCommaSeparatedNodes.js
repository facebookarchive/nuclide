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

function printCommaSeparatedNodes(print, nodes) {
  if (nodes.length === 0) {
    return [];
  }
  return (0, _utilsFlatten2.default)([_constantsMarkers2.default.openScope, _constantsMarkers2.default.scopeIndent, (0, _utilsFlatten2.default)(nodes.map(function (node, i, arr) {
    return (0, _utilsFlatten2.default)([i > 0 ? [_constantsMarkers2.default.space] : [], _constantsMarkers2.default.scopeBreak, print(node), i === arr.length - 1 ? [_constantsMarkers2.default.scopeComma] : ',', '']);
  })), _constantsMarkers2.default.scopeBreak, _constantsMarkers2.default.scopeDedent, _constantsMarkers2.default.closeScope]);
}

module.exports = printCommaSeparatedNodes;