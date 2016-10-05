function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _hasOneDeclaration2;

function _hasOneDeclaration() {
  return _hasOneDeclaration2 = _interopRequireDefault(require('./hasOneDeclaration'));
}

var _isRequireExpression2;

function _isRequireExpression() {
  return _isRequireExpression2 = _interopRequireDefault(require('./isRequireExpression'));
}

function hasOneRequireDeclaration(node) {
  if (!(0, (_hasOneDeclaration2 || _hasOneDeclaration()).default)(node)) {
    return false;
  }
  var declaration = node.declarations[0];
  return (0, (_isRequireExpression2 || _isRequireExpression()).default)(declaration.init);
}

module.exports = hasOneRequireDeclaration;