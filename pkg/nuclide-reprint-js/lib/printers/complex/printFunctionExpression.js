

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

var _commonPrintCommaSeparatedNodes2;

function _commonPrintCommaSeparatedNodes() {
  return _commonPrintCommaSeparatedNodes2 = _interopRequireDefault(require('../common/printCommaSeparatedNodes'));
}

var _wrappersSimpleWrapExpression2;

function _wrappersSimpleWrapExpression() {
  return _wrappersSimpleWrapExpression2 = _interopRequireDefault(require('../../wrappers/simple/wrapExpression'));
}

function printFunctionExpression(print, node, context) {
  var wrap = function wrap(x) {
    return (0, (_wrappersSimpleWrapExpression2 || _wrappersSimpleWrapExpression()).default)(print, node, x);
  };
  var last = context.path.last();

  var parts = [];
  if (last && last.type === 'MethodDefinition') {
    // Method definitions don't have the function keyword.
  } else if (last && last.type === 'Property' && last.method) {
      // Properties that are methods don't use the function keyword.
    } else {
        parts = parts.concat([node.async ? ['async', (_constantsMarkers2 || _constantsMarkers()).default.space, (_constantsMarkers2 || _constantsMarkers()).default.noBreak] : (_constantsMarkers2 || _constantsMarkers()).default.empty, 'function', node.generator ? '*' : (_constantsMarkers2 || _constantsMarkers()).default.empty, (_constantsMarkers2 || _constantsMarkers()).default.noBreak]);
      }

  if (node.id) {
    var id = node.id;
    parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.space, print(id)]);
  }

  parts = parts.concat([node.typeParameters ? [(_constantsMarkers2 || _constantsMarkers()).default.noBreak, print(node.typeParameters)] : (_constantsMarkers2 || _constantsMarkers()).default.empty, (_constantsMarkers2 || _constantsMarkers()).default.noBreak, '(', (0, (_commonPrintCommaSeparatedNodes2 || _commonPrintCommaSeparatedNodes()).default)(print, node.params), ')', node.returnType ? print(node.returnType) : (_constantsMarkers2 || _constantsMarkers()).default.empty, (_constantsMarkers2 || _constantsMarkers()).default.space, print(node.body),
  // This is to squash any breaks from the body.
  (_constantsMarkers2 || _constantsMarkers()).default.noBreak, '']);

  return wrap(parts);
}

module.exports = printFunctionExpression;