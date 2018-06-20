'use strict';

var _atom = require('atom');

var _textEdit;

function _load_textEdit() {
  return _textEdit = require('../text-edit');
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

const fakeFile = '/tmp/file.txt';

describe('applyTextEdits', () => {
  let editor = null;

  beforeEach(async () => {
    await (async () => {
      editor = await atom.workspace.open(fakeFile);
      editor.setText('foo\nbar\nbaz\n');
    })();
  });

  it('should apply a patch', () => {
    const textedit = {
      oldRange: new _atom.Range([1, 0], [1, 2]),
      newText: 'BAR'
    };

    expect((0, (_textEdit || _load_textEdit()).applyTextEdits)(fakeFile, textedit)).toBeTruthy();
    expect(editor.getText()).toEqual('foo\nBARr\nbaz\n');
  });

  it('should apply whole-file patches by diffing', () => {
    const textedit = {
      oldRange: editor.getBuffer().getRange(),
      newText: 'BAR'
    };

    jest.spyOn(editor.getBuffer(), 'setTextViaDiff');

    expect((0, (_textEdit || _load_textEdit()).applyTextEdits)(fakeFile, textedit)).toBeTruthy();
    expect(editor.getText()).toEqual('BAR');
    expect(editor.getBuffer().setTextViaDiff).toHaveBeenCalled();
  });

  it('should accept a patch with the right old text', () => {
    const textedit = {
      oldRange: new _atom.Range([1, 0], [1, 2]),
      newText: 'BAR',
      oldText: 'ba'
    };

    expect((0, (_textEdit || _load_textEdit()).applyTextEdits)(fakeFile, textedit)).toBeTruthy();
    expect(editor.getText()).toEqual('foo\nBARr\nbaz\n');
  });

  it('should reject a patch with the wrong old text', () => {
    const textedit = {
      oldRange: new _atom.Range([1, 0], [1, 2]),
      newText: 'BAR',
      oldText: 'b'
    };

    expect((0, (_textEdit || _load_textEdit()).applyTextEdits)(fakeFile, textedit)).toBeFalsy();
    expect(editor.getText()).toEqual('foo\nbar\nbaz\n');
  });

  it('should reject a patch with an invalid old range', () => {
    const textedit = {
      oldRange: new _atom.Range([1, 4], [1, 4]),
      newText: 'foo',
      oldText: ''
    };

    expect((0, (_textEdit || _load_textEdit()).applyTextEdits)(fakeFile, textedit)).toBeFalsy();
  });

  it('should accept a patch that appends to a line', () => {
    const textedit = {
      oldRange: new _atom.Range([1, 3], [1, 3]),
      newText: ';',
      oldText: ''
    };

    expect((0, (_textEdit || _load_textEdit()).applyTextEdits)(fakeFile, textedit)).toBeTruthy();
    expect(editor.getText()).toEqual('foo\nbar;\nbaz\n');
  });

  it('should correctly apply edits on the same line', () => {
    const edits = [{
      oldRange: new _atom.Range([0, 0], [0, 1]),
      oldText: 'f',
      newText: 'FFF'
    }, {
      oldRange: new _atom.Range([0, 2], [0, 3]),
      oldText: 'o',
      newText: 'OOO'
    }];
    expect((0, (_textEdit || _load_textEdit()).applyTextEdits)(fakeFile, ...edits)).toBeTruthy();
    expect(editor.getText()).toEqual('FFFoOOO\nbar\nbaz\n');
  });
});