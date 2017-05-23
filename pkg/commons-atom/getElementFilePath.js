'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getElementFilePath;

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

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

function getElementFilePath(element, fallbackToActiveTextEditor = false) {
  let el = element;
  while (el != null) {
    if (el.dataset != null && el.dataset.path != null) {
      return el.dataset.path;
    }
    if (typeof el.getModel === 'function') {
      const model = el.getModel();
      if ((0, (_textEditor || _load_textEditor()).isValidTextEditor)(model)) {
        const path = model.getPath();
        if (path != null) {
          return path;
        }
      }
    }
    el = el.parentElement;
  }
  if (fallbackToActiveTextEditor) {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor != null && (0, (_textEditor || _load_textEditor()).isValidTextEditor)(editor)) {
      return editor.getPath();
    }
  }
  return null;
}