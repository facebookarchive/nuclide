"use strict";

function _textEditor() {
  const data = require("../text-editor");

  _textEditor = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

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
describe('existingEditorForUri', () => {
  const file1 = '/tmp/file1.txt';
  const file2 = '/tmp/file2.txt';
  const file3 = '/tmp/file3.txt';
  let file1Editor = null;
  let file2Editor = null;
  let secondFile2Editor = null;
  beforeEach(async () => {
    file1Editor = await atom.workspace.open(file1);
    file2Editor = await atom.workspace.open(file2);
    secondFile2Editor = await atom.workspace.open(file2);
  });
  it('should find the one editor for a file', () => {
    expect((0, _textEditor().existingEditorForUri)(file1)).toBe(file1Editor);
  });
  it('should find one of the editors for a file', () => {
    const editor = (0, _textEditor().existingEditorForUri)(file2);
    expect(editor === file2Editor || editor === secondFile2Editor).toBeTruthy();
  });
  it('should return null if no editor exists', () => {
    expect((0, _textEditor().existingEditorForUri)(file3)).toBeNull();
  });
});

function ensureReadOnlyOperations(buffer, operations, expectedReadOnly) {
  const initialText = buffer.getText();
  operations.forEach(operation => {
    operation();
    expect(initialText === buffer.getText()).toBe(expectedReadOnly);

    if (!expectedReadOnly) {
      buffer.setText(initialText);
    }
  });
}

describe('enforceReadOnlyEditor', () => {
  function getOperations(editor) {
    return [() => editor.insertText('xyz'), () => editor.backspace(), () => editor.duplicateLines(), () => editor.insertNewline()];
  }

  it('should not be able to write to the text editor', async () => {
    const editor = await atom.workspace.open('');
    editor.setText('ABC\nDEF');
    const buffer = editor.getBuffer();
    const operations = getOperations(editor);
    ensureReadOnlyOperations(buffer, operations, false);
    (0, _textEditor().enforceReadOnlyEditor)(editor);
    ensureReadOnlyOperations(buffer, operations, true); // Underlying buffer's `setText` and `append` are an exception by default.

    ensureReadOnlyOperations(buffer, [() => buffer.setText('lol'), () => buffer.append('lol')], false);
  });
  it('should be able to write to the text editor after cancelling', async () => {
    const editor = await atom.workspace.open('');
    editor.setText('ABC\nDEF');
    const buffer = editor.getBuffer();
    const operations = getOperations(editor);
    const enforceReadOnlyEditorDisposable = (0, _textEditor().enforceReadOnlyEditor)(editor, []);
    enforceReadOnlyEditorDisposable.dispose();
    ensureReadOnlyOperations(buffer, operations, false);
  });
});
describe('enforceReadOnlyBuffer', () => {
  function getOperations(buffer) {
    return [() => buffer.append('xyz'), () => buffer.deleteRows(0, 1), () => buffer.delete(new _atom.Range([0, 0], [1, 0])), () => buffer.insert(new _atom.Point(0, 0), 'lol'), () => buffer.undo(), () => buffer.setText('lol')];
  }

  it('should not be able to write to the text buffer', async () => {
    const editor = await atom.workspace.open('');
    const buffer = editor.getBuffer();
    buffer.setText('ABC\nDEF');
    const operations = getOperations(buffer);
    ensureReadOnlyOperations(buffer, operations, false);
    (0, _textEditor().enforceReadOnlyEditor)(editor, []);
    ensureReadOnlyOperations(buffer, operations, true);
  });
  it('should be able to write to the text buffer after cancelling', async () => {
    const editor = await atom.workspace.open('');
    const buffer = editor.getBuffer();
    buffer.setText('ABC\nDEF');
    const operations = getOperations(buffer);
    const enforceReadOnlyEditorDisposable = (0, _textEditor().enforceReadOnlyEditor)(editor, []);
    enforceReadOnlyEditorDisposable.dispose();
    ensureReadOnlyOperations(buffer, operations, false);
  });
});