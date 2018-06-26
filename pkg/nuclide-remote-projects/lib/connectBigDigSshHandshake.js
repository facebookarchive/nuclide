'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = connectBigDigSshHandshake;

var _client;

function _load_client() {
  return _client = require('../../../modules/big-dig/src/client');
}

var _yargs;

function _load_yargs() {
  return _yargs = _interopRequireDefault(require('yargs'));
}

var _fsPlus;

function _load_fsPlus() {
  return _fsPlus = _interopRequireDefault(require('fs-plus'));
}

var _systemInfo;

function _load_systemInfo() {
  return _systemInfo = require('../../commons-node/system-info');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('../../nuclide-remote-connection/lib/ServerConnection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  const sshHandshake = new (_client || _load_client()).SshHandshake({
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
            throw new Error('Unexpected prompt kind');
        }
      });
    },
    onWillConnect(config) {
      delegate.onWillConnect(connectionConfig);
    },
    onDidConnect(remoteConfig, config) {
      (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.findOrCreate(Object.assign({}, remoteConfig, {
        path: connectionConfig.cwd,
        displayTitle: connectionConfig.displayTitle,
        version: (_ServerConnection || _load_ServerConnection()).BIG_DIG_VERSION
      })).then(connection => {
        delegate.onDidConnect(connection, connectionConfig);
      }, err => {
        delegate.onError(err.code === 'CERT_NOT_YET_VALID' ? (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).SshHandshake.ErrorType.CERT_NOT_YET_VALID : (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).SshHandshake.ErrorType.SERVER_CANNOT_CONNECT, err, connectionConfig);
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
  let { remoteServerCommand } = connectionConfig;
  // If the user does not specify --port or -p in the remoteServerCommand, then
  // we default to '9093-9090' as the port range. Currently, we do not give the
  // user a way to specify their own port range from the connection dialog.
  // We can straighten this out once we completely cutover to Big Dig.
  let remoteServerPorts = '9093-9090';
  // Add the current Nuclide version, unless explicitly provided.
  let version = (0, (_systemInfo || _load_systemInfo()).getNuclideVersion)();
  // We'll only allow one Nuclide server per user - but you can override this.
  let exclusive = 'atom';
  // big-dig doesn't parse extra arguments.
  // We'll try to adapt commonly used ones for now.
  if (remoteServerCommand.includes(' ')) {
    const parsed = (_yargs || _load_yargs()).default.parse(remoteServerCommand);
    remoteServerCommand = parsed._.join(' ');
    if (parsed.version != null) {
      version = parsed.version;
    }
    if (typeof parsed.port === 'number') {
      remoteServerPorts = String(parsed.port);
    }
    if (typeof parsed.p === 'number') {
      remoteServerPorts = String(parsed.p);
    }
    if (typeof parsed.exclusive === 'string') {
      exclusive = parsed.exclusive;
    }
  }

  // We use fs-plus's normalize() function because it will expand the ~, if present.
  const expandedPath = (_fsPlus || _load_fsPlus()).default.normalize(pathToPrivateKey);

  // Add an extra flag to indicate the use of big-dig.
  remoteServerCommand += ' --big-dig';
  remoteServerCommand += ` --version=${version}`;
  sshHandshake.connect({
    host,
    sshPort,
    username,
    pathToPrivateKey: expandedPath,
    remoteServer: {
      command: remoteServerCommand
    },
    remoteServerPorts,
    authMethod,
    password,
    exclusive
  });
  return sshHandshake;
}