Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.waitsForFile = waitsForFile;
exports.waitsForFilePosition = waitsForFilePosition;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

/**
 * Waits for the specified file to become the active text editor.
 * Can only be used in a Jasmine context.
 */

function waitsForFile(filename) {
  var timeoutMs = arguments.length <= 1 || arguments[1] === undefined ? 10000 : arguments[1];

  waitsFor(filename + ' to become active', timeoutMs, function () {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return false;
    }
    var editorPath = editor.getPath();
    if (editorPath == null) {
      return false;
    }
    return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(editorPath) === filename;
  });
}

function waitsForFilePosition(filename, row, column) {
  var timeoutMs = arguments.length <= 3 || arguments[3] === undefined ? 10000 : arguments[3];

  waitsFor(filename + ' to become active at ' + row + ':' + column, timeoutMs, function () {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return false;
    }
    var editorPath = editor.getPath();
    if (editorPath == null) {
      return false;
    }
    var pos = editor.getCursorBufferPosition();
    return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(editorPath) === filename && pos.row === row && pos.column === column;
  });
}