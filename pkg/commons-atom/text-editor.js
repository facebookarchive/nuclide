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
exports.loadBufferForUri = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let loadBufferForUri = exports.loadBufferForUri = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (uri) {
    let buffer = existingBufferForUri(uri);
    if (buffer == null) {
      buffer = createBufferForUri(uri);
    }
    if (buffer.loaded) {
      return buffer;
    }
    try {
      yield buffer.load();
      return buffer;
    } catch (error) {
      atom.project.removeBuffer(buffer);
      throw error;
    }
  });

  return function loadBufferForUri(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Returns an existing buffer for that uri, or create one if not existing.
 */


exports.existingEditorForUri = existingEditorForUri;
exports.existingEditorForBuffer = existingEditorForBuffer;
exports.bufferForUri = bufferForUri;
exports.existingBufferForUri = existingBufferForUri;
exports.getViewOfEditor = getViewOfEditor;
exports.getScrollTop = getScrollTop;
exports.setScrollTop = setScrollTop;
exports.setPositionAndScroll = setPositionAndScroll;
exports.getCursorPositions = getCursorPositions;
exports.observeEditorDestroy = observeEditorDestroy;
exports.enforceReadOnly = enforceReadOnly;

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../nuclide-remote-connection');
}

var _event;

function _load_event() {
  return _event = require('../commons-node/event');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function bufferForUri(uri) {
  const buffer = existingBufferForUri(uri);
  if (buffer != null) {
    return buffer;
  }
  return createBufferForUri(uri);
}

function createBufferForUri(uri) {
  let buffer;
  if ((_nuclideUri || _load_nuclideUri()).default.isLocal(uri)) {
    buffer = new _atom.TextBuffer({ filePath: uri });
  } else {
    const connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.getForUri(uri);
    if (connection == null) {
      throw new Error(`ServerConnection cannot be found for uri: ${ uri }`);
    }
    buffer = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).NuclideTextBuffer(connection, { filePath: uri });
  }
  atom.project.addBuffer(buffer);

  if (!buffer) {
    throw new Error('Invariant violation: "buffer"');
  }

  return buffer;
}

/**
 * Returns an exsting buffer for that uri, or null if not existing.
 */
function existingBufferForUri(uri) {
  return atom.project.findBufferForPath(uri);
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
  editor.setCursorBufferPosition(position, { autoscroll: false });
  setScrollTop(editor, scrollTop);
}

function getCursorPositions(editor) {
  // This will behave strangely in the face of multiple cursors. Consider supporting multiple
  // cursors in the future.
  const cursor = editor.getCursors()[0];

  if (!(cursor != null)) {
    throw new Error('Invariant violation: "cursor != null"');
  }

  return _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.of(cursor.getBufferPosition()), (0, (_event || _load_event()).observableFromSubscribeFunction)(cursor.onDidChangePosition.bind(cursor)).map(event => event.newBufferPosition));
}

function observeEditorDestroy(editor) {
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor)).map(event => editor).take(1);
}

// As of the introduction of atom.workspace.buildTextEditor(), it is no longer possible to
// subclass TextEditor to create a ReadOnlyTextEditor. Instead, the way to achieve this effect
// is to create an ordinary TextEditor and then override any methods that would allow it to
// change its contents.
// TODO: https://github.com/atom/atom/issues/9237.
function enforceReadOnly(textEditor) {
  const noop = () => {};

  // Cancel insert events to prevent typing in the text editor and disallow editing (read-only).
  textEditor.onWillInsertText(event => {
    event.cancel();
  });

  const textBuffer = textEditor.getBuffer();

  // All user edits use `transact` - so, mocking this will effectively make the editor read-only.
  const originalApplyChange = textBuffer.applyChange;
  textBuffer.applyChange = noop;

  // `setText` & `append` are the only exceptions that's used to set the read-only text.
  passReadOnlyException('append');
  passReadOnlyException('setText');

  function passReadOnlyException(functionName) {
    const buffer = textBuffer;
    const originalFunction = buffer[functionName];

    buffer[functionName] = function () {
      textBuffer.applyChange = originalApplyChange;
      const result = originalFunction.apply(textBuffer, arguments);
      textBuffer.applyChange = noop;
      return result;
    };
  }
}