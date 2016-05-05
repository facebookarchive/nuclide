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
}

export function deactivate() {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
  jumpToRelatedFile = null;
}
