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

function printClassDeclaration(print, node) {
  var parts = (0, _utilsFlatten2.default)(['class', _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space, print(node.id), node.typeParameters ? [_constantsMarkers2.default.noBreak, print(node.typeParameters)] : _constantsMarkers2.default.empty, _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space]);

  if (node.superClass) {
    var superClass = node.superClass;
    parts = (0, _utilsFlatten2.default)([parts, 'extends', _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space, print(superClass), node.superTypeParameters ? [_constantsMarkers2.default.noBreak, print(node.superTypeParameters)] : _constantsMarkers2.default.empty, _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space]);
  }

  return (0, _utilsFlatten2.default)([parts, print(node.body), _constantsMarkers2.default.hardBreak]);
}

module.exports = printClassDeclaration;