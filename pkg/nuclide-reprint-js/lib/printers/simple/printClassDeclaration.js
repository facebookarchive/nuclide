

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

function printClassDeclaration(print, node) {
  var parts = (0, (_utilsFlatten2 || _utilsFlatten()).default)(['class', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space, print(node.id), node.typeParameters ? [(_constantsMarkers2 || _constantsMarkers()).default.noBreak, print(node.typeParameters)] : (_constantsMarkers2 || _constantsMarkers()).default.empty, (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space]);

  if (node.superClass) {
    var superClass = node.superClass;
    parts = (0, (_utilsFlatten2 || _utilsFlatten()).default)([parts, 'extends', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space, print(superClass), node.superTypeParameters ? [(_constantsMarkers2 || _constantsMarkers()).default.noBreak, print(node.superTypeParameters)] : (_constantsMarkers2 || _constantsMarkers()).default.empty, (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space]);
  }

  return (0, (_utilsFlatten2 || _utilsFlatten()).default)([parts, print(node.body), (_constantsMarkers2 || _constantsMarkers()).default.hardBreak]);
}

module.exports = printClassDeclaration;