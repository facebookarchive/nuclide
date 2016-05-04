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

function printObjectExpression(print, node) {
  var wrap = function wrap(x) {
    return (0, _wrappersSimpleWrapExpression2.default)(print, node, x);
  };
  return wrap(['{', _constantsMarkers2.default.openScope, _constantsMarkers2.default.scopeIndent, _constantsMarkers2.default.scopeBreak, node.properties.map(function (propNode, i, arr) {
    return [print(propNode), i === arr.length - 1 ? _constantsMarkers2.default.scopeComma : ',', i === arr.length - 1 ? _constantsMarkers2.default.scopeBreak : _constantsMarkers2.default.scopeSpaceBreak];
  }), _constantsMarkers2.default.scopeDedent, _constantsMarkers2.default.closeScope, '}']);
}

module.exports = printObjectExpression;