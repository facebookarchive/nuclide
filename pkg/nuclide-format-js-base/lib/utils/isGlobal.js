

/**
 * Tests if a NodePath is a direct child of the Program node.
 */
function isGlobal(path) {
  return path.parent && path.parent.node.type === 'Program';
}

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = isGlobal;