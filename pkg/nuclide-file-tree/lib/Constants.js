'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const REVEAL_FILE_ON_SWITCH_SETTING = exports.REVEAL_FILE_ON_SWITCH_SETTING = 'nuclide-file-tree.revealFileOnSwitch';
const SHOW_OPEN_FILE_CONFIG_KEY = exports.SHOW_OPEN_FILE_CONFIG_KEY = 'nuclide-file-tree.showOpenFiles';
const SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY = exports.SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY = 'nuclide-file-tree.showUncommittedChanges';
const SHOW_UNCOMMITTED_CHANGES_KIND_CONFIG_KEY = exports.SHOW_UNCOMMITTED_CHANGES_KIND_CONFIG_KEY = 'nuclide-file-tree.showUncommittedChangesKind';

const ShowUncommittedChangesKind = exports.ShowUncommittedChangesKind = Object.freeze({
  UNCOMMITTED: 'Uncommitted changes',
  HEAD: 'Head changes',
  STACK: 'Stack changes'
});

// This is to work around flow's missing support of enums.
ShowUncommittedChangesKind;

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/file-tree';