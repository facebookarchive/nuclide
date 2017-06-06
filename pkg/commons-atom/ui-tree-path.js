'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = uiTreePath;
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

const TREE_API_DATA_PATH = 'data-path';

/**
 * This shouldn't be used for the `file-tree` as it's replaced by
 * the `FileTreeContextMenu` API.
 * This can only be useful for other `ui/tree` usages, like the `DiffViewTree`.
 */
function uiTreePath(event) {
  // Event target isn't necessarily an HTMLElement,
  const target = event.currentTarget;
  const nameElement = target.hasAttribute(TREE_API_DATA_PATH) ? target : target.querySelector(`[${TREE_API_DATA_PATH}]`);

  if (!(nameElement != null)) {
    throw new Error('Invariant violation: "nameElement != null"');
  }

  return nameElement.getAttribute(TREE_API_DATA_PATH);
}