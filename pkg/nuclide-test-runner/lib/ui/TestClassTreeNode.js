'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

var _LazyTreeNode;

function _load_LazyTreeNode() {
  return _LazyTreeNode = require('../../../nuclide-ui/LazyTreeNode');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
    super(testClass, null, true, async () => (_immutable || _load_immutable()).List.of());
  }

  getLabel() {
    return this.getItem().name;
  }
}
exports.default = TestClassTreeNode;