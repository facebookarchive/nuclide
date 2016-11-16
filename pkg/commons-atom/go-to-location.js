'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Subject} from 'rxjs';
import type {Observable} from 'rxjs';
import invariant from 'assert';

// Opens the given file at the line/column.
// By default will center the opened text editor.
export async function goToLocation(
  file: string,
  line?: number,
  column?: number,
  center?: boolean = true,
): Promise<atom$TextEditor> {
  // Prefer going to the current editor rather than the leftmost editor.
  const currentEditor = atom.workspace.getActiveTextEditor();
  if (currentEditor != null && currentEditor.getPath() === file) {
    if (line != null) {
      goToLocationInEditor(currentEditor, line, column == null ? 0 : column, center);
    } else {
      invariant(center !== true, 'goToLocation: Cannot center if no line specfied');
      invariant(column == null, 'goToLocation: Cannot specify just column');
    }
    return currentEditor;
  } else {
    const editor = await atom.workspace.open(file, {
      initialLine: line,
      initialColumn: column,
      searchAllPanes: true,
    });

    if (center) {
      editor.scrollToBufferPosition([line, column], {center: true});
    }
    return editor;
  }
}

const goToLocationSubject = new Subject();

// Scrolls to the given line/column at the given editor
// broadcasts the editor instance on an observable (subject) available
// through the getGoToLocation
export function goToLocationInEditor(
  editor: atom$TextEditor,
  line: number,
  column: number,
  center: boolean = true,
): void {
  editor.setCursorBufferPosition([line, column]);
  if (center) {
    editor.scrollToBufferPosition([line, column], {center: true});
  }

  goToLocationSubject.next(editor);
}

export function observeNavigatingEditors(): Observable<atom$TextEditor> {
  return goToLocationSubject;
}
