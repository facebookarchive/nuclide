'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPathOfLocation = getPathOfLocation;
exports.getLocationOfEditor = getLocationOfEditor;
exports.editorOfLocation = editorOfLocation;

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../modules/nuclide-commons-atom/go-to-location');
}

// A location which can be navigated to. Includes the file (as uri for closed files and as
// atom$TextEditor for open files) as well as the cursor position.
function getPathOfLocation(location) {
  return location.type === 'uri' ? location.uri : location.editor.getPath();
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function getLocationOfEditor(editor) {
  return {
    type: 'editor',
    editor,
    bufferPosition: editor.getCursorBufferPosition()
  };
}

async function editorOfLocation(location) {
  if (location.type === 'uri') {
    return (0, (_goToLocation || _load_goToLocation()).goToLocation)(location.uri);
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
}