'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';

export type TextEdit = {
  oldRange: atom$Range,
  newText: string,
  // If included, this will be used to verify that the edit still applies cleanly.
  oldText?: string,
}

import invariant from 'assert';

import {editorForPath} from '../../atom-helpers';

/**
 * Attempts to apply the patch to the given file.
 *
 * The file must be currently open in Atom, and the changes will be applied to the buffer but not
 * saved.
 *
 * Returns true if the application was successful, otherwise false (e.g. if the oldText did not
 * match).
 */
export function applyTextEdit(path: NuclideUri, edit: TextEdit): boolean {
  const editor = editorForPath(path);
  invariant(editor != null);
  const buffer = editor.getBuffer();
  if (edit.oldText != null) {
    const currentText = buffer.getTextInRange(edit.oldRange);
    if (currentText !== edit.oldText) {
      return false;
    }
  }
  buffer.setTextInRange(edit.oldRange, edit.newText);
  return true;
}
