'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

var _LazyTreeNode;

function _load_LazyTreeNode() {
  return _LazyTreeNode = require('../../../nuclide-ui/LazyTreeNode');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class TestClassTreeNode extends (_LazyTreeNode || _load_LazyTreeNode()).LazyTreeNode {
  constructor(testClass) {
    super(testClass, null, true, (0, _asyncToGenerator.default)(function* () {
      return (_immutable || _load_immutable()).default.List.of();
    }));
  }

  getLabel() {
    return this.getItem().name;
  }
}
exports.default = TestClassTreeNode;