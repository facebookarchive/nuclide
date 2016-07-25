'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';

import JumpToRelatedFile from './JumpToRelatedFile';

let subscriptions: ?CompositeDisposable = null;

// Only expose a context menu for files in languages that have header files.
const GRAMMARS_WITH_HEADER_FILES = new Set([
  'source.c',
  'source.cpp',
  'source.objc',
  'source.objcpp',
  'source.ocaml',
]);

export function activate() {
  subscriptions = new CompositeDisposable(
    new JumpToRelatedFile(),
    atom.contextMenu.add({
      'atom-text-editor': [
        {
          label: 'Switch Between Header/Source',
          command: 'nuclide-related-files:jump-to-next-related-file',
          shouldDisplay() {
            const editor = atom.workspace.getActiveTextEditor();
            return editor != null &&
              GRAMMARS_WITH_HEADER_FILES.has(editor.getGrammar().scopeName);
          },
        },
        {type: 'separator'},
      ],
    }),
  );
}

export function deactivate() {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
}
