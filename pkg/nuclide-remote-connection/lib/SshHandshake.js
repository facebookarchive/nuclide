'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SshHandshake = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.decorateSshConnectionDelegateWithTracking = decorateSshConnectionDelegateWithTracking;

var _ConnectionTracker;

function _load_ConnectionTracker() {
  return _ConnectionTracker = _interopRequireDefault(require('./ConnectionTracker'));
}

var _ssh;

function _load_ssh() {
  return _ssh = require('ssh2');
}

var _fsPlus;

function _load_fsPlus() {
  return _fsPlus = _interopRequireDefault(require('fs-plus'));
}

var _net = _interopRequireDefault(require('net'));

var _RemoteConnection;

function _load_RemoteConnection() {
  return _RemoteConnection = require('./RemoteConnection');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _lookupPreferIpV;

function _load_lookupPreferIpV() {
  return _lookupPreferIpV = _interopRequireDefault(require('./lookup-prefer-ip-v6'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-connection');

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
  USER_CANCELLED: 'USER_CANCELLED'
});

/**
 * The server is asking for replies to the given prompts for
 * keyboard-interactive user authentication.
 *
 * @param name is generally what you'd use as
 *     a window title (for GUI apps).
 * @param prompts is an array of { prompt: 'Password: ',
 *     echo: false } style objects (here echo indicates whether user input
 *     should be displayed on the screen).
 * @param finish: The answers for all prompts must be provided as an
 *     array of strings and passed to finish when you are ready to continue. Note:
 *     It's possible for the server to come back and ask more questions.
 */


const SshConnectionErrorLevelMap = new Map([['client-timeout', ErrorType.SSH_CONNECT_TIMEOUT], ['client-socket', ErrorType.SSH_CONNECT_FAILED], ['protocal', ErrorType.SSH_CONNECT_FAILED], ['client-authentication', ErrorType.SSH_AUTHENTICATION], ['agent', ErrorType.SSH_AUTHENTICATION], ['client-dns', ErrorType.SSH_AUTHENTICATION]]);

class SshHandshake {

  constructor(delegate, connection) {
    this._cancelled = false;
    this._delegate = delegate;
    this._connection = connection ? connection : new (_ssh || _load_ssh()).Client();
    this._connection.on('ready', this._onConnect.bind(this));
    this._connection.on('error', this._onSshConnectionError.bind(this));
    this._connection.on('keyboard-interactive', this._onKeyboardInteractive.bind(this));
  }

  _willConnect() {
    this._delegate.onWillConnect(this._config);
  }

  _didConnect(connection) {
    this._delegate.onDidConnect(connection, this._config);
  }

  _error(message, errorType, error) {
    logger.error(`SshHandshake failed: ${errorType}, ${message}`, error);
    this._delegate.onError(errorType, error, this._config);
  }

  _onSshConnectionError(error) {
    const errorLevel = error.level;
    // Upon authentication failure, fall back to using a password.
    if (errorLevel === 'client-authentication' && this._passwordRetryCount < PASSWORD_RETRIES) {
      const config = this._config;
      const retryText = this._passwordRetryCount ? ' again' : '';
      this._delegate.onKeyboardInteractive('', '', '', // ignored
      [{
        prompt: `Authentication failed. Try entering your password${retryText}:`,
        echo: true
      }], ([password]) => {
        this._connection.connect({
          host: config.host,
          port: config.sshPort,
          username: config.username,
          password,
          tryKeyboard: true,
          readyTimeout: READY_TIMEOUT_MS
        });
      });
      this._passwordRetryCount++;
      return;
    }
    const errorType = SshConnectionErrorLevelMap.get(errorLevel) || SshHandshake.ErrorType.UNKNOWN;
    this._error('Ssh connection failed.', errorType, error);
  }

  connect(config) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._config = config;
      _this._passwordRetryCount = 0;
      _this._cancelled = false;
      _this._willConnect();

      const existingConnection = (_RemoteConnection || _load_RemoteConnection()).RemoteConnection.getByHostnameAndPath(_this._config.host, _this._config.cwd);

      if (existingConnection) {
        _this._didConnect(existingConnection);
        return;
      }

      let lookup;
      try {
        lookup = yield (0, (_lookupPreferIpV || _load_lookupPreferIpV()).default)(config.host);
      } catch (e) {
        return _this._error('Failed to resolve DNS.', SshHandshake.ErrorType.HOST_NOT_FOUND, e);
      }

      const { address, family } = lookup;
      _this._config.family = family;

      const connection = (yield (_RemoteConnection || _load_RemoteConnection()).RemoteConnection.createConnectionBySavedConfig(_this._config.host, _this._config.cwd, _this._config.displayTitle)) || (
      // We save connections by their IP address as well, in case a different hostname
      // was used for the same server.
      yield (_RemoteConnection || _load_RemoteConnection()).RemoteConnection.createConnectionBySavedConfig(address, _this._config.cwd, _this._config.displayTitle));

      if (connection) {
        _this._didConnect(connection);
        return;
      }

      if (config.authMethod === SupportedMethods.SSL_AGENT) {
        // Point to ssh-agent's socket for ssh-agent-based authentication.
        let agent = process.env.SSH_AUTH_SOCK;
        // flowlint-next-line sketchy-null-string:off
        if (!agent && /^win/.test(process.platform)) {
          // #100: On Windows, fall back to pageant.
          agent = 'pageant';
        }
        _this._connection.connect({
          host: address,
          port: config.sshPort,
          username: config.username,
          agent,
          tryKeyboard: true,
          readyTimeout: READY_TIMEOUT_MS
        });
      } else if (config.authMethod === SupportedMethods.PASSWORD) {
        // The user has already entered the password once.
        _this._passwordRetryCount++;
        // When the user chooses password-based authentication, we specify
        // the config as follows so that it tries simple password auth and
        // failing that it falls through to the keyboard interactive path
        _this._connection.connect({
          host: address,
          port: config.sshPort,
          username: config.username,
          password: config.password,
          tryKeyboard: true,
          readyTimeout: READY_TIMEOUT_MS
        });
      } else if (config.authMethod === SupportedMethods.PRIVATE_KEY) {
        // We use fs-plus's normalize() function because it will expand the ~, if present.
        const expandedPath = (_fsPlus || _load_fsPlus()).default.normalize(config.pathToPrivateKey);
        try {
          const privateKey = yield (_fsPromise || _load_fsPromise()).default.readFile(expandedPath);
          _this._connection.connect({
            host: address,
            port: config.sshPort,
            username: config.username,
            privateKey,
            tryKeyboard: true,
            readyTimeout: READY_TIMEOUT_MS
          });
        } catch (e) {
          _this._error('Failed to read private key', SshHandshake.ErrorType.CANT_READ_PRIVATE_KEY, e);
        }
      }
    })();
  }

  cancel() {
    this._cancelled = true;
    this._connection.end();
  }

  _onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish) {
    this._delegate.onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish);
  }

  _forwardSocket(socket) {
    this._connection.forwardOut(socket.remoteAddress, socket.remotePort, 'localhost', this._remotePort, (err, stream) => {
      if (err) {
        socket.end();
        logger.error(err);
        return;
      }
      socket.pipe(stream);
      stream.pipe(socket);
    });
  }

  _updateServerInfo(serverInfo) {
    if (!(typeof serverInfo.port === 'number')) {
      throw new Error('Invariant violation: "typeof serverInfo.port === \'number\'"');
    }

    this._remotePort = serverInfo.port;
    this._remoteHost = typeof serverInfo.hostname === 'string' ? serverInfo.hostname : this._config.host;

    // Because the value for the Initial Directory that the user supplied may have
    // been a symlink that was resolved by the server, overwrite the original `cwd`
    // value with the resolved value.

    if (!(typeof serverInfo.workspace === 'string')) {
      throw new Error('Invariant violation: "typeof serverInfo.workspace === \'string\'"');
    }

    this._config.cwd = serverInfo.workspace;

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

  _startRemoteServer() {
    var _this2 = this;

    let sftpTimer = null;
    return new Promise((resolve, reject) => {
      let stdOut = '';
      const remoteTempFile = `/tmp/nuclide-sshhandshake-${Math.random()}`;
      // TODO: escape any single quotes
      // TODO: the timeout value shall be configurable using .json file too (t6904691).
      const cmd = `${this._config.remoteServerCommand} --workspace=${this._config.cwd}` + ` --common-name=${this._config.host} --json-output-file=${remoteTempFile} -t 60`;

      this._connection.exec(cmd, { pty: { term: 'nuclide' } }, (err, stream) => {
        if (err) {
          this._onSshConnectionError(err);
          return resolve(false);
        }
        stream.on('close', (() => {
          var _ref = (0, _asyncToGenerator.default)(function* (code, signal) {
            // Note: this code is probably the code from the child shell if one
            // is in use.
            if (code === 0) {
              // Some servers have max channels set to 1, so add a delay to ensure
              // the old channel has been cleaned up on the server.
              // TODO(hansonw): Implement a proper retry mechanism.
              // But first, we have to clean up this callback hell.
              yield (0, (_promise || _load_promise()).sleep)(100);
              sftpTimer = setTimeout(function () {
                _this2._error('Failed to start sftp connection', SshHandshake.ErrorType.SFTP_TIMEOUT, new Error());
                sftpTimer = null;
                _this2._connection.end();
                resolve(false);
              }, SFTP_TIMEOUT_MS);
              _this2._connection.sftp((() => {
                var _ref2 = (0, _asyncToGenerator.default)(function* (error, sftp) {
                  if (sftpTimer != null) {
                    // Clear the sftp timer once we get a response.
                    clearTimeout(sftpTimer);
                  } else {
                    // If the timer already triggered, we timed out. Just exit.
                    return;
                  }
                  if (error) {
                    _this2._error('Failed to start sftp connection', SshHandshake.ErrorType.SERVER_START_FAILED, error);
                    return resolve(false);
                  }
                  const localTempFile = yield (_fsPromise || _load_fsPromise()).default.tempfile();
                  sftp.fastGet(remoteTempFile, localTempFile, (() => {
                    var _ref3 = (0, _asyncToGenerator.default)(function* (sftpError) {
                      sftp.end();
                      if (sftpError) {
                        _this2._error('Failed to transfer server start information', SshHandshake.ErrorType.SERVER_START_FAILED, sftpError);
                        return resolve(false);
                      }

                      let serverInfo = null;
                      const serverInfoJson = yield (_fsPromise || _load_fsPromise()).default.readFile(localTempFile, 'utf8');
                      try {
                        serverInfo = JSON.parse(serverInfoJson);
                      } catch (e) {
                        _this2._error('Malformed server start information', SshHandshake.ErrorType.SERVER_START_FAILED, new Error(serverInfoJson));
                        return resolve(false);
                      }

                      if (!serverInfo.success) {
                        _this2._error('Remote server failed to start', SshHandshake.ErrorType.SERVER_START_FAILED, new Error(serverInfo.logs));
                        return resolve(false);
                      }

                      if (!serverInfo.workspace) {
                        _this2._error('Could not find directory', SshHandshake.ErrorType.DIRECTORY_NOT_FOUND, new Error(serverInfo.logs));
                        return resolve(false);
                      }

                      // Update server info that is needed for setting up client.
                      _this2._updateServerInfo(serverInfo);
                      return resolve(true);
                    });

                    return function (_x5) {
                      return _ref3.apply(this, arguments);
                    };
                  })());
                });

                return function (_x3, _x4) {
                  return _ref2.apply(this, arguments);
                };
              })());
            } else {
              if (_this2._cancelled) {
                _this2._error('Cancelled by user', SshHandshake.ErrorType.USER_CANCELLED, new Error(stdOut));
              } else {
                _this2._error('Remote shell execution failed', SshHandshake.ErrorType.UNKNOWN, new Error(stdOut));
              }
              return resolve(false);
            }
          });

          return function (_x, _x2) {
            return _ref.apply(this, arguments);
          };
        })()).on('data', data => {
          stdOut += data;
        });
      });
    });
  }

  _onConnect() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(yield _this3._startRemoteServer())) {
        return;
      }

      const connect = (() => {
        var _ref4 = (0, _asyncToGenerator.default)(function* (config) {
          let connection = null;
          try {
            connection = yield (_RemoteConnection || _load_RemoteConnection()).RemoteConnection.findOrCreate(config);
          } catch (e) {
            _this3._error('Connection check failed', SshHandshake.ErrorType.SERVER_CANNOT_CONNECT, e);
          }
          if (connection != null) {
            _this3._didConnect(connection);
            // If we are secure then we don't need the ssh tunnel.
            if (_this3._isSecure()) {
              _this3._connection.end();
            }
          }
        });

        return function connect(_x6) {
          return _ref4.apply(this, arguments);
        };
      })();

      // Use an ssh tunnel if server is not secure
      if (_this3._isSecure()) {
        // flowlint-next-line sketchy-null-string:off
        if (!_this3._remoteHost) {
          throw new Error('Invariant violation: "this._remoteHost"');
        }
        // flowlint-next-line sketchy-null-number:off


        if (!_this3._remotePort) {
          throw new Error('Invariant violation: "this._remotePort"');
        }

        connect({
          host: _this3._remoteHost,
          port: _this3._remotePort,
          family: _this3._config.family,
          cwd: _this3._config.cwd,
          certificateAuthorityCertificate: _this3._certificateAuthorityCertificate,
          clientCertificate: _this3._clientCertificate,
          clientKey: _this3._clientKey,
          displayTitle: _this3._config.displayTitle
        });
      } else {
        /* $FlowIssue t9212378 */
        _this3._forwardingServer = _net.default.createServer(function (sock) {
          _this3._forwardSocket(sock);
        }).listen(0, 'localhost', function () {
          const localPort = _this3._getLocalPort();
          // flowlint-next-line sketchy-null-number:off

          if (!localPort) {
            throw new Error('Invariant violation: "localPort"');
          }

          connect({
            host: 'localhost',
            port: localPort,
            family: _this3._config.family,
            cwd: _this3._config.cwd,
            displayTitle: _this3._config.displayTitle
          });
        });
      }
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
    onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
      if (!connectionTracker) {
        throw new Error('Invariant violation: "connectionTracker"');
      }

      connectionTracker.trackPromptYubikeyInput();
      delegate.onKeyboardInteractive(name, instructions, instructionsLang, prompts, answers => {
        if (!connectionTracker) {
          throw new Error('Invariant violation: "connectionTracker"');
        }

        connectionTracker.trackFinishYubikeyInput();
        finish(answers);
      });
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