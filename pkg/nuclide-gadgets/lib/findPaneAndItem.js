Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.default = findPaneAndItem;

/**
 * Finds the first item that matches the predicate in the workspace and its parent. It's necessary
 * to get them both in one function because items don't have links back to their parent.
 */

function findPaneAndItem(predicate) {
  for (var _pane of atom.workspace.getPanes()) {
    for (var _item of _pane.getItems()) {
      if (predicate(_item, _pane)) {
        return { item: _item, pane: _pane };
      }
    }
  }
}

module.exports = exports.default;