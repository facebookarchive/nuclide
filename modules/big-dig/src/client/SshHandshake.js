'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SshHandshake = exports.SshHandshakeError = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.decorateSshConnectionDelegateWithTracking = decorateSshConnectionDelegateWithTracking;

var _net = _interopRequireDefault(require('net'));

var _ssh;

function _load_ssh() {
  return _ssh = require('ssh2');
}

var _SftpClient;

function _load_SftpClient() {
  return _SftpClient = require('./SftpClient');
}

var _SshClient;

function _load_SshClient() {
  return _SshClient = require('./SshClient');
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireDefault(require('../common/fs'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _ConnectionTracker;

function _load_ConnectionTracker() {
  return _ConnectionTracker = _interopRequireDefault(require('./ConnectionTracker'));
}

var _lookupPreferIpV;

function _load_lookupPreferIpV() {
  return _lookupPreferIpV = _interopRequireDefault(require('./lookup-prefer-ip-v6'));
}

var _createBigDigClient;

function _load_createBigDigClient() {
  return _createBigDigClient = _interopRequireDefault(require('./createBigDigClient'));
}

var _events;

function _load_events() {
  return _events = require('../common/events');
}

var _RemotePackage;

function _load_RemotePackage() {
  return _RemotePackage = require('./RemotePackage');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO
function restoreBigDigClient(address) {} /**
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
const SFTP_TIMEOUT_MS = 20 * 1000;

// Automatically retry with a password prompt if existing authentication methods fail.
const PASSWORD_RETRIES = 3;

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
  SERVER_CANNOT_CONNECT: 'SERVER_CANNOT_CONNECT',
  SFTP_TIMEOUT: 'SFTP_TIMEOUT',
  UNSUPPORTED_AUTH_METHOD: 'UNSUPPORTED_AUTH_METHOD',
  USER_CANCELLED: 'USER_CANCELLED',
  SERVER_SETUP_FAILED: 'SERVER_SETUP_FAILED'
});

/** A prompt from ssh */


/** We need the user's private-key password */


/**
 * Prompt for installing a remote server. Emitted when a server does not exist and the given
 * installation path has no conflicts (i.e. is nonexistant or empty).
 */


/**
 * Prompt for updating the remote server. Emitted when a valid server is already installed, but it
 * is the wrong version for our client.
 */


/**
 * The server is asking for replies to the given prompts for
 * keyboard-interactive user authentication.
 *
 * @param name is generally what you'd use as
 *     a window title (for GUI apps).
 * @param prompts is an array of { prompt: 'Password: ',
 *     echo: false } style objects (here echo indicates whether user input
 *     should be displayed on the screen).
 * @return The answers for all prompts must be returned as an array of strings.
 *     Note: It's possible for the server to come back and ask more questions.
 */


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
    this.isCancellation = errorType === SshHandshake.ErrorType.USER_CANCELLED;
  }
}

exports.SshHandshakeError = SshHandshakeError; /**
                                                * Represents a connection failure due to a client-authentication error.
                                                */

class SshAuthError extends Error {
  /** If we have determined that the cause of the error was that a private key needs a password. */
  constructor(innerError, options) {
    super(innerError.message);
    this.innerError = innerError;
    this.needsPrivateKeyPassword = options.needsPrivateKeyPassword;
    const errorLevel = innerError.level;
    this.errorType = SshConnectionErrorLevelMap.get(errorLevel) || SshHandshake.ErrorType.UNKNOWN;
  }
  /** The error thrown by `SshClient::connect` */
}

class SshHandshake {

  constructor(delegate, connection) {
    this._cancelled = false;
    this._delegate = delegate;
    this._connection = new (_SshClient || _load_SshClient()).SshClient(connection ? connection : new (_ssh || _load_ssh()).Client(), this._onKeyboardInteractive.bind(this));
  }

  _willConnect() {
    this._delegate.onWillConnect(this._config);
  }

  _didConnect(connection) {
    this._delegate.onDidConnect(connection, this._config);
  }

  _userPromptSingle(prompt) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const [answer] = yield _this._delegate.onKeyboardInteractive('' /* name */
      , '' /* instructions */
      , '' /* instructionsLang */
      , [prompt]);
      return answer;
    })();
  }

  _getConnectConfig(address, config) {
    return (0, _asyncToGenerator.default)(function* () {
      if (config.authMethod === SupportedMethods.SSL_AGENT) {
        // Point to ssh-agent's socket for ssh-agent-based authentication.
        let agent = process.env.SSH_AUTH_SOCK;
        // flowlint-next-line sketchy-null-string:off
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
          privateKey = yield (_fs || _load_fs()).default.readFileAsBuffer(expandedPath);
        } catch (error) {
          throw new SshHandshakeError(`Failed to read private key at ${expandedPath}.`, SshHandshake.ErrorType.CANT_READ_PRIVATE_KEY, error);
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
    })();
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
  _connectOrNeedsAuth(config) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        yield _this2._connection.connect(config);
        return null;
      } catch (error) {
        if (error.message === 'Encrypted private key detected, but no passphrase given') {
          return new SshAuthError(error, { needsPrivateKeyPassword: true });
        } else if (error.level === 'client-authentication') {
          return new SshAuthError(error, { needsPrivateKeyPassword: false });
        } else {
          throw error;
        }
      }
    })();
  }

  /**
   * Called when initial authentication fails and we want to give the user several attempts to enter
   * a password manually. Throws if unsuccessful.
   * @param {*} error - the authentication error thrown by `SshClient::connect`.
   * @param {*} connectConfig - the connection configuration; this function will add in the user's
   *  password.
   * @param {*} config - the base configuration information.
   */
  _connectFallbackViaPassword(error, connectConfig, config) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let attempts = 0;
      let authError = error;

      // If the user has already provided a password, count it against their retry count.
      // flowlint-next-line sketchy-null-string:off
      if (connectConfig.password) {
        ++attempts;
      }

      // Using a private key, but no password was provided:
      if (error.needsPrivateKeyPassword) {
        const prompt = 'Encrypted private key detected, but no passphrase given.\n' + `Enter passphrase for ${config.pathToPrivateKey}: `;
        const password = yield _this3._userPromptSingle({
          kind: 'private-key',
          prompt,
          echo: false,
          retry: false
        });
        authError = yield _this3._connectOrNeedsAuth(Object.assign({}, connectConfig, {
          password
        }));
        ++attempts;
      }

      // Keep asking the user for the correct password until they run out of attempts or the
      // connection fails for a reason other than the password being wrong.
      while (authError != null && attempts < PASSWORD_RETRIES) {
        const retryText = attempts > 0 ? ' again' : '';
        const prompt = `Authentication failed. Try entering your password${retryText}: `;
        ++attempts;

        // eslint-disable-next-line no-await-in-loop
        const password = yield _this3._userPromptSingle({
          kind: 'private-key',
          prompt,
          echo: false,
          retry: true
        });
        // eslint-disable-next-line no-await-in-loop
        authError = yield _this3._connectOrNeedsAuth(Object.assign({}, connectConfig, {
          password
        }));
      }

      if (authError != null) {
        // Exceeded retries
        throw new SshHandshakeError('Ssh connection failed.', authError.errorType, authError.innerError);
      }
      // Success.
    })();
  }

  /**
   * Makes sure that the given error is wrapped in `SshHandshakeError`. If the connection is being
   * cancelled, then wrap the error again by a `USER_CANCELLED` error. Otherwise, if the error is
   * already an `SshHandshakeError`, then just return it. Finally, if not being cancelled and it is
   * not an `SshHandshakeError`, then wrap it with `UNKNOWN`.
   */
  _wrapError(error) {
    if (this._cancelled) {
      return new SshHandshakeError('Cancelled by user', SshHandshake.ErrorType.USER_CANCELLED, error);
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
  connect(config) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        _this4._config = config;
        _this4._cancelled = false;
        _this4._willConnect();

        let address;
        try {
          address = yield (0, (_lookupPreferIpV || _load_lookupPreferIpV()).default)(config.host);
        } catch (error) {
          throw new SshHandshakeError('Failed to resolve DNS.', SshHandshake.ErrorType.HOST_NOT_FOUND, error);
        }

        const connection = (yield restoreBigDigClient(config.host)) || (
        // We save connections by their IP address as well, in case a different hostname
        // was used for the same server.
        yield restoreBigDigClient(address));

        if (connection) {
          _this4._didConnect(connection);
          return [connection, _this4._config];
        }

        const connectConfig = yield _this4._getConnectConfig(address, config);
        const authError = yield _this4._connectOrNeedsAuth(connectConfig);
        if (authError) {
          yield _this4._connectFallbackViaPassword(authError, connectConfig, config);
        }

        return [yield _this4._onSshConnectionIsReady(), _this4._config];
      } catch (innerError) {
        const error = _this4._wrapError(innerError);

        // eslint-disable-next-line no-console
        console.error(`SshHandshake failed: ${error.errorType}, ${error.message}`, error.innerError);
        _this4._delegate.onError(error.errorType, innerError, _this4._config);

        throw error;
      }
    })();
  }

  cancel() {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this5._cancelled = true;
      yield _this5._connection.end();
    })();
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
      throw new Error('Invariant violation: "socket.remoteAddress != null"');
    }

    if (!(this._remotePort != null)) {
      throw new Error('Invariant violation: "this._remotePort != null"');
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
      throw new Error('Invariant violation: "typeof serverInfo.port === \'number\'"');
    }

    this._remotePort = serverInfo.port || 0;
    this._remoteHost = typeof serverInfo.hostname === 'string' ? serverInfo.hostname : this._config.host;

    // The following keys are optional in `RemoteConnectionConfiguration`.
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
  _loadServerStartInformation(remoteTempFile) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const createSftp = (() => {
        var _ref = (0, _asyncToGenerator.default)(function* () {
          try {
            return yield (0, (_promise || _load_promise()).timeoutPromise)(_this6._connection.sftp(), SFTP_TIMEOUT_MS);
          } catch (error) {
            const reason = error instanceof (_promise || _load_promise()).TimedOutError ? SshHandshake.ErrorType.SFTP_TIMEOUT : SshHandshake.ErrorType.SERVER_START_FAILED;
            throw new SshHandshakeError('Failed to start sftp connection', reason, error);
          }
        });

        return function createSftp() {
          return _ref.apply(this, arguments);
        };
      })();
      const getServerStartInfo = (() => {
        var _ref2 = (0, _asyncToGenerator.default)(function* (sftp) {
          try {
            return yield sftp.readFile(remoteTempFile, { encoding: 'utf8' });
          } catch (sftpError) {
            throw new SshHandshakeError('Failed to transfer server start information', SshHandshake.ErrorType.SERVER_START_FAILED, sftpError);
          }
        });

        return function getServerStartInfo(_x) {
          return _ref2.apply(this, arguments);
        };
      })();

      try {
        const sftp = yield createSftp();
        const serverInfoJson = yield (0, (_promise || _load_promise()).lastly)(getServerStartInfo(sftp), function () {
          return sftp.end();
        });
        const serverInfo = _this6._parseServerStartInfo(serverInfoJson);
        // Update server info that is needed for setting up client.
        _this6._updateServerInfo(serverInfo);
      } catch (error) {
        throw new SshHandshakeError('Unknown error while acquiring server start information', SshHandshake.ErrorType.UNKNOWN, error);
      }
    })();
  }

  _installServerPackage(server) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const answer = yield _this7._userPromptSingle({
        kind: 'install',
        prompt: 'Cannot find the remote server in ${server.getInstallationPath()}. Abort or install?',
        echo: true,
        installationPath: server.getInstallationPath(),
        options: ['abort', 'install']
      });
      if (answer === 'install') {
        yield server.install(_this7._connection);
      } else {
        throw new SshHandshakeError('Server setup was aborted by the user', SshHandshake.ErrorType.SERVER_SETUP_FAILED);
      }
    })();
  }

  _updateServerPackage(server, current, expected) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const answer = yield _this8._userPromptSingle({
        kind: 'update',
        prompt: `The remote server version is ${current}, but ${expected} is required. Abort or update?`,
        echo: true,
        current,
        expected,
        options: ['abort', 'update']
      });
      if (answer === 'update') {
        yield server.install(_this8._connection, { force: true });
      } else {
        throw new SshHandshakeError('Server setup was aborted by the user', SshHandshake.ErrorType.SERVER_SETUP_FAILED);
      }
    })();
  }

  /**
   * Makes sure that the remote server is installed, possibly installing it if necessary.
   * @param {*} remoteServer Represents the remore server
   */
  _setupServerPackage(serverParams) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let server;
      let check;
      try {
        server = (0, (_RemotePackage || _load_RemotePackage()).getPackage)(serverParams);
        check = yield server.verifyInstallation(_this9._connection);
      } catch (error) {
        throw new SshHandshakeError('Could not verify server installation', SshHandshake.ErrorType.SERVER_SETUP_FAILED, error);
      }

      if (check.status === 'needs-install') {
        yield _this9._installServerPackage(server);
      } else if (check.status === 'needs-update') {
        yield _this9._updateServerPackage(server, check.current, check.expected);
      } else if (check.status !== 'okay') {
        throw new SshHandshakeError(`Server is corrupt; ${check.message}`, SshHandshake.ErrorType.SERVER_SETUP_FAILED);
      }

      return server;
    })();
  }

  /**
   * Invokes the remote server and updates the server info via `_updateServerInfo`.
   */
  _startRemoteServer(server) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const remoteTempFile = `/tmp/big-dig-sshhandshake-${Math.random()}`;
      const params = {
        cname: _this10._config.host,
        jsonOutputFile: remoteTempFile,
        timeout: '60s', // Currently unused and not configurable.
        expiration: '7d',
        serverParams: _this10._config.remoteServerCustomParams,
        port: _this10._config.remoteServerPort
      };

      try {
        // Run the server bootstrapper: this will create a server process, output the process info
        // to `remoteTempFile`, and then exit.
        const { stdout, code } = yield server.run([JSON.stringify(params)], { pty: { term: 'nuclide' } }, _this10._connection);

        if (code !== 0) {
          throw new SshHandshakeError('Remote shell execution failed', SshHandshake.ErrorType.UNKNOWN, new Error(stdout));
        }

        return _this10._loadServerStartInformation(remoteTempFile);
      } catch (error) {
        if (error instanceof SshHandshakeError) {
          throw error;
        }
        const errorType = error.level && SshConnectionErrorLevelMap.get(error.level) || SshHandshake.ErrorType.UNKNOWN;
        throw new SshHandshakeError('Ssh connection failed.', errorType, error);
      }
    })();
  }

  /**
   * This is called when the SshConnection is ready.
   */
  _onSshConnectionIsReady() {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const server = yield _this11._setupServerPackage(_this11._config.remoteServer);
      yield _this11._startRemoteServer(server);

      // Use an ssh tunnel if server is not secure
      if (_this11._isSecure()) {
        // flowlint-next-line sketchy-null-string:off
        if (!_this11._remoteHost) {
          throw new Error('Invariant violation: "this._remoteHost"');
        }

        return _this11._establishBigDigClient({
          host: _this11._remoteHost,
          port: _this11._remotePort,
          certificateAuthorityCertificate: _this11._certificateAuthorityCertificate,
          clientCertificate: _this11._clientCertificate,
          clientKey: _this11._clientKey
        });
      } else {
        _this11._forwardingServer = _net.default.createServer(function (sock) {
          _this11._forwardSocket(sock);
        });
        const listening = (0, (_events || _load_events()).onceEventOrError)(_this11._forwardingServer, 'listening');
        _this11._forwardingServer.listen(0, 'localhost');
        yield listening;
        const localPort = _this11._getLocalPort();
        // flowlint-next-line sketchy-null-number:off

        if (!localPort) {
          throw new Error('Invariant violation: "localPort"');
        }

        return _this11._establishBigDigClient({
          host: 'localhost',
          port: localPort
        });
      }
    })();
  }

  /**
   * Now that the remote server has been started, create the BigDigClient to talk to it and
   * pass it to the _didConnect() callback.
   */
  _establishBigDigClient(config) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let bigDigClient = null;
      try {
        bigDigClient = yield (0, (_createBigDigClient || _load_createBigDigClient()).default)(config);
      } catch (error) {
        throw new SshHandshakeError('Connection check failed', SshHandshake.ErrorType.SERVER_CANNOT_CONNECT, error);
      }

      _this12._didConnect(bigDigClient);
      // If we are secure then we don't need the ssh tunnel.
      if (_this12._isSecure()) {
        yield _this12._connection.end();
      }

      return bigDigClient;
    })();
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
    onKeyboardInteractive(name, instructions, instructionsLang, prompts) {
      return (0, _asyncToGenerator.default)(function* () {
        if (!connectionTracker) {
          throw new Error('Invariant violation: "connectionTracker"');
        }

        connectionTracker.trackPromptYubikeyInput();
        const answers = yield delegate.onKeyboardInteractive(name, instructions, instructionsLang, prompts);

        if (!connectionTracker) {
          throw new Error('Invariant violation: "connectionTracker"');
        }

        connectionTracker.trackFinishYubikeyInput();
        return answers;
      })();
    },
    onWillConnect: config => {
      connectionTracker = new (_ConnectionTracker || _load_ConnectionTracker()).default(config);
      delegate.onWillConnect(config);
    },
    onDidConnect: (connection, config) => {
      if (!connectionTracker) {
        throw new Error('Invariant violation: "connectionTracker"');
      }

      connectionTracker.trackSuccess();
      delegate.onDidConnect(connection, config);
    },
    onError: (errorType, error, config) => {
      if (!connectionTracker) {
        throw new Error('Invariant violation: "connectionTracker"');
      }

      connectionTracker.trackFailure(errorType, error);
      delegate.onError(errorType, error, config);
    }
  };
}