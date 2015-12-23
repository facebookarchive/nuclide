'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  createTextEditor,
  isTextEditor,
  editorForPath,
} from '../lib/main';

describe('isTextEditor', () => {
  it('returns appropriate value for various inputs', () => {
    expect(isTextEditor(null)).toBe(false);
    expect(isTextEditor(undefined)).toBe(false);
    expect(isTextEditor(42)).toBe(false);
    expect(isTextEditor(false)).toBe(false);
    expect(isTextEditor('TextEditor')).toBe(false);
    expect(isTextEditor([])).toBe(false);
    expect(isTextEditor({})).toBe(false);

    const textEditor = createTextEditor(/* params */ {});
    expect(isTextEditor(textEditor)).toBe(true);
  });
});

describe('editorForPath', () => {
  const file1 = '/tmp/file1.txt';
  const file2 = '/tmp/file2.txt';
  const file3 = '/tmp/file3.txt';

  let file1Editor: atom$TextEditor = (null: any);
  let file2Editor: atom$TextEditor = (null: any);
  let secondFile2Editor: atom$TextEditor = (null: any);

  beforeEach(() => {
    waitsForPromise(async () => {
      file1Editor = await atom.workspace.open(file1);
      file2Editor = await atom.workspace.open(file2);
      secondFile2Editor = await atom.workspace.open(file2);
    });
  });

  it('should find the one editor for a file', () => {
    expect(editorForPath(file1)).toBe(file1Editor);
  });

  it('should find one of the editors for a file', () => {
    const editor = editorForPath(file2);
    expect(editor === file2Editor || editor === secondFile2Editor).toBeTruthy();
  });

  it('should return null if no editor exists', () => {
    expect(editorForPath(file3)).toBeNull();
  });
});
