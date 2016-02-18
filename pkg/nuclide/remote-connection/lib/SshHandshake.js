Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.decorateSshConnectionDelegateWithTracking = decorateSshConnectionDelegateWithTracking;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ConnectionTracker = require('./ConnectionTracker');

var _ConnectionTracker2 = _interopRequireDefault(_ConnectionTracker);

var SshConnection = require('ssh2').Client;
var fs = require('fs-plus');
var net = require('net');
var logger = require('../../logging').getLogger();
var invariant = require('assert');

var _require = require('./RemoteConnection');

var RemoteConnection = _require.RemoteConnection;

var _require2 = require('../../commons');

var fsPromise = _require2.fsPromise;
var promises = _require2.promises;

// Sync word and regex pattern for parsing command stdout.
var READY_TIMEOUT_MS = 60 * 1000;

// for simple password-based authentication

var SupportedMethods = {
  SSL_AGENT: 'SSL_AGENT',
  PASSWORD: 'PASSWORD',
  PRIVATE_KEY: 'PRIVATE_KEY'
};

var ErrorType = {
  UNKNOWN: 'UNKNOWN',
  HOST_NOT_FOUND: 'HOST_NOT_FOUND',
  CANT_READ_PRIVATE_KEY: 'CANT_READ_PRIVATE_KEY',
  SSH_CONNECT_TIMEOUT: 'SSH_CONNECT_TIMEOUT',
  SSH_CONNECT_FAILED: 'SSH_CONNECT_FAILED',
  SSH_AUTHENTICATION: 'SSH_AUTHENTICATION',
  DIRECTORY_NOT_FOUND: 'DIRECTORY_NOT_FOUND',
  SERVER_START_FAILED: 'SERVER_START_FAILED',
  SERVER_VERSION_MISMATCH: 'SERVER_VERSION_MISMATCH'
};

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

var SshConnectionErrorLevelMap = new Map([['client-timeout', ErrorType.SSH_CONNECT_TIMEOUT], ['client-socket', ErrorType.SSH_CONNECT_FAILED], ['protocal', ErrorType.SSH_CONNECT_FAILED], ['client-authentication', ErrorType.SSH_AUTHENTICATION], ['agent', ErrorType.SSH_AUTHENTICATION], ['client-dns', ErrorType.SSH_AUTHENTICATION]]);

var SshHandshake = (function () {
  _createClass(SshHandshake, null, [{
    key: 'ErrorType',
    value: ErrorType,
    enumerable: true
  }]);

  function SshHandshake(delegate, connection) {
    _classCallCheck(this, SshHandshake);

    this._delegate = delegate;
    this._connection = connection ? connection : new SshConnection();
    this._connection.on('ready', this._onConnect.bind(this));
    this._connection.on('error', this._onSshConnectionError.bind(this));
    this._connection.on('keyboard-interactive', this._onKeyboardInteractive.bind(this));
  }

  _createClass(SshHandshake, [{
    key: '_willConnect',
    value: function _willConnect() {
      this._delegate.onWillConnect(this._config);
    }
  }, {
    key: '_didConnect',
    value: function _didConnect(connection) {
      this._delegate.onDidConnect(connection, this._config);
    }
  }, {
    key: '_error',
    value: function _error(message, errorType, error) {
      logger.error('SshHandshake failed: ' + errorType + ', ' + message, error);
      this._delegate.onError(errorType, error, this._config);
    }
  }, {
    key: '_onSshConnectionError',
    value: function _onSshConnectionError(error) {
      var errorLevel = error.level;
      var errorType = SshConnectionErrorLevelMap.get(errorLevel) || SshHandshake.ErrorType.UNKNOWN;
      this._error('Ssh connection failed.', errorType, error);
    }
  }, {
    key: 'connect',
    value: _asyncToGenerator(function* (config) {
      this._config = config;
      this._willConnect();

      var existingConnection = RemoteConnection.getByHostnameAndPath(this._config.host, this._config.cwd);

      if (existingConnection) {
        this._didConnect(existingConnection);
        return;
      }

      var connection = yield RemoteConnection.createConnectionBySavedConfig(this._config.host, this._config.cwd);

      if (connection) {
        this._didConnect(connection);
        return;
      }

      var lookupPreferIpv6 = require('../../commons').dnsUtils.lookupPreferIpv6;

      var address = null;
      try {
        address = yield lookupPreferIpv6(config.host);
      } catch (e) {
        this._error('Failed to resolve DNS.', SshHandshake.ErrorType.HOST_NOT_FOUND, e);
      }

      if (config.authMethod === SupportedMethods.SSL_AGENT) {
        // Point to ssh-agent's socket for ssh-agent-based authentication.
        var agent = process.env['SSH_AUTH_SOCK'];
        if (!agent && /^win/.test(process.platform)) {
          // #100: On Windows, fall back to pageant.
          agent = 'pageant';
        }
        this._connection.connect({
          host: address,
          port: config.sshPort,
          username: config.username,
          agent: agent,
          tryKeyboard: true,
          readyTimeout: READY_TIMEOUT_MS
        });
      } else if (config.authMethod === SupportedMethods.PASSWORD) {
        // When the user chooses password-based authentication, we specify
        // the config as follows so that it tries simple password auth and
        // failing that it falls through to the keyboard interactive path
        this._connection.connect({
          host: address,
          port: config.sshPort,
          username: config.username,
          password: config.password,
          tryKeyboard: true
        });
      } else if (config.authMethod === SupportedMethods.PRIVATE_KEY) {
        // We use fs-plus's normalize() function because it will expand the ~, if present.
        var expandedPath = fs.normalize(config.pathToPrivateKey);
        var privateKey = null;
        try {
          privateKey = yield fsPromise.readFile(expandedPath);
        } catch (e) {
          this._error('Failed to read private key', SshHandshake.ErrorType.CANT_READ_PRIVATE_KEY, e);
        }
        this._connection.connect({
          host: address,
          port: config.sshPort,
          username: config.username,
          privateKey: privateKey,
          tryKeyboard: true,
          readyTimeout: READY_TIMEOUT_MS
        });
      }
    })
  }, {
    key: 'cancel',
    value: function cancel() {
      this._connection.end();
    }
  }, {
    key: '_onKeyboardInteractive',
    value: function _onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish) {
      this._delegate.onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish);
    }
  }, {
    key: '_forwardSocket',
    value: function _forwardSocket(socket) {
      this._connection.forwardOut(socket.remoteAddress, socket.remotePort, 'localhost', this._remotePort, function (err, stream) {
        if (err) {
          socket.end();
          logger.error(err);
          return;
        }
        socket.pipe(stream);
        stream.pipe(socket);
      });
    }
  }, {
    key: '_updateServerInfo',
    value: function _updateServerInfo(serverInfo) {
      invariant(serverInfo.port);
      this._remotePort = serverInfo.port;
      this._remoteHost = '' + (serverInfo.hostname || this._config.host);
      // Because the value for the Initial Directory that the user supplied may have
      // been a symlink that was resolved by the server, overwrite the original `cwd`
      // value with the resolved value.
      invariant(serverInfo.workspace);
      this._config.cwd = serverInfo.workspace;
      invariant(serverInfo.ca);
      this._certificateAuthorityCertificate = serverInfo.ca;
      invariant(serverInfo.cert);
      this._clientCertificate = serverInfo.cert;
      invariant(serverInfo.key);
      this._clientKey = serverInfo.key;
    }
  }, {
    key: '_isSecure',
    value: function _isSecure() {
      return !!(this._certificateAuthorityCertificate && this._clientCertificate && this._clientKey);
    }
  }, {
    key: '_startRemoteServer',
    value: _asyncToGenerator(function* () {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var stdOut = '';
        var remoteTempFile = '/tmp/nuclide-sshhandshake-' + Math.random();
        //TODO: escape any single quotes
        //TODO: the timeout value shall be configurable using .json file too (t6904691).
        var cmd = _this._config.remoteServerCommand + ' --workspace=' + _this._config.cwd + (' --common-name=' + _this._config.host + ' --json-output-file=' + remoteTempFile + ' -t 60');

        _this._connection.exec(cmd, { pty: { term: 'nuclide' } }, function (err, stream) {
          if (err) {
            _this._onSshConnectionError(err);
            return resolve(false);
          }
          stream.on('close', _asyncToGenerator(function* (code, signal) {
            // Note: this code is probably the code from the child shell if one
            // is in use.
            if (code === 0) {
              // Some servers have max channels set to 1, so add a delay to ensure
              // the old channel has been cleaned up on the server.
              // TODO(hansonw): Implement a proper retry mechanism.
              // But first, we have to clean up this callback hell.
              yield promises.awaitMilliSeconds(100);
              _this._connection.sftp(_asyncToGenerator(function* (error, sftp) {
                if (error) {
                  _this._error('Failed to start sftp connection', SshHandshake.ErrorType.SERVER_START_FAILED, error);
                  return resolve(false);
                }
                var localTempFile = yield fsPromise.tempfile();
                sftp.fastGet(remoteTempFile, localTempFile, _asyncToGenerator(function* (sftpError) {
                  sftp.end();
                  if (sftpError) {
                    _this._error('Failed to transfer server start information', SshHandshake.ErrorType.SERVER_START_FAILED, sftpError);
                    return resolve(false);
                  }

                  var serverInfo = null;
                  var serverInfoJson = yield fsPromise.readFile(localTempFile);
                  try {
                    serverInfo = JSON.parse(serverInfoJson);
                  } catch (e) {
                    _this._error('Malformed server start information', SshHandshake.ErrorType.SERVER_START_FAILED, new Error(serverInfoJson));
                    return resolve(false);
                  }

                  if (!serverInfo.success) {
                    _this._error('Remote server failed to start', SshHandshake.ErrorType.SERVER_START_FAILED, new Error(serverInfo.logs));
                    return resolve(false);
                  }

                  if (!serverInfo.workspace) {
                    _this._error('Could not find directory', SshHandshake.ErrorType.DIRECTORY_NOT_FOUND, new Error(serverInfo.logs));
                    return resolve(false);
                  }

                  // Update server info that is needed for setting up client.
                  _this._updateServerInfo(serverInfo);
                  return resolve(true);
                }));
              }));
            } else {
              _this._error('Remote shell execution failed', SshHandshake.ErrorType.UNKNOWN, new Error(stdOut));
              return resolve(false);
            }
          })).on('data', function (data) {
            stdOut += data;
          });
        });
      });
    })
  }, {
    key: '_onConnect',
    value: _asyncToGenerator(function* () {
      var _this2 = this;

      if (!(yield this._startRemoteServer())) {
        return;
      }

      var finishHandshake = _asyncToGenerator(function* (connection) {
        try {
          yield connection.initialize();
        } catch (e) {
          _this2._error('Connection check failed', SshHandshake.ErrorType.SERVER_VERSION_MISMATCH, e);
        }
        _this2._didConnect(connection);
        // If we are secure then we don't need the ssh tunnel.
        if (_this2._isSecure()) {
          _this2._connection.end();
        }
      });

      // Use an ssh tunnel if server is not secure
      if (this._isSecure()) {
        invariant(this._remoteHost);
        invariant(this._remotePort);
        var _connection = new RemoteConnection({
          host: this._remoteHost,
          port: this._remotePort,
          cwd: this._config.cwd,
          certificateAuthorityCertificate: this._certificateAuthorityCertificate,
          clientCertificate: this._clientCertificate,
          clientKey: this._clientKey
        });
        finishHandshake(_connection);
      } else {
        /* $FlowIssue t9212378 */
        this._forwardingServer = net.createServer(function (sock) {
          _this2._forwardSocket(sock);
        }).listen(0, 'localhost', function () {
          var localPort = _this2._getLocalPort();
          invariant(localPort);
          var connection = new RemoteConnection({
            host: 'localhost',
            port: localPort,
            cwd: _this2._config.cwd
          });
          finishHandshake(connection);
        });
      }
    })
  }, {
    key: '_getLocalPort',
    value: function _getLocalPort() {
      return this._forwardingServer ? this._forwardingServer.address().port : null;
    }
  }, {
    key: 'getConfig',
    value: function getConfig() {
      return this._config;
    }
  }]);

  return SshHandshake;
})();

exports.SshHandshake = SshHandshake;

SshHandshake.SupportedMethods = SupportedMethods;

function decorateSshConnectionDelegateWithTracking(delegate) {
  var connectionTracker = undefined;

  return {
    onKeyboardInteractive: function onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish) {
      invariant(connectionTracker);
      connectionTracker.trackPromptYubikeyInput();
      delegate.onKeyboardInteractive(name, instructions, instructionsLang, prompts, function (answers) {
        invariant(connectionTracker);
        connectionTracker.trackFinishYubikeyInput();
        finish(answers);
      });
    },
    onWillConnect: function onWillConnect(config) {
      connectionTracker = new _ConnectionTracker2['default'](config);
      delegate.onWillConnect(config);
    },
    onDidConnect: function onDidConnect(connection, config) {
      invariant(connectionTracker);
      connectionTracker.trackSuccess();
      delegate.onDidConnect(connection, config);
    },
    onError: function onError(errorType, error, config) {
      invariant(connectionTracker);
      connectionTracker.trackFailure(errorType, error);
      delegate.onError(errorType, error, config);
    }
  };
}

// host nuclide server is running on
// ssh port of host nuclide server is running on
// username to authenticate as
// The path to private key
// Command to use to start server
// Path to remote directory user should start in upon connection.
// Which of the authentication methods in `SupportedMethods` to use.

/** Invoked when server requests keyboard interaction */

/** Invoked when trying to connect */

/** Invoked when connection is sucessful */

/** Invoked when connection is fails */
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdCLHVCQUFpQixDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ2pDLGNBQVEsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzNDO0FBQ0QsV0FBTyxFQUFFLGlCQUNQLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNIO0FBQ0gsZUFBUyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDN0IsdUJBQWlCLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNqRCxjQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDNUM7R0FDRixDQUFDO0NBQ0giLCJmaWxlIjoiU3NoSGFuZHNoYWtlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IENvbm5lY3Rpb25UcmFja2VyIGZyb20gJy4vQ29ubmVjdGlvblRyYWNrZXInO1xuXG5jb25zdCBTc2hDb25uZWN0aW9uID0gcmVxdWlyZSgnc3NoMicpLkNsaWVudDtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMtcGx1cycpO1xuY29uc3QgbmV0ID0gcmVxdWlyZSgnbmV0Jyk7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5jb25zdCBpbnZhcmlhbnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcblxuY29uc3Qge1JlbW90ZUNvbm5lY3Rpb259ID0gcmVxdWlyZSgnLi9SZW1vdGVDb25uZWN0aW9uJyk7XG5jb25zdCB7ZnNQcm9taXNlLCBwcm9taXNlc30gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJyk7XG5cbi8vIFN5bmMgd29yZCBhbmQgcmVnZXggcGF0dGVybiBmb3IgcGFyc2luZyBjb21tYW5kIHN0ZG91dC5cbmNvbnN0IFJFQURZX1RJTUVPVVRfTVMgPSA2MCAqIDEwMDA7XG5cbmV4cG9ydCB0eXBlIFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uID0ge1xuICBob3N0OiBzdHJpbmcsIC8vIGhvc3QgbnVjbGlkZSBzZXJ2ZXIgaXMgcnVubmluZyBvblxuICBzc2hQb3J0OiBudW1iZXIsIC8vIHNzaCBwb3J0IG9mIGhvc3QgbnVjbGlkZSBzZXJ2ZXIgaXMgcnVubmluZyBvblxuICB1c2VybmFtZTogc3RyaW5nLCAvLyB1c2VybmFtZSB0byBhdXRoZW50aWNhdGUgYXNcbiAgcGF0aFRvUHJpdmF0ZUtleTogc3RyaW5nLCAvLyBUaGUgcGF0aCB0byBwcml2YXRlIGtleVxuICByZW1vdGVTZXJ2ZXJDb21tYW5kOiBzdHJpbmcsIC8vIENvbW1hbmQgdG8gdXNlIHRvIHN0YXJ0IHNlcnZlclxuICBjd2Q6IHN0cmluZywgLy8gUGF0aCB0byByZW1vdGUgZGlyZWN0b3J5IHVzZXIgc2hvdWxkIHN0YXJ0IGluIHVwb24gY29ubmVjdGlvbi5cbiAgYXV0aE1ldGhvZDogc3RyaW5nLCAvLyBXaGljaCBvZiB0aGUgYXV0aGVudGljYXRpb24gbWV0aG9kcyBpbiBgU3VwcG9ydGVkTWV0aG9kc2AgdG8gdXNlLlxuICBwYXNzd29yZDogc3RyaW5nLCAvLyBmb3Igc2ltcGxlIHBhc3N3b3JkLWJhc2VkIGF1dGhlbnRpY2F0aW9uXG59XG5cbmNvbnN0IFN1cHBvcnRlZE1ldGhvZHMgPSB7XG4gIFNTTF9BR0VOVDogJ1NTTF9BR0VOVCcsXG4gIFBBU1NXT1JEOiAnUEFTU1dPUkQnLFxuICBQUklWQVRFX0tFWTogJ1BSSVZBVEVfS0VZJyxcbn07XG5cbmNvbnN0IEVycm9yVHlwZSA9IHtcbiAgVU5LTk9XTjogJ1VOS05PV04nLFxuICBIT1NUX05PVF9GT1VORDogJ0hPU1RfTk9UX0ZPVU5EJyxcbiAgQ0FOVF9SRUFEX1BSSVZBVEVfS0VZOiAnQ0FOVF9SRUFEX1BSSVZBVEVfS0VZJyxcbiAgU1NIX0NPTk5FQ1RfVElNRU9VVDogJ1NTSF9DT05ORUNUX1RJTUVPVVQnLFxuICBTU0hfQ09OTkVDVF9GQUlMRUQ6ICdTU0hfQ09OTkVDVF9GQUlMRUQnLFxuICBTU0hfQVVUSEVOVElDQVRJT046ICdTU0hfQVVUSEVOVElDQVRJT04nLFxuICBESVJFQ1RPUllfTk9UX0ZPVU5EOiAnRElSRUNUT1JZX05PVF9GT1VORCcsXG4gIFNFUlZFUl9TVEFSVF9GQUlMRUQ6ICdTRVJWRVJfU1RBUlRfRkFJTEVEJyxcbiAgU0VSVkVSX1ZFUlNJT05fTUlTTUFUQ0g6ICdTRVJWRVJfVkVSU0lPTl9NSVNNQVRDSCcsXG59O1xuXG5leHBvcnQgdHlwZSBTc2hIYW5kc2hha2VFcnJvclR5cGUgPSAnVU5LTk9XTicgfCAnSE9TVF9OT1RfRk9VTkQnIHwgJ0NBTlRfUkVBRF9QUklWQVRFX0tFWScgfFxuICAnU1NIX0NPTk5FQ1RfVElNRU9VVCcgfCAnU1NIX0NPTk5FQ1RfRkFJTEVEJyB8ICdTU0hfQVVUSEVOVElDQVRJT04nIHwgJ0RJUkVDVE9SWV9OT1RfRk9VTkQnIHxcbiAgJ1NFUlZFUl9TVEFSVF9GQUlMRUQnIHwgJ1NFUlZFUl9WRVJTSU9OX01JU01BVENIJztcblxudHlwZSBTc2hDb25uZWN0aW9uRXJyb3JMZXZlbCA9ICdjbGllbnQtdGltZW91dCcgfCAnY2xpZW50LXNvY2tldCcgfCAncHJvdG9jYWwnIHxcbiAgJ2NsaWVudC1hdXRoZW50aWNhdGlvbicgfCAnYWdlbnQnIHwgJ2NsaWVudC1kbnMnO1xuXG4vKipcbiAqIFRoZSBzZXJ2ZXIgaXMgYXNraW5nIGZvciByZXBsaWVzIHRvIHRoZSBnaXZlbiBwcm9tcHRzIGZvclxuICoga2V5Ym9hcmQtaW50ZXJhY3RpdmUgdXNlciBhdXRoZW50aWNhdGlvbi5cbiAqXG4gKiBAcGFyYW0gbmFtZSBpcyBnZW5lcmFsbHkgd2hhdCB5b3UnZCB1c2UgYXNcbiAqICAgICBhIHdpbmRvdyB0aXRsZSAoZm9yIEdVSSBhcHBzKS5cbiAqIEBwYXJhbSBwcm9tcHRzIGlzIGFuIGFycmF5IG9mIHsgcHJvbXB0OiAnUGFzc3dvcmQ6ICcsXG4gKiAgICAgZWNobzogZmFsc2UgfSBzdHlsZSBvYmplY3RzIChoZXJlIGVjaG8gaW5kaWNhdGVzIHdoZXRoZXIgdXNlciBpbnB1dFxuICogICAgIHNob3VsZCBiZSBkaXNwbGF5ZWQgb24gdGhlIHNjcmVlbikuXG4gKiBAcGFyYW0gZmluaXNoOiBUaGUgYW5zd2VycyBmb3IgYWxsIHByb21wdHMgbXVzdCBiZSBwcm92aWRlZCBhcyBhblxuICogICAgIGFycmF5IG9mIHN0cmluZ3MgYW5kIHBhc3NlZCB0byBmaW5pc2ggd2hlbiB5b3UgYXJlIHJlYWR5IHRvIGNvbnRpbnVlLiBOb3RlOlxuICogICAgIEl0J3MgcG9zc2libGUgZm9yIHRoZSBzZXJ2ZXIgdG8gY29tZSBiYWNrIGFuZCBhc2sgbW9yZSBxdWVzdGlvbnMuXG4gKi9cbmV4cG9ydCB0eXBlIEtleWJvYXJkSW50ZXJhY3RpdmVDYWxsYmFjayA9IChcbiAgbmFtZTogc3RyaW5nLFxuICBpbnN0cnVjdGlvbnM6IHN0cmluZyxcbiAgaW5zdHJ1Y3Rpb25zTGFuZzogc3RyaW5nLFxuICBwcm9tcHRzOiBBcnJheTx7cHJvbXB0OiBzdHJpbmcsIGVjaG86IGJvb2xlYW4sfT4sXG4gIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IHZvaWQpICA9PiB2b2lkO1xuXG5leHBvcnQgdHlwZSBTc2hDb25uZWN0aW9uRGVsZWdhdGUgPSB7XG4gIC8qKiBJbnZva2VkIHdoZW4gc2VydmVyIHJlcXVlc3RzIGtleWJvYXJkIGludGVyYWN0aW9uICovXG4gIG9uS2V5Ym9hcmRJbnRlcmFjdGl2ZTogS2V5Ym9hcmRJbnRlcmFjdGl2ZUNhbGxiYWNrLFxuICAvKiogSW52b2tlZCB3aGVuIHRyeWluZyB0byBjb25uZWN0ICovXG4gIG9uV2lsbENvbm5lY3Q6IChjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB2b2lkLFxuICAvKiogSW52b2tlZCB3aGVuIGNvbm5lY3Rpb24gaXMgc3VjZXNzZnVsICovXG4gIG9uRGlkQ29ubmVjdDogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24sIGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IHZvaWQsXG4gIC8qKiBJbnZva2VkIHdoZW4gY29ubmVjdGlvbiBpcyBmYWlscyAqL1xuICBvbkVycm9yOlxuICAgIChlcnJvclR5cGU6IFNzaEhhbmRzaGFrZUVycm9yVHlwZSwgZXJyb3I6IEVycm9yLCBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB2b2lkLFxufTtcblxuY29uc3QgU3NoQ29ubmVjdGlvbkVycm9yTGV2ZWxNYXA6IE1hcDxTc2hDb25uZWN0aW9uRXJyb3JMZXZlbCwgU3NoSGFuZHNoYWtlRXJyb3JUeXBlPiA9IG5ldyBNYXAoW1xuICBbJ2NsaWVudC10aW1lb3V0JywgRXJyb3JUeXBlLlNTSF9DT05ORUNUX1RJTUVPVVRdLFxuICBbJ2NsaWVudC1zb2NrZXQnLCBFcnJvclR5cGUuU1NIX0NPTk5FQ1RfRkFJTEVEXSxcbiAgWydwcm90b2NhbCcsIEVycm9yVHlwZS5TU0hfQ09OTkVDVF9GQUlMRURdLFxuICBbJ2NsaWVudC1hdXRoZW50aWNhdGlvbicsIEVycm9yVHlwZS5TU0hfQVVUSEVOVElDQVRJT05dLFxuICBbJ2FnZW50JywgRXJyb3JUeXBlLlNTSF9BVVRIRU5USUNBVElPTl0sXG4gIFsnY2xpZW50LWRucycsIEVycm9yVHlwZS5TU0hfQVVUSEVOVElDQVRJT05dLFxuXSk7XG5cbmV4cG9ydCBjbGFzcyBTc2hIYW5kc2hha2Uge1xuICBfZGVsZWdhdGU6IFNzaENvbm5lY3Rpb25EZWxlZ2F0ZTtcbiAgX2Nvbm5lY3Rpb246IFNzaENvbm5lY3Rpb247XG4gIF9jb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uO1xuICBfZm9yd2FyZGluZ1NlcnZlcjogbmV0LlNlcnZlcjtcbiAgX3JlbW90ZUhvc3Q6ID9zdHJpbmc7XG4gIF9yZW1vdGVQb3J0OiA/bnVtYmVyO1xuICBfY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZTogQnVmZmVyO1xuICBfY2xpZW50Q2VydGlmaWNhdGU6IEJ1ZmZlcjtcbiAgX2NsaWVudEtleTogQnVmZmVyO1xuICBzdGF0aWMgU3VwcG9ydGVkTWV0aG9kczogdHlwZW9mIFN1cHBvcnRlZE1ldGhvZHM7XG5cbiAgc3RhdGljIEVycm9yVHlwZSA9IEVycm9yVHlwZTtcblxuICBjb25zdHJ1Y3RvcihkZWxlZ2F0ZTogU3NoQ29ubmVjdGlvbkRlbGVnYXRlLCBjb25uZWN0aW9uPzogU3NoQ29ubmVjdGlvbikge1xuICAgIHRoaXMuX2RlbGVnYXRlID0gZGVsZWdhdGU7XG4gICAgdGhpcy5fY29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gPyBjb25uZWN0aW9uIDogbmV3IFNzaENvbm5lY3Rpb24oKTtcbiAgICB0aGlzLl9jb25uZWN0aW9uLm9uKCdyZWFkeScsIHRoaXMuX29uQ29ubmVjdC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9jb25uZWN0aW9uLm9uKCdlcnJvcicsIHRoaXMuX29uU3NoQ29ubmVjdGlvbkVycm9yLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24ub24oJ2tleWJvYXJkLWludGVyYWN0aXZlJywgdGhpcy5fb25LZXlib2FyZEludGVyYWN0aXZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgX3dpbGxDb25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuX2RlbGVnYXRlLm9uV2lsbENvbm5lY3QodGhpcy5fY29uZmlnKTtcbiAgfVxuXG4gIF9kaWRDb25uZWN0KGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZS5vbkRpZENvbm5lY3QoY29ubmVjdGlvbiwgdGhpcy5fY29uZmlnKTtcbiAgfVxuXG4gIF9lcnJvcihtZXNzYWdlOiBzdHJpbmcsIGVycm9yVHlwZTogU3NoSGFuZHNoYWtlRXJyb3JUeXBlLCBlcnJvcjogRXJyb3IpOiB2b2lkIHtcbiAgICBsb2dnZXIuZXJyb3IoYFNzaEhhbmRzaGFrZSBmYWlsZWQ6ICR7ZXJyb3JUeXBlfSwgJHttZXNzYWdlfWAsIGVycm9yKTtcbiAgICB0aGlzLl9kZWxlZ2F0ZS5vbkVycm9yKGVycm9yVHlwZSwgZXJyb3IsIHRoaXMuX2NvbmZpZyk7XG4gIH1cblxuICBfb25Tc2hDb25uZWN0aW9uRXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG4gICAgY29uc3QgZXJyb3JMZXZlbCA9ICgoZXJyb3I6IE9iamVjdCkubGV2ZWw6IFNzaENvbm5lY3Rpb25FcnJvckxldmVsKTtcbiAgICBjb25zdCBlcnJvclR5cGUgPSBTc2hDb25uZWN0aW9uRXJyb3JMZXZlbE1hcC5nZXQoZXJyb3JMZXZlbCkgfHwgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5VTktOT1dOO1xuICAgIHRoaXMuX2Vycm9yKCdTc2ggY29ubmVjdGlvbiBmYWlsZWQuJywgZXJyb3JUeXBlLCBlcnJvcik7XG4gIH1cblxuICBhc3luYyBjb25uZWN0KGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5fd2lsbENvbm5lY3QoKTtcblxuICAgIGNvbnN0IGV4aXN0aW5nQ29ubmVjdGlvbiA9IFJlbW90ZUNvbm5lY3Rpb25cbiAgICAgIC5nZXRCeUhvc3RuYW1lQW5kUGF0aCh0aGlzLl9jb25maWcuaG9zdCwgdGhpcy5fY29uZmlnLmN3ZCk7XG5cbiAgICBpZiAoZXhpc3RpbmdDb25uZWN0aW9uKSB7XG4gICAgICB0aGlzLl9kaWRDb25uZWN0KGV4aXN0aW5nQ29ubmVjdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IFJlbW90ZUNvbm5lY3Rpb24uY3JlYXRlQ29ubmVjdGlvbkJ5U2F2ZWRDb25maWcoXG4gICAgICB0aGlzLl9jb25maWcuaG9zdCxcbiAgICAgIHRoaXMuX2NvbmZpZy5jd2QsXG4gICAgKTtcblxuICAgIGlmIChjb25uZWN0aW9uKSB7XG4gICAgICB0aGlzLl9kaWRDb25uZWN0KGNvbm5lY3Rpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtsb29rdXBQcmVmZXJJcHY2fSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKS5kbnNVdGlscztcbiAgICBsZXQgYWRkcmVzcyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGFkZHJlc3MgPSBhd2FpdCBsb29rdXBQcmVmZXJJcHY2KGNvbmZpZy5ob3N0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgJ0ZhaWxlZCB0byByZXNvbHZlIEROUy4nLFxuICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLkhPU1RfTk9UX0ZPVU5ELFxuICAgICAgICBlLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmF1dGhNZXRob2QgPT09IFN1cHBvcnRlZE1ldGhvZHMuU1NMX0FHRU5UKSB7XG4gICAgICAvLyBQb2ludCB0byBzc2gtYWdlbnQncyBzb2NrZXQgZm9yIHNzaC1hZ2VudC1iYXNlZCBhdXRoZW50aWNhdGlvbi5cbiAgICAgIGxldCBhZ2VudCA9IHByb2Nlc3MuZW52WydTU0hfQVVUSF9TT0NLJ107XG4gICAgICBpZiAoIWFnZW50ICYmIC9ed2luLy50ZXN0KHByb2Nlc3MucGxhdGZvcm0pKSB7XG4gICAgICAgIC8vICMxMDA6IE9uIFdpbmRvd3MsIGZhbGwgYmFjayB0byBwYWdlYW50LlxuICAgICAgICBhZ2VudCA9ICdwYWdlYW50JztcbiAgICAgIH1cbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uY29ubmVjdCh7XG4gICAgICAgIGhvc3Q6IGFkZHJlc3MsXG4gICAgICAgIHBvcnQ6IGNvbmZpZy5zc2hQb3J0LFxuICAgICAgICB1c2VybmFtZTogY29uZmlnLnVzZXJuYW1lLFxuICAgICAgICBhZ2VudCxcbiAgICAgICAgdHJ5S2V5Ym9hcmQ6IHRydWUsXG4gICAgICAgIHJlYWR5VGltZW91dDogUkVBRFlfVElNRU9VVF9NUyxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnLmF1dGhNZXRob2QgPT09IFN1cHBvcnRlZE1ldGhvZHMuUEFTU1dPUkQpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgdXNlciBjaG9vc2VzIHBhc3N3b3JkLWJhc2VkIGF1dGhlbnRpY2F0aW9uLCB3ZSBzcGVjaWZ5XG4gICAgICAgIC8vIHRoZSBjb25maWcgYXMgZm9sbG93cyBzbyB0aGF0IGl0IHRyaWVzIHNpbXBsZSBwYXNzd29yZCBhdXRoIGFuZFxuICAgICAgICAvLyBmYWlsaW5nIHRoYXQgaXQgZmFsbHMgdGhyb3VnaCB0byB0aGUga2V5Ym9hcmQgaW50ZXJhY3RpdmUgcGF0aFxuICAgICAgdGhpcy5fY29ubmVjdGlvbi5jb25uZWN0KHtcbiAgICAgICAgaG9zdDogYWRkcmVzcyxcbiAgICAgICAgcG9ydDogY29uZmlnLnNzaFBvcnQsXG4gICAgICAgIHVzZXJuYW1lOiBjb25maWcudXNlcm5hbWUsXG4gICAgICAgIHBhc3N3b3JkOiBjb25maWcucGFzc3dvcmQsXG4gICAgICAgIHRyeUtleWJvYXJkOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChjb25maWcuYXV0aE1ldGhvZCA9PT0gU3VwcG9ydGVkTWV0aG9kcy5QUklWQVRFX0tFWSkge1xuICAgICAgLy8gV2UgdXNlIGZzLXBsdXMncyBub3JtYWxpemUoKSBmdW5jdGlvbiBiZWNhdXNlIGl0IHdpbGwgZXhwYW5kIHRoZSB+LCBpZiBwcmVzZW50LlxuICAgICAgY29uc3QgZXhwYW5kZWRQYXRoID0gZnMubm9ybWFsaXplKGNvbmZpZy5wYXRoVG9Qcml2YXRlS2V5KTtcbiAgICAgIGxldCBwcml2YXRlS2V5OiBzdHJpbmcgPSAobnVsbCA6IGFueSk7XG4gICAgICB0cnkge1xuICAgICAgICBwcml2YXRlS2V5ID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKGV4cGFuZGVkUGF0aCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgIGBGYWlsZWQgdG8gcmVhZCBwcml2YXRlIGtleWAsXG4gICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5DQU5UX1JFQURfUFJJVkFURV9LRVksXG4gICAgICAgICAgZSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uY29ubmVjdCh7XG4gICAgICAgIGhvc3Q6IGFkZHJlc3MsXG4gICAgICAgIHBvcnQ6IGNvbmZpZy5zc2hQb3J0LFxuICAgICAgICB1c2VybmFtZTogY29uZmlnLnVzZXJuYW1lLFxuICAgICAgICBwcml2YXRlS2V5LFxuICAgICAgICB0cnlLZXlib2FyZDogdHJ1ZSxcbiAgICAgICAgcmVhZHlUaW1lb3V0OiBSRUFEWV9USU1FT1VUX01TLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY2FuY2VsKCkge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24uZW5kKCk7XG4gIH1cblxuICBfb25LZXlib2FyZEludGVyYWN0aXZlKFxuICAgICAgbmFtZTogc3RyaW5nLFxuICAgICAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmcsXG4gICAgICBpbnN0cnVjdGlvbnNMYW5nOiBzdHJpbmcsXG4gICAgICBwcm9tcHRzOiBBcnJheTx7cHJvbXB0OiBzdHJpbmcsIGVjaG86IGJvb2xlYW4sfT4sXG4gICAgICBmaW5pc2g6IChhbnN3ZXJzOiBBcnJheTxzdHJpbmc+KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fZGVsZWdhdGUub25LZXlib2FyZEludGVyYWN0aXZlKG5hbWUsIGluc3RydWN0aW9ucywgaW5zdHJ1Y3Rpb25zTGFuZywgcHJvbXB0cywgZmluaXNoKTtcbiAgfVxuXG4gIF9mb3J3YXJkU29ja2V0KHNvY2tldDogbmV0LlNvY2tldCk6IHZvaWQge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24uZm9yd2FyZE91dChcbiAgICAgIHNvY2tldC5yZW1vdGVBZGRyZXNzLFxuICAgICAgc29ja2V0LnJlbW90ZVBvcnQsXG4gICAgICAnbG9jYWxob3N0JyxcbiAgICAgIHRoaXMuX3JlbW90ZVBvcnQsXG4gICAgICAoZXJyLCBzdHJlYW0pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHNvY2tldC5lbmQoKTtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc29ja2V0LnBpcGUoc3RyZWFtKTtcbiAgICAgICAgc3RyZWFtLnBpcGUoc29ja2V0KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgX3VwZGF0ZVNlcnZlckluZm8oc2VydmVySW5mbzoge30pIHtcbiAgICBpbnZhcmlhbnQoc2VydmVySW5mby5wb3J0KTtcbiAgICB0aGlzLl9yZW1vdGVQb3J0ID0gc2VydmVySW5mby5wb3J0O1xuICAgIHRoaXMuX3JlbW90ZUhvc3QgPSBgJHtzZXJ2ZXJJbmZvLmhvc3RuYW1lIHx8IHRoaXMuX2NvbmZpZy5ob3N0fWA7XG4gICAgLy8gQmVjYXVzZSB0aGUgdmFsdWUgZm9yIHRoZSBJbml0aWFsIERpcmVjdG9yeSB0aGF0IHRoZSB1c2VyIHN1cHBsaWVkIG1heSBoYXZlXG4gICAgLy8gYmVlbiBhIHN5bWxpbmsgdGhhdCB3YXMgcmVzb2x2ZWQgYnkgdGhlIHNlcnZlciwgb3ZlcndyaXRlIHRoZSBvcmlnaW5hbCBgY3dkYFxuICAgIC8vIHZhbHVlIHdpdGggdGhlIHJlc29sdmVkIHZhbHVlLlxuICAgIGludmFyaWFudChzZXJ2ZXJJbmZvLndvcmtzcGFjZSk7XG4gICAgdGhpcy5fY29uZmlnLmN3ZCA9IHNlcnZlckluZm8ud29ya3NwYWNlO1xuICAgIGludmFyaWFudChzZXJ2ZXJJbmZvLmNhKTtcbiAgICB0aGlzLl9jZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlID0gc2VydmVySW5mby5jYTtcbiAgICBpbnZhcmlhbnQoc2VydmVySW5mby5jZXJ0KTtcbiAgICB0aGlzLl9jbGllbnRDZXJ0aWZpY2F0ZSA9IHNlcnZlckluZm8uY2VydDtcbiAgICBpbnZhcmlhbnQoc2VydmVySW5mby5rZXkpO1xuICAgIHRoaXMuX2NsaWVudEtleSA9IHNlcnZlckluZm8ua2V5O1xuICB9XG5cbiAgX2lzU2VjdXJlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhISh0aGlzLl9jZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlXG4gICAgICAgICYmIHRoaXMuX2NsaWVudENlcnRpZmljYXRlXG4gICAgICAgICYmIHRoaXMuX2NsaWVudEtleSk7XG4gIH1cblxuICBhc3luYyBfc3RhcnRSZW1vdGVTZXJ2ZXIoKTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IHN0ZE91dCA9ICcnO1xuICAgICAgY29uc3QgcmVtb3RlVGVtcEZpbGUgPSBgL3RtcC9udWNsaWRlLXNzaGhhbmRzaGFrZS0ke01hdGgucmFuZG9tKCl9YDtcbiAgICAgIC8vVE9ETzogZXNjYXBlIGFueSBzaW5nbGUgcXVvdGVzXG4gICAgICAvL1RPRE86IHRoZSB0aW1lb3V0IHZhbHVlIHNoYWxsIGJlIGNvbmZpZ3VyYWJsZSB1c2luZyAuanNvbiBmaWxlIHRvbyAodDY5MDQ2OTEpLlxuICAgICAgY29uc3QgY21kID0gYCR7dGhpcy5fY29uZmlnLnJlbW90ZVNlcnZlckNvbW1hbmR9IC0td29ya3NwYWNlPSR7dGhpcy5fY29uZmlnLmN3ZH1gXG4gICAgICAgICsgYCAtLWNvbW1vbi1uYW1lPSR7dGhpcy5fY29uZmlnLmhvc3R9IC0tanNvbi1vdXRwdXQtZmlsZT0ke3JlbW90ZVRlbXBGaWxlfSAtdCA2MGA7XG5cbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uZXhlYyhjbWQsIHtwdHk6IHt0ZXJtOiAnbnVjbGlkZSd9fSwgKGVyciwgc3RyZWFtKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICB0aGlzLl9vblNzaENvbm5lY3Rpb25FcnJvcihlcnIpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ub24oJ2Nsb3NlJywgYXN5bmMgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgICAgIC8vIE5vdGU6IHRoaXMgY29kZSBpcyBwcm9iYWJseSB0aGUgY29kZSBmcm9tIHRoZSBjaGlsZCBzaGVsbCBpZiBvbmVcbiAgICAgICAgICAvLyBpcyBpbiB1c2UuXG4gICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgIC8vIFNvbWUgc2VydmVycyBoYXZlIG1heCBjaGFubmVscyBzZXQgdG8gMSwgc28gYWRkIGEgZGVsYXkgdG8gZW5zdXJlXG4gICAgICAgICAgICAvLyB0aGUgb2xkIGNoYW5uZWwgaGFzIGJlZW4gY2xlYW5lZCB1cCBvbiB0aGUgc2VydmVyLlxuICAgICAgICAgICAgLy8gVE9ETyhoYW5zb253KTogSW1wbGVtZW50IGEgcHJvcGVyIHJldHJ5IG1lY2hhbmlzbS5cbiAgICAgICAgICAgIC8vIEJ1dCBmaXJzdCwgd2UgaGF2ZSB0byBjbGVhbiB1cCB0aGlzIGNhbGxiYWNrIGhlbGwuXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlcy5hd2FpdE1pbGxpU2Vjb25kcygxMDApO1xuICAgICAgICAgICAgdGhpcy5fY29ubmVjdGlvbi5zZnRwKGFzeW5jIChlcnJvciwgc2Z0cCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gc3RhcnQgc2Z0cCBjb25uZWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuU0VSVkVSX1NUQVJUX0ZBSUxFRCxcbiAgICAgICAgICAgICAgICAgIGVycm9yLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IGxvY2FsVGVtcEZpbGUgPSBhd2FpdCBmc1Byb21pc2UudGVtcGZpbGUoKTtcbiAgICAgICAgICAgICAgc2Z0cC5mYXN0R2V0KHJlbW90ZVRlbXBGaWxlLCBsb2NhbFRlbXBGaWxlLCBhc3luYyBzZnRwRXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIHNmdHAuZW5kKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNmdHBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gdHJhbnNmZXIgc2VydmVyIHN0YXJ0IGluZm9ybWF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5TRVJWRVJfU1RBUlRfRkFJTEVELFxuICAgICAgICAgICAgICAgICAgICBzZnRwRXJyb3IsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBzZXJ2ZXJJbmZvOiBhbnkgPSBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlcnZlckluZm9Kc29uID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKGxvY2FsVGVtcEZpbGUpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBzZXJ2ZXJJbmZvID0gSlNPTi5wYXJzZShzZXJ2ZXJJbmZvSnNvbik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdNYWxmb3JtZWQgc2VydmVyIHN0YXJ0IGluZm9ybWF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5TRVJWRVJfU1RBUlRfRkFJTEVELFxuICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3Ioc2VydmVySW5mb0pzb24pLFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXNlcnZlckluZm8uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdSZW1vdGUgc2VydmVyIGZhaWxlZCB0byBzdGFydCcsXG4gICAgICAgICAgICAgICAgICAgIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuU0VSVkVSX1NUQVJUX0ZBSUxFRCxcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yKHNlcnZlckluZm8ubG9ncyksXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghc2VydmVySW5mby53b3Jrc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgICAgICAgICAgICAnQ291bGQgbm90IGZpbmQgZGlyZWN0b3J5JyxcbiAgICAgICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5ESVJFQ1RPUllfTk9UX0ZPVU5ELFxuICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3Ioc2VydmVySW5mby5sb2dzKSxcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIHNlcnZlciBpbmZvIHRoYXQgaXMgbmVlZGVkIGZvciBzZXR0aW5nIHVwIGNsaWVudC5cbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTZXJ2ZXJJbmZvKHNlcnZlckluZm8pO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgJ1JlbW90ZSBzaGVsbCBleGVjdXRpb24gZmFpbGVkJyxcbiAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5VTktOT1dOLFxuICAgICAgICAgICAgICBuZXcgRXJyb3Ioc3RkT3V0KSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICAgIHN0ZE91dCArPSBkYXRhO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX29uQ29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLl9zdGFydFJlbW90ZVNlcnZlcigpKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbmlzaEhhbmRzaGFrZSA9IGFzeW5jIChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBjb25uZWN0aW9uLmluaXRpYWxpemUoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgJ0Nvbm5lY3Rpb24gY2hlY2sgZmFpbGVkJyxcbiAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNFUlZFUl9WRVJTSU9OX01JU01BVENILFxuICAgICAgICAgIGUsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLl9kaWRDb25uZWN0KGNvbm5lY3Rpb24pO1xuICAgICAgLy8gSWYgd2UgYXJlIHNlY3VyZSB0aGVuIHdlIGRvbid0IG5lZWQgdGhlIHNzaCB0dW5uZWwuXG4gICAgICBpZiAodGhpcy5faXNTZWN1cmUoKSkge1xuICAgICAgICB0aGlzLl9jb25uZWN0aW9uLmVuZCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBVc2UgYW4gc3NoIHR1bm5lbCBpZiBzZXJ2ZXIgaXMgbm90IHNlY3VyZVxuICAgIGlmICh0aGlzLl9pc1NlY3VyZSgpKSB7XG4gICAgICBpbnZhcmlhbnQodGhpcy5fcmVtb3RlSG9zdCk7XG4gICAgICBpbnZhcmlhbnQodGhpcy5fcmVtb3RlUG9ydCk7XG4gICAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IFJlbW90ZUNvbm5lY3Rpb24oe1xuICAgICAgICBob3N0OiB0aGlzLl9yZW1vdGVIb3N0LFxuICAgICAgICBwb3J0OiB0aGlzLl9yZW1vdGVQb3J0LFxuICAgICAgICBjd2Q6IHRoaXMuX2NvbmZpZy5jd2QsXG4gICAgICAgIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU6IHRoaXMuX2NlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUsXG4gICAgICAgIGNsaWVudENlcnRpZmljYXRlOiB0aGlzLl9jbGllbnRDZXJ0aWZpY2F0ZSxcbiAgICAgICAgY2xpZW50S2V5OiB0aGlzLl9jbGllbnRLZXksXG4gICAgICB9KTtcbiAgICAgIGZpbmlzaEhhbmRzaGFrZShjb25uZWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLyogJEZsb3dJc3N1ZSB0OTIxMjM3OCAqL1xuICAgICAgdGhpcy5fZm9yd2FyZGluZ1NlcnZlciA9IG5ldC5jcmVhdGVTZXJ2ZXIoc29jayA9PiB7XG4gICAgICAgIHRoaXMuX2ZvcndhcmRTb2NrZXQoc29jayk7XG4gICAgICB9KS5saXN0ZW4oMCwgJ2xvY2FsaG9zdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgbG9jYWxQb3J0ID0gdGhpcy5fZ2V0TG9jYWxQb3J0KCk7XG4gICAgICAgIGludmFyaWFudChsb2NhbFBvcnQpO1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IFJlbW90ZUNvbm5lY3Rpb24oe1xuICAgICAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgICAgICAgIHBvcnQ6IGxvY2FsUG9ydCxcbiAgICAgICAgICBjd2Q6IHRoaXMuX2NvbmZpZy5jd2QsXG4gICAgICAgIH0pO1xuICAgICAgICBmaW5pc2hIYW5kc2hha2UoY29ubmVjdGlvbik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfZ2V0TG9jYWxQb3J0KCk6ID9udW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9mb3J3YXJkaW5nU2VydmVyID8gdGhpcy5fZm9yd2FyZGluZ1NlcnZlci5hZGRyZXNzKCkucG9ydCA6IG51bGw7XG4gIH1cblxuICBnZXRDb25maWcoKTogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24ge1xuICAgIHJldHVybiB0aGlzLl9jb25maWc7XG4gIH1cbn1cblxuU3NoSGFuZHNoYWtlLlN1cHBvcnRlZE1ldGhvZHMgPSBTdXBwb3J0ZWRNZXRob2RzO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVjb3JhdGVTc2hDb25uZWN0aW9uRGVsZWdhdGVXaXRoVHJhY2tpbmcoXG4gIGRlbGVnYXRlOiBTc2hDb25uZWN0aW9uRGVsZWdhdGUsXG4pOiBTc2hDb25uZWN0aW9uRGVsZWdhdGUge1xuICBsZXQgY29ubmVjdGlvblRyYWNrZXI7XG5cbiAgcmV0dXJuIHtcbiAgICBvbktleWJvYXJkSW50ZXJhY3RpdmU6IChcbiAgICAgIG5hbWU6IHN0cmluZyxcbiAgICAgIGluc3RydWN0aW9uczogc3RyaW5nLFxuICAgICAgaW5zdHJ1Y3Rpb25zTGFuZzogc3RyaW5nLFxuICAgICAgcHJvbXB0czogQXJyYXk8e3Byb21wdDogc3RyaW5nLCBlY2hvOiBib29sZWFuLH0+LFxuICAgICAgZmluaXNoOiAoYW5zd2VyczogQXJyYXk8c3RyaW5nPikgPT4gdm9pZCxcbiAgICApID0+IHtcbiAgICAgIGludmFyaWFudChjb25uZWN0aW9uVHJhY2tlcik7XG4gICAgICBjb25uZWN0aW9uVHJhY2tlci50cmFja1Byb21wdFl1YmlrZXlJbnB1dCgpO1xuICAgICAgZGVsZWdhdGUub25LZXlib2FyZEludGVyYWN0aXZlKFxuICAgICAgICBuYW1lLFxuICAgICAgICBpbnN0cnVjdGlvbnMsXG4gICAgICAgIGluc3RydWN0aW9uc0xhbmcsXG4gICAgICAgIHByb21wdHMsXG4gICAgICAgIGFuc3dlcnMgPT4ge1xuICAgICAgICAgIGludmFyaWFudChjb25uZWN0aW9uVHJhY2tlcik7XG4gICAgICAgICAgY29ubmVjdGlvblRyYWNrZXIudHJhY2tGaW5pc2hZdWJpa2V5SW5wdXQoKTtcbiAgICAgICAgICBmaW5pc2goYW5zd2Vycyk7XG4gICAgICAgIH0sXG4gICAgICApO1xuICAgIH0sXG4gICAgb25XaWxsQ29ubmVjdDogKGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IHtcbiAgICAgIGNvbm5lY3Rpb25UcmFja2VyID0gbmV3IENvbm5lY3Rpb25UcmFja2VyKGNvbmZpZyk7XG4gICAgICBkZWxlZ2F0ZS5vbldpbGxDb25uZWN0KGNvbmZpZyk7XG4gICAgfSxcbiAgICBvbkRpZENvbm5lY3Q6IChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uLCBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB7XG4gICAgICBpbnZhcmlhbnQoY29ubmVjdGlvblRyYWNrZXIpO1xuICAgICAgY29ubmVjdGlvblRyYWNrZXIudHJhY2tTdWNjZXNzKCk7XG4gICAgICBkZWxlZ2F0ZS5vbkRpZENvbm5lY3QoY29ubmVjdGlvbiwgY29uZmlnKTtcbiAgICB9LFxuICAgIG9uRXJyb3I6IChcbiAgICAgIGVycm9yVHlwZTogU3NoSGFuZHNoYWtlRXJyb3JUeXBlLFxuICAgICAgZXJyb3I6IEVycm9yLFxuICAgICAgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbiAgICApID0+IHtcbiAgICAgIGludmFyaWFudChjb25uZWN0aW9uVHJhY2tlcik7XG4gICAgICBjb25uZWN0aW9uVHJhY2tlci50cmFja0ZhaWx1cmUoZXJyb3JUeXBlLCBlcnJvcik7XG4gICAgICBkZWxlZ2F0ZS5vbkVycm9yKGVycm9yVHlwZSwgZXJyb3IsIGNvbmZpZyk7XG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==