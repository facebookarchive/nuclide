

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _wrappersSimpleWrapStatement2;

function _wrappersSimpleWrapStatement() {
  return _wrappersSimpleWrapStatement2 = _interopRequireDefault(require('../../wrappers/simple/wrapStatement'));
}

function printEmptyStatement(print, node) {
  var wrap = function wrap(x) {
    return (0, (_wrappersSimpleWrapStatement2 || _wrappersSimpleWrapStatement()).default)(print, node, x);
  };
  return wrap([';']);
}

module.exports = printEmptyStatement;