'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {repositoryForPath} = require('nuclide-hg-git-bridge');

import type {BlameForEditor} from 'nuclide-blame-base/blame-types';

var logger;
function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

function hgRepositoryForEditor(editor: TextEditor): ?Repository {
  var repo = repositoryForPath(editor.getPath());
  if (!repo || repo.getType !== 'hg') {
    return null;
  }
  return repo;
}

function canProvideBlameForEditor(editor: TextEditor): boolean {
  var repo = hgRepositoryForEditor(editor);
  return !!repo;
}

async function getBlameForEditor(editor: TextEditor): Promise<BlameForEditor> {
  var repo = hgRepositoryForEditor(editor);
  if (!repo) {
    var message = 'HgBlameProvider could not fetch blame for ' + editor.getPath() + ': no Hg repo found.';
    getLogger().error(message);
    throw new Error(message);
  }

  var blameForEditor = await repo.getBlameAtHead(editor.getPath());
  return blameForEditor;
}


module.exports = {
  canProvideBlameForEditor,
  getBlameForEditor,
};
