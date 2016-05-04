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

var _commonPrintCommaSeparatedNodes = require('../common/printCommaSeparatedNodes');

var _commonPrintCommaSeparatedNodes2 = _interopRequireDefault(_commonPrintCommaSeparatedNodes);

function printFunctionDeclaration(print, node) {
  return (0, _utilsFlatten2.default)([node.async ? ['async', _constantsMarkers2.default.space, _constantsMarkers2.default.noBreak] : _constantsMarkers2.default.empty, 'function', node.generator ? '*' : _constantsMarkers2.default.empty, _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space, print(node.id), node.typeParameters ? [_constantsMarkers2.default.noBreak, print(node.typeParameters)] : _constantsMarkers2.default.empty, '(', (0, _commonPrintCommaSeparatedNodes2.default)(print, node.params), ')', node.returnType ? print(node.returnType) : _constantsMarkers2.default.empty, _constantsMarkers2.default.space, print(node.body), _constantsMarkers2.default.hardBreak]);
}

module.exports = printFunctionDeclaration;