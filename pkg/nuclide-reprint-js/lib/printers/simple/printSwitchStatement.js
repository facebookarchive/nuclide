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

var _wrappersSimpleWrapStatement = require('../../wrappers/simple/wrapStatement');

var _wrappersSimpleWrapStatement2 = _interopRequireDefault(_wrappersSimpleWrapStatement);

function printSwitchStatement(print, node) {
  var wrap = function wrap(x) {
    return (0, _wrappersSimpleWrapStatement2.default)(print, node, x);
  };
  return wrap([_constantsMarkers2.default.hardBreak, 'switch (', _constantsMarkers2.default.openScope, _constantsMarkers2.default.scopeIndent, _constantsMarkers2.default.scopeBreak, print(node.discriminant), _constantsMarkers2.default.scopeBreak, _constantsMarkers2.default.scopeDedent, _constantsMarkers2.default.closeScope, ') {', _constantsMarkers2.default.hardBreak, _constantsMarkers2.default.indent, node.cases.map(function (caseNode) {
    return print(caseNode);
  }), _constantsMarkers2.default.noBreak, // Squash the last breaks.
  '', _constantsMarkers2.default.dedent, _constantsMarkers2.default.hardBreak, '}']);
}

module.exports = printSwitchStatement;