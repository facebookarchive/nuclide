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

import invariant from 'assert';
import {getScrollTop} from '../../commons-atom/text-editor';

// A location which can be navigated to. Includes the file (as uri for closed files and as
// atom$TextEditor for open files) as well as the cursor position and scroll.
export type UriLocation = {
  type: 'uri',
  uri: NuclideUri,
  bufferPosition: atom$Point,
  scrollTop: number,
};
export type EditorLocation = {
  type: 'editor',
  editor: atom$TextEditor,
  bufferPosition: atom$Point,
  scrollTop: number,
};
export type Location = EditorLocation | UriLocation;

export function getPathOfLocation(location: Location): ?NuclideUri {
  return location.type === 'uri' ? location.uri : location.editor.getPath();
}

export function getLocationOfEditor(editor: atom$TextEditor): EditorLocation {
  return {
    type: 'editor',
    editor,
    bufferPosition: editor.getCursorBufferPosition(),
    scrollTop: getScrollTop(editor),
  };
}

export async function editorOfLocation(location: Location): Promise<atom$TextEditor> {
  if (location.type === 'uri') {
    return await atom.workspace.open(location.uri, {
      searchAllPanes: true,
    });
  } else {
    invariant(location.type === 'editor');
    const editor = location.editor;
    const pane = atom.workspace.paneForItem(editor);
    invariant(pane != null);
    pane.activateItem(editor);
    pane.activate();
    return editor;
  }
}
