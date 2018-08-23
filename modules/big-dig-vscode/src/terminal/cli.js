"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startCli = startCli;
exports.BIG_DIG_SESSION = void 0;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
const BIG_DIG_SESSION = `${process.pid}-${Math.random()}`;
exports.BIG_DIG_SESSION = BIG_DIG_SESSION;
const logger = (0, _log4js().getLogger)('cli');
/**
 * Responds to remote invocations of the `code` command.
 *
 * When the user opens a remote terminal, we make the `code` command available
 * in their path. When invoked, it causes this *local* instance of vscode to
 * open the specified remote files for editing.
 */

function startCli() {
  return (0, _remote().onEachFilesystem)(fs => fs.getServer().onEachConnection(conn => conn.cliListen(BIG_DIG_SESSION).subscribe(async message => {
    // The user has run `code ...files` from the remote terminal
    const {
      cwd,
      files
    } = message; // Start editing the files

    await tryOpenFiles(fs, cwd, files);
  })));
}
/**
 * Best-effort: open each of the remote files.
 */


async function tryOpenFiles(filesystem, cwd, files) {
  await Promise.all(files.map(async file => {
    try {
      const resource = filesystem.pathToUri(file);
      await vscode().window.showTextDocument(resource, {
        preview: files.length === 1,
        preserveFocus: false,
        viewColumn: vscode().ViewColumn.Active
      });
    } catch (error) {
      logger.error(`Could not open remote file ${file} for editing.`);
    }
  }));
}