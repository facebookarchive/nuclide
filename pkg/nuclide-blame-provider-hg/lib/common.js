Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.hgRepositoryForEditor = hgRepositoryForEditor;

var _require = require('../../nuclide-hg-git-bridge');

var repositoryForPath = _require.repositoryForPath;

function hgRepositoryForEditor(editor) {
  var repo = repositoryForPath(editor.getPath() || '');
  if (!repo || repo.getType() !== 'hg') {
    return null;
  }
  return repo;
}