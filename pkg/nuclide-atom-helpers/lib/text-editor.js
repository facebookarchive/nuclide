'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

import invariant from 'assert';
import {TextBuffer, TextEditor} from 'atom';
import {Observable} from 'rx';

// TODO(most): move to remote-connection/lib/RemoteTextBuffer.js
import NuclideTextBuffer from '../../nuclide-remote-projects/lib/NuclideTextBuffer';
import {isLocal} from '../../nuclide-remote-uri';
import {RemoteConnection} from '../../nuclide-remote-connection';

import {event as commonsEvent} from '../../nuclide-commons';
const {observableFromSubscribeFunction} = commonsEvent;

export function isTextEditor(item: ?any): boolean {
  if (item == null) {
    return false;
  } else if (typeof atom.workspace.buildTextEditor === 'function') {
    // If buildTextEditor is present, then accessing the TextEditor constructor will trigger a
    // deprecation warning. Atom recommends testing for the existence of the public method of
    // TextEditor that you are using as a proxy for whether the object is a TextEditor:
    // https://github.com/atom/atom/commit/4d2d4c3. This is a fairly weak heuristic, so we test
    // for a larger set of methods that are more likely unique to TextEditor as a better heuristic:
    return typeof item.screenPositionForBufferPosition === 'function' &&
      typeof item.scanInBufferRange === 'function' &&
      typeof item.scopeDescriptorForBufferPosition === 'function';
  } else {
    return item instanceof TextEditor;
  }
}

export function createTextEditor(textEditorParams: atom$TextEditorParams): TextEditor {
  // Note that atom.workspace.buildTextEditor was introduced after the release of Atom 1.0.19.
  // As of this change, calling the constructor of TextEditor directly is deprecated. Therefore,
  // we must choose the appropriate code path based on which API is available.
  if (atom.workspace.buildTextEditor) {
    return atom.workspace.buildTextEditor(textEditorParams);
  } else {
    return new TextEditor(textEditorParams);
  }
}

/**
 * Returns a text editor that has the given path open, or null if none exists. If there are multiple
 * text editors for this path, one is chosen arbitrarily.
 */
export function existingEditorForUri(path: NuclideUri): ?atom$TextEditor {
  // This isn't ideal but realistically iterating through even a few hundred editors shouldn't be a
  // real problem. And if you have more than a few hundred you probably have bigger problems.
  for (const editor of atom.workspace.getTextEditors()) {
    if (editor.getPath() === path) {
      return editor;
    }
  }

  return null;
}

export async function loadBufferForUri(uri: NuclideUri): Promise<atom$TextBuffer> {
  let buffer = existingBufferForUri(uri);
  if (buffer == null) {
    buffer = createBufferForUri(uri);
  }
  if (buffer.loaded) {
    return buffer;
  }
  try {
    await buffer.load();
    return buffer;
  } catch (error) {
    atom.project.removeBuffer(buffer);
    throw error;
  }
}

/**
 * Returns an existing buffer for that uri, or create one if not existing.
 */
export function bufferForUri(uri: NuclideUri): atom$TextBuffer {
  const buffer = existingBufferForUri(uri);
  if (buffer != null) {
    return buffer;
  }
  return createBufferForUri(uri);
}

function createBufferForUri(uri: NuclideUri): atom$TextBuffer {
  let buffer;
  if (isLocal(uri)) {
    buffer = new TextBuffer({filePath: uri});
  } else {
    const connection = RemoteConnection.getForUri(uri);
    if (connection == null) {
      throw new Error(`RemoteConnection cannot be found for uri: ${uri}`);
    }
    buffer = new NuclideTextBuffer(connection.getConnection(), {filePath: uri});
  }
  atom.project.addBuffer(buffer);
  invariant(buffer);
  return buffer;
}

/**
 * Returns an exsting buffer for that uri, or null if not existing.
 */
export function existingBufferForUri(uri: NuclideUri): ?atom$TextBuffer {
  return atom.project.findBufferForPath(uri);
}

export function getViewOfEditor(editor: atom$TextEditor): atom$TextEditorElement {
  return atom.views.getView(editor);
}

export function getScrollTop(editor: atom$TextEditor): number {
  return getViewOfEditor(editor).getScrollTop();
}

export function setScrollTop(editor: atom$TextEditor, scrollTop: number): void {
  getViewOfEditor(editor).setScrollTop(scrollTop);
}

/**
 * Does a best effort to set an editor pane to a given cursor position & scroll.
 * Does not ensure that the current cursor position is visible.
 *
 * Can be used with editor.getCursorBufferPosition() & getScrollTop() to restore
 * an editors cursor and scroll.
 */
export function setPositionAndScroll(
  editor: atom$TextEditor,
  position: atom$Point,
  scrollTop: number,
): void {
  editor.setCursorBufferPosition(position, {autoscroll: false});
  setScrollTop(editor, scrollTop);
}

export function getCursorPositions(editor: atom$TextEditor): Observable<atom$Point> {
  // This will behave strangely in the face of multiple cursors. Consider supporting multiple
  // cursors in the future.
  const cursor = editor.getCursors()[0];
  invariant(cursor != null);
  return Observable.merge(
    Observable.just(cursor.getBufferPosition()),
    observableFromSubscribeFunction(cursor.onDidChangePosition.bind(cursor))
      .map(event => event.newBufferPosition),
  );
}
