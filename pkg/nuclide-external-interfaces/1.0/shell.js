/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/* eslint-disable no-unused-vars */

/**
 * The `shell` module provides functions related to desktop integration.
 *
 * {@link http://electron.atom.io/docs/latest/api/shell/}
 */
declare module 'shell' {
  /**
   * Show the given file in a file manager. If possible, select the file.
   *
   * {@link http://electron.atom.io/docs/latest/api/shell/#shell-showiteminfolder-fullpath}
   */
  declare function showItemInFolder(fullPath: string): void;
  declare function moveItemToTrash(fullPath: string): boolean;
  declare function openExternal(url: string): void;
}
