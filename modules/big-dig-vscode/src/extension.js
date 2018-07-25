"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

function _serverDeployment() {
  const data = require("./server-deployment");

  _serverDeployment = function () {
    return data;
  };

  return data;
}

function _bigDigToml() {
  const data = require("./remote/big-dig-toml");

  _bigDigToml = function () {
    return data;
  };

  return data;
}

function _scm() {
  const data = require("./scm");

  _scm = function () {
    return data;
  };

  return data;
}

function _FileSystemMultiplexer() {
  const data = require("./FileSystemMultiplexer");

  _FileSystemMultiplexer = function () {
    return data;
  };

  return data;
}

function _remote() {
  const data = require("./remote");

  _remote = function () {
    return data;
  };

  return data;
}

function _workspace() {
  const data = require("./commands/workspace");

  _workspace = function () {
    return data;
  };

  return data;
}

function _terminal() {
  const data = require("./commands/terminal");

  _terminal = function () {
    return data;
  };

  return data;
}

function _server() {
  const data = require("./commands/server");

  _server = function () {
    return data;
  };

  return data;
}

function _debugger() {
  const data = require("./debugger");

  _debugger = function () {
    return data;
  };

  return data;
}

function _cli() {
  const data = require("./terminal/cli");

  _cli = function () {
    return data;
  };

  return data;
}

function _dev() {
  const data = require("./dev");

  _dev = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
function activate(context) {
  reloadIfFirstWorkspaceFolder(context);

  if (_dev().__DEV__) {
    (0, _serverDeployment().devInit)();
  }

  loadCommands(context);
  context.subscriptions.push((0, _remote().startFilesystems)());
  context.subscriptions.push(startMultiplexingFilesystems());
  context.subscriptions.push((0, _bigDigToml().startBigDigTomlServices)());
  context.subscriptions.push((0, _scm().startScm)());
  context.subscriptions.push((0, _cli().startCli)());
  context.subscriptions.push((0, _debugger().startDebugProviders)());
  context.subscriptions.push((0, _remote().startSearchProviders)());
}
/** This function is called when this extension is deactivated. */


function deactivate() {}

function loadCommands(context) {
  function registerCommand(command, handler) {
    context.subscriptions.push(vscode().commands.registerCommand(command, handler));
  }

  function registerTextEditorCommand(command, handler) {
    context.subscriptions.push(vscode().commands.registerTextEditorCommand(command, handler));
  } // Opens the current file in the terminal


  registerTextEditorCommand('big-dig.explorer.openCurrentFileInTerminal', editor => (0, _terminal().openRemoteTerminal)(_cli().BIG_DIG_SESSION, editor.document && editor.document.uri)); // Opens the explorer-selection in the terminal

  registerCommand('big-dig.explorer.openInTerminal', file => (0, _terminal().openRemoteTerminal)(_cli().BIG_DIG_SESSION, file)); // Presents UI to select a workspace to open in terminal

  registerCommand('big-dig.explorer.openTerminal', () => (0, _terminal().openRemoteTerminal)(_cli().BIG_DIG_SESSION)); // Either add an explorer-selected folder to the workspace or else present a
  // UI to quickly choose a folder from the user's connection profiles.

  registerCommand('big-dig.quickAddFolderToWorkspace', file => (0, _workspace().quickAddFolderToWorkspace)(context)); // Add an explorer-selected folder to the workspace.

  registerCommand('big-dig.addFolderToWorkspace', file => (0, _workspace().addFolderToWorkspace)(context, file)); // UI to select an active remote connection and shut down its server.

  registerCommand('big-dig.shutdown', () => (0, _server().shutdownRemoteServer)());
}
/**
 * Creates a single registered FileSystemProvider that automatically
 * multiplexes over all filesystems created.
 * @return a disposable that unregisters the multiplexer and stops listening
 * for new filesystems.
 */


function startMultiplexingFilesystems() {
  const fsMultiplexer = new (_FileSystemMultiplexer().FileSystemMultiplexer)();
  const sub = (0, _remote().onEachFilesystem)(fs => fsMultiplexer.addFileSystem(fs));
  fsMultiplexer.register();
  return vscode().Disposable.from(sub, fsMultiplexer);
} // As a safeguard, don't reload the window if we added the workspace
// more than a minute ago.


const MAX_RELOAD_AGE = 60 * 1000; // See comment where firstWorkspaceFolder is set (in workspace.js).

function reloadIfFirstWorkspaceFolder(context) {
  const firstWorkspaceFolder = context.globalState.get('firstWorkspaceFolder');

  if (firstWorkspaceFolder != null && Date.now() - firstWorkspaceFolder.time < MAX_RELOAD_AGE && vscode().workspace.workspaceFolders && vscode().workspace.workspaceFolders.length === 1 && vscode().workspace.workspaceFolders[0].uri.toString() === firstWorkspaceFolder.uri) {
    (0, _log4js().getLogger)().info('Reloading window to work around ENOENT bug');
    context.globalState.update('firstWorkspaceFolder', undefined);
    vscode().commands.executeCommand('workbench.action.reloadWindow');
    return;
  }
}