

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

var _commonPrintArrayOfStatements2;

function _commonPrintArrayOfStatements() {
  return _commonPrintArrayOfStatements2 = _interopRequireDefault(require('../common/printArrayOfStatements'));
}

var _commonPrintComments2;

function _commonPrintComments() {
  return _commonPrintComments2 = _interopRequireDefault(require('../common/printComments'));
}

var _wrappersSimpleWrapStatement2;

function _wrappersSimpleWrapStatement() {
  return _wrappersSimpleWrapStatement2 = _interopRequireDefault(require('../../wrappers/simple/wrapStatement'));
}

function printBlockStatement(print, node) {
  var wrap = function wrap(x) {
    return (0, (_wrappersSimpleWrapStatement2 || _wrappersSimpleWrapStatement()).default)(print, node, x);
  };
  return wrap(['{', (_constantsMarkers2 || _constantsMarkers()).default.openScope, (_constantsMarkers2 || _constantsMarkers()).default.scopeIndent, (_constantsMarkers2 || _constantsMarkers()).default.scopeBreak, (0, (_commonPrintComments2 || _commonPrintComments()).default)(node.innerComments), (0, (_commonPrintArrayOfStatements2 || _commonPrintArrayOfStatements()).default)(print, node.body), (_constantsMarkers2 || _constantsMarkers()).default.scopeBreak, (_constantsMarkers2 || _constantsMarkers()).default.scopeDedent, (_constantsMarkers2 || _constantsMarkers()).default.closeScope, '}']);
}

module.exports = printBlockStatement;