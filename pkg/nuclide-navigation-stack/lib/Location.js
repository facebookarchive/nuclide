"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPathOfLocation = getPathOfLocation;
exports.getLocationOfEditor = getLocationOfEditor;
exports.editorOfLocation = editorOfLocation;

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
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
function getPathOfLocation(location) {
  return location.type === 'uri' ? location.uri : location.editor.getPath();
}

function getLocationOfEditor(editor) {
  return {
    type: 'editor',
    editor,
    bufferPosition: editor.getCursorBufferPosition()
  };
}

async function editorOfLocation(location) {
  if (location.type === 'uri') {
    return (0, _goToLocation().goToLocation)(location.uri);
  } else {
    if (!(location.type === 'editor')) {
      throw new Error("Invariant violation: \"location.type === 'editor'\"");
    }

    const editor = location.editor;
    const pane = atom.workspace.paneForItem(editor);

    if (!(pane != null)) {
      throw new Error("Invariant violation: \"pane != null\"");
    }

    pane.activateItem(editor);
    pane.activate();
    return editor;
  }
}