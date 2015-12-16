'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Range} from 'atom';

import {applyTextEdit} from '../lib/main';

const fakeFile = '/tmp/file.txt';

describe('applyTextEdit', () => {
  let editor: atom$TextEditor = (null: any);

  beforeEach(() => {
    waitsForPromise(async () => {
      editor = await atom.workspace.open(fakeFile);
      editor.setText('foo\nbar\nbaz\n');
    });
  });

  it('should apply a patch', () => {
    const textedit = {
      oldRange: new Range([1,0], [1, 2]),
      newText: 'BAR',
    };

    expect(applyTextEdit(fakeFile, textedit)).toBeTruthy();
    expect(editor.getText()).toEqual('foo\nBARr\nbaz\n');
  });

  it('should accept a patch with the right old text', () => {
    const textedit = {
      oldRange: new Range([1, 0], [1, 2]),
      newText: 'BAR',
      oldText: 'ba',
    };

    expect(applyTextEdit(fakeFile, textedit)).toBeTruthy();
    expect(editor.getText()).toEqual('foo\nBARr\nbaz\n');
  });

  it('should reject a patch with the wrong old text', () => {
    const textedit = {
      oldRange: new Range([1, 0], [1, 2]),
      newText: 'BAR',
      oldText: 'b',
    };

    expect(applyTextEdit(fakeFile, textedit)).toBeFalsy();
    expect(editor.getText()).toEqual('foo\nbar\nbaz\n');
  });
});
