'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {TextEditor} = require('atom');

class ReadOnlyTextEditor extends TextEditor {

  constructor(...args) {
    super(...args);

    // Cancel insert events to prevent typing in the text editor and disallow editing (read-only).
    this.onWillInsertText(event => {
      event.cancel();
    });
  }

  // Make pasting in the text editor a no-op to disallow editing (read-only).
  pasteText() {}

}

module.exports = ReadOnlyTextEditor;
