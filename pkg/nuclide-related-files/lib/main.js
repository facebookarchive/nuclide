'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import JumpToRelatedFile from './JumpToRelatedFile';
import RelatedFileFinder from './RelatedFileFinder';

let jumpToRelatedFile: ?JumpToRelatedFile = null;

module.exports = {
  activate() {
    // Make it a const for Flow
    const local = jumpToRelatedFile = new JumpToRelatedFile(new RelatedFileFinder());

    atom.workspace.observeTextEditors(textEditor => {
      local.enableInTextEditor(textEditor);
    });
  },

  deactivate() {
    if (jumpToRelatedFile) {
      jumpToRelatedFile.dispose();
      jumpToRelatedFile = null;
    }
  },
};
