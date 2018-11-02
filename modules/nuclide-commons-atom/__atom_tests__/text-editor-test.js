"use strict";

function _textEditor() {
  const data = require("../text-editor");

  _textEditor = function () {
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
 * @emails oncall+nuclide
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