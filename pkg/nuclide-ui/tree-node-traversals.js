'use strict';
'use babel';

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
  forEachCachedNode: function (rootNode, callback) {
    const stack = [rootNode];
    while (stack.length !== 0) {
      const node = stack.pop();
      callback(node);
      (node.getCachedChildren() || []).forEach(childNode => stack.push(childNode));
    }
  }
};