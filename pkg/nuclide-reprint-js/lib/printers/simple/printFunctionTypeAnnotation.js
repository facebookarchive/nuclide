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

function printFunctionTypeAnnotation(print, node) {
  // TODO: node.rest
  return (0, _utilsFlatten2.default)(['(', (0, _commonPrintCommaSeparatedNodes2.default)(print, node.params), ') =>', _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space, print(node.returnType)]);
}

module.exports = printFunctionTypeAnnotation;