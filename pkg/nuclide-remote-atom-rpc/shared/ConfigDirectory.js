'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getServer = exports.createNewEntry = exports.RPC_PROTOCOL = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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
let createConfigDirectory = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (clearDirectory) {
    // Try some candidate directories. We exclude the directory if it is on NFS
    // because nuclide-server is local, so it should only write out its state to
    // a local directory.
    return (0, (_promise || _load_promise()).asyncFind)(getCandidateDirectories(), (() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (directory) {
        if (yield (_fsPromise || _load_fsPromise()).default.isNonNfsDirectory(directory)) {
          const configDirPath = getConfigDirectory(directory);
          if (clearDirectory) {
            // When starting up a new server, we remove any connection configs leftover
            // from previous runs.
            yield (_fsPromise || _load_fsPromise()).default.rimraf(configDirPath);
            if (yield (_fsPromise || _load_fsPromise()).default.exists(configDirPath)) {
              throw new Error('createConfigDirectory: Failed to remove' + configDirPath);
            }
          }
          yield (_fsPromise || _load_fsPromise()).default.mkdirp(configDirPath);
          return configDirPath;
        } else {
          return null;
        }
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })());
  });

  return function createConfigDirectory(_x) {
    return _ref.apply(this, arguments);
  };
})();

let createNewEntry = exports.createNewEntry = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (commandPort, family) {
    const clearDirectory = true;
    const configDirectory = yield createConfigDirectory(clearDirectory);
    if (configDirectory == null) {
      throw new Error("Could't create config directory");
    }

    // TODO: Instead of using this dummy '0' port, will need to figure out
    // a directory structure which can handle multiple registered servers on the client side.
    const subdir = (_nuclideUri || _load_nuclideUri()).default.join(configDirectory, String(0));
    yield (_fsPromise || _load_fsPromise()).default.rimraf(subdir);
    if (yield (_fsPromise || _load_fsPromise()).default.exists(subdir)) {
      throw new Error('createNewEntry: Failed to delete: ' + subdir);
    }
    const info = {
      commandPort,
      family
    };
    yield (_fsPromise || _load_fsPromise()).default.mkdir(subdir);
    yield (_fsPromise || _load_fsPromise()).default.writeFile((_nuclideUri || _load_nuclideUri()).default.join(subdir, SERVER_INFO_FILE), JSON.stringify(info));

    logger.debug(`Created new remote atom config at ${subdir} for port ${commandPort} family ${family}`);
  });

  return function createNewEntry(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
})();

let getServer = exports.getServer = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* () {
    const configDirectory = yield findPathToConfigDirectory();
    if (configDirectory == null) {
      return null;
    }

    const serverInfos = yield getServerInfos(configDirectory);
    // For now, just return the first ServerInfo found.
    // Currently there can be only one ServerInfo at a time.
    // In the future, we may use the serverMetadata to determine which server
    // to use.
    if (serverInfos.length > 0) {
      const { commandPort, family } = serverInfos[0];
      logger.debug(`Read remote atom config at ${configDirectory} for port ${commandPort} family ${family}`);
      return serverInfos[0];
    } else {
      return null;
    }
  });

  return function getServer() {
    return _ref4.apply(this, arguments);
  };
})();

let getServerInfos = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (configDirectory) {
    const entries = yield (_fsPromise || _load_fsPromise()).default.readdir(configDirectory);
    return (0, (_collection || _load_collection()).arrayCompact)((yield Promise.all(entries.map((() => {
      var _ref6 = (0, _asyncToGenerator.default)(function* (entry) {
        const subdir = (_nuclideUri || _load_nuclideUri()).default.join(configDirectory, entry);
        const info = JSON.parse((yield (_fsPromise || _load_fsPromise()).default.readFile((_nuclideUri || _load_nuclideUri()).default.join(subdir, SERVER_INFO_FILE), 'utf8')));
        if (info.commandPort != null && info.family != null) {
          return info;
        } else {
          return null;
        }
      });

      return function (_x6) {
        return _ref6.apply(this, arguments);
      };
    })()))));
  });

  return function getServerInfos(_x5) {
    return _ref5.apply(this, arguments);
  };
})();

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _os = _interopRequireDefault(require('os'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-atom-rpc'); /**
                                                                                       * Copyright (c) 2015-present, Facebook, Inc.
                                                                                       * All rights reserved.
                                                                                       *
                                                                                       * This source code is licensed under the license found in the LICENSE file in
                                                                                       * the root directory of this source tree.
                                                                                       *
                                                                                       * 
                                                                                       * @format
                                                                                       */

const RPC_PROTOCOL = exports.RPC_PROTOCOL = 'atom_rpc_protocol';

const NUCLIDE_DIR = '.nuclide';
const NUCLIDE_SERVER_INFO_DIR = 'command-server';
const SERVER_INFO_FILE = 'serverInfo.json';

function getConfigDirectory(directory) {
  return (_nuclideUri || _load_nuclideUri()).default.join(directory, NUCLIDE_DIR, NUCLIDE_SERVER_INFO_DIR);
}

function findPathToConfigDirectory() {
  return (0, (_promise || _load_promise()).asyncFind)(getCandidateDirectories(), (() => {
    var _ref7 = (0, _asyncToGenerator.default)(function* (directory) {
      const configDir = getConfigDirectory(directory);
      return (yield (_fsPromise || _load_fsPromise()).default.exists(configDir)) ? configDir : null;
    });

    return function (_x7) {
      return _ref7.apply(this, arguments);
    };
  })());
}

function getCandidateDirectories() {
  const { homedir } = _os.default.userInfo();
  return [
  // Try the ~/local directory (if it exists) to avoid directly polluting homedirs.
  (_nuclideUri || _load_nuclideUri()).default.resolve((_nuclideUri || _load_nuclideUri()).default.join(homedir, 'local')),
  // Then try the OS temporary directory...
  _os.default.tmpdir(),
  // And fall back to the home directory as a last resort.
  homedir];
}