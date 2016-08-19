'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';

export type TextEdit = {
  oldRange: atom$Range,
  newText: string,
  // If included, this will be used to verify that the edit still applies cleanly.
  oldText?: string,
};

import invariant from 'assert';

import {existingEditorForUri} from '../../commons-atom/text-editor';

/**
 * Attempts to apply the given patches to the given file.
 *
 * The file must be currently open in Atom, and the changes will be applied to the buffer but not
 * saved.
 *
 * Returns true if the application was successful, otherwise false (e.g. if the oldText did not
 * match).
 */
export default function applyTextEdits(path: NuclideUri, ...edits: Array<TextEdit>): boolean {
  const editor = existingEditorForUri(path);
  invariant(editor != null);

  const buffer = editor.getBuffer();
  const checkpoint = buffer.createCheckpoint();

  for (const edit of edits) {
    const success = applyToBuffer(buffer, edit);
    if (!success) {
      buffer.revertToCheckpoint(checkpoint);
      return false;
    }
  }

  buffer.groupChangesSinceCheckpoint(checkpoint);
  return true;
}

function applyToBuffer(buffer: atom$TextBuffer, edit: TextEdit): boolean {
  if (edit.oldRange.start.row === edit.oldRange.end.row) {
    // A little extra validation when the old range spans only one line. In particular, this helps
    // when the old range is empty so there is no old text for us to compare against. We can at
    // least abort if the line isn't long enough.
    const lineLength = buffer.lineLengthForRow(edit.oldRange.start.row);
    if (edit.oldRange.end.column > lineLength) {
      return false;
    }
  }
  if (edit.oldText != null) {
    const currentText = buffer.getTextInRange(edit.oldRange);
    if (currentText !== edit.oldText) {
      return false;
    }
  }
  buffer.setTextInRange(edit.oldRange, edit.newText);
  return true;
}
