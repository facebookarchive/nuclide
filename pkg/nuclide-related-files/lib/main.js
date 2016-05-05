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
import {CompositeDisposable} from 'atom';

import JumpToRelatedFile from './JumpToRelatedFile';
import RelatedFileFinder from './RelatedFileFinder';

let jumpToRelatedFile: ?JumpToRelatedFile = null;
let subscriptions: ?CompositeDisposable = null;

// Only expose a context menu for C-family files.
const C_GRAMMARS = new Set([
  'source.c',
  'source.cpp',
  'source.objc',
  'source.objcpp',
]);

export function activate() {
  subscriptions = new CompositeDisposable();
  subscriptions.add(atom.workspace.observeTextEditors(textEditor => {
    if (jumpToRelatedFile == null) {
      jumpToRelatedFile = new JumpToRelatedFile(new RelatedFileFinder());
      invariant(subscriptions);
      subscriptions.add(jumpToRelatedFile);
    }
    jumpToRelatedFile.enableInTextEditor(textEditor);
  }));
  subscriptions.add(atom.contextMenu.add({
    'atom-text-editor': [
      {
        label: 'Switch Between Header/Source',
        command: 'nuclide-related-files:jump-to-next-related-file',
        shouldDisplay() {
          const editor = atom.workspace.getActiveTextEditor();
          return editor != null && C_GRAMMARS.has(editor.getGrammar().scopeName);
        },
      },
      {type: 'separator'},
    ],
  }));
}

export function deactivate() {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
  jumpToRelatedFile = null;
}
