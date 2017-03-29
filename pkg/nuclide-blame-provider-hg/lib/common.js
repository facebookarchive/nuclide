'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hgRepositoryForEditor = hgRepositoryForEditor;

var _vcs;

function _load_vcs() {
  return _vcs = require('../../commons-atom/vcs');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function hgRepositoryForEditor(editor) {
  const repo = (0, (_vcs || _load_vcs()).repositoryForPath)(editor.getPath() || '');
  if (!repo || repo.getType() !== 'hg') {
    return null;
  }
  return repo;
}