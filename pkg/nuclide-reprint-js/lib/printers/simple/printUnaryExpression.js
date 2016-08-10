

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../../constants/markers'));
}

var _wrappersSimpleWrapExpression2;

function _wrappersSimpleWrapExpression() {
  return _wrappersSimpleWrapExpression2 = _interopRequireDefault(require('../../wrappers/simple/wrapExpression'));
}

function printUnaryExpression(print, node) {
  var wrap = function wrap(x) {
    return (0, (_wrappersSimpleWrapExpression2 || _wrappersSimpleWrapExpression()).default)(print, node, x);
  };

  var hasSpace = node.operator === 'typeof' || node.operator === 'void' || node.operator === 'delete';

  var parts = [node.operator];
  if (hasSpace) {
    parts.push((_constantsMarkers2 || _constantsMarkers()).default.noBreak);
    parts.push((_constantsMarkers2 || _constantsMarkers()).default.space);
  }

  return wrap([parts, print(node.argument)]);
}

module.exports = printUnaryExpression;