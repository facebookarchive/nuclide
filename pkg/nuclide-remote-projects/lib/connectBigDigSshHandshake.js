'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = connectBigDigSshHandshake;

var _index;

function _load_index() {
  return _index = require('big-dig/src/client/index');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _systemInfo;

function _load_systemInfo() {
  return _systemInfo = require('../../commons-node/system-info');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

/**
 * Adapts big-dig's SshHandshake to what Nuclide expects.
 * After the migration is complete, we should be able to refactor this away.
 */
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

function connectBigDigSshHandshake(connectionConfig, delegate) {
  const sshHandshake = new (_index || _load_index()).SshHandshake({
    onKeyboardInteractive(name, instructions, instructionsLang, prompts) {
      const prompt = prompts[0];
      return new Promise(resolve => {
        switch (prompt.kind) {
          case 'ssh':
          case 'private-key':
            delegate.onKeyboardInteractive(name, instructions, instructionsLang, [{ prompt: prompt.prompt, echo: prompt.echo }], resolve);
            break;
          default:
            // No need to handle update/install for unmanaged startups.
            throw Error('Unexpected prompt kind');
        }
      });
    },
    onWillConnect(config) {
      delegate.onWillConnect(connectionConfig);
    },
    onDidConnect(remoteConfig, config) {
      (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.findOrCreate(Object.assign({}, remoteConfig, {
        cwd: connectionConfig.cwd,
        displayTitle: connectionConfig.displayTitle,
        // TODO(T25637185): Get family from SshHandshake
        version: 2
      })).then(connection => {
        delegate.onDidConnect(connection, connectionConfig);
      }, err => {
        delegate.onError((_nuclideRemoteConnection || _load_nuclideRemoteConnection()).SshHandshake.ErrorType.SERVER_CANNOT_CONNECT, err, connectionConfig);
      });
    },
    onError(errorType, error, config) {
      const nuclideErrorType = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).SshHandshake.ErrorType[errorType] || (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).SshHandshake.ErrorType.UNKNOWN;
      delegate.onError(nuclideErrorType, error, connectionConfig);
    }
  });
  const {
    host,
    sshPort,
    username,
    pathToPrivateKey,
    authMethod,
    password
  } = connectionConfig;
  // TODO(T25636858): Have the server auto-detect FB-friendly ports
  let remoteServerPort = 9091;
  let { remoteServerCommand } = connectionConfig;
  // big-dig doesn't parse extra arguments.
  // We'll try to adapt commonly used ones for now.
  if (remoteServerCommand.includes(' ')) {
    const argv = (0, (_string || _load_string()).shellParse)(remoteServerCommand);
    remoteServerCommand = argv[0];
    for (let i = 1; i < argv.length - 1; i++) {
      if (argv[i] === '--port' || argv[i] === '-p') {
        remoteServerPort = parseInt(argv[i + 1], 10);
      }
      // TODO(T25636823): Also support debug flags
    }
  }
  // Add an extra flag to indicate the use of big-dig.
  remoteServerCommand += ' --big-dig';
  // And the current Nuclide version.
  remoteServerCommand += ` --version=${(0, (_systemInfo || _load_systemInfo()).getNuclideVersion)()}`;
  sshHandshake.connect({
    host,
    sshPort,
    username,
    pathToPrivateKey,
    remoteServer: {
      command: remoteServerCommand
    },
    remoteServerPort,
    authMethod,
    password
  });
  return sshHandshake;
}