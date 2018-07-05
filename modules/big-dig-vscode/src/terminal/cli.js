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

import * as vscode from 'vscode';
import {getLogger} from 'log4js';

import {RemoteFileSystem} from '../RemoteFileSystem';
import {onEachFilesystem} from '../remote';

export const BIG_DIG_SESSION = `${process.pid}-${Math.random()}`;
const logger = getLogger('cli');

/**
 * Responds to remote invocations of the `code` command.
 *
 * When the user opens a remote terminal, we make the `code` command available
 * in their path. When invoked, it causes this *local* instance of vscode to
 * open the specified remote files for editing.
 */
export function startCli(): IDisposable {
  return onEachFilesystem(fs =>
    fs.getServer().onEachConnection(conn =>
      conn.cliListen(BIG_DIG_SESSION).subscribe(async message => {
        // The user has run `code ...files` from the remote terminal
        const {cwd, files} = message;
        // Start editing the files
        await tryOpenFiles(fs, cwd, files);
      }),
    ),
  );
}

/**
 * Best-effort: open each of the remote files.
 */
async function tryOpenFiles(
  filesystem: RemoteFileSystem,
  cwd: string,
  files: Array<string>,
): Promise<void> {
  await Promise.all(
    files.map(async file => {
      try {
        const resource = filesystem.pathToUri(file);
        await vscode.window.showTextDocument(resource, {
          preview: files.length === 1,
          preserveFocus: false,
          viewColumn: vscode.ViewColumn.Active,
        });
      } catch (error) {
        logger.error(`Could not open remote file ${file} for editing.`);
      }
    }),
  );
}
