'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = onWillDestroyTextBuffer;

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('./text-editor');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function onWillDestroyTextBuffer(callback) {
  return atom.workspace.onWillDestroyPaneItem(({ item }) => {
    if (!(0, (_textEditor || _load_textEditor()).isValidTextEditor)(item)) {
      return;
    }

    const editor = item;
    const openBufferCount = editor.getBuffer().refcount;

    if (!(openBufferCount !== 0)) {
      throw new Error('The file that is about to be closed should still be open.');
    }

    if (openBufferCount === 1) {
      callback(editor.getBuffer());
    }
  });
}
module.exports = exports['default'];