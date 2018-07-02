"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decorateSshConnectionDelegateWithTracking = decorateSshConnectionDelegateWithTracking;
exports.SshHandshake = exports.SshHandshakeError = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var _net = _interopRequireDefault(require("net"));

function _ssh() {
  const data = require("ssh2");

  _ssh = function () {
    return data;
  };

  return data;
}

function _SftpClient() {
  const data = require("./SftpClient");

  _SftpClient = function () {
    return data;
  };

  return data;
}

function _SshClient() {
  const data = require("./SshClient");

  _SshClient = function () {
    return data;
  };

  return data;
}

function _fs() {
  const data = _interopRequireDefault(require("../common/fs"));

  _fs = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _ConnectionTracker() {
  const data = _interopRequireDefault(require("./ConnectionTracker"));

  _ConnectionTracker = function () {
    return data;
  };

  return data;
}

function _lookupPreferIpV() {
  const data = _interopRequireDefault(require("./lookup-prefer-ip-v6"));

  _lookupPreferIpV = function () {
    return data;
  };

  return data;
}

function _events() {
  const data = require("../common/events");

  _events = function () {
    return data;
  };

  return data;
}

function _RemotePackage() {
  const data = require("./RemotePackage");

  _RemotePackage = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// Sync word and regex pattern for parsing command stdout.
const READY_TIMEOUT_MS = 120 * 1000;
const SFTP_TIMEOUT_MS = 20 * 1000; // Automatically retry with a password prompt if existing authentication methods fail.

const PASSWORD_RETRIES = 3;
const logger = (0, _log4js().getLogger)('SshHandshake');
const SupportedMethods = Object.freeze({
  SSL_AGENT: 'SSL_AGENT',
  PASSWORD: 'PASSWORD',
  PRIVATE_KEY: 'PRIVATE_KEY'
});
const ErrorType = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  HOST_NOT_FOUND: 'HOST_NOT_FOUND',
  CANT_READ_PRIVATE_KEY: 'CANT_READ_PRIVATE_KEY',
  SSH_CONNECT_TIMEOUT: 'SSH_CONNECT_TIMEOUT',
  SSH_CONNECT_FAILED: 'SSH_CONNECT_FAILED',
  SSH_AUTHENTICATION: 'SSH_AUTHENTICATION',
  DIRECTORY_NOT_FOUND: 'DIRECTORY_NOT_FOUND',
  SERVER_START_FAILED: 'SERVER_START_FAILED',
  SFTP_TIMEOUT: 'SFTP_TIMEOUT',
  UNSUPPORTED_AUTH_METHOD: 'UNSUPPORTED_AUTH_METHOD',
  USER_CANCELED: 'USER_CANCELLED',
  SERVER_SETUP_FAILED: 'SERVER_SETUP_FAILED'
});
const SshConnectionErrorLevelMap = new Map([['client-timeout', ErrorType.SSH_CONNECT_TIMEOUT], ['client-socket', ErrorType.SSH_CONNECT_FAILED], ['protocal', ErrorType.SSH_CONNECT_FAILED], ['client-authentication', ErrorType.SSH_AUTHENTICATION], ['agent', ErrorType.SSH_AUTHENTICATION], ['client-dns', ErrorType.SSH_AUTHENTICATION]]);
/**
 * The output of the server bootstrapping process. In case we're not using a secure connection, we
 * cannot make any assumptions about its format. The intent of this interface is to document what
 * valid server info should look like. The type of each property is `T | any` for some `T`, which
 * means that we want it to be `T`, but must verify first.
 */

class SshHandshakeError extends Error {
  constructor(message, errorType, innerError) {
    super(`SshHandshake failed: ${errorType}, ${message}`);
    this.message = message;
    this.errorType = errorType;
    this.innerError = innerError;
    this.isCancellation = errorType === SshHandshake.ErrorType.USER_CANCELED;
  }

}
/**
 * Represents a connection failure due to a client-authentication error.
 */


exports.SshHandshakeError = SshHandshakeError;

class SshAuthError extends Error {
  /** The error thrown by `SshClient::connect` */

  /** If we have determined that the cause of the error was that a private key needs a password. */
  constructor(innerError, options) {
    super(innerError.message);
    this.innerError = innerError;
    this.needsPrivateKeyPassword = options.needsPrivateKeyPassword;
    const errorLevel = innerError.level;
    this.errorType = SshConnectionErrorLevelMap.get(errorLevel) || SshHandshake.ErrorType.UNKNOWN;
  }

}

class SshHandshake {
  constructor(delegate, connection) {
    this._canceled = false;
    this._delegate = delegate;
    this._connection = new (_SshClient().SshClient)(connection ? connection : new (_ssh().Client)(), this._onKeyboardInteractive.bind(this));
  }

  _willConnect() {
    this._delegate.onWillConnect(this._config);
  }

  _didConnect(config) {
    this._delegate.onDidConnect(config, this._config);

    return config;
  }

  async _userPromptSingle(prompt) {
    const [answer] = await this._delegate.onKeyboardInteractive(''
    /* name */
    , ''
    /* instructions */
    , ''
    /* instructionsLang */
    , [prompt]);
    return answer;
  }

  async _getConnectConfig(address, config) {
    if (config.authMethod === SupportedMethods.SSL_AGENT) {
      // Point to ssh-agent's socket for ssh-agent-based authentication.
      let agent = process.env.SSH_AUTH_SOCK; // flowlint-next-line sketchy-null-string:off

      if (!agent && /^win/.test(process.platform)) {
        // #100: On Windows, fall back to pageant.
        agent = 'pageant';
      }

      return {
        host: address,
        port: config.sshPort,
        username: config.username,
        agent,
        tryKeyboard: true,
        readyTimeout: READY_TIMEOUT_MS
      };
    } else if (config.authMethod === SupportedMethods.PASSWORD) {
      // When the user chooses password-based authentication, we specify
      // the config as follows so that it tries simple password auth and
      // failing that it falls through to the keyboard interactive path
      return {
        host: address,
        port: config.sshPort,
        username: config.username,
        password: config.password,
        tryKeyboard: true,
        readyTimeout: READY_TIMEOUT_MS
      };
    } else if (config.authMethod === SupportedMethods.PRIVATE_KEY) {
      // Note that if the path the user entered contains a ~, the calling function is responsible
      // for doing the expansion before it is passed in.
      const expandedPath = config.pathToPrivateKey;
      let privateKey;

      try {
        privateKey = await _fs().default.readFileAsBuffer(expandedPath);
      } catch (error) {
        logger.warn(`Failed to read private key at ${expandedPath}, falling back to password auth`);
        return {
          host: address,
          port: config.sshPort,
          username: config.username,
          tryKeyboard: true,
          readyTimeout: READY_TIMEOUT_MS
        };
      }

      return {
        host: address,
        port: config.sshPort,
        username: config.username,
        privateKey,
        tryKeyboard: true,
        readyTimeout: READY_TIMEOUT_MS
      };
    } else {
      throw new SshHandshakeError(`Unsupported authentication method: ${config.authMethod}.`, SshHandshake.ErrorType.UNSUPPORTED_AUTH_METHOD);
    }
  }
  /**
   * Attempts to make an SSH connection. If it fails due to an authentication error, this returns
   * the error. If it succeeds, then this returns `null`. Other errors will raise an exception.
   * The distinction between auth errors and other kinds of errors is due to auth errors being
   * intrinsic to the connection process: we want to give the user several attempts to reenter their
   * password. Whereas other errors will cause the entire connection process to fail immediately.
   * @param {*} config - connection configuration parameters.
   * @returns the authentication error, or `null` if successful.
   */


  async _connectOrNeedsAuth(config) {
    if (this._canceled) {
      throw new SshHandshakeError('Connection has been cancelled by the user', SshHandshake.ErrorType.USER_CANCELED);
    }

    try {
      await this._connection.connect(config);
      return null;
    } catch (error) {
      if (error.message === 'Encrypted private key detected, but no passphrase given') {
        return new SshAuthError(error, {
          needsPrivateKeyPassword: true
        });
      } else if (error.level === 'client-authentication') {
        return new SshAuthError(error, {
          needsPrivateKeyPassword: false
        });
      } else if (error.level !== undefined) {
        const errorType = error.level && SshConnectionErrorLevelMap.get(error.level) || SshHandshake.ErrorType.UNKNOWN;
        throw new SshHandshakeError(error.message, errorType, error);
      } else {
        throw error;
      }
    }
  }
  /**
   * Called when initial authentication fails and we want to give the user several attempts to enter
   * a password manually. Throws if unsuccessful.
   * @param {*} error - the authentication error thrown by `SshClient::connect`.
   * @param {*} connectConfig - the connection configuration; this function will add in the user's
   *  password.
   * @param {*} config - the base configuration information.
   */


  async _connectFallbackViaPassword(error, connectConfig, config) {
    let attempts = 0;
    let authError = error; // If the user has already provided a password, count it against their retry count.
    // flowlint-next-line sketchy-null-string:off

    if (connectConfig.password) {
      ++attempts;
    } // Using a private key, but no password was provided:


    if (error.needsPrivateKeyPassword) {
      const prompt = 'Encrypted private key detected, but no passphrase given.\n' + `Enter passphrase for ${config.pathToPrivateKey}: `;
      const password = await this._userPromptSingle({
        kind: 'private-key',
        prompt,
        echo: false,
        retry: false
      });
      authError = await this._connectOrNeedsAuth(Object.assign({}, connectConfig, {
        password
      }));
      ++attempts;
    } // Keep asking the user for the correct password until they run out of attempts or the
    // connection fails for a reason other than the password being wrong.


    while (authError != null && attempts < PASSWORD_RETRIES) {
      const retry = attempts > 0;
      const retryText = attempts > 0 ? ' again' : '';
      const prompt = `Authentication failed. Try entering your password${retryText}: `;
      ++attempts; // eslint-disable-next-line no-await-in-loop

      const password = await this._userPromptSingle({
        kind: 'private-key',
        prompt,
        echo: false,
        retry
      }); // eslint-disable-next-line no-await-in-loop

      authError = await this._connectOrNeedsAuth(Object.assign({}, connectConfig, {
        password
      }));
    }

    if (authError != null) {
      // Exceeded retries
      throw new SshHandshakeError('Ssh connection failed.', authError.errorType, authError.innerError);
    } // Success.

  }
  /**
   * Makes sure that the given error is wrapped in `SshHandshakeError`. If the connection is being
   * cancelled, then wrap the error again by a `USER_CANCELLED` error. Otherwise, if the error is
   * already an `SshHandshakeError`, then just return it. Finally, if not being cancelled and it is
   * not an `SshHandshakeError`, then wrap it with `UNKNOWN`.
   */


  _wrapError(error) {
    if (this._canceled) {
      return new SshHandshakeError('Cancelled by user', SshHandshake.ErrorType.USER_CANCELED, error);
    } else if (error instanceof SshHandshakeError) {
      return error;
    } else {
      return new SshHandshakeError('Unknown error', SshHandshake.ErrorType.UNKNOWN, error);
    }
  }
  /**
   * Starts a remote connection by initiating an ssh connection, starting up the remote server, and
   * configuring certificates for a secure connection.
   * @param {*} config
   */


  async connect(config) {
    try {
      this._config = config;
      this._canceled = false;

      this._willConnect();

      let lookup;

      try {
        lookup = await (0, _lookupPreferIpV().default)(config.host);
      } catch (error) {
        throw new SshHandshakeError('Failed to resolve DNS.', SshHandshake.ErrorType.HOST_NOT_FOUND, error);
      }

      const {
        address,
        family
      } = lookup;
      this._remoteFamily = family;
      const connectConfig = await this._getConnectConfig(address, config);
      const authError = await this._connectOrNeedsAuth(connectConfig);

      if (authError) {
        await this._connectFallbackViaPassword(authError, connectConfig, config);
      }

      return [await this._onSshConnectionIsReady(), this._config];
    } catch (error) {
      const wrappedError = this._wrapError(error); // eslint-disable-next-line no-console


      console.error(`SshHandshake failed: ${wrappedError.errorType}, ${wrappedError.message}`, wrappedError.innerError);

      this._delegate.onError(wrappedError.errorType, wrappedError.innerError || error, this._config);

      throw error;
    }
  }

  async cancel() {
    this._canceled = true;
    await this._connection.end();
  }

  _onKeyboardInteractive(name, instructions, instructionsLang, prompts) {
    return this._delegate.onKeyboardInteractive(name, instructions, instructionsLang, prompts.map(prompt => ({
      kind: 'ssh',
      prompt: prompt.prompt,
      echo: prompt.echo === undefined ? false : prompt.echo
    })));
  }

  _forwardSocket(socket) {
    if (!(socket.remoteAddress != null)) {
      throw new Error("Invariant violation: \"socket.remoteAddress != null\"");
    }

    if (!(this._remotePort != null)) {
      throw new Error("Invariant violation: \"this._remotePort != null\"");
    }

    this._connection.forwardOut(socket.remoteAddress, socket.remotePort, 'localhost', this._remotePort).then(stream => {
      socket.pipe(stream);
      stream.pipe(socket);
    }, err => {
      socket.end();
      console.error(err); // eslint-disable-line no-console
    });
  }

  _updateServerInfo(serverInfo) {
    // TODO(siegebell): `serverInfo` may not define `port` if in "insecure" mode.
    if (!(typeof serverInfo.port === 'number')) {
      throw new Error("Invariant violation: \"typeof serverInfo.port === 'number'\"");
    }

    this._remotePort = serverInfo.port || 0;
    this._remoteHost = typeof serverInfo.hostname === 'string' ? serverInfo.hostname : this._config.host; // The following keys are optional in `RemoteConnectionConfiguration`.
    //
    // Do not throw when any of them (`ca`, `cert`, or `key`) are undefined because that will be the
    // case when the server is started in "insecure" mode. See `::_isSecure`, which returns the
    // security of this connection after the server is started.

    if (typeof serverInfo.ca === 'string') {
      this._certificateAuthorityCertificate = new Buffer(serverInfo.ca);
    }

    if (typeof serverInfo.cert === 'string') {
      this._clientCertificate = new Buffer(serverInfo.cert);
    }

    if (typeof serverInfo.key === 'string') {
      this._clientKey = new Buffer(serverInfo.key);
    }
  }

  _isSecure() {
    return Boolean(this._certificateAuthorityCertificate && this._clientCertificate && this._clientKey);
  }

  _parseServerStartInfo(serverInfoJson) {
    let serverInfo;

    try {
      serverInfo = JSON.parse(serverInfoJson);
    } catch (error) {
      throw new SshHandshakeError('Malformed server start information', SshHandshake.ErrorType.SERVER_START_FAILED, new Error(serverInfoJson));
    }

    if (serverInfo.success) {
      return serverInfo;
    } else {
      throw new SshHandshakeError('Remote server failed to start', SshHandshake.ErrorType.SERVER_START_FAILED, new Error(serverInfo.logs));
    }
  }
  /**
   * After the server bootstrap completes, this function loads the server start info that was
   * written to `remoteTempFile`.
   * @param {*} remoteTempFile - where the server bootstrap wrote start info.
   */


  async _loadServerStartInformation(remoteTempFile) {
    const createSftp = async () => {
      try {
        return await (0, _promise().timeoutPromise)(this._connection.sftp(), SFTP_TIMEOUT_MS);
      } catch (error) {
        const reason = error instanceof _promise().TimedOutError ? SshHandshake.ErrorType.SFTP_TIMEOUT : SshHandshake.ErrorType.SERVER_START_FAILED;
        throw new SshHandshakeError('Failed to start sftp connection', reason, error);
      }
    };

    const getServerStartInfo = async sftp => {
      try {
        return await sftp.readFile(remoteTempFile, {
          encoding: 'utf8'
        });
      } catch (sftpError) {
        throw new SshHandshakeError('Failed to transfer server start information', SshHandshake.ErrorType.SERVER_START_FAILED, sftpError);
      }
    };

    try {
      const sftp = await createSftp();
      const serverInfoJson = await (0, _promise().lastly)(getServerStartInfo(sftp), () => sftp.end());

      const serverInfo = this._parseServerStartInfo(serverInfoJson); // Update server info that is needed for setting up client.


      this._updateServerInfo(serverInfo);
    } catch (error) {
      if (error instanceof SshHandshakeError) {
        throw error;
      }

      throw new SshHandshakeError('Unknown error while acquiring server start information', SshHandshake.ErrorType.UNKNOWN, error);
    }
  }

  async _installServerPackage(server) {
    const answer = await this._userPromptSingle({
      kind: 'install',
      prompt: 'Cannot find the remote server in ${server.getInstallationPath()}. Abort or install?',
      echo: true,
      installationPath: server.getInstallationPath(),
      options: ['abort', 'install']
    });

    if (answer === 'install') {
      await server.install(this._connection);
    } else {
      throw new SshHandshakeError('Server setup was aborted by the user', SshHandshake.ErrorType.SERVER_SETUP_FAILED);
    }
  }

  async _updateServerPackage(server, current, expected) {
    const answer = await this._userPromptSingle({
      kind: 'update',
      prompt: `The remote server version is ${current}, but ${expected} is required. Abort or update?`,
      echo: true,
      current,
      expected,
      options: ['abort', 'update']
    });

    if (answer === 'update') {
      await server.install(this._connection, {
        force: true
      });
    } else {
      throw new SshHandshakeError('Server setup was aborted by the user', SshHandshake.ErrorType.SERVER_SETUP_FAILED);
    }
  }
  /**
   * Makes sure that the remote server is installed, possibly installing it if necessary.
   * @param {*} remoteServer Represents the remore server
   */


  async _setupServerPackage(serverParams) {
    let server;
    let check;

    try {
      server = (0, _RemotePackage().getPackage)(serverParams);
      check = await server.verifyInstallation(this._connection);
    } catch (error) {
      throw new SshHandshakeError('Could not verify server installation', SshHandshake.ErrorType.SERVER_SETUP_FAILED, error);
    }

    if (check.status === 'needs-install') {
      await this._installServerPackage(server);
    } else if (check.status === 'needs-update') {
      await this._updateServerPackage(server, check.current, check.expected);
    } else if (check.status !== 'okay') {
      throw new SshHandshakeError(`Server is corrupt; ${check.message}`, SshHandshake.ErrorType.SERVER_SETUP_FAILED);
    }

    return server;
  }
  /**
   * Invokes the remote server and updates the server info via `_updateServerInfo`.
   */


  async _startRemoteServer(server) {
    const remoteTempFile = `/tmp/big-dig-sshhandshake-${Math.random()}`;
    const params = {
      cname: this._config.host,
      jsonOutputFile: remoteTempFile,
      timeout: 60000,
      expiration: '14d',
      serverParams: this._config.remoteServerCustomParams,
      exclusive: this._config.exclusive,
      ports: this._config.remoteServerPorts
    };

    try {
      // Run the server bootstrapper: this will create a server process, output the process info
      // to `remoteTempFile`, and then exit.
      const {
        stdout,
        code
      } = await server.run([JSON.stringify(params)], {
        pty: {
          term: 'nuclide'
        }
      }, this._connection);

      if (code !== 0) {
        throw new SshHandshakeError('Remote shell execution failed', SshHandshake.ErrorType.SERVER_START_FAILED, new Error(stdout));
      }

      return this._loadServerStartInformation(remoteTempFile);
    } catch (error) {
      if (error instanceof SshHandshakeError) {
        throw error;
      }

      const errorType = error.level && SshConnectionErrorLevelMap.get(error.level) || SshHandshake.ErrorType.UNKNOWN;
      throw new SshHandshakeError('Ssh connection failed.', errorType, error);
    }
  }
  /**
   * This is called when the SshConnection is ready.
   */


  async _onSshConnectionIsReady() {
    const server = await this._setupServerPackage(this._config.remoteServer);
    await this._startRemoteServer(server); // Use an ssh tunnel if server is not secure

    if (this._isSecure()) {
      if (!(this._remoteHost != null)) {
        throw new Error("Invariant violation: \"this._remoteHost != null\"");
      }

      if (!(this._remoteFamily != null)) {
        throw new Error("Invariant violation: \"this._remoteFamily != null\"");
      }

      return this._didConnect({
        host: this._remoteHost,
        family: this._remoteFamily,
        port: this._remotePort,
        certificateAuthorityCertificate: this._certificateAuthorityCertificate,
        clientCertificate: this._clientCertificate,
        clientKey: this._clientKey
      });
    } else {
      this._forwardingServer = _net.default.createServer(sock => {
        this._forwardSocket(sock);
      });
      const listening = (0, _events().onceEventOrError)(this._forwardingServer, 'listening');

      this._forwardingServer.listen(0, 'localhost');

      await listening;

      const localPort = this._getLocalPort();

      if (!(localPort != null)) {
        throw new Error("Invariant violation: \"localPort != null\"");
      }

      if (!(this._remoteFamily != null)) {
        throw new Error("Invariant violation: \"this._remoteFamily != null\"");
      }

      return this._didConnect({
        host: 'localhost',
        family: this._remoteFamily,
        port: localPort
      });
    }
  }

  _getLocalPort() {
    return this._forwardingServer ? this._forwardingServer.address().port : null;
  }

  getConfig() {
    return this._config;
  }

}

exports.SshHandshake = SshHandshake;
SshHandshake.ErrorType = ErrorType;
SshHandshake.SupportedMethods = SupportedMethods;

function decorateSshConnectionDelegateWithTracking(delegate) {
  let connectionTracker;
  return {
    async onKeyboardInteractive(name, instructions, instructionsLang, prompts) {
      if (!connectionTracker) {
        throw new Error("Invariant violation: \"connectionTracker\"");
      }

      connectionTracker.trackPromptYubikeyInput();
      const answers = await delegate.onKeyboardInteractive(name, instructions, instructionsLang, prompts);

      if (!connectionTracker) {
        throw new Error("Invariant violation: \"connectionTracker\"");
      }

      connectionTracker.trackFinishYubikeyInput();
      return answers;
    },

    onWillConnect: config => {
      connectionTracker = new (_ConnectionTracker().default)(config);
      delegate.onWillConnect(config);
    },
    onDidConnect: (remoteConnectionConfig, config) => {
      if (!connectionTracker) {
        throw new Error("Invariant violation: \"connectionTracker\"");
      }

      connectionTracker.trackSuccess();
      delegate.onDidConnect(remoteConnectionConfig, config);
    },
    onError: (errorType, error, config) => {
      if (!connectionTracker) {
        throw new Error("Invariant violation: \"connectionTracker\"");
      }

      connectionTracker.trackFailure(errorType, error);
      delegate.onError(errorType, error, config);
    }
  };
}