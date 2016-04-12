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
var logger = require('../../nuclide-logging').getLogger();
var invariant = require('assert');

var _require = require('./RemoteConnection');

var RemoteConnection = _require.RemoteConnection;

var _require2 = require('../../nuclide-commons');

var fsPromise = _require2.fsPromise;
var promises = _require2.promises;

// Sync word and regex pattern for parsing command stdout.
var READY_TIMEOUT_MS = 60 * 1000;

// Name of the saved connection profile.

var SupportedMethods = Object.freeze({
  SSL_AGENT: 'SSL_AGENT',
  PASSWORD: 'PASSWORD',
  PRIVATE_KEY: 'PRIVATE_KEY'
});

var ErrorType = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  HOST_NOT_FOUND: 'HOST_NOT_FOUND',
  CANT_READ_PRIVATE_KEY: 'CANT_READ_PRIVATE_KEY',
  SSH_CONNECT_TIMEOUT: 'SSH_CONNECT_TIMEOUT',
  SSH_CONNECT_FAILED: 'SSH_CONNECT_FAILED',
  SSH_AUTHENTICATION: 'SSH_AUTHENTICATION',
  DIRECTORY_NOT_FOUND: 'DIRECTORY_NOT_FOUND',
  SERVER_START_FAILED: 'SERVER_START_FAILED',
  SERVER_VERSION_MISMATCH: 'SERVER_VERSION_MISMATCH'
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

      var connection = yield RemoteConnection.createConnectionBySavedConfig(this._config.host, this._config.cwd, this._config.displayTitle);

      if (connection) {
        this._didConnect(connection);
        return;
      }

      var lookupPreferIpv6 = require('../../nuclide-commons').dnsUtils.lookupPreferIpv6;

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

      // The following keys are optional in `RemoteConnectionConfiguration`.
      //
      // Do not throw when any of them (`ca`, `cert`, or `key`) are undefined because that will be the
      // case when the server is started in "insecure" mode. See `::_isSecure`, which returns the
      // security of this connection after the server is started.
      if (serverInfo.ca != null) {
        this._certificateAuthorityCertificate = serverInfo.ca;
      }
      if (serverInfo.cert != null) {
        this._clientCertificate = serverInfo.cert;
      }
      if (serverInfo.key != null) {
        this._clientKey = serverInfo.key;
      }
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

      var connect = _asyncToGenerator(function* (config) {
        var connection = null;
        try {
          connection = yield RemoteConnection.findOrCreate(config);
        } catch (e) {
          _this2._error('Connection check failed', SshHandshake.ErrorType.SERVER_VERSION_MISMATCH, e);
        }
        if (connection != null) {
          _this2._didConnect(connection);
          // If we are secure then we don't need the ssh tunnel.
          if (_this2._isSecure()) {
            _this2._connection.end();
          }
        }
      });

      // Use an ssh tunnel if server is not secure
      if (this._isSecure()) {
        invariant(this._remoteHost);
        invariant(this._remotePort);
        connect({
          host: this._remoteHost,
          port: this._remotePort,
          cwd: this._config.cwd,
          certificateAuthorityCertificate: this._certificateAuthorityCertificate,
          clientCertificate: this._clientCertificate,
          clientKey: this._clientKey,
          displayTitle: this._config.displayTitle
        });
      } else {
        /* $FlowIssue t9212378 */
        this._forwardingServer = net.createServer(function (sock) {
          _this2._forwardSocket(sock);
        }).listen(0, 'localhost', function () {
          var localPort = _this2._getLocalPort();
          invariant(localPort);
          connect({
            host: 'localhost',
            port: localPort,
            cwd: _this2._config.cwd,
            displayTitle: _this2._config.displayTitle
          });
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
// for simple password-based authentication

/** Invoked when server requests keyboard interaction */

/** Invoked when trying to connect */

/** Invoked when connection is sucessful */

/** Invoked when connection is fails */
//# sourceMappingURL=data:application/json;base64,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YSxFQUFFLHVCQUFDLE1BQU0sRUFBaUM7QUFDckQsdUJBQWlCLEdBQUcsbUNBQXNCLE1BQU0sQ0FBQyxDQUFDO0FBQ2xELGNBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDaEM7QUFDRCxnQkFBWSxFQUFFLHNCQUFDLFVBQVUsRUFBb0IsTUFBTSxFQUFpQztBQUNsRixlQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM3Qix1QkFBaUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNqQyxjQUFRLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUMzQztBQUNELFdBQU8sRUFBRSxpQkFDUCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFDSDtBQUNILGVBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdCLHVCQUFpQixDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDakQsY0FBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzVDO0dBQ0YsQ0FBQztDQUNIIiwiZmlsZSI6IlNzaEhhbmRzaGFrZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBDb25uZWN0aW9uVHJhY2tlciBmcm9tICcuL0Nvbm5lY3Rpb25UcmFja2VyJztcbmltcG9ydCB0eXBlIHtSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9SZW1vdGVDb25uZWN0aW9uJztcblxuY29uc3QgU3NoQ29ubmVjdGlvbiA9IHJlcXVpcmUoJ3NzaDInKS5DbGllbnQ7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcbmNvbnN0IG5ldCA9IHJlcXVpcmUoJ25ldCcpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5jb25zdCBpbnZhcmlhbnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcblxuY29uc3Qge1JlbW90ZUNvbm5lY3Rpb259ID0gcmVxdWlyZSgnLi9SZW1vdGVDb25uZWN0aW9uJyk7XG5jb25zdCB7ZnNQcm9taXNlLCBwcm9taXNlc30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcblxuLy8gU3luYyB3b3JkIGFuZCByZWdleCBwYXR0ZXJuIGZvciBwYXJzaW5nIGNvbW1hbmQgc3Rkb3V0LlxuY29uc3QgUkVBRFlfVElNRU9VVF9NUyA9IDYwICogMTAwMDtcblxuZXhwb3J0IHR5cGUgU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24gPSB7XG4gIGhvc3Q6IHN0cmluZzsgLy8gaG9zdCBudWNsaWRlIHNlcnZlciBpcyBydW5uaW5nIG9uXG4gIHNzaFBvcnQ6IG51bWJlcjsgLy8gc3NoIHBvcnQgb2YgaG9zdCBudWNsaWRlIHNlcnZlciBpcyBydW5uaW5nIG9uXG4gIHVzZXJuYW1lOiBzdHJpbmc7IC8vIHVzZXJuYW1lIHRvIGF1dGhlbnRpY2F0ZSBhc1xuICBwYXRoVG9Qcml2YXRlS2V5OiBzdHJpbmc7IC8vIFRoZSBwYXRoIHRvIHByaXZhdGUga2V5XG4gIHJlbW90ZVNlcnZlckNvbW1hbmQ6IHN0cmluZzsgLy8gQ29tbWFuZCB0byB1c2UgdG8gc3RhcnQgc2VydmVyXG4gIGN3ZDogc3RyaW5nOyAvLyBQYXRoIHRvIHJlbW90ZSBkaXJlY3RvcnkgdXNlciBzaG91bGQgc3RhcnQgaW4gdXBvbiBjb25uZWN0aW9uLlxuICBhdXRoTWV0aG9kOiBzdHJpbmc7IC8vIFdoaWNoIG9mIHRoZSBhdXRoZW50aWNhdGlvbiBtZXRob2RzIGluIGBTdXBwb3J0ZWRNZXRob2RzYCB0byB1c2UuXG4gIHBhc3N3b3JkOiBzdHJpbmc7IC8vIGZvciBzaW1wbGUgcGFzc3dvcmQtYmFzZWQgYXV0aGVudGljYXRpb25cbiAgZGlzcGxheVRpdGxlOiBzdHJpbmc7IC8vIE5hbWUgb2YgdGhlIHNhdmVkIGNvbm5lY3Rpb24gcHJvZmlsZS5cbn07XG5cbmNvbnN0IFN1cHBvcnRlZE1ldGhvZHMgPSBPYmplY3QuZnJlZXplKHtcbiAgU1NMX0FHRU5UOiAnU1NMX0FHRU5UJyxcbiAgUEFTU1dPUkQ6ICdQQVNTV09SRCcsXG4gIFBSSVZBVEVfS0VZOiAnUFJJVkFURV9LRVknLFxufSk7XG5cbmNvbnN0IEVycm9yVHlwZSA9IE9iamVjdC5mcmVlemUoe1xuICBVTktOT1dOOiAnVU5LTk9XTicsXG4gIEhPU1RfTk9UX0ZPVU5EOiAnSE9TVF9OT1RfRk9VTkQnLFxuICBDQU5UX1JFQURfUFJJVkFURV9LRVk6ICdDQU5UX1JFQURfUFJJVkFURV9LRVknLFxuICBTU0hfQ09OTkVDVF9USU1FT1VUOiAnU1NIX0NPTk5FQ1RfVElNRU9VVCcsXG4gIFNTSF9DT05ORUNUX0ZBSUxFRDogJ1NTSF9DT05ORUNUX0ZBSUxFRCcsXG4gIFNTSF9BVVRIRU5USUNBVElPTjogJ1NTSF9BVVRIRU5USUNBVElPTicsXG4gIERJUkVDVE9SWV9OT1RfRk9VTkQ6ICdESVJFQ1RPUllfTk9UX0ZPVU5EJyxcbiAgU0VSVkVSX1NUQVJUX0ZBSUxFRDogJ1NFUlZFUl9TVEFSVF9GQUlMRUQnLFxuICBTRVJWRVJfVkVSU0lPTl9NSVNNQVRDSDogJ1NFUlZFUl9WRVJTSU9OX01JU01BVENIJyxcbn0pO1xuXG5leHBvcnQgdHlwZSBTc2hIYW5kc2hha2VFcnJvclR5cGUgPSAnVU5LTk9XTicgfCAnSE9TVF9OT1RfRk9VTkQnIHwgJ0NBTlRfUkVBRF9QUklWQVRFX0tFWScgfFxuICAnU1NIX0NPTk5FQ1RfVElNRU9VVCcgfCAnU1NIX0NPTk5FQ1RfRkFJTEVEJyB8ICdTU0hfQVVUSEVOVElDQVRJT04nIHwgJ0RJUkVDVE9SWV9OT1RfRk9VTkQnIHxcbiAgJ1NFUlZFUl9TVEFSVF9GQUlMRUQnIHwgJ1NFUlZFUl9WRVJTSU9OX01JU01BVENIJztcblxudHlwZSBTc2hDb25uZWN0aW9uRXJyb3JMZXZlbCA9ICdjbGllbnQtdGltZW91dCcgfCAnY2xpZW50LXNvY2tldCcgfCAncHJvdG9jYWwnIHxcbiAgJ2NsaWVudC1hdXRoZW50aWNhdGlvbicgfCAnYWdlbnQnIHwgJ2NsaWVudC1kbnMnO1xuXG4vKipcbiAqIFRoZSBzZXJ2ZXIgaXMgYXNraW5nIGZvciByZXBsaWVzIHRvIHRoZSBnaXZlbiBwcm9tcHRzIGZvclxuICoga2V5Ym9hcmQtaW50ZXJhY3RpdmUgdXNlciBhdXRoZW50aWNhdGlvbi5cbiAqXG4gKiBAcGFyYW0gbmFtZSBpcyBnZW5lcmFsbHkgd2hhdCB5b3UnZCB1c2UgYXNcbiAqICAgICBhIHdpbmRvdyB0aXRsZSAoZm9yIEdVSSBhcHBzKS5cbiAqIEBwYXJhbSBwcm9tcHRzIGlzIGFuIGFycmF5IG9mIHsgcHJvbXB0OiAnUGFzc3dvcmQ6ICcsXG4gKiAgICAgZWNobzogZmFsc2UgfSBzdHlsZSBvYmplY3RzIChoZXJlIGVjaG8gaW5kaWNhdGVzIHdoZXRoZXIgdXNlciBpbnB1dFxuICogICAgIHNob3VsZCBiZSBkaXNwbGF5ZWQgb24gdGhlIHNjcmVlbikuXG4gKiBAcGFyYW0gZmluaXNoOiBUaGUgYW5zd2VycyBmb3IgYWxsIHByb21wdHMgbXVzdCBiZSBwcm92aWRlZCBhcyBhblxuICogICAgIGFycmF5IG9mIHN0cmluZ3MgYW5kIHBhc3NlZCB0byBmaW5pc2ggd2hlbiB5b3UgYXJlIHJlYWR5IHRvIGNvbnRpbnVlLiBOb3RlOlxuICogICAgIEl0J3MgcG9zc2libGUgZm9yIHRoZSBzZXJ2ZXIgdG8gY29tZSBiYWNrIGFuZCBhc2sgbW9yZSBxdWVzdGlvbnMuXG4gKi9cbmV4cG9ydCB0eXBlIEtleWJvYXJkSW50ZXJhY3RpdmVDYWxsYmFjayA9IChcbiAgbmFtZTogc3RyaW5nLFxuICBpbnN0cnVjdGlvbnM6IHN0cmluZyxcbiAgaW5zdHJ1Y3Rpb25zTGFuZzogc3RyaW5nLFxuICBwcm9tcHRzOiBBcnJheTx7cHJvbXB0OiBzdHJpbmc7IGVjaG86IGJvb2xlYW47fT4sXG4gIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IHZvaWQpICA9PiB2b2lkO1xuXG5leHBvcnQgdHlwZSBTc2hDb25uZWN0aW9uRGVsZWdhdGUgPSB7XG4gIC8qKiBJbnZva2VkIHdoZW4gc2VydmVyIHJlcXVlc3RzIGtleWJvYXJkIGludGVyYWN0aW9uICovXG4gIG9uS2V5Ym9hcmRJbnRlcmFjdGl2ZTogS2V5Ym9hcmRJbnRlcmFjdGl2ZUNhbGxiYWNrO1xuICAvKiogSW52b2tlZCB3aGVuIHRyeWluZyB0byBjb25uZWN0ICovXG4gIG9uV2lsbENvbm5lY3Q6IChjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB2b2lkO1xuICAvKiogSW52b2tlZCB3aGVuIGNvbm5lY3Rpb24gaXMgc3VjZXNzZnVsICovXG4gIG9uRGlkQ29ubmVjdDogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24sIGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IHZvaWQ7XG4gIC8qKiBJbnZva2VkIHdoZW4gY29ubmVjdGlvbiBpcyBmYWlscyAqL1xuICBvbkVycm9yOlxuICAgIChlcnJvclR5cGU6IFNzaEhhbmRzaGFrZUVycm9yVHlwZSwgZXJyb3I6IEVycm9yLCBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB2b2lkO1xufTtcblxuY29uc3QgU3NoQ29ubmVjdGlvbkVycm9yTGV2ZWxNYXA6IE1hcDxTc2hDb25uZWN0aW9uRXJyb3JMZXZlbCwgU3NoSGFuZHNoYWtlRXJyb3JUeXBlPiA9IG5ldyBNYXAoW1xuICBbJ2NsaWVudC10aW1lb3V0JywgRXJyb3JUeXBlLlNTSF9DT05ORUNUX1RJTUVPVVRdLFxuICBbJ2NsaWVudC1zb2NrZXQnLCBFcnJvclR5cGUuU1NIX0NPTk5FQ1RfRkFJTEVEXSxcbiAgWydwcm90b2NhbCcsIEVycm9yVHlwZS5TU0hfQ09OTkVDVF9GQUlMRURdLFxuICBbJ2NsaWVudC1hdXRoZW50aWNhdGlvbicsIEVycm9yVHlwZS5TU0hfQVVUSEVOVElDQVRJT05dLFxuICBbJ2FnZW50JywgRXJyb3JUeXBlLlNTSF9BVVRIRU5USUNBVElPTl0sXG4gIFsnY2xpZW50LWRucycsIEVycm9yVHlwZS5TU0hfQVVUSEVOVElDQVRJT05dLFxuXSk7XG5cbmV4cG9ydCBjbGFzcyBTc2hIYW5kc2hha2Uge1xuICBfZGVsZWdhdGU6IFNzaENvbm5lY3Rpb25EZWxlZ2F0ZTtcbiAgX2Nvbm5lY3Rpb246IFNzaENvbm5lY3Rpb247XG4gIF9jb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uO1xuICBfZm9yd2FyZGluZ1NlcnZlcjogbmV0LlNlcnZlcjtcbiAgX3JlbW90ZUhvc3Q6ID9zdHJpbmc7XG4gIF9yZW1vdGVQb3J0OiA/bnVtYmVyO1xuICBfY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZTogQnVmZmVyO1xuICBfY2xpZW50Q2VydGlmaWNhdGU6IEJ1ZmZlcjtcbiAgX2NsaWVudEtleTogQnVmZmVyO1xuICBzdGF0aWMgU3VwcG9ydGVkTWV0aG9kczogdHlwZW9mIFN1cHBvcnRlZE1ldGhvZHM7XG5cbiAgc3RhdGljIEVycm9yVHlwZSA9IEVycm9yVHlwZTtcblxuICBjb25zdHJ1Y3RvcihkZWxlZ2F0ZTogU3NoQ29ubmVjdGlvbkRlbGVnYXRlLCBjb25uZWN0aW9uPzogU3NoQ29ubmVjdGlvbikge1xuICAgIHRoaXMuX2RlbGVnYXRlID0gZGVsZWdhdGU7XG4gICAgdGhpcy5fY29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gPyBjb25uZWN0aW9uIDogbmV3IFNzaENvbm5lY3Rpb24oKTtcbiAgICB0aGlzLl9jb25uZWN0aW9uLm9uKCdyZWFkeScsIHRoaXMuX29uQ29ubmVjdC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9jb25uZWN0aW9uLm9uKCdlcnJvcicsIHRoaXMuX29uU3NoQ29ubmVjdGlvbkVycm9yLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24ub24oJ2tleWJvYXJkLWludGVyYWN0aXZlJywgdGhpcy5fb25LZXlib2FyZEludGVyYWN0aXZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgX3dpbGxDb25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuX2RlbGVnYXRlLm9uV2lsbENvbm5lY3QodGhpcy5fY29uZmlnKTtcbiAgfVxuXG4gIF9kaWRDb25uZWN0KGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZS5vbkRpZENvbm5lY3QoY29ubmVjdGlvbiwgdGhpcy5fY29uZmlnKTtcbiAgfVxuXG4gIF9lcnJvcihtZXNzYWdlOiBzdHJpbmcsIGVycm9yVHlwZTogU3NoSGFuZHNoYWtlRXJyb3JUeXBlLCBlcnJvcjogRXJyb3IpOiB2b2lkIHtcbiAgICBsb2dnZXIuZXJyb3IoYFNzaEhhbmRzaGFrZSBmYWlsZWQ6ICR7ZXJyb3JUeXBlfSwgJHttZXNzYWdlfWAsIGVycm9yKTtcbiAgICB0aGlzLl9kZWxlZ2F0ZS5vbkVycm9yKGVycm9yVHlwZSwgZXJyb3IsIHRoaXMuX2NvbmZpZyk7XG4gIH1cblxuICBfb25Tc2hDb25uZWN0aW9uRXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG4gICAgY29uc3QgZXJyb3JMZXZlbCA9ICgoZXJyb3I6IE9iamVjdCkubGV2ZWw6IFNzaENvbm5lY3Rpb25FcnJvckxldmVsKTtcbiAgICBjb25zdCBlcnJvclR5cGUgPSBTc2hDb25uZWN0aW9uRXJyb3JMZXZlbE1hcC5nZXQoZXJyb3JMZXZlbCkgfHwgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5VTktOT1dOO1xuICAgIHRoaXMuX2Vycm9yKCdTc2ggY29ubmVjdGlvbiBmYWlsZWQuJywgZXJyb3JUeXBlLCBlcnJvcik7XG4gIH1cblxuICBhc3luYyBjb25uZWN0KGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5fd2lsbENvbm5lY3QoKTtcblxuICAgIGNvbnN0IGV4aXN0aW5nQ29ubmVjdGlvbiA9IFJlbW90ZUNvbm5lY3Rpb25cbiAgICAgIC5nZXRCeUhvc3RuYW1lQW5kUGF0aCh0aGlzLl9jb25maWcuaG9zdCwgdGhpcy5fY29uZmlnLmN3ZCk7XG5cbiAgICBpZiAoZXhpc3RpbmdDb25uZWN0aW9uKSB7XG4gICAgICB0aGlzLl9kaWRDb25uZWN0KGV4aXN0aW5nQ29ubmVjdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IFJlbW90ZUNvbm5lY3Rpb24uY3JlYXRlQ29ubmVjdGlvbkJ5U2F2ZWRDb25maWcoXG4gICAgICB0aGlzLl9jb25maWcuaG9zdCxcbiAgICAgIHRoaXMuX2NvbmZpZy5jd2QsXG4gICAgICB0aGlzLl9jb25maWcuZGlzcGxheVRpdGxlLFxuICAgICk7XG5cbiAgICBpZiAoY29ubmVjdGlvbikge1xuICAgICAgdGhpcy5fZGlkQ29ubmVjdChjb25uZWN0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7bG9va3VwUHJlZmVySXB2Nn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKS5kbnNVdGlscztcbiAgICBsZXQgYWRkcmVzcyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGFkZHJlc3MgPSBhd2FpdCBsb29rdXBQcmVmZXJJcHY2KGNvbmZpZy5ob3N0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgJ0ZhaWxlZCB0byByZXNvbHZlIEROUy4nLFxuICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLkhPU1RfTk9UX0ZPVU5ELFxuICAgICAgICBlLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmF1dGhNZXRob2QgPT09IFN1cHBvcnRlZE1ldGhvZHMuU1NMX0FHRU5UKSB7XG4gICAgICAvLyBQb2ludCB0byBzc2gtYWdlbnQncyBzb2NrZXQgZm9yIHNzaC1hZ2VudC1iYXNlZCBhdXRoZW50aWNhdGlvbi5cbiAgICAgIGxldCBhZ2VudCA9IHByb2Nlc3MuZW52WydTU0hfQVVUSF9TT0NLJ107XG4gICAgICBpZiAoIWFnZW50ICYmIC9ed2luLy50ZXN0KHByb2Nlc3MucGxhdGZvcm0pKSB7XG4gICAgICAgIC8vICMxMDA6IE9uIFdpbmRvd3MsIGZhbGwgYmFjayB0byBwYWdlYW50LlxuICAgICAgICBhZ2VudCA9ICdwYWdlYW50JztcbiAgICAgIH1cbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uY29ubmVjdCh7XG4gICAgICAgIGhvc3Q6IGFkZHJlc3MsXG4gICAgICAgIHBvcnQ6IGNvbmZpZy5zc2hQb3J0LFxuICAgICAgICB1c2VybmFtZTogY29uZmlnLnVzZXJuYW1lLFxuICAgICAgICBhZ2VudCxcbiAgICAgICAgdHJ5S2V5Ym9hcmQ6IHRydWUsXG4gICAgICAgIHJlYWR5VGltZW91dDogUkVBRFlfVElNRU9VVF9NUyxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnLmF1dGhNZXRob2QgPT09IFN1cHBvcnRlZE1ldGhvZHMuUEFTU1dPUkQpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgdXNlciBjaG9vc2VzIHBhc3N3b3JkLWJhc2VkIGF1dGhlbnRpY2F0aW9uLCB3ZSBzcGVjaWZ5XG4gICAgICAgIC8vIHRoZSBjb25maWcgYXMgZm9sbG93cyBzbyB0aGF0IGl0IHRyaWVzIHNpbXBsZSBwYXNzd29yZCBhdXRoIGFuZFxuICAgICAgICAvLyBmYWlsaW5nIHRoYXQgaXQgZmFsbHMgdGhyb3VnaCB0byB0aGUga2V5Ym9hcmQgaW50ZXJhY3RpdmUgcGF0aFxuICAgICAgdGhpcy5fY29ubmVjdGlvbi5jb25uZWN0KHtcbiAgICAgICAgaG9zdDogYWRkcmVzcyxcbiAgICAgICAgcG9ydDogY29uZmlnLnNzaFBvcnQsXG4gICAgICAgIHVzZXJuYW1lOiBjb25maWcudXNlcm5hbWUsXG4gICAgICAgIHBhc3N3b3JkOiBjb25maWcucGFzc3dvcmQsXG4gICAgICAgIHRyeUtleWJvYXJkOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChjb25maWcuYXV0aE1ldGhvZCA9PT0gU3VwcG9ydGVkTWV0aG9kcy5QUklWQVRFX0tFWSkge1xuICAgICAgLy8gV2UgdXNlIGZzLXBsdXMncyBub3JtYWxpemUoKSBmdW5jdGlvbiBiZWNhdXNlIGl0IHdpbGwgZXhwYW5kIHRoZSB+LCBpZiBwcmVzZW50LlxuICAgICAgY29uc3QgZXhwYW5kZWRQYXRoID0gZnMubm9ybWFsaXplKGNvbmZpZy5wYXRoVG9Qcml2YXRlS2V5KTtcbiAgICAgIGxldCBwcml2YXRlS2V5OiBzdHJpbmcgPSAobnVsbCA6IGFueSk7XG4gICAgICB0cnkge1xuICAgICAgICBwcml2YXRlS2V5ID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKGV4cGFuZGVkUGF0aCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgIGBGYWlsZWQgdG8gcmVhZCBwcml2YXRlIGtleWAsXG4gICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5DQU5UX1JFQURfUFJJVkFURV9LRVksXG4gICAgICAgICAgZSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uY29ubmVjdCh7XG4gICAgICAgIGhvc3Q6IGFkZHJlc3MsXG4gICAgICAgIHBvcnQ6IGNvbmZpZy5zc2hQb3J0LFxuICAgICAgICB1c2VybmFtZTogY29uZmlnLnVzZXJuYW1lLFxuICAgICAgICBwcml2YXRlS2V5LFxuICAgICAgICB0cnlLZXlib2FyZDogdHJ1ZSxcbiAgICAgICAgcmVhZHlUaW1lb3V0OiBSRUFEWV9USU1FT1VUX01TLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY2FuY2VsKCkge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24uZW5kKCk7XG4gIH1cblxuICBfb25LZXlib2FyZEludGVyYWN0aXZlKFxuICAgICAgbmFtZTogc3RyaW5nLFxuICAgICAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmcsXG4gICAgICBpbnN0cnVjdGlvbnNMYW5nOiBzdHJpbmcsXG4gICAgICBwcm9tcHRzOiBBcnJheTx7cHJvbXB0OiBzdHJpbmc7IGVjaG86IGJvb2xlYW47fT4sXG4gICAgICBmaW5pc2g6IChhbnN3ZXJzOiBBcnJheTxzdHJpbmc+KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fZGVsZWdhdGUub25LZXlib2FyZEludGVyYWN0aXZlKG5hbWUsIGluc3RydWN0aW9ucywgaW5zdHJ1Y3Rpb25zTGFuZywgcHJvbXB0cywgZmluaXNoKTtcbiAgfVxuXG4gIF9mb3J3YXJkU29ja2V0KHNvY2tldDogbmV0LlNvY2tldCk6IHZvaWQge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24uZm9yd2FyZE91dChcbiAgICAgIHNvY2tldC5yZW1vdGVBZGRyZXNzLFxuICAgICAgc29ja2V0LnJlbW90ZVBvcnQsXG4gICAgICAnbG9jYWxob3N0JyxcbiAgICAgIHRoaXMuX3JlbW90ZVBvcnQsXG4gICAgICAoZXJyLCBzdHJlYW0pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHNvY2tldC5lbmQoKTtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc29ja2V0LnBpcGUoc3RyZWFtKTtcbiAgICAgICAgc3RyZWFtLnBpcGUoc29ja2V0KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgX3VwZGF0ZVNlcnZlckluZm8oc2VydmVySW5mbzoge30pIHtcbiAgICBpbnZhcmlhbnQoc2VydmVySW5mby5wb3J0KTtcbiAgICB0aGlzLl9yZW1vdGVQb3J0ID0gc2VydmVySW5mby5wb3J0O1xuICAgIHRoaXMuX3JlbW90ZUhvc3QgPSBgJHtzZXJ2ZXJJbmZvLmhvc3RuYW1lIHx8IHRoaXMuX2NvbmZpZy5ob3N0fWA7XG5cbiAgICAvLyBCZWNhdXNlIHRoZSB2YWx1ZSBmb3IgdGhlIEluaXRpYWwgRGlyZWN0b3J5IHRoYXQgdGhlIHVzZXIgc3VwcGxpZWQgbWF5IGhhdmVcbiAgICAvLyBiZWVuIGEgc3ltbGluayB0aGF0IHdhcyByZXNvbHZlZCBieSB0aGUgc2VydmVyLCBvdmVyd3JpdGUgdGhlIG9yaWdpbmFsIGBjd2RgXG4gICAgLy8gdmFsdWUgd2l0aCB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gICAgaW52YXJpYW50KHNlcnZlckluZm8ud29ya3NwYWNlKTtcbiAgICB0aGlzLl9jb25maWcuY3dkID0gc2VydmVySW5mby53b3Jrc3BhY2U7XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIGtleXMgYXJlIG9wdGlvbmFsIGluIGBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbmAuXG4gICAgLy9cbiAgICAvLyBEbyBub3QgdGhyb3cgd2hlbiBhbnkgb2YgdGhlbSAoYGNhYCwgYGNlcnRgLCBvciBga2V5YCkgYXJlIHVuZGVmaW5lZCBiZWNhdXNlIHRoYXQgd2lsbCBiZSB0aGVcbiAgICAvLyBjYXNlIHdoZW4gdGhlIHNlcnZlciBpcyBzdGFydGVkIGluIFwiaW5zZWN1cmVcIiBtb2RlLiBTZWUgYDo6X2lzU2VjdXJlYCwgd2hpY2ggcmV0dXJucyB0aGVcbiAgICAvLyBzZWN1cml0eSBvZiB0aGlzIGNvbm5lY3Rpb24gYWZ0ZXIgdGhlIHNlcnZlciBpcyBzdGFydGVkLlxuICAgIGlmIChzZXJ2ZXJJbmZvLmNhICE9IG51bGwpIHsgdGhpcy5fY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSA9IHNlcnZlckluZm8uY2E7IH1cbiAgICBpZiAoc2VydmVySW5mby5jZXJ0ICE9IG51bGwpIHsgdGhpcy5fY2xpZW50Q2VydGlmaWNhdGUgPSBzZXJ2ZXJJbmZvLmNlcnQ7IH1cbiAgICBpZiAoc2VydmVySW5mby5rZXkgIT0gbnVsbCkgeyB0aGlzLl9jbGllbnRLZXkgPSBzZXJ2ZXJJbmZvLmtleTsgfVxuICB9XG5cbiAgX2lzU2VjdXJlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhISh0aGlzLl9jZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlXG4gICAgICAgICYmIHRoaXMuX2NsaWVudENlcnRpZmljYXRlXG4gICAgICAgICYmIHRoaXMuX2NsaWVudEtleSk7XG4gIH1cblxuICBhc3luYyBfc3RhcnRSZW1vdGVTZXJ2ZXIoKTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IHN0ZE91dCA9ICcnO1xuICAgICAgY29uc3QgcmVtb3RlVGVtcEZpbGUgPSBgL3RtcC9udWNsaWRlLXNzaGhhbmRzaGFrZS0ke01hdGgucmFuZG9tKCl9YDtcbiAgICAgIC8vVE9ETzogZXNjYXBlIGFueSBzaW5nbGUgcXVvdGVzXG4gICAgICAvL1RPRE86IHRoZSB0aW1lb3V0IHZhbHVlIHNoYWxsIGJlIGNvbmZpZ3VyYWJsZSB1c2luZyAuanNvbiBmaWxlIHRvbyAodDY5MDQ2OTEpLlxuICAgICAgY29uc3QgY21kID0gYCR7dGhpcy5fY29uZmlnLnJlbW90ZVNlcnZlckNvbW1hbmR9IC0td29ya3NwYWNlPSR7dGhpcy5fY29uZmlnLmN3ZH1gXG4gICAgICAgICsgYCAtLWNvbW1vbi1uYW1lPSR7dGhpcy5fY29uZmlnLmhvc3R9IC0tanNvbi1vdXRwdXQtZmlsZT0ke3JlbW90ZVRlbXBGaWxlfSAtdCA2MGA7XG5cbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uZXhlYyhjbWQsIHtwdHk6IHt0ZXJtOiAnbnVjbGlkZSd9fSwgKGVyciwgc3RyZWFtKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICB0aGlzLl9vblNzaENvbm5lY3Rpb25FcnJvcihlcnIpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ub24oJ2Nsb3NlJywgYXN5bmMgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgICAgIC8vIE5vdGU6IHRoaXMgY29kZSBpcyBwcm9iYWJseSB0aGUgY29kZSBmcm9tIHRoZSBjaGlsZCBzaGVsbCBpZiBvbmVcbiAgICAgICAgICAvLyBpcyBpbiB1c2UuXG4gICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgIC8vIFNvbWUgc2VydmVycyBoYXZlIG1heCBjaGFubmVscyBzZXQgdG8gMSwgc28gYWRkIGEgZGVsYXkgdG8gZW5zdXJlXG4gICAgICAgICAgICAvLyB0aGUgb2xkIGNoYW5uZWwgaGFzIGJlZW4gY2xlYW5lZCB1cCBvbiB0aGUgc2VydmVyLlxuICAgICAgICAgICAgLy8gVE9ETyhoYW5zb253KTogSW1wbGVtZW50IGEgcHJvcGVyIHJldHJ5IG1lY2hhbmlzbS5cbiAgICAgICAgICAgIC8vIEJ1dCBmaXJzdCwgd2UgaGF2ZSB0byBjbGVhbiB1cCB0aGlzIGNhbGxiYWNrIGhlbGwuXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlcy5hd2FpdE1pbGxpU2Vjb25kcygxMDApO1xuICAgICAgICAgICAgdGhpcy5fY29ubmVjdGlvbi5zZnRwKGFzeW5jIChlcnJvciwgc2Z0cCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gc3RhcnQgc2Z0cCBjb25uZWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuU0VSVkVSX1NUQVJUX0ZBSUxFRCxcbiAgICAgICAgICAgICAgICAgIGVycm9yLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IGxvY2FsVGVtcEZpbGUgPSBhd2FpdCBmc1Byb21pc2UudGVtcGZpbGUoKTtcbiAgICAgICAgICAgICAgc2Z0cC5mYXN0R2V0KHJlbW90ZVRlbXBGaWxlLCBsb2NhbFRlbXBGaWxlLCBhc3luYyBzZnRwRXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIHNmdHAuZW5kKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNmdHBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gdHJhbnNmZXIgc2VydmVyIHN0YXJ0IGluZm9ybWF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5TRVJWRVJfU1RBUlRfRkFJTEVELFxuICAgICAgICAgICAgICAgICAgICBzZnRwRXJyb3IsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBzZXJ2ZXJJbmZvOiBhbnkgPSBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlcnZlckluZm9Kc29uID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKGxvY2FsVGVtcEZpbGUpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBzZXJ2ZXJJbmZvID0gSlNPTi5wYXJzZShzZXJ2ZXJJbmZvSnNvbik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdNYWxmb3JtZWQgc2VydmVyIHN0YXJ0IGluZm9ybWF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5TRVJWRVJfU1RBUlRfRkFJTEVELFxuICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3Ioc2VydmVySW5mb0pzb24pLFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXNlcnZlckluZm8uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdSZW1vdGUgc2VydmVyIGZhaWxlZCB0byBzdGFydCcsXG4gICAgICAgICAgICAgICAgICAgIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuU0VSVkVSX1NUQVJUX0ZBSUxFRCxcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yKHNlcnZlckluZm8ubG9ncyksXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghc2VydmVySW5mby53b3Jrc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgICAgICAgICAgICAnQ291bGQgbm90IGZpbmQgZGlyZWN0b3J5JyxcbiAgICAgICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5ESVJFQ1RPUllfTk9UX0ZPVU5ELFxuICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3Ioc2VydmVySW5mby5sb2dzKSxcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIHNlcnZlciBpbmZvIHRoYXQgaXMgbmVlZGVkIGZvciBzZXR0aW5nIHVwIGNsaWVudC5cbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTZXJ2ZXJJbmZvKHNlcnZlckluZm8pO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgJ1JlbW90ZSBzaGVsbCBleGVjdXRpb24gZmFpbGVkJyxcbiAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5VTktOT1dOLFxuICAgICAgICAgICAgICBuZXcgRXJyb3Ioc3RkT3V0KSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICAgIHN0ZE91dCArPSBkYXRhO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX29uQ29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLl9zdGFydFJlbW90ZVNlcnZlcigpKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm5lY3QgPSBhc3luYyAoY29uZmlnOiBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4ge1xuICAgICAgbGV0IGNvbm5lY3Rpb24gPSBudWxsO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29ubmVjdGlvbiA9IGF3YWl0IFJlbW90ZUNvbm5lY3Rpb24uZmluZE9yQ3JlYXRlKGNvbmZpZyk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgICdDb25uZWN0aW9uIGNoZWNrIGZhaWxlZCcsXG4gICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5TRVJWRVJfVkVSU0lPTl9NSVNNQVRDSCxcbiAgICAgICAgICBlLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKGNvbm5lY3Rpb24gIT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9kaWRDb25uZWN0KGNvbm5lY3Rpb24pO1xuICAgICAgICAvLyBJZiB3ZSBhcmUgc2VjdXJlIHRoZW4gd2UgZG9uJ3QgbmVlZCB0aGUgc3NoIHR1bm5lbC5cbiAgICAgICAgaWYgKHRoaXMuX2lzU2VjdXJlKCkpIHtcbiAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLmVuZCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIFVzZSBhbiBzc2ggdHVubmVsIGlmIHNlcnZlciBpcyBub3Qgc2VjdXJlXG4gICAgaWYgKHRoaXMuX2lzU2VjdXJlKCkpIHtcbiAgICAgIGludmFyaWFudCh0aGlzLl9yZW1vdGVIb3N0KTtcbiAgICAgIGludmFyaWFudCh0aGlzLl9yZW1vdGVQb3J0KTtcbiAgICAgIGNvbm5lY3Qoe1xuICAgICAgICBob3N0OiB0aGlzLl9yZW1vdGVIb3N0LFxuICAgICAgICBwb3J0OiB0aGlzLl9yZW1vdGVQb3J0LFxuICAgICAgICBjd2Q6IHRoaXMuX2NvbmZpZy5jd2QsXG4gICAgICAgIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU6IHRoaXMuX2NlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUsXG4gICAgICAgIGNsaWVudENlcnRpZmljYXRlOiB0aGlzLl9jbGllbnRDZXJ0aWZpY2F0ZSxcbiAgICAgICAgY2xpZW50S2V5OiB0aGlzLl9jbGllbnRLZXksXG4gICAgICAgIGRpc3BsYXlUaXRsZTogdGhpcy5fY29uZmlnLmRpc3BsYXlUaXRsZSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvKiAkRmxvd0lzc3VlIHQ5MjEyMzc4ICovXG4gICAgICB0aGlzLl9mb3J3YXJkaW5nU2VydmVyID0gbmV0LmNyZWF0ZVNlcnZlcihzb2NrID0+IHtcbiAgICAgICAgdGhpcy5fZm9yd2FyZFNvY2tldChzb2NrKTtcbiAgICAgIH0pLmxpc3RlbigwLCAnbG9jYWxob3N0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBsb2NhbFBvcnQgPSB0aGlzLl9nZXRMb2NhbFBvcnQoKTtcbiAgICAgICAgaW52YXJpYW50KGxvY2FsUG9ydCk7XG4gICAgICAgIGNvbm5lY3Qoe1xuICAgICAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgICAgICAgIHBvcnQ6IGxvY2FsUG9ydCxcbiAgICAgICAgICBjd2Q6IHRoaXMuX2NvbmZpZy5jd2QsXG4gICAgICAgICAgZGlzcGxheVRpdGxlOiB0aGlzLl9jb25maWcuZGlzcGxheVRpdGxlLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRMb2NhbFBvcnQoKTogP251bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2ZvcndhcmRpbmdTZXJ2ZXIgPyB0aGlzLl9mb3J3YXJkaW5nU2VydmVyLmFkZHJlc3MoKS5wb3J0IDogbnVsbDtcbiAgfVxuXG4gIGdldENvbmZpZygpOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcbiAgfVxufVxuXG5Tc2hIYW5kc2hha2UuU3VwcG9ydGVkTWV0aG9kcyA9IFN1cHBvcnRlZE1ldGhvZHM7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNvcmF0ZVNzaENvbm5lY3Rpb25EZWxlZ2F0ZVdpdGhUcmFja2luZyhcbiAgZGVsZWdhdGU6IFNzaENvbm5lY3Rpb25EZWxlZ2F0ZSxcbik6IFNzaENvbm5lY3Rpb25EZWxlZ2F0ZSB7XG4gIGxldCBjb25uZWN0aW9uVHJhY2tlcjtcblxuICByZXR1cm4ge1xuICAgIG9uS2V5Ym9hcmRJbnRlcmFjdGl2ZTogKFxuICAgICAgbmFtZTogc3RyaW5nLFxuICAgICAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmcsXG4gICAgICBpbnN0cnVjdGlvbnNMYW5nOiBzdHJpbmcsXG4gICAgICBwcm9tcHRzOiBBcnJheTx7cHJvbXB0OiBzdHJpbmc7IGVjaG86IGJvb2xlYW47fT4sXG4gICAgICBmaW5pc2g6IChhbnN3ZXJzOiBBcnJheTxzdHJpbmc+KSA9PiB2b2lkLFxuICAgICkgPT4ge1xuICAgICAgaW52YXJpYW50KGNvbm5lY3Rpb25UcmFja2VyKTtcbiAgICAgIGNvbm5lY3Rpb25UcmFja2VyLnRyYWNrUHJvbXB0WXViaWtleUlucHV0KCk7XG4gICAgICBkZWxlZ2F0ZS5vbktleWJvYXJkSW50ZXJhY3RpdmUoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGluc3RydWN0aW9ucyxcbiAgICAgICAgaW5zdHJ1Y3Rpb25zTGFuZyxcbiAgICAgICAgcHJvbXB0cyxcbiAgICAgICAgYW5zd2VycyA9PiB7XG4gICAgICAgICAgaW52YXJpYW50KGNvbm5lY3Rpb25UcmFja2VyKTtcbiAgICAgICAgICBjb25uZWN0aW9uVHJhY2tlci50cmFja0ZpbmlzaFl1YmlrZXlJbnB1dCgpO1xuICAgICAgICAgIGZpbmlzaChhbnN3ZXJzKTtcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSxcbiAgICBvbldpbGxDb25uZWN0OiAoY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4ge1xuICAgICAgY29ubmVjdGlvblRyYWNrZXIgPSBuZXcgQ29ubmVjdGlvblRyYWNrZXIoY29uZmlnKTtcbiAgICAgIGRlbGVnYXRlLm9uV2lsbENvbm5lY3QoY29uZmlnKTtcbiAgICB9LFxuICAgIG9uRGlkQ29ubmVjdDogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24sIGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IHtcbiAgICAgIGludmFyaWFudChjb25uZWN0aW9uVHJhY2tlcik7XG4gICAgICBjb25uZWN0aW9uVHJhY2tlci50cmFja1N1Y2Nlc3MoKTtcbiAgICAgIGRlbGVnYXRlLm9uRGlkQ29ubmVjdChjb25uZWN0aW9uLCBjb25maWcpO1xuICAgIH0sXG4gICAgb25FcnJvcjogKFxuICAgICAgZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsXG4gICAgICBlcnJvcjogRXJyb3IsXG4gICAgICBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxuICAgICkgPT4ge1xuICAgICAgaW52YXJpYW50KGNvbm5lY3Rpb25UcmFja2VyKTtcbiAgICAgIGNvbm5lY3Rpb25UcmFja2VyLnRyYWNrRmFpbHVyZShlcnJvclR5cGUsIGVycm9yKTtcbiAgICAgIGRlbGVnYXRlLm9uRXJyb3IoZXJyb3JUeXBlLCBlcnJvciwgY29uZmlnKTtcbiAgICB9LFxuICB9O1xufVxuIl19