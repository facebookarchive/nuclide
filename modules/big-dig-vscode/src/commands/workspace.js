"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.quickAddFolderToWorkspace = quickAddFolderToWorkspace;
exports.addFolderToWorkspace = addFolderToWorkspace;
exports.pickRemoteWorkspaceFolder = pickRemoteWorkspaceFolder;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var pathModule = _interopRequireWildcard(require("path"));

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

function _RemoteFileSystem() {
  const data = require("../RemoteFileSystem");

  _RemoteFileSystem = function () {
    return data;
  };

  return data;
}

function _remote() {
  const data = require("../remote");

  _remote = function () {
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
 *  strict-local
 * @format
 */
const logger = (0, _log4js().getLogger)('commands');

function appendFolderToWorkspace(context, file) {
  const insertPos = vscode().workspace.workspaceFolders ? vscode().workspace.workspaceFolders.length : 0;

  if (insertPos === 0) {
    // If there are currently no workspace folders, adding one triggers a bug.
    // https://github.com/Microsoft/vscode/issues/36177#issuecomment-355728701
    //
    // VSCode reloads the extension host when the first folder is added:
    // https://code.visualstudio.com/docs/extensionAPI/vscode-api#details-1693
    //
    // This races with the explorer's attempt to resolve the remote filepath,
    // which is aborted when the extension host shuts down.
    // The easiest workaround for now is to force a window reload when the
    // extension gets loaded again...
    logger.info('Triggering window reload for ENOENT bug');
    context.globalState.update('firstWorkspaceFolder', {
      uri: file.toString(),
      time: Date.now()
    });
  }

  return vscode().workspace.updateWorkspaceFolders(insertPos, 0, {
    uri: file
  });
}
/**
 * Uses the configuration of big-dig.connection.profiles to collect folders and
 * presents a UI to select which one to add to the workspace.
 * @return true if a selection was successfully added to the workspace, or
 * false if the the user canceled the operation or if the folder is already
 * loaded.
 * @throws if there are no remote filesystems or folders configured.
 */


async function quickAddFolderToWorkspace(context) {
  try {
    const pick = await quickPickRemoteFolder('Select a folder to add to your workspace.');

    switch (pick.status) {
      case 'pick':
        return appendFolderToWorkspace(context, pick.folder);

      case 'no-filesystems':
        throw new Error('No remote filesystems are defined; ' + 'check the configuration of big-dig.connection.profiles.');

      case 'no-folders':
        throw new Error('No folders are defined; ' + 'check the configuration of big-dig.connection.profiles.');

      case 'cancel':
        return false;

      default:
        pick.status;
    }
  } catch (error) {
    vscode().window.showErrorMessage(error.message);
    logger.error(error);
  }

  return false;
}
/**
 * Adds the *remote* folder to the current workspace.
 * @return true if successful, or false if the folder is already in the
 * workspace, not a remote folder, or if the file is null.
 */


async function addFolderToWorkspace(context, file) {
  if (file != null) {
    if ((0, _remote().getFilesystemForUri)(file) != null) {
      return appendFolderToWorkspace(context, file);
    } else {
      logger.warn(`Add folder to workspace: no filesystem handles ${file.toString()}`);
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


async function pickRemoteWorkspaceFolder(prompt) {
  const items = [];

  for (const fs of (0, _remote().getFilesystems)()) {
    items.push(...fs.getWorkspaceFolders().map(folder => ({
      label: folder.name,
      description: folder.uri.toString(),
      result: {
        fs,
        folder
      }
    })));
  }

  const pick = await vscode().window.showQuickPick(items, {
    placeHolder: prompt
  });
  return pick == null ? null : pick.result;
}

/**
 * Presents a UI to select a folder (i.e. "folders" from the user's
 * connection profile).
 */
async function quickPickRemoteFolder(prompt) {
  const items = [];
  const filesystems = (0, _remote().getFilesystems)();

  if (filesystems.length === 0) {
    return {
      status: 'no-filesystems'
    };
  }

  for (const fs of filesystems) {
    const server = fs.getServer();
    const folders = server.getProfile().folders;
    items.push(...folders.map(folder => ({
      label: pathModule.basename(folder),
      detail: fs.pathToUri(folder).toString(),
      description: folder,
      fs,
      folder: fs.pathToUri(folder)
    })));
  }

  if (items.length === 0) {
    return {
      status: 'no-folders'
    };
  }

  const pick = await vscode().window.showQuickPick(items, {
    placeHolder: prompt
  });
  return pick == null ? {
    status: 'cancel'
  } : {
    status: 'pick',
    fs: pick.fs,
    folder: pick.folder
  };
}