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

var _commonPrintCommaSeparatedNodes = require('../common/printCommaSeparatedNodes');

var _commonPrintCommaSeparatedNodes2 = _interopRequireDefault(_commonPrintCommaSeparatedNodes);

var _wrappersSimpleWrapExpression = require('../../wrappers/simple/wrapExpression');

var _wrappersSimpleWrapExpression2 = _interopRequireDefault(_wrappersSimpleWrapExpression);

function printFunctionExpression(print, node, context) {
  var wrap = function wrap(x) {
    return (0, _wrappersSimpleWrapExpression2.default)(print, node, x);
  };
  var last = context.path.last();

  var parts = [];
  if (last && last.type === 'MethodDefinition') {
    // Method definitions don't have the function keyword.
  } else if (last && last.type === 'Property' && last.method) {
      // Properties that are methods don't use the function keyword.
    } else {
        parts = parts.concat([node.async ? ['async', _constantsMarkers2.default.space, _constantsMarkers2.default.noBreak] : _constantsMarkers2.default.empty, 'function', node.generator ? '*' : _constantsMarkers2.default.empty, _constantsMarkers2.default.noBreak]);
      }

  if (node.id) {
    var id = node.id;
    parts = parts.concat([_constantsMarkers2.default.space, print(id)]);
  }

  parts = parts.concat([node.typeParameters ? [_constantsMarkers2.default.noBreak, print(node.typeParameters)] : _constantsMarkers2.default.empty, _constantsMarkers2.default.noBreak, '(', (0, _commonPrintCommaSeparatedNodes2.default)(print, node.params), ')', node.returnType ? print(node.returnType) : _constantsMarkers2.default.empty, _constantsMarkers2.default.space, print(node.body),
  // This is to squash any breaks from the body.
  _constantsMarkers2.default.noBreak, '']);

  return wrap(parts);
}

module.exports = printFunctionExpression;