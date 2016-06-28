function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _jscodeshift2;

function _jscodeshift() {
  return _jscodeshift2 = _interopRequireDefault(require('jscodeshift'));
}

function reprintComment(node) {
  if (node.type === 'Block') {
    return (_jscodeshift2 || _jscodeshift()).default.block(node.value);
  } else if (node.type === 'Line') {
    return (_jscodeshift2 || _jscodeshift()).default.line(node.value);
  }
  return node;
}

module.exports = reprintComment;