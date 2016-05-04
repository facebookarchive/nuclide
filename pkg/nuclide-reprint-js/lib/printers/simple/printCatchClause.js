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

function printCatchClause(print, node) {
  return (0, _utilsFlatten2.default)(['catch (', _constantsMarkers2.default.openScope, _constantsMarkers2.default.scopeIndent, _constantsMarkers2.default.scopeBreak, print(node.param), _constantsMarkers2.default.scopeBreak, _constantsMarkers2.default.scopeDedent, _constantsMarkers2.default.closeScope, ')', _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space, print(node.body)]);
}

module.exports = printCatchClause;