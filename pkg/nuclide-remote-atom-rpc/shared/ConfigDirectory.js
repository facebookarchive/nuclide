"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNewEntry = createNewEntry;
exports.getServer = getServer;
exports.RPC_PROTOCOL = void 0;

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('nuclide-remote-atom-rpc');
const RPC_PROTOCOL = 'atom_rpc_protocol';
exports.RPC_PROTOCOL = RPC_PROTOCOL;
const NUCLIDE_DIR = '.nuclide';
const NUCLIDE_SERVER_INFO_DIR = 'command-server';
const SERVER_INFO_FILE = 'serverInfo.json';

function getConfigDirectory(directory) {
  return _nuclideUri().default.join(directory, NUCLIDE_DIR, NUCLIDE_SERVER_INFO_DIR);
}
/**
 * The local command server stores its state in files in a directory. The structure of the config
 * directory is as follows:
 * - It contains a list of subdirectories where the name of each subdirectory corresponds to the
 *   port of the nuclide-server whose data it contains.
 * - Each subdirectory contains a serverInfo.json file, which contains a ServerInfo about the
 *   instance of nuclide-server.
 *
 * Code in this file is used by the NuclideServer process as well as the atom
 * command line process on the server.
 */


async function createConfigDirectory(clearDirectory) {
  // Try some candidate directories. We exclude the directory if it is on NFS
  // because nuclide-server is local, so it should only write out its state to
  // a local directory.
  return (0, _promise().asyncFind)(getCandidateDirectories(), async directory => {
    if (await _fsPromise().default.isNonNfsDirectory(directory)) {
      const configDirPath = getConfigDirectory(directory);

      if (clearDirectory) {
        // When starting up a new server, we remove any connection configs leftover
        // from previous runs.
        await _fsPromise().default.rimraf(configDirPath);

        if (await _fsPromise().default.exists(configDirPath)) {
          throw new Error('createConfigDirectory: Failed to remove' + configDirPath);
        }
      }

      await _fsPromise().default.mkdirp(configDirPath);
      return configDirPath;
    } else {
      return null;
    }
  });
}

async function createNewEntry(commandPort, family) {
  const clearDirectory = true;
  const configDirectory = await createConfigDirectory(clearDirectory);

  if (configDirectory == null) {
    throw new Error("Could't create config directory");
  } // TODO: Instead of using this dummy '0' port, will need to figure out
  // a directory structure which can handle multiple registered servers on the client side.


  const subdir = _nuclideUri().default.join(configDirectory, String(0));

  await _fsPromise().default.rimraf(subdir);

  if (await _fsPromise().default.exists(subdir)) {
    throw new Error('createNewEntry: Failed to delete: ' + subdir);
  }

  const info = {
    commandPort,
    family
  };
  await _fsPromise().default.mkdir(subdir);
  await _fsPromise().default.writeFile(_nuclideUri().default.join(subdir, SERVER_INFO_FILE), JSON.stringify(info));
  logger.debug(`Created new remote atom config at ${subdir} for port ${commandPort} family ${family}`);
}

async function getServer() {
  const configDirectory = await findPathToConfigDirectory();

  if (configDirectory == null) {
    return null;
  }

  const serverInfos = await getServerInfos(configDirectory); // For now, just return the first ServerInfo found.
  // Currently there can be only one ServerInfo at a time.
  // In the future, we may use the serverMetadata to determine which server
  // to use.

  if (serverInfos.length > 0) {
    const {
      commandPort,
      family
    } = serverInfos[0];
    logger.debug(`Read remote atom config at ${configDirectory} for port ${commandPort} family ${family}`);
    return serverInfos[0];
  } else {
    return null;
  }
}

async function getServerInfos(configDirectory) {
  const entries = await _fsPromise().default.readdir(configDirectory);
  return (0, _collection().arrayCompact)((await Promise.all(entries.map(async entry => {
    const subdir = _nuclideUri().default.join(configDirectory, entry);

    const info = JSON.parse((await _fsPromise().default.readFile(_nuclideUri().default.join(subdir, SERVER_INFO_FILE), 'utf8')));

    if (info.commandPort != null && info.family != null) {
      return info;
    } else {
      return null;
    }
  }))));
}

function findPathToConfigDirectory() {
  return (0, _promise().asyncFind)(getCandidateDirectories(), async directory => {
    const configDir = getConfigDirectory(directory);
    return (await _fsPromise().default.exists(configDir)) ? configDir : null;
  });
}

function getCandidateDirectories() {
  const {
    homedir
  } = _os.default.userInfo();

  return [// Try the ~/local directory (if it exists) to avoid directly polluting homedirs.
  _nuclideUri().default.resolve(_nuclideUri().default.join(homedir, 'local')), // Then try the OS temporary directory...
  _os.default.tmpdir(), // And fall back to the home directory as a last resort.
  homedir];
}