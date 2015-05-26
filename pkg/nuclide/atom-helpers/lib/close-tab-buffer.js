'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function closeTabForBuffer(buffer: TextBuffer) {
  atom.workspace.getPanes().forEach((pane) => {
    pane.getItems().forEach((item) => {
      if (item.buffer === buffer) {
        pane.removeItem(item);
      }
    });
  });
}

module.exports = closeTabForBuffer;
