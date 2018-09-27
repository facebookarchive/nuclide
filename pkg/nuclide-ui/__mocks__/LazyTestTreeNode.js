"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LazyTestTreeNode = void 0;

function _LazyTreeNode() {
  const data = require("../LazyTreeNode");

  _LazyTreeNode = function () {
    return data;
  };

  return data;
}

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
class LazyTestTreeNode extends _LazyTreeNode().LazyTreeNode {
  constructor(item, parent, isContainer, fetchChildren) {
    // Test tree nodes that provide no `fetchChildren` get a default fetcher that returns nothing.
    const localFetchChildren = fetchChildren || (() => Promise.resolve());

    super(item, parent, isContainer, localFetchChildren);
  }

  getLabel() {
    return this.__item.label;
  }

}

exports.LazyTestTreeNode = LazyTestTreeNode;