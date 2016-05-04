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

var _commonPrintArrayOfStatements = require('../common/printArrayOfStatements');

var _commonPrintArrayOfStatements2 = _interopRequireDefault(_commonPrintArrayOfStatements);

var _commonPrintComments = require('../common/printComments');

var _commonPrintComments2 = _interopRequireDefault(_commonPrintComments);

var _wrappersSimpleWrapStatement = require('../../wrappers/simple/wrapStatement');

var _wrappersSimpleWrapStatement2 = _interopRequireDefault(_wrappersSimpleWrapStatement);

function printBlockStatement(print, node) {
  var wrap = function wrap(x) {
    return (0, _wrappersSimpleWrapStatement2.default)(print, node, x);
  };
  return wrap(['{', _constantsMarkers2.default.openScope, _constantsMarkers2.default.scopeIndent, _constantsMarkers2.default.scopeBreak, (0, _commonPrintComments2.default)(node.innerComments), (0, _commonPrintArrayOfStatements2.default)(print, node.body), _constantsMarkers2.default.scopeBreak, _constantsMarkers2.default.scopeDedent, _constantsMarkers2.default.closeScope, '}']);
}

module.exports = printBlockStatement;