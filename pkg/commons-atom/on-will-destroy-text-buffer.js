Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = onWillDestroyTextBuffer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

function onWillDestroyTextBuffer(callback) {
  return atom.workspace.onWillDestroyPaneItem(function (_ref) {
    var item = _ref.item;

    if (!atom.workspace.isTextEditor(item)) {
      return;
    }

    var editor = item;
    var openBufferCount = editor.getBuffer().refcount;
    (0, (_assert2 || _assert()).default)(openBufferCount !== 0, 'The file that is about to be closed should still be open.');
    if (openBufferCount === 1) {
      callback(editor.getBuffer());
    }
  });
}

module.exports = exports.default;