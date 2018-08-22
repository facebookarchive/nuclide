"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WORKSPACE_VIEW_URI = exports.ShowUncommittedChangesKind = exports.SHOW_UNCOMMITTED_CHANGES_KIND_CONFIG_KEY = exports.SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY = exports.SHOW_OPEN_FILE_CONFIG_KEY = exports.REVEAL_FILE_ON_SWITCH_SETTING = void 0;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */
const REVEAL_FILE_ON_SWITCH_SETTING = 'nuclide-file-tree.revealFileOnSwitch';
exports.REVEAL_FILE_ON_SWITCH_SETTING = REVEAL_FILE_ON_SWITCH_SETTING;
const SHOW_OPEN_FILE_CONFIG_KEY = 'nuclide-file-tree.showOpenFiles';
exports.SHOW_OPEN_FILE_CONFIG_KEY = SHOW_OPEN_FILE_CONFIG_KEY;
const SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY = 'nuclide-file-tree.showUncommittedChanges';
exports.SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY = SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY;
const SHOW_UNCOMMITTED_CHANGES_KIND_CONFIG_KEY = 'nuclide-file-tree.showUncommittedChangesKind';
exports.SHOW_UNCOMMITTED_CHANGES_KIND_CONFIG_KEY = SHOW_UNCOMMITTED_CHANGES_KIND_CONFIG_KEY;
const ShowUncommittedChangesKind = Object.freeze({
  UNCOMMITTED: 'Uncommitted changes',
  HEAD: 'Head changes',
  STACK: 'Stack changes'
}); // This is to work around flow's missing support of enums.

exports.ShowUncommittedChangesKind = ShowUncommittedChangesKind;
ShowUncommittedChangesKind;
const WORKSPACE_VIEW_URI = 'atom://nuclide/file-tree';
exports.WORKSPACE_VIEW_URI = WORKSPACE_VIEW_URI;