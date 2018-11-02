"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.existingEditorForUri = existingEditorForUri;
exports.existingEditorForBuffer = existingEditorForBuffer;
exports.getViewOfEditor = getViewOfEditor;
exports.getScrollTop = getScrollTop;
exports.setScrollTop = setScrollTop;
exports.setPositionAndScroll = setPositionAndScroll;
exports.getCursorPositions = getCursorPositions;
exports.observeEditorDestroy = observeEditorDestroy;
exports.enforceReadOnlyEditor = enforceReadOnlyEditor;
exports.enforceSoftWrap = enforceSoftWrap;
exports.isValidTextEditor = isValidTextEditor;
exports.centerScrollToBufferLine = centerScrollToBufferLine;

var _atom = require("atom");

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _event() {
  const data = require("../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/**
 * Returns a text editor that has the given path open, or null if none exists. If there are multiple
 * text editors for this path, one is chosen arbitrarily.
 */
function existingEditorForUri(path) {
  // This isn't ideal but realistically iterating through even a few hundred editors shouldn't be a
  // real problem. And if you have more than a few hundred you probably have bigger problems.
  for (const editor of atom.workspace.getTextEditors()) {
    if (editor.getPath() === path) {
      return editor;
    }
  }

  return null;
}
/**
 * Returns a text editor that has the given buffer open, or null if none exists. If there are
 * multiple text editors for this buffer, one is chosen arbitrarily.
 */


function existingEditorForBuffer(buffer) {
  // This isn't ideal but realistically iterating through even a few hundred editors shouldn't be a
  // real problem. And if you have more than a few hundred you probably have bigger problems.
  for (const editor of atom.workspace.getTextEditors()) {
    if (editor.getBuffer() === buffer) {
      return editor;
    }
  }

  return null;
}

function getViewOfEditor(editor) {
  return atom.views.getView(editor);
}

function getScrollTop(editor) {
  return getViewOfEditor(editor).getScrollTop();
}

function setScrollTop(editor, scrollTop) {
  getViewOfEditor(editor).setScrollTop(scrollTop);
}
/**
 * Does a best effort to set an editor pane to a given cursor position & scroll.
 * Does not ensure that the current cursor position is visible.
 *
 * Can be used with editor.getCursorBufferPosition() & getScrollTop() to restore
 * an editors cursor and scroll.
 */


function setPositionAndScroll(editor, position, scrollTop) {
  editor.setCursorBufferPosition(position, {
    autoscroll: false
  });
  setScrollTop(editor, scrollTop);
}

function getCursorPositions(editor) {
  return _rxjsCompatUmdMin.Observable.defer(() => {
    // This will behave strangely in the face of multiple cursors. Consider supporting multiple
    // cursors in the future.
    const cursor = editor.getCursors()[0];

    if (!(cursor != null)) {
      throw new Error("Invariant violation: \"cursor != null\"");
    }

    return _rxjsCompatUmdMin.Observable.merge(_rxjsCompatUmdMin.Observable.of(cursor.getBufferPosition()), (0, _event().observableFromSubscribeFunction)(cursor.onDidChangePosition.bind(cursor)).map(event => event.newBufferPosition));
  });
}

function observeEditorDestroy(editor) {
  return (0, _event().observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor)).map(event => editor).take(1);
} // Use atom readOnly attribute to set read-only state.


function enforceReadOnlyEditor(textEditor, readOnlyExceptions = ['append', 'setText']) {
  textEditor.getElement().setAttribute('readonly', '');
  return {
    dispose() {
      textEditor.getElement().removeAttribute('readonly');
    }

  };
} // Turn off soft wrap setting for these editors so diffs properly align.
// Some text editor register sometimes override the set soft wrapping
// after mounting an editor to the workspace - here, that's watched and reset to `false`.


function enforceSoftWrap(editor, enforcedSoftWrap) {
  editor.setSoftWrapped(enforcedSoftWrap);
  return editor.onDidChangeSoftWrapped(softWrapped => {
    if (softWrapped !== enforcedSoftWrap) {
      // Reset the overridden softWrap to `false` once the operation completes.
      process.nextTick(() => {
        if (!editor.isDestroyed()) {
          editor.setSoftWrapped(enforcedSoftWrap);
        }
      });
    }
  });
}
/**
 * Checks if an object (typically an Atom pane) is a TextEditor.
 * Could be replaced with atom.workspace.isValidTextEditor,
 * but Flow doesn't support %checks in methods yet.
 */


function isValidTextEditor(item) {
  return item instanceof _atom.TextEditor;
}

function centerScrollToBufferLine(textEditorElement, bufferLineNumber) {
  const textEditor = textEditorElement.getModel();
  const pixelPositionTop = textEditorElement.pixelPositionForBufferPosition([bufferLineNumber, 0]).top; // Manually calculate the scroll location, instead of using
  // `textEditor.scrollToBufferPosition([lineNumber, 0], {center: true})`
  // because that API to wouldn't center the line if it was in the visible screen range.

  const scrollTop = pixelPositionTop + textEditor.getLineHeightInPixels() / 2 - textEditorElement.clientHeight / 2;
  textEditorElement.setScrollTop(Math.max(scrollTop, 1));
  textEditorElement.focus();
  textEditor.setCursorBufferPosition([bufferLineNumber, 0], {
    autoscroll: false
  });
}