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

exports.getPathOfLocation = getPathOfLocation;
exports.getLocationOfEditor = getLocationOfEditor;

var editorOfLocation = _asyncToGenerator(function* (location) {
  if (location.type === 'uri') {
    return yield atom.workspace.open(location.uri, {
      searchAllPanes: true
    });
  } else {
    (0, (_assert2 || _assert()).default)(location.type === 'editor');
    var _editor = location.editor;
    var pane = atom.workspace.paneForItem(_editor);
    (0, (_assert2 || _assert()).default)(pane != null);
    pane.activateItem(_editor);
    pane.activate();
    return _editor;
  }
});

exports.editorOfLocation = editorOfLocation;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsAtomTextEditor2;

function _commonsAtomTextEditor() {
  return _commonsAtomTextEditor2 = require('../../commons-atom/text-editor');
}

// A location which can be navigated to. Includes the file (as uri for closed files and as
// atom$TextEditor for open files) as well as the cursor position and scroll.

function getPathOfLocation(location) {
  return location.type === 'uri' ? location.uri : location.editor.getPath();
}

function getLocationOfEditor(editor) {
  return {
    type: 'editor',
    editor: editor,
    bufferPosition: editor.getCursorBufferPosition(),
    scrollTop: (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).getScrollTop)(editor)
  };
}