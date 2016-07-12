Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.existingEditorForUri = existingEditorForUri;

var loadBufferForUri = _asyncToGenerator(function* (uri) {
  var buffer = existingBufferForUri(uri);
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
}

/**
 * Returns an existing buffer for that uri, or create one if not existing.
 */
);

exports.loadBufferForUri = loadBufferForUri;
exports.bufferForUri = bufferForUri;
exports.existingBufferForUri = existingBufferForUri;
exports.getViewOfEditor = getViewOfEditor;
exports.getScrollTop = getScrollTop;
exports.setScrollTop = setScrollTop;
exports.setPositionAndScroll = setPositionAndScroll;
exports.getCursorPositions = getCursorPositions;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

// TODO(most): move to remote-connection/lib/RemoteTextBuffer.js

var _nuclideRemoteProjectsLibNuclideTextBuffer2;

function _nuclideRemoteProjectsLibNuclideTextBuffer() {
  return _nuclideRemoteProjectsLibNuclideTextBuffer2 = _interopRequireDefault(require('../nuclide-remote-projects/lib/NuclideTextBuffer'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../nuclide-remote-uri'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../nuclide-remote-connection');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../commons-node/event');
}

/**
 * Returns a text editor that has the given path open, or null if none exists. If there are multiple
 * text editors for this path, one is chosen arbitrarily.
 */

function existingEditorForUri(path) {
  // This isn't ideal but realistically iterating through even a few hundred editors shouldn't be a
  // real problem. And if you have more than a few hundred you probably have bigger problems.
  for (var editor of atom.workspace.getTextEditors()) {
    if (editor.getPath() === path) {
      return editor;
    }
  }

  return null;
}

function bufferForUri(uri) {
  var buffer = existingBufferForUri(uri);
  if (buffer != null) {
    return buffer;
  }
  return createBufferForUri(uri);
}

function createBufferForUri(uri) {
  var buffer = undefined;
  if ((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isLocal(uri)) {
    buffer = new (_atom2 || _atom()).TextBuffer({ filePath: uri });
  } else {
    var connection = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ServerConnection.getForUri(uri);
    if (connection == null) {
      throw new Error('ServerConnection cannot be found for uri: ' + uri);
    }
    buffer = new (_nuclideRemoteProjectsLibNuclideTextBuffer2 || _nuclideRemoteProjectsLibNuclideTextBuffer()).default(connection, { filePath: uri });
  }
  atom.project.addBuffer(buffer);
  (0, (_assert2 || _assert()).default)(buffer);
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
  var cursor = editor.getCursors()[0];
  (0, (_assert2 || _assert()).default)(cursor != null);
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(cursor.getBufferPosition()), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(cursor.onDidChangePosition.bind(cursor)).map(function (event) {
    return event.newBufferPosition;
  }));
}