"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startBigDigTomlServices = startBigDigTomlServices;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

var pathModule = _interopRequireWildcard(require("path"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _index() {
  const data = require("./index");

  _index = function () {
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

function _LspProxy() {
  const data = require("../LspProxy");

  _LspProxy = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const logger = (0, _log4js().getLogger)('LSP');
/**
 * Finds the appropriate .bigdig.toml for the remote file system, parses it,
 * and kicks off the process to start each LSP in the config. These are wrapped
 * up in a single Disposable so that they can all be torn down when the
 * connection is closed.
 */

function startBigDigTomlServices() {
  return (0, _index().onEachFilesystem)(fs => fs.getServer().onEachConnection(conn => createServicesForConnection(fs, conn)));
}

async function createServicesForConnection(filesystem, conn) {
  // Make sure we don't process the same config file more than once.
  const tomlFiles = new Set();
  const cleanups = await Promise.all(filesystem.getWorkspaceFolders().map(async folder => {
    const path = filesystem.uriToPath(folder.uri); // For now, automatically start all LSPs in .bigdig.toml. Going forward,
    // we should probably wait until a file matching the DocumentSelector is
    // opened, prompt to install suggested extensions, etc.

    const {
      configFile,
      lspConfigs
    } = await conn.lspList(path); // Do not process the same config file more than once.

    if (configFile == null || tomlFiles.has(configFile)) {
      return null;
    }

    tomlFiles.add(configFile);
    logger.info(`.bigdig.toml was found at ${configFile}.`);
    return createServicesForFolder(filesystem, conn, configFile, lspConfigs);
  }));
  return new (vscode().Disposable.from)(...cleanups.filter(Boolean));
}

async function createServicesForFolder(filesystem, conn, configFile, lspConfigs) {
  const cleanup = new (_UniversalDisposable().default)();

  for (const [name, configAsMixed] of Object.entries(lspConfigs)) {
    const config = configAsMixed;
    const rootPath = config.rootPath != null ? config.rootPath : pathModule.dirname(configFile);
    const options = {
      name,
      language: config.language,
      outputChannelName: `${name} LSP`,
      command: config.command,
      args: config.args,
      encoding: 'utf8'
    }; // eslint-disable-next-line no-await-in-loop

    cleanup.add((await (0, _LspProxy().createLsp)(options, filesystem, rootPath, conn)));
    logger.info(`Added an LSP for ${name}.`);
  }

  return cleanup;
}