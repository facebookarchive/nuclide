function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _constantsMarkers = require('../../constants/markers');

var _constantsMarkers2 = _interopRequireDefault(_constantsMarkers);

var _wrappersSimpleWrapExpression = require('../../wrappers/simple/wrapExpression');

var _wrappersSimpleWrapExpression2 = _interopRequireDefault(_wrappersSimpleWrapExpression);

function printUpdateExpression(print, node) {
  var wrap = function wrap(x) {
    return (0, _wrappersSimpleWrapExpression2.default)(print, node, x);
  };
  if (node.prefix) {
    return wrap([node.operator, _constantsMarkers2.default.noBreak, print(node.argument)]);
  } else {
    return wrap([print(node.argument), _constantsMarkers2.default.noBreak, node.operator]);
  }
}

module.exports = printUpdateExpression;