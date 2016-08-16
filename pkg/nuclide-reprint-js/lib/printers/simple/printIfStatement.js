

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

var _wrappersSimpleWrapStatement2;

function _wrappersSimpleWrapStatement() {
  return _wrappersSimpleWrapStatement2 = _interopRequireDefault(require('../../wrappers/simple/wrapStatement'));
}

function printIfStatement(print, node) {
  var wrap = function wrap(x) {
    return (0, (_wrappersSimpleWrapStatement2 || _wrappersSimpleWrapStatement()).default)(print, node, x);
  };

  var parts = [(_constantsMarkers2 || _constantsMarkers()).default.hardBreak, 'if (', (_constantsMarkers2 || _constantsMarkers()).default.openScope, (_constantsMarkers2 || _constantsMarkers()).default.scopeIndent, (_constantsMarkers2 || _constantsMarkers()).default.scopeBreak, print(node.test), (_constantsMarkers2 || _constantsMarkers()).default.scopeBreak, (_constantsMarkers2 || _constantsMarkers()).default.scopeDedent, (_constantsMarkers2 || _constantsMarkers()).default.closeScope, ') ', print(node.consequent)];

  if (node.alternate) {

    parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.noBreak, ' else ', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, print(node.alternate)]);
  }

  return wrap(parts);
}

module.exports = printIfStatement;