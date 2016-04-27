

var jscs = require('jscodeshift');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function reprintComment(node) {
  if (node.type === 'Block') {
    return jscs.block(node.value);
  } else if (node.type === 'Line') {
    return jscs.line(node.value);
  }
  return node;
}

module.exports = reprintComment;