"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeConnection = makeConnection;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

function _client() {
  const data = require("../../big-dig/src/client");

  _client = function () {
    return data;
  };

  return data;
}

function _keytar() {
  const data = require("nuclide-prebuilt-libs/keytar");

  _keytar = function () {
    return data;
  };

  return data;
}

function _configuration() {
  const data = require("./configuration");

  _configuration = function () {
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
  const data = require("../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _ConnectionPrompt() {
  const data = _interopRequireDefault(require("./ConnectionPrompt"));

  _ConnectionPrompt = function () {
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

function _ConnectionWrapper() {
  const data = require("./ConnectionWrapper");

  _ConnectionWrapper = function () {
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
const logger = (0, _log4js().getLogger)('remote'); // Time to wait (ms) until giving up on getting the server version during the
// validation step.

const SERVER_VERSION_TIMEOUT = 5000; // Time to wait (ms) before giving up on the server acknowledging a request to
// shutdown.

const SERVER_SHUTDOWN_TIMEOUT = 2000;

/**
 * Cache the credentials so we can handle reconnections without necessarily
 * prompting the user to authenticate again.
 */
const CREDENTIALS_SERVICE = 'big-dig-vscode';

async function saveCredentials(hostname, credentials) {
  try {
    await (0, _keytar().setPassword)(CREDENTIALS_SERVICE, hostname, JSON.stringify(credentials));
  } catch (err) {
    logger.warn('Unable to store credentials', err);
  }
}

async function getCredentials(hostname) {
  const password = await (0, _keytar().getPassword)(CREDENTIALS_SERVICE, hostname);

  if (password != null) {
    return JSON.parse(password);
  }

  return null;
}

function getExtractCommand(server) {
  const {
    extractFileCommand
  } = server;

  if (extractFileCommand != null) {
    return {
      fromFileCommand: (archive, dst) => extractFileCommand.replace('${file}', archive).replace('${dest}', dst)
    };
  } else {
    return {
      fromFileCommand: (archive, dst) => `unzip -oq ${archive} -d ${dst}`
    };
  }
}

function getServer(profile) {
  const {
    node,
    installationPath
  } = profile.deployServer;
  return {
    package: _serverDeployment().packageServerZip,
    command: (installPath, args) => `${node} ${installPath} ${args}`,
    installationPath,
    expectedVersion: current => (0, _serverDeployment().serverPackageZipVersion)(),
    extract: getExtractCommand(profile.deployServer)
  };
}
/**
 * If the server is running the wrong version, tell it to shut down; we will
 * create a new instance (by returning `false` here).
 * Note: even if the server does not shut down, the new instance will kill the
 * existing process.
 * @returns `true` if the server is running the correct version.
 */


async function validateCurrentServer(conn) {
  const {
    version: serverVersion
  } = await (0, _promise().timeoutPromise)(conn.getServerStatus(), SERVER_VERSION_TIMEOUT);
  logger.info(`Server version: ${serverVersion}`);
  const expectedVersion = await (0, _serverDeployment().serverPackageZipVersion)();

  if (expectedVersion !== serverVersion) {
    logger.info(`Expected server version ${expectedVersion}; shutting server down...`);
    await (0, _promise().timeoutPromise)(conn.shutdown(), SERVER_SHUTDOWN_TIMEOUT).catch(() => {});
    return false;
  } // The server is the correct version


  return true;
}

async function makeConnection(profile) {
  const {
    address,
    deployServer,
    authMethod: authMethodPromise,
    ports,
    privateKey: privateKeyPromise,
    username
  } = profile;
  const server = getServer(profile);
  const {
    autoUpdate
  } = deployServer;
  const connectionId = (0, _configuration().getConnectionIdForCredentialStore)(profile);
  const canceller = new (vscode().CancellationTokenSource)();

  async function doReconnect(progress) {
    try {
      // Attempt to reconnect using cached credentials
      const credentials = await getCredentials(connectionId);

      if (credentials != null) {
        progress.report({
          message: `Reconnecting to ${address}...`
        });
        const bigDigClient = await (0, _client().createBigDigClient)(Object.assign({}, credentials, {
          host: address,
          // TODO(hansonw): Resolve the family of the hostname, preferring IPv6.
          ignoreIntransientErrors: false
        }));
        const conn = new (_ConnectionWrapper().ConnectionWrapper)(bigDigClient);
        const compatible = await validateCurrentServer(conn);

        if (!compatible) {
          conn.dispose();
          return null;
        } else {
          return conn;
        }
      }
    } catch (error) {
      logger.info(`Could not automatically reconnect to ${address}`, error);
      return null;
    }
  }

  async function doConnect(progress) {
    const sshConnectionDelegate = {
      onKeyboardInteractive: (0, _ConnectionPrompt().default)(progress, {
        hostname: address,
        autoUpdate,
        canceller
      }),

      onWillConnect() {},

      onDidConnect(connectionConfig, config) {},

      onError(errorType, error, config) {// No need to log here because SshHandshake.connect() already logs any
        // errors.
      }

    };
    const sshHandshake = new (_client().SshHandshake)(sshConnectionDelegate);
    canceller.token.onCancellationRequested(() => sshHandshake.cancel());
    let authMethod; // TODO(T27503297): It does not make sense to set pathToPrivateKey when
    // password auth is set. We should tighten up the Flow types so that
    // SshConnectionConfiguration has a single authentication property that is a
    // tagged union where each value in the union includes only the data
    // necessary to support the authentication mechanism.

    let pathToPrivateKey;
    const userAuthMethod = await authMethodPromise;

    switch (userAuthMethod) {
      case 'private-key':
        authMethod = 'PRIVATE_KEY';
        pathToPrivateKey = await privateKeyPromise;
        break;

      case 'password':
        authMethod = 'PASSWORD';
        pathToPrivateKey = ''; // Dummy value.

        break;

      default:
        userAuthMethod;
        throw new Error(`Unhandled userAuthMethod: ${userAuthMethod}`);
    }

    const [connectionConfig] = await sshHandshake.connect({
      host: address,
      sshPort: 22,
      username,
      pathToPrivateKey,
      authMethod,
      remoteServer: server,
      remoteServerPorts: ports,
      // We set password to the empty string so that if
      // SshHandshake._connectFallbackViaPassword() is called, it does not
      // appear as though the user has attempted a password yet.
      password: '',
      exclusive: 'vscode'
    });
    const bigDigClient = await (0, _client().createBigDigClient)(Object.assign({}, connectionConfig, {
      ignoreIntransientErrors: false
    }));
    const {
      certificateAuthorityCertificate,
      clientCertificate,
      clientKey,
      port
    } = connectionConfig;

    if (certificateAuthorityCertificate != null && clientCertificate != null && clientKey != null) {
      await saveCredentials(connectionId, {
        certificateAuthorityCertificate: certificateAuthorityCertificate.toString(),
        clientCertificate: clientCertificate.toString(),
        clientKey: clientKey.toString(),
        port
      });
    }

    return new (_ConnectionWrapper().ConnectionWrapper)(bigDigClient);
  }

  try {
    const conn = await vscode().window.withProgress({
      location: vscode().ProgressLocation.Window,
      title: `Connecting to ${address}`
    }, async progress => (await doReconnect(progress)) || doConnect(progress));
    return conn;
  } finally {
    canceller.dispose();
  }
}