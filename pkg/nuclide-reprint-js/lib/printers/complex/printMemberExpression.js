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

function printMemberExpression(print, node, context) {
  var wrap = function wrap(x) {
    return (0, _wrappersSimpleWrapExpression2.default)(print, node, x);
  };

  if (node.computed) {
    return wrap([print(node.object), '[', _constantsMarkers2.default.openScope, _constantsMarkers2.default.scopeIndent, _constantsMarkers2.default.scopeBreak, print(node.property), _constantsMarkers2.default.scopeBreak, _constantsMarkers2.default.scopeDedent, _constantsMarkers2.default.closeScope, ']']);
  } else {
    return wrap([print(node.object), '.', print(node.property)]);
  }
}

module.exports = printMemberExpression;