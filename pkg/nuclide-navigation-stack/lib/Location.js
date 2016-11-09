'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.editorOfLocation = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let editorOfLocation = exports.editorOfLocation = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (location) {
    if (location.type === 'uri') {
      return yield atom.workspace.open(location.uri, {
        searchAllPanes: true
      });
    } else {
      if (!(location.type === 'editor')) {
        throw new Error('Invariant violation: "location.type === \'editor\'"');
      }

      const editor = location.editor;
      const pane = atom.workspace.paneForItem(editor);

      if (!(pane != null)) {
        throw new Error('Invariant violation: "pane != null"');
      }

      pane.activateItem(editor);
      pane.activate();
      return editor;
    }
  });

  return function editorOfLocation(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.getPathOfLocation = getPathOfLocation;
exports.getLocationOfEditor = getLocationOfEditor;

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// A location which can be navigated to. Includes the file (as uri for closed files and as
// atom$TextEditor for open files) as well as the cursor position and scroll.
function getPathOfLocation(location) {
  return location.type === 'uri' ? location.uri : location.editor.getPath();
}function getLocationOfEditor(editor) {
  return {
    type: 'editor',
    editor: editor,
    bufferPosition: editor.getCursorBufferPosition(),
    scrollTop: (0, (_textEditor || _load_textEditor()).getScrollTop)(editor)
  };
}