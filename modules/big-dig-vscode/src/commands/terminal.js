/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import {getLogger} from 'log4js';
import * as vscode from 'vscode';
import {RemoteFileSystem} from '../RemoteFileSystem';
import {getFilesystemForUri} from '../remote';
import {createRemoteTerminal} from '../terminal';
import {pickRemoteWorkspaceFolder} from './workspace';

const logger = getLogger('commands');

/**
 * If `file` is given, then open a remote terminal at the path. Otherwise,
 * present a UI to select from one of the remote workspace folders.
 */
export async function openRemoteTerminal(
  bigDigSessionId: string,
  file?: vscode.Uri,
): Promise<void> {
  const location = await getTerminalLocation(file);
  if (location == null) {
    return;
  }

  const {fs, path} = location;
  try {
    const conn = await fs.getConnection();
    const cwd = fs.uriToPath(await fs.toDir(path));
    await createRemoteTerminal(conn, cwd, {
      // The `code` shell script uses this env. var. to communicate files to edit, etc. to vscode.
      BIG_DIG_SESSION: bigDigSessionId,
      TERM_PROGRAM: 'vscode',
    });
  } catch (error) {
    logger.error('Failed to open remote terminal', error);
  }
}

/**
 * Returns a location where a terminal should be opened, returning a filesystem
 * and path. If `path` is specified, then this will find the associated
 * filesystem. Otherwise, this will present a UI to select a remote workspace
 * folder to open in the terminal.
 */
async function getTerminalLocation(
  path: ?vscode.Uri,
): Promise<?{fs: RemoteFileSystem, path: vscode.Uri}> {
  if (path != null) {
    const fs = getFilesystemForUri(path);
    if (fs == null) {
      return null;
    } else {
      return {path, fs};
    }
  } else {
    const pick = await pickRemoteWorkspaceFolder(
      'Select a folder to open in a terminal:',
    );
    if (pick == null) {
      return null;
    } else {
      return {fs: pick.fs, path: pick.folder.uri};
    }
  }
}
