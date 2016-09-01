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

exports.convertRange = convertRange;
exports.getFileVersionOfBuffer = getFileVersionOfBuffer;
exports.getFileVersionOfEditor = getFileVersionOfEditor;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

// Workaround for flow

function convertRange(range) {
  return {
    start: range.start,
    end: range.end
  };
}

function getFileVersionOfBuffer(buffer) {
  (0, (_assert2 || _assert()).default)(buffer.getPath() !== '');
  return {
    filePath: buffer.getPath(),
    version: buffer.changeCount
  };
}

function getFileVersionOfEditor(editor) {
  return getFileVersionOfBuffer(editor.getBuffer());
}