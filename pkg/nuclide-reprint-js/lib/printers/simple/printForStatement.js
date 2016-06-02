

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

function printForStatement(print, node) {
  var wrap = function wrap(x) {
    return (0, (_wrappersSimpleWrapStatement2 || _wrappersSimpleWrapStatement()).default)(print, node, x);
  };

  var parts = [(_constantsMarkers2 || _constantsMarkers()).default.hardBreak, 'for (', (_constantsMarkers2 || _constantsMarkers()).default.openScope, (_constantsMarkers2 || _constantsMarkers()).default.scopeIndent];
  parts.push((_constantsMarkers2 || _constantsMarkers()).default.scopeBreak);
  if (node.init) {
    var init = node.init;
    parts.push(print(init));
  }
  parts.push(';');
  parts.push((_constantsMarkers2 || _constantsMarkers()).default.scopeBreak);
  if (node.test) {
    var test = node.test;
    parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.space, print(test)]);
  }
  parts.push(';');
  parts.push((_constantsMarkers2 || _constantsMarkers()).default.scopeBreak);
  if (node.update) {
    var update = node.update;
    parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.space, print(update)]);
    // We only need an additional one if there was an update, otherwise we
    // just ended with a scopeBreak.
    parts.push((_constantsMarkers2 || _constantsMarkers()).default.scopeBreak);
  }
  parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.scopeDedent, (_constantsMarkers2 || _constantsMarkers()).default.closeScope, ')', (_constantsMarkers2 || _constantsMarkers()).default.space, print(node.body)]);
  return wrap(parts);
}

module.exports = printForStatement;