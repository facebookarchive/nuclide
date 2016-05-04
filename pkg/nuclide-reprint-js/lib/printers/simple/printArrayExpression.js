function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonPrintCommaSeparatedNodes = require('../common/printCommaSeparatedNodes');

var _commonPrintCommaSeparatedNodes2 = _interopRequireDefault(_commonPrintCommaSeparatedNodes);

var _wrappersSimpleWrapExpression = require('../../wrappers/simple/wrapExpression');

var _wrappersSimpleWrapExpression2 = _interopRequireDefault(_wrappersSimpleWrapExpression);

function printArrayExpression(print, node) {
  var wrap = function wrap(x) {
    return (0, _wrappersSimpleWrapExpression2.default)(print, node, x);
  };
  return wrap(['[', (0, _commonPrintCommaSeparatedNodes2.default)(print, node.elements), ']']);
}

module.exports = printArrayExpression;