

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonPrintCommaSeparatedNodes2;

function _commonPrintCommaSeparatedNodes() {
  return _commonPrintCommaSeparatedNodes2 = _interopRequireDefault(require('../common/printCommaSeparatedNodes'));
}

var _wrappersSimpleWrapExpression2;

function _wrappersSimpleWrapExpression() {
  return _wrappersSimpleWrapExpression2 = _interopRequireDefault(require('../../wrappers/simple/wrapExpression'));
}

function printArrayExpression(print, node) {
  var wrap = function wrap(x) {
    return (0, (_wrappersSimpleWrapExpression2 || _wrappersSimpleWrapExpression()).default)(print, node, x);
  };
  return wrap(['[', (0, (_commonPrintCommaSeparatedNodes2 || _commonPrintCommaSeparatedNodes()).default)(print, node.elements), ']']);
}

module.exports = printArrayExpression;