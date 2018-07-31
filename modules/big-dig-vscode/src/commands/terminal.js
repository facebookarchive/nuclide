"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openRemoteTerminal = openRemoteTerminal;

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

function _terminal() {
  const data = require("../terminal");

  _terminal = function () {
    return data;
  };

  return data;
}

function _workspace() {
  const data = require("./workspace");

  _workspace = function () {
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
/**
 * If `file` is given, then open a remote terminal at the path. Otherwise,
 * present a UI to select from one of the remote workspace folders.
 */

async function openRemoteTerminal(bigDigSessionId, file) {
  const location = await getTerminalLocation(file);

  if (location == null) {
    return;
  }

  const {
    fs,
    path
  } = location;

  try {
    const conn = await fs.getConnection();
    const cwd = fs.uriToPath((await fs.toDir(path)));
    await (0, _terminal().createRemoteTerminal)(conn, cwd, {
      // The `code` shell script uses this env. var. to communicate files to edit, etc. to vscode.
      BIG_DIG_SESSION: bigDigSessionId,
      TERM_PROGRAM: 'vscode'
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


async function getTerminalLocation(path) {
  if (path != null) {
    const fs = (0, _remote().getFilesystemForUri)(path);

    if (fs == null) {
      return null;
    } else {
      return {
        path,
        fs
      };
    }
  } else {
    const pick = await (0, _workspace().pickRemoteWorkspaceFolder)('Select a folder to open in a terminal:');

    if (pick == null) {
      return null;
    } else {
      return {
        fs: pick.fs,
        path: pick.folder.uri
      };
    }
  }
}