

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

var _commonPrintCommaSeparatedNodes2;

function _commonPrintCommaSeparatedNodes() {
  return _commonPrintCommaSeparatedNodes2 = _interopRequireDefault(require('../common/printCommaSeparatedNodes'));
}

function printFunctionDeclaration(print, node) {
  return (0, (_utilsFlatten2 || _utilsFlatten()).default)([node.async ? ['async', (_constantsMarkers2 || _constantsMarkers()).default.space, (_constantsMarkers2 || _constantsMarkers()).default.noBreak] : (_constantsMarkers2 || _constantsMarkers()).default.empty, 'function', node.generator ? '*' : (_constantsMarkers2 || _constantsMarkers()).default.empty, (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space, print(node.id), node.typeParameters ? [(_constantsMarkers2 || _constantsMarkers()).default.noBreak, print(node.typeParameters)] : (_constantsMarkers2 || _constantsMarkers()).default.empty, '(', (0, (_commonPrintCommaSeparatedNodes2 || _commonPrintCommaSeparatedNodes()).default)(print, node.params), ')', node.returnType ? print(node.returnType) : (_constantsMarkers2 || _constantsMarkers()).default.empty, (_constantsMarkers2 || _constantsMarkers()).default.space, print(node.body), (_constantsMarkers2 || _constantsMarkers()).default.hardBreak]);
}

module.exports = printFunctionDeclaration;