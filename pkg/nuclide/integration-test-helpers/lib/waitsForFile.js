'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';

/**
 * Waits for the specified file to become the active text editor.
 * Can only be used in a Jasmine context.
 */
export function waitsForFile(filename: string, timeoutMs: number = 10000): void {
  waitsFor(`${filename} to become active`, timeoutMs, () => {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return false;
    }
    const editorPath = editor.getPath();
    if (editorPath == null) {
      return false;
    }
    return path.basename(editorPath) === filename;
  });
}
