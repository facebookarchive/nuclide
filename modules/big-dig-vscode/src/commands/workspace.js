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
import * as pathModule from 'path';
import * as vscode from 'vscode';
import {RemoteFileSystem} from '../RemoteFileSystem';
import {getFilesystemForUri, getFilesystems} from '../remote';

const logger = getLogger('commands');

function appendFolderToWorkspace(
  context: vscode.ExtensionContext,
  file: vscode.Uri,
): boolean {
  const insertPos = vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders.length
    : 0;
  return vscode.workspace.updateWorkspaceFolders(insertPos, 0, {uri: file});
}

/**
 * Uses the configuration of big-dig.connection.profiles to collect folders and
 * presents a UI to select which one to add to the workspace.
 * @return true if a selection was successfully added to the workspace, or
 * false if the the user canceled the operation or if the folder is already
 * loaded.
 * @throws if there are no remote filesystems or folders configured.
 */
export async function quickAddFolderToWorkspace(
  context: vscode.ExtensionContext,
): Promise<boolean> {
  try {
    const pick = await quickPickRemoteFolder(
      'Select a folder to add to your workspace.',
    );

    switch (pick.status) {
      case 'pick':
        return appendFolderToWorkspace(context, pick.folder);
      case 'no-filesystems':
        throw new Error(
          'No remote filesystems are defined; ' +
            'check the configuration of big-dig.connection.profiles.',
        );
      case 'no-folders':
        throw new Error(
          'No folders are defined; ' +
            'check the configuration of big-dig.connection.profiles.',
        );
      case 'cancel':
        return false;
      default:
        (pick.status: empty);
    }
  } catch (error) {
    vscode.window.showErrorMessage(error.message);
    logger.error(error);
  }
  return false;
}

/**
 * Adds the *remote* folder to the current workspace.
 * @return true if successful, or false if the folder is already in the
 * workspace, not a remote folder, or if the file is null.
 */
export async function addFolderToWorkspace(
  context: vscode.ExtensionContext,
  file: ?vscode.Uri,
): Promise<boolean> {
  if (file != null) {
    if (getFilesystemForUri(file) != null) {
      return appendFolderToWorkspace(context, file);
    } else {
      logger.warn(
        `Add folder to workspace: no filesystem handles ${file.toString()}`,
      );
    }
  } else {
    logger.warn('Add folder to workspace: no file specified');
  }
  return false;
}

/**
 * Presents a UI to pick a remote workspace folder.
 * @param prompt message to display to the user.
 * @return the selected filesystem and workspace folder; else `null`.
 */
export async function pickRemoteWorkspaceFolder(
  prompt: string,
): Promise<?{fs: RemoteFileSystem, folder: vscode.WorkspaceFolder}> {
  const items = [];
  for (const fs of getFilesystems()) {
    items.push(
      ...fs.getWorkspaceFolders().map(folder => ({
        label: folder.name,
        description: folder.uri.toString(),
        result: {fs, folder},
      })),
    );
  }
  const pick = await vscode.window.showQuickPick(items, {
    placeHolder: prompt,
  });
  return pick == null ? null : pick.result;
}

type QuickPickRemoteFolderResult =
  | {|status: 'cancel'|}
  | {|status: 'pick', fs: RemoteFileSystem, folder: vscode.Uri|}
  | {|status: 'no-folders'|}
  | {|status: 'no-filesystems'|};

/**
 * Presents a UI to select a folder (i.e. "folders" from the user's
 * connection profile).
 */
async function quickPickRemoteFolder(
  prompt: string,
): Promise<QuickPickRemoteFolderResult> {
  const items = [];

  const filesystems = getFilesystems();
  if (filesystems.length === 0) {
    return {status: 'no-filesystems'};
  }

  for (const fs of filesystems) {
    const server = fs.getServer();
    const folders = server.getProfile().folders;
    items.push(
      ...folders.map(folder => ({
        label: pathModule.basename(folder),
        detail: fs.pathToUri(folder).toString(),
        description: folder,
        fs,
        folder: fs.pathToUri(folder),
      })),
    );
  }

  if (items.length === 0) {
    return {status: 'no-folders'};
  }

  const pick = await vscode.window.showQuickPick(items, {
    placeHolder: prompt,
  });
  return pick == null
    ? {status: 'cancel'}
    : {status: 'pick', fs: pick.fs, folder: pick.folder};
}
