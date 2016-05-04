function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _hasOneDeclaration = require('./hasOneDeclaration');

var _hasOneDeclaration2 = _interopRequireDefault(_hasOneDeclaration);

var _isRequireExpression = require('./isRequireExpression');

var _isRequireExpression2 = _interopRequireDefault(_isRequireExpression);

function hasOneRequireDeclaration(node) {
  if (!(0, _hasOneDeclaration2.default)(node)) {
    return false;
  }
  var declaration = node.declarations[0];
  return (0, _isRequireExpression2.default)(declaration.init);
}

module.exports = hasOneRequireDeclaration;