'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type JumpToRelatedFile from './JumpToRelatedFile';

let jumper: ?JumpToRelatedFile = null;

module.exports = {
  activate() {
    const jumpToRelatedFile = require('./JumpToRelatedFile');
    const RelatedFileFinder = require('./RelatedFileFinder');
    // Make it a const for Flow
    const local = jumper = new jumpToRelatedFile(new RelatedFileFinder());

    atom.workspace.observeTextEditors(textEditor => {
      local.enableInTextEditor(textEditor);
    });
  },

  deactivate() {
    if (jumper) {
      jumper.dispose();
      jumper = null;
    }
  },
};
