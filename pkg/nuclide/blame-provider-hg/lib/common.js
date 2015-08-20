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

function hgRepositoryForEditor(editor: TextEditor): ?Repository {
  var repo = repositoryForPath(editor.getPath());
  if (!repo || repo.getType() !== 'hg') {
    return null;
  }
  return repo;
}

module.exports = {
  hgRepositoryForEditor,
};
