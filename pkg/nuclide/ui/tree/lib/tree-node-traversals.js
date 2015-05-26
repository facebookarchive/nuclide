'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = {
  /**
   * Call `callback` on every node in the subtree, including `rootNode`.
   */
  forEachCachedNode(rootNode: LazyTreeNode, callback: (node: LazyTreeNode)=>void) {
    var stack = [rootNode];
    while (stack.length !== 0) {
      var node = stack.pop();
      callback(node);
      (node.getCachedChildren() || []).forEach((childNode) => stack.push(childNode));
    }
  },
};
