/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import {getLogger} from 'log4js';
import * as vscode from 'vscode';
import {devInit as initServerDevelopmentDeployment} from './server-deployment';
import {startBigDigTomlServices} from './remote/big-dig-toml';
import {startScm} from './scm';
import {FileSystemMultiplexer} from './FileSystemMultiplexer';
import {
  startFilesystems,
  startSearchProviders,
  onEachFilesystem,
} from './remote';
import {
  addFolderToWorkspace,
  quickAddFolderToWorkspace,
} from './commands/workspace';
import {openRemoteTerminal} from './commands/terminal';
import {shutdownRemoteServer} from './commands/server';
import {startDebugProviders} from './debugger';
import {BIG_DIG_SESSION, startCli} from './terminal/cli';
import {__DEV__} from './dev';

export function activate(context: vscode.ExtensionContext) {
  reloadIfFirstWorkspaceFolder(context);
  if (__DEV__) {
    initServerDevelopmentDeployment();
  }

  loadCommands(context);

  context.subscriptions.push(startFilesystems());

  context.subscriptions.push(startMultiplexingFilesystems());

  context.subscriptions.push(startBigDigTomlServices());

  context.subscriptions.push(startScm());

  context.subscriptions.push(startCli());

  context.subscriptions.push(startDebugProviders());

  context.subscriptions.push(startSearchProviders());
}

/** This function is called when this extension is deactivated. */
export function deactivate() {}

function loadCommands(context: vscode.ExtensionContext): void {
  function registerCommand(command: string, handler: any): void {
    context.subscriptions.push(
      vscode.commands.registerCommand(command, handler),
    );
  }

  function registerTextEditorCommand(command: string, handler: any): void {
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand(command, handler),
    );
  }

  // Opens the current file in the terminal
  registerTextEditorCommand(
    'big-dig.explorer.openCurrentFileInTerminal',
    editor =>
      openRemoteTerminal(
        BIG_DIG_SESSION,
        editor.document && editor.document.uri,
      ),
  );

  // Opens the explorer-selection in the terminal
  registerCommand('big-dig.explorer.openInTerminal', file =>
    openRemoteTerminal(BIG_DIG_SESSION, file),
  );

  // Presents UI to select a workspace to open in terminal
  registerCommand('big-dig.explorer.openTerminal', () =>
    openRemoteTerminal(BIG_DIG_SESSION),
  );

  // Either add an explorer-selected folder to the workspace or else present a
  // UI to quickly choose a folder from the user's connection profiles.
  registerCommand('big-dig.quickAddFolderToWorkspace', file =>
    quickAddFolderToWorkspace(context),
  );

  // Add an explorer-selected folder to the workspace.
  registerCommand('big-dig.addFolderToWorkspace', file =>
    addFolderToWorkspace(context, file),
  );

  // UI to select an active remote connection and shut down its server.
  registerCommand('big-dig.shutdown', () => shutdownRemoteServer());
}

/**
 * Creates a single registered FileSystemProvider that automatically
 * multiplexes over all filesystems created.
 * @return a disposable that unregisters the multiplexer and stops listening
 * for new filesystems.
 */
function startMultiplexingFilesystems(): IDisposable {
  const fsMultiplexer = new FileSystemMultiplexer();
  const sub = onEachFilesystem(fs => fsMultiplexer.addFileSystem(fs));
  fsMultiplexer.register();
  return vscode.Disposable.from(sub, fsMultiplexer);
}

// As a safeguard, don't reload the window if we added the workspace
// more than a minute ago.
const MAX_RELOAD_AGE = 60 * 1000;

// See comment where firstWorkspaceFolder is set (in workspace.js).
function reloadIfFirstWorkspaceFolder(context: vscode.ExtensionContext) {
  const firstWorkspaceFolder = context.globalState.get('firstWorkspaceFolder');
  if (
    firstWorkspaceFolder != null &&
    Date.now() - firstWorkspaceFolder.time < MAX_RELOAD_AGE &&
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length === 1 &&
    vscode.workspace.workspaceFolders[0].uri.toString() ===
      firstWorkspaceFolder.uri
  ) {
    getLogger().info('Reloading window to work around ENOENT bug');
    context.globalState.update('firstWorkspaceFolder', undefined);
    vscode.commands.executeCommand('workbench.action.reloadWindow');
    return;
  }
}
