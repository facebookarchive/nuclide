

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

function printBreakStatement(print, node) {
  var wrap = function wrap(x) {
    return (0, (_wrappersSimpleWrapStatement2 || _wrappersSimpleWrapStatement()).default)(print, node, x);
  };

  var parts = ['break'];
  if (node.label) {
    var label = node.label;
    parts = parts.concat([':', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space, print(label)]);
  }
  return wrap([parts, (_constantsMarkers2 || _constantsMarkers()).default.noBreak, ';']);
}

module.exports = printBreakStatement;