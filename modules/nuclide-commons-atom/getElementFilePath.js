'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =















getElementFilePath;var _textEditor;function _load_textEditor() {return _textEditor = require('./text-editor');} /**
                                                                                                                 * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                 * All rights reserved.
                                                                                                                 *
                                                                                                                 * This source code is licensed under the BSD-style license found in the
                                                                                                                 * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                 * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                 *
                                                                                                                 * 
                                                                                                                 * @format
                                                                                                                 */function getElementFilePath(element, fallbackToActiveTextEditor = false) {let el = element;while (el != null) {if (el.dataset != null && el.dataset.path != null) {return el.dataset.path;} // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    if (typeof el.getModel === 'function') {const model = el.getModel();
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
    if (editor != null) {
      return editor.getPath();
    }
  }
  return null;
}