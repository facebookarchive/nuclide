

module.exports = {
  /**
   * Call `callback` on every node in the subtree, including `rootNode`.
   */
  forEachCachedNode: function forEachCachedNode(rootNode, callback) {
    var stack = [rootNode];
    while (stack.length !== 0) {
      var _node = stack.pop();
      callback(_node);
      (_node.getCachedChildren() || []).forEach(function (childNode) {
        return stack.push(childNode);
      });
    }
  }
};

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */