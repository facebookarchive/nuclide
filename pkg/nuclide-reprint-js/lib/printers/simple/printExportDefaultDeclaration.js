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

function printExportDefaultDeclaration(print, node) {
  return (0, _utilsFlatten2.default)(['export', _constantsMarkers2.default.space, 'default', _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space, print(node.declaration), _constantsMarkers2.default.noBreak, ';', _constantsMarkers2.default.hardBreak]);
}

module.exports = printExportDefaultDeclaration;