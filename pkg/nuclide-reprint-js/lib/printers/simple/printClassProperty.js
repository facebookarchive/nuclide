

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

function printClassProperty(print, node) {
  var parts = [];
  if (node.static) {
    parts = parts.concat(['static', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space]);
  }

  // TODO: Computed class properties don't seem to be supported by Babylon yet.

  parts = parts.concat([print(node.key)]);

  if (node.value) {
    parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space, '=', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space, print(node.value)]);
  }

  if (node.typeAnnotation) {
    parts = parts.concat(print(node.typeAnnotation));
  }

  parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.noBreak, ';', (_constantsMarkers2 || _constantsMarkers()).default.hardBreak]);

  return (0, (_utilsFlatten2 || _utilsFlatten()).default)(parts);
}

module.exports = printClassProperty;