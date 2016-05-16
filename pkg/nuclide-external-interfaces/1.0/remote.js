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
 * The `remote` module provides functions related to communicating with the main Electron process.
 *
 * {@link http://electron.atom.io/docs/latest/api/remote/}
 */
declare module 'remote' {
  /**
   * Show the given file in a file manager. If possible, select the file.
   *
   * {@link http://electron.atom.io/docs/latest/api/shell/#shell-showiteminfolder-fullpath}
   *
   * TODO: type BrowserWindow, WebContents return types.
   */
  declare function require(module: string): any;
  declare function getCurrentWindow(): any;
  declare function getCurrentWebContents(): mixed;
  declare function getGlobal(name: string): any;
  declare var process: mixed;
}
