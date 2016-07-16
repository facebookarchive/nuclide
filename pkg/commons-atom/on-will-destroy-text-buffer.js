'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

export default function onWillDestroyTextBuffer(
  callback: (buffer: atom$TextBuffer) => mixed,
): IDisposable {
  return atom.workspace.onWillDestroyPaneItem(({item}) => {
    if (!atom.workspace.isTextEditor(item)) {
      return;
    }

    const editor: atom$TextEditor = (item: any);
    const openBufferCount = editor.getBuffer().refcount;
    invariant(
      openBufferCount !== 0,
      'The file that is about to be closed should still be open.',
    );
    if (openBufferCount === 1) {
      callback(editor.getBuffer());
    }
  });
}
