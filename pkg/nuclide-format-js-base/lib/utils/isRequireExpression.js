function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _getRootIdentifierInExpression = require('./getRootIdentifierInExpression');

var _getRootIdentifierInExpression2 = _interopRequireDefault(_getRootIdentifierInExpression);

function isRequireExpression(node) {
  var root = (0, _getRootIdentifierInExpression2.default)(node);
  return !!(root && root.name === 'require');
}

module.exports = isRequireExpression;