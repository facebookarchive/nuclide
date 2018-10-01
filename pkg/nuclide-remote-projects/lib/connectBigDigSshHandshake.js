"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = connectBigDigSshHandshake;

function _client() {
  const data = require("../../../modules/big-dig/src/client");

  _client = function () {
    return data;
  };

  return data;
}

function _yargs() {
  const data = _interopRequireDefault(require("yargs"));

  _yargs = function () {
    return data;
  };

  return data;
}

function _fsPlus() {
  const data = _interopRequireDefault(require("fs-plus"));

  _fsPlus = function () {
    return data;
  };

  return data;
}

function _systemInfo() {
  const data = require("../../commons-node/system-info");

  _systemInfo = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _ServerConnection() {
  const data = require("../../nuclide-remote-connection/lib/ServerConnection");

  _ServerConnection = function () {
    return data;
  };

  return data;
}

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

/**
 * Adapts big-dig's SshHandshake to what Nuclide expects.
 * After the migration is complete, we should be able to refactor this away.
 */
function connectBigDigSshHandshake(connectionConfig, delegate) {
  const sshHandshake = new (_client().SshHandshake)({
    onKeyboardInteractive(name, instructions, instructionsLang, prompts) {
      const prompt = prompts[0];
      return new Promise(resolve => {
        switch (prompt.kind) {
          case 'ssh':
          case 'private-key':
            delegate.onKeyboardInteractive(name, instructions, instructionsLang, [{
              prompt: prompt.prompt,
              echo: prompt.echo
            }], resolve);
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
      _nuclideRemoteConnection().RemoteConnection.findOrCreate(Object.assign({}, remoteConfig, {
        path: connectionConfig.cwd,
        displayTitle: connectionConfig.displayTitle,
        version: _ServerConnection().BIG_DIG_VERSION
      })).then(connection => {
        delegate.onDidConnect(connection, connectionConfig);
      }, err => {
        delegate.onError(err.code === 'CERT_NOT_YET_VALID' ? _nuclideRemoteConnection().SshHandshake.ErrorType.CERT_NOT_YET_VALID : _nuclideRemoteConnection().SshHandshake.ErrorType.SERVER_CANNOT_CONNECT, err, connectionConfig);
      });
    },

    onError(errorType, error, config) {
      const nuclideErrorType = _nuclideRemoteConnection().SshHandshake.ErrorType[errorType] || _nuclideRemoteConnection().SshHandshake.ErrorType.UNKNOWN;

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
  let {
    remoteServerCommand
  } = connectionConfig; // If the user does not specify --port or -p in the remoteServerCommand, then
  // we default to '9093-9090' as the port range. Currently, we do not give the
  // user a way to specify their own port range from the connection dialog.
  // We can straighten this out once we completely cutover to Big Dig.

  let remoteServerPorts = '9093-9090'; // Add the current Nuclide version, unless explicitly provided.

  let version = (0, _systemInfo().getNuclideVersion)(); // We'll only allow one Nuclide server per user - but you can override this.

  let exclusive = 'atom'; // big-dig doesn't parse extra arguments.
  // We'll try to adapt commonly used ones for now.

  if (remoteServerCommand.includes(' ')) {
    const parsed = _yargs().default.parse(remoteServerCommand);

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
  } // We use fs-plus's normalize() function because it will expand the ~, if present.


  const expandedPath = _fsPlus().default.normalize(pathToPrivateKey); // Add an extra flag to indicate the use of big-dig.


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