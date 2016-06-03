function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _getRootIdentifierInExpression2;

function _getRootIdentifierInExpression() {
  return _getRootIdentifierInExpression2 = _interopRequireDefault(require('./getRootIdentifierInExpression'));
}

function isRequireExpression(node) {
  var root = (0, (_getRootIdentifierInExpression2 || _getRootIdentifierInExpression()).default)(node);
  return Boolean(root && root.name === 'require');
}

module.exports = isRequireExpression;