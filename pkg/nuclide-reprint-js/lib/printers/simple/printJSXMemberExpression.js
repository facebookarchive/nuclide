

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

function printJSXMemberExpression(print, node) {
  // JSXMemberExpressions can only contain identifiers so we do not allow any
  // sort of breaking between accesses unlike in a standard member expression.
  return (0, (_utilsFlatten2 || _utilsFlatten()).default)([print(node.object), (_constantsMarkers2 || _constantsMarkers()).default.noBreak, '.', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, print(node.property)]);
}

module.exports = printJSXMemberExpression;