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

type ExtensionExports = {
  fileSystemProvider: vscode.FileSystemProvider,
};

export function activate(context: vscode.ExtensionContext): ExtensionExports {
  if (__DEV__) {
    initServerDevelopmentDeployment();
  }

  loadCommands(context);

  context.subscriptions.push(startFilesystems());

  const filesystems = startMultiplexingFilesystems();
  context.subscriptions.push(filesystems.disposable);

  context.subscriptions.push(startBigDigTomlServices());

  context.subscriptions.push(startScm());

  context.subscriptions.push(startCli());

  context.subscriptions.push(startDebugProviders());

  context.subscriptions.push(startSearchProviders());

  return {
    fileSystemProvider: filesystems.fileSystemProvider,
  };
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
function startMultiplexingFilesystems(): {
  disposable: IDisposable,
  fileSystemProvider: vscode.FileSystemProvider,
} {
  const fsMultiplexer = new FileSystemMultiplexer();
  const sub = onEachFilesystem(fs => fsMultiplexer.addFileSystem(fs));
  fsMultiplexer.register();
  const disposable = vscode.Disposable.from(sub, fsMultiplexer);
  return {disposable, fileSystemProvider: fsMultiplexer};
}
