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
      this._connection.forwardOut(
      /* $FlowIssue t9212378 */
      socket.remoteAddress,
      /* $FlowIssue t9212378 */
      socket.remotePort, 'localhost', this._remotePort, function (err, stream) {
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

        // This imitates a user typing:
        //   $ TERM=nuclide ssh server
        // then on the interactive prompt executing the remote server command.  If
        // that works, then nuclide should also work.
        //
        // The reason we don'y use exec here is because people like to put as the
        // last statement in their .bashrc zsh or fish.  This starts an
        // and interactive child shell that never exits if you exec.
        //
        // This is a bad idea because besides breaking us, it also breaks this:
        // $ ssh server any_cmd
        //
        // As a last resort we also set term to 'nuclide' so that if anything we
        // haven't thought of happens, the user can always add the following to
        // the top of their favorite shell startup file:
        //
        //   [ "$TERM" = "nuclide"] && return;
        _this._connection.shell({ term: 'nuclide' }, function (err, stream) {
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
          // Yes we exit twice.  This is because people who use shells like zsh
          // or fish, etc like to put zsh/fish as the last statement of their
          // .bashrc.  This means that when we exit zsh/fish, we then have to exit
          // the parent bash shell.
          //
          // The second exit is ignored when there is only one shell.
          //
          // We will still hang forever if they have a shell within a shell within
          // a shell.  But I can't bring myself to exit 3 times.
          //
          // TODO: (mikeo) There is a SHLVL environment variable set that can be
          // used to decide how many times to exit
          stream.end(cmd + '\nexit\nexit\n');
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
//# sourceMappingURL=data:application/json;base64,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WSxFQUFFLHNCQUFDLFVBQVUsRUFBb0IsTUFBTSxFQUFpQztBQUNsRixlQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM3Qix1QkFBaUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNqQyxjQUFRLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUMzQztBQUNELFdBQU8sRUFBRSxpQkFDUCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFDSDtBQUNILGVBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdCLHVCQUFpQixDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDakQsY0FBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzVDO0dBQ0YsQ0FBQztDQUNIIiwiZmlsZSI6IlNzaEhhbmRzaGFrZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBDb25uZWN0aW9uVHJhY2tlciBmcm9tICcuL0Nvbm5lY3Rpb25UcmFja2VyJztcblxuY29uc3QgU3NoQ29ubmVjdGlvbiA9IHJlcXVpcmUoJ3NzaDInKS5DbGllbnQ7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcbmNvbnN0IG5ldCA9IHJlcXVpcmUoJ25ldCcpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuY29uc3QgaW52YXJpYW50ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5cbmNvbnN0IHtSZW1vdGVDb25uZWN0aW9ufSA9IHJlcXVpcmUoJy4vUmVtb3RlQ29ubmVjdGlvbicpO1xuY29uc3Qge2ZzUHJvbWlzZSwgcHJvbWlzZXN9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuXG4vLyBTeW5jIHdvcmQgYW5kIHJlZ2V4IHBhdHRlcm4gZm9yIHBhcnNpbmcgY29tbWFuZCBzdGRvdXQuXG5jb25zdCBSRUFEWV9USU1FT1VUX01TID0gNjAgKiAxMDAwO1xuXG5leHBvcnQgdHlwZSBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbiA9IHtcbiAgaG9zdDogc3RyaW5nOyAvLyBob3N0IG51Y2xpZGUgc2VydmVyIGlzIHJ1bm5pbmcgb25cbiAgc3NoUG9ydDogbnVtYmVyOyAvLyBzc2ggcG9ydCBvZiBob3N0IG51Y2xpZGUgc2VydmVyIGlzIHJ1bm5pbmcgb25cbiAgdXNlcm5hbWU6IHN0cmluZzsgLy8gdXNlcm5hbWUgdG8gYXV0aGVudGljYXRlIGFzXG4gIHBhdGhUb1ByaXZhdGVLZXk6IHN0cmluZzsgLy8gVGhlIHBhdGggdG8gcHJpdmF0ZSBrZXlcbiAgcmVtb3RlU2VydmVyQ29tbWFuZDogc3RyaW5nOyAvLyBDb21tYW5kIHRvIHVzZSB0byBzdGFydCBzZXJ2ZXJcbiAgY3dkOiBzdHJpbmc7IC8vIFBhdGggdG8gcmVtb3RlIGRpcmVjdG9yeSB1c2VyIHNob3VsZCBzdGFydCBpbiB1cG9uIGNvbm5lY3Rpb24uXG4gIGF1dGhNZXRob2Q6IHN0cmluZzsgLy8gV2hpY2ggb2YgdGhlIGF1dGhlbnRpY2F0aW9uIG1ldGhvZHMgaW4gYFN1cHBvcnRlZE1ldGhvZHNgIHRvIHVzZS5cbiAgcGFzc3dvcmQ6IHN0cmluZzsgLy8gZm9yIHNpbXBsZSBwYXNzd29yZC1iYXNlZCBhdXRoZW50aWNhdGlvblxufVxuXG5jb25zdCBTdXBwb3J0ZWRNZXRob2RzID0ge1xuICBTU0xfQUdFTlQ6ICdTU0xfQUdFTlQnLFxuICBQQVNTV09SRDogJ1BBU1NXT1JEJyxcbiAgUFJJVkFURV9LRVk6ICdQUklWQVRFX0tFWScsXG59O1xuXG5jb25zdCBFcnJvclR5cGUgPSB7XG4gIFVOS05PV046ICdVTktOT1dOJyxcbiAgSE9TVF9OT1RfRk9VTkQ6ICdIT1NUX05PVF9GT1VORCcsXG4gIENBTlRfUkVBRF9QUklWQVRFX0tFWTogJ0NBTlRfUkVBRF9QUklWQVRFX0tFWScsXG4gIFNTSF9DT05ORUNUX1RJTUVPVVQ6ICdTU0hfQ09OTkVDVF9USU1FT1VUJyxcbiAgU1NIX0NPTk5FQ1RfRkFJTEVEOiAnU1NIX0NPTk5FQ1RfRkFJTEVEJyxcbiAgU1NIX0FVVEhFTlRJQ0FUSU9OOiAnU1NIX0FVVEhFTlRJQ0FUSU9OJyxcbiAgRElSRUNUT1JZX05PVF9GT1VORDogJ0RJUkVDVE9SWV9OT1RfRk9VTkQnLFxuICBTRVJWRVJfU1RBUlRfRkFJTEVEOiAnU0VSVkVSX1NUQVJUX0ZBSUxFRCcsXG4gIFNFUlZFUl9WRVJTSU9OX01JU01BVENIOiAnU0VSVkVSX1ZFUlNJT05fTUlTTUFUQ0gnLFxufTtcblxuZXhwb3J0IHR5cGUgU3NoSGFuZHNoYWtlRXJyb3JUeXBlID0gJ1VOS05PV04nIHwgJ0hPU1RfTk9UX0ZPVU5EJyB8ICdDQU5UX1JFQURfUFJJVkFURV9LRVknIHxcbiAgJ1NTSF9DT05ORUNUX1RJTUVPVVQnIHwgJ1NTSF9DT05ORUNUX0ZBSUxFRCcgfCAnU1NIX0FVVEhFTlRJQ0FUSU9OJyB8ICdESVJFQ1RPUllfTk9UX0ZPVU5EJyB8XG4gICdTRVJWRVJfU1RBUlRfRkFJTEVEJyB8ICdTRVJWRVJfVkVSU0lPTl9NSVNNQVRDSCc7XG5cbnR5cGUgU3NoQ29ubmVjdGlvbkVycm9yTGV2ZWwgPSAnY2xpZW50LXRpbWVvdXQnIHwgJ2NsaWVudC1zb2NrZXQnIHwgJ3Byb3RvY2FsJyB8XG4gICdjbGllbnQtYXV0aGVudGljYXRpb24nIHwgJ2FnZW50JyB8ICdjbGllbnQtZG5zJztcblxuLyoqXG4gKiBUaGUgc2VydmVyIGlzIGFza2luZyBmb3IgcmVwbGllcyB0byB0aGUgZ2l2ZW4gcHJvbXB0cyBmb3JcbiAqIGtleWJvYXJkLWludGVyYWN0aXZlIHVzZXIgYXV0aGVudGljYXRpb24uXG4gKlxuICogQHBhcmFtIG5hbWUgaXMgZ2VuZXJhbGx5IHdoYXQgeW91J2QgdXNlIGFzXG4gKiAgICAgYSB3aW5kb3cgdGl0bGUgKGZvciBHVUkgYXBwcykuXG4gKiBAcGFyYW0gcHJvbXB0cyBpcyBhbiBhcnJheSBvZiB7IHByb21wdDogJ1Bhc3N3b3JkOiAnLFxuICogICAgIGVjaG86IGZhbHNlIH0gc3R5bGUgb2JqZWN0cyAoaGVyZSBlY2hvIGluZGljYXRlcyB3aGV0aGVyIHVzZXIgaW5wdXRcbiAqICAgICBzaG91bGQgYmUgZGlzcGxheWVkIG9uIHRoZSBzY3JlZW4pLlxuICogQHBhcmFtIGZpbmlzaDogVGhlIGFuc3dlcnMgZm9yIGFsbCBwcm9tcHRzIG11c3QgYmUgcHJvdmlkZWQgYXMgYW5cbiAqICAgICBhcnJheSBvZiBzdHJpbmdzIGFuZCBwYXNzZWQgdG8gZmluaXNoIHdoZW4geW91IGFyZSByZWFkeSB0byBjb250aW51ZS4gTm90ZTpcbiAqICAgICBJdCdzIHBvc3NpYmxlIGZvciB0aGUgc2VydmVyIHRvIGNvbWUgYmFjayBhbmQgYXNrIG1vcmUgcXVlc3Rpb25zLlxuICovXG5leHBvcnQgdHlwZSBLZXlib2FyZEludGVyYWN0aXZlQ2FsbGJhY2sgPSAoXG4gIG5hbWU6IHN0cmluZyxcbiAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmcsXG4gIGluc3RydWN0aW9uc0xhbmc6IHN0cmluZyxcbiAgcHJvbXB0czogQXJyYXk8e3Byb21wdDogc3RyaW5nOyBlY2hvOiBib29sZWFuO30+LFxuICBmaW5pc2g6IChhbnN3ZXJzOiBBcnJheTxzdHJpbmc+KSA9PiB2b2lkKSAgPT4gdm9pZDtcblxuZXhwb3J0IHR5cGUgU3NoQ29ubmVjdGlvbkRlbGVnYXRlID0ge1xuICAvKiogSW52b2tlZCB3aGVuIHNlcnZlciByZXF1ZXN0cyBrZXlib2FyZCBpbnRlcmFjdGlvbiAqL1xuICBvbktleWJvYXJkSW50ZXJhY3RpdmU6IEtleWJvYXJkSW50ZXJhY3RpdmVDYWxsYmFjaztcbiAgLyoqIEludm9rZWQgd2hlbiB0cnlpbmcgdG8gY29ubmVjdCAqL1xuICBvbldpbGxDb25uZWN0OiAoY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4gdm9pZDtcbiAgLyoqIEludm9rZWQgd2hlbiBjb25uZWN0aW9uIGlzIHN1Y2Vzc2Z1bCAqL1xuICBvbkRpZENvbm5lY3Q6IChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uLCBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB2b2lkO1xuICAvKiogSW52b2tlZCB3aGVuIGNvbm5lY3Rpb24gaXMgZmFpbHMgKi9cbiAgb25FcnJvcjpcbiAgICAoZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsIGVycm9yOiBFcnJvciwgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4gdm9pZDtcbn07XG5cbmNvbnN0IFNzaENvbm5lY3Rpb25FcnJvckxldmVsTWFwOiBNYXA8U3NoQ29ubmVjdGlvbkVycm9yTGV2ZWwsIFNzaEhhbmRzaGFrZUVycm9yVHlwZT4gPSBuZXcgTWFwKFtcbiAgWydjbGllbnQtdGltZW91dCcsIEVycm9yVHlwZS5TU0hfQ09OTkVDVF9USU1FT1VUXSxcbiAgWydjbGllbnQtc29ja2V0JywgRXJyb3JUeXBlLlNTSF9DT05ORUNUX0ZBSUxFRF0sXG4gIFsncHJvdG9jYWwnLCBFcnJvclR5cGUuU1NIX0NPTk5FQ1RfRkFJTEVEXSxcbiAgWydjbGllbnQtYXV0aGVudGljYXRpb24nLCBFcnJvclR5cGUuU1NIX0FVVEhFTlRJQ0FUSU9OXSxcbiAgWydhZ2VudCcsIEVycm9yVHlwZS5TU0hfQVVUSEVOVElDQVRJT05dLFxuICBbJ2NsaWVudC1kbnMnLCBFcnJvclR5cGUuU1NIX0FVVEhFTlRJQ0FUSU9OXSxcbl0pO1xuXG5leHBvcnQgY2xhc3MgU3NoSGFuZHNoYWtlIHtcbiAgX2RlbGVnYXRlOiBTc2hDb25uZWN0aW9uRGVsZWdhdGU7XG4gIF9jb25uZWN0aW9uOiBTc2hDb25uZWN0aW9uO1xuICBfY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbjtcbiAgX2ZvcndhcmRpbmdTZXJ2ZXI6IG5ldC5TZXJ2ZXI7XG4gIF9yZW1vdGVIb3N0OiA/c3RyaW5nO1xuICBfcmVtb3RlUG9ydDogP251bWJlcjtcbiAgX2NlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU6IEJ1ZmZlcjtcbiAgX2NsaWVudENlcnRpZmljYXRlOiBCdWZmZXI7XG4gIF9jbGllbnRLZXk6IEJ1ZmZlcjtcbiAgc3RhdGljIFN1cHBvcnRlZE1ldGhvZHM6IHR5cGVvZiBTdXBwb3J0ZWRNZXRob2RzO1xuXG4gIHN0YXRpYyBFcnJvclR5cGUgPSBFcnJvclR5cGU7XG5cbiAgY29uc3RydWN0b3IoZGVsZWdhdGU6IFNzaENvbm5lY3Rpb25EZWxlZ2F0ZSwgY29ubmVjdGlvbj86IFNzaENvbm5lY3Rpb24pIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZSA9IGRlbGVnYXRlO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24gPSBjb25uZWN0aW9uID8gY29ubmVjdGlvbiA6IG5ldyBTc2hDb25uZWN0aW9uKCk7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5vbigncmVhZHknLCB0aGlzLl9vbkNvbm5lY3QuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5vbignZXJyb3InLCB0aGlzLl9vblNzaENvbm5lY3Rpb25FcnJvci5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9jb25uZWN0aW9uLm9uKCdrZXlib2FyZC1pbnRlcmFjdGl2ZScsIHRoaXMuX29uS2V5Ym9hcmRJbnRlcmFjdGl2ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIF93aWxsQ29ubmVjdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZS5vbldpbGxDb25uZWN0KHRoaXMuX2NvbmZpZyk7XG4gIH1cblxuICBfZGlkQ29ubmVjdChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5fZGVsZWdhdGUub25EaWRDb25uZWN0KGNvbm5lY3Rpb24sIHRoaXMuX2NvbmZpZyk7XG4gIH1cblxuICBfZXJyb3IobWVzc2FnZTogc3RyaW5nLCBlcnJvclR5cGU6IFNzaEhhbmRzaGFrZUVycm9yVHlwZSwgZXJyb3I6IEVycm9yKTogdm9pZCB7XG4gICAgbG9nZ2VyLmVycm9yKGBTc2hIYW5kc2hha2UgZmFpbGVkOiAke2Vycm9yVHlwZX0sICR7bWVzc2FnZX1gLCBlcnJvcik7XG4gICAgdGhpcy5fZGVsZWdhdGUub25FcnJvcihlcnJvclR5cGUsIGVycm9yLCB0aGlzLl9jb25maWcpO1xuICB9XG5cbiAgX29uU3NoQ29ubmVjdGlvbkVycm9yKGVycm9yOiBFcnJvcik6IHZvaWQge1xuICAgIGNvbnN0IGVycm9yTGV2ZWwgPSAoKGVycm9yOiBPYmplY3QpLmxldmVsOiBTc2hDb25uZWN0aW9uRXJyb3JMZXZlbCk7XG4gICAgY29uc3QgZXJyb3JUeXBlID0gU3NoQ29ubmVjdGlvbkVycm9yTGV2ZWxNYXAuZ2V0KGVycm9yTGV2ZWwpIHx8IFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuVU5LTk9XTjtcbiAgICB0aGlzLl9lcnJvcignU3NoIGNvbm5lY3Rpb24gZmFpbGVkLicsIGVycm9yVHlwZSwgZXJyb3IpO1xuICB9XG5cbiAgYXN5bmMgY29ubmVjdChjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuX3dpbGxDb25uZWN0KCk7XG5cbiAgICBjb25zdCBleGlzdGluZ0Nvbm5lY3Rpb24gPSBSZW1vdGVDb25uZWN0aW9uXG4gICAgICAuZ2V0QnlIb3N0bmFtZUFuZFBhdGgodGhpcy5fY29uZmlnLmhvc3QsIHRoaXMuX2NvbmZpZy5jd2QpO1xuXG4gICAgaWYgKGV4aXN0aW5nQ29ubmVjdGlvbikge1xuICAgICAgdGhpcy5fZGlkQ29ubmVjdChleGlzdGluZ0Nvbm5lY3Rpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBSZW1vdGVDb25uZWN0aW9uLmNyZWF0ZUNvbm5lY3Rpb25CeVNhdmVkQ29uZmlnKFxuICAgICAgdGhpcy5fY29uZmlnLmhvc3QsXG4gICAgICB0aGlzLl9jb25maWcuY3dkLFxuICAgICk7XG5cbiAgICBpZiAoY29ubmVjdGlvbikge1xuICAgICAgdGhpcy5fZGlkQ29ubmVjdChjb25uZWN0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7bG9va3VwUHJlZmVySXB2Nn0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJykuZG5zVXRpbHM7XG4gICAgbGV0IGFkZHJlc3MgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBhZGRyZXNzID0gYXdhaXQgbG9va3VwUHJlZmVySXB2Nihjb25maWcuaG9zdCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICdGYWlsZWQgdG8gcmVzb2x2ZSBETlMuJyxcbiAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5IT1NUX05PVF9GT1VORCxcbiAgICAgICAgZSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5hdXRoTWV0aG9kID09PSBTdXBwb3J0ZWRNZXRob2RzLlNTTF9BR0VOVCkge1xuICAgICAgLy8gUG9pbnQgdG8gc3NoLWFnZW50J3Mgc29ja2V0IGZvciBzc2gtYWdlbnQtYmFzZWQgYXV0aGVudGljYXRpb24uXG4gICAgICBsZXQgYWdlbnQgPSBwcm9jZXNzLmVudlsnU1NIX0FVVEhfU09DSyddO1xuICAgICAgaWYgKCFhZ2VudCAmJiAvXndpbi8udGVzdChwcm9jZXNzLnBsYXRmb3JtKSkge1xuICAgICAgICAvLyAjMTAwOiBPbiBXaW5kb3dzLCBmYWxsIGJhY2sgdG8gcGFnZWFudC5cbiAgICAgICAgYWdlbnQgPSAncGFnZWFudCc7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLmNvbm5lY3Qoe1xuICAgICAgICBob3N0OiBhZGRyZXNzLFxuICAgICAgICBwb3J0OiBjb25maWcuc3NoUG9ydCxcbiAgICAgICAgdXNlcm5hbWU6IGNvbmZpZy51c2VybmFtZSxcbiAgICAgICAgYWdlbnQsXG4gICAgICAgIHRyeUtleWJvYXJkOiB0cnVlLFxuICAgICAgICByZWFkeVRpbWVvdXQ6IFJFQURZX1RJTUVPVVRfTVMsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5hdXRoTWV0aG9kID09PSBTdXBwb3J0ZWRNZXRob2RzLlBBU1NXT1JEKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIHVzZXIgY2hvb3NlcyBwYXNzd29yZC1iYXNlZCBhdXRoZW50aWNhdGlvbiwgd2Ugc3BlY2lmeVxuICAgICAgICAvLyB0aGUgY29uZmlnIGFzIGZvbGxvd3Mgc28gdGhhdCBpdCB0cmllcyBzaW1wbGUgcGFzc3dvcmQgYXV0aCBhbmRcbiAgICAgICAgLy8gZmFpbGluZyB0aGF0IGl0IGZhbGxzIHRocm91Z2ggdG8gdGhlIGtleWJvYXJkIGludGVyYWN0aXZlIHBhdGhcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uY29ubmVjdCh7XG4gICAgICAgIGhvc3Q6IGFkZHJlc3MsXG4gICAgICAgIHBvcnQ6IGNvbmZpZy5zc2hQb3J0LFxuICAgICAgICB1c2VybmFtZTogY29uZmlnLnVzZXJuYW1lLFxuICAgICAgICBwYXNzd29yZDogY29uZmlnLnBhc3N3b3JkLFxuICAgICAgICB0cnlLZXlib2FyZDogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnLmF1dGhNZXRob2QgPT09IFN1cHBvcnRlZE1ldGhvZHMuUFJJVkFURV9LRVkpIHtcbiAgICAgIC8vIFdlIHVzZSBmcy1wbHVzJ3Mgbm9ybWFsaXplKCkgZnVuY3Rpb24gYmVjYXVzZSBpdCB3aWxsIGV4cGFuZCB0aGUgfiwgaWYgcHJlc2VudC5cbiAgICAgIGNvbnN0IGV4cGFuZGVkUGF0aCA9IGZzLm5vcm1hbGl6ZShjb25maWcucGF0aFRvUHJpdmF0ZUtleSk7XG4gICAgICBsZXQgcHJpdmF0ZUtleTogc3RyaW5nID0gKG51bGwgOiBhbnkpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcHJpdmF0ZUtleSA9IGF3YWl0IGZzUHJvbWlzZS5yZWFkRmlsZShleHBhbmRlZFBhdGgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICBgRmFpbGVkIHRvIHJlYWQgcHJpdmF0ZSBrZXlgLFxuICAgICAgICAgIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuQ0FOVF9SRUFEX1BSSVZBVEVfS0VZLFxuICAgICAgICAgIGUsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLmNvbm5lY3Qoe1xuICAgICAgICBob3N0OiBhZGRyZXNzLFxuICAgICAgICBwb3J0OiBjb25maWcuc3NoUG9ydCxcbiAgICAgICAgdXNlcm5hbWU6IGNvbmZpZy51c2VybmFtZSxcbiAgICAgICAgcHJpdmF0ZUtleSxcbiAgICAgICAgdHJ5S2V5Ym9hcmQ6IHRydWUsXG4gICAgICAgIHJlYWR5VGltZW91dDogUkVBRFlfVElNRU9VVF9NUyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNhbmNlbCgpIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uLmVuZCgpO1xuICB9XG5cbiAgX29uS2V5Ym9hcmRJbnRlcmFjdGl2ZShcbiAgICAgIG5hbWU6IHN0cmluZyxcbiAgICAgIGluc3RydWN0aW9uczogc3RyaW5nLFxuICAgICAgaW5zdHJ1Y3Rpb25zTGFuZzogc3RyaW5nLFxuICAgICAgcHJvbXB0czogQXJyYXk8e3Byb21wdDogc3RyaW5nOyBlY2hvOiBib29sZWFuO30+LFxuICAgICAgZmluaXNoOiAoYW5zd2VyczogQXJyYXk8c3RyaW5nPikgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2RlbGVnYXRlLm9uS2V5Ym9hcmRJbnRlcmFjdGl2ZShuYW1lLCBpbnN0cnVjdGlvbnMsIGluc3RydWN0aW9uc0xhbmcsIHByb21wdHMsIGZpbmlzaCk7XG4gIH1cblxuICBfZm9yd2FyZFNvY2tldChzb2NrZXQ6IG5ldC5Tb2NrZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uLmZvcndhcmRPdXQoXG4gICAgICAvKiAkRmxvd0lzc3VlIHQ5MjEyMzc4ICovXG4gICAgICBzb2NrZXQucmVtb3RlQWRkcmVzcyxcbiAgICAgIC8qICRGbG93SXNzdWUgdDkyMTIzNzggKi9cbiAgICAgIHNvY2tldC5yZW1vdGVQb3J0LFxuICAgICAgJ2xvY2FsaG9zdCcsXG4gICAgICB0aGlzLl9yZW1vdGVQb3J0LFxuICAgICAgKGVyciwgc3RyZWFtKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBzb2NrZXQuZW5kKCk7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNvY2tldC5waXBlKHN0cmVhbSk7XG4gICAgICAgIHN0cmVhbS5waXBlKHNvY2tldCk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIF91cGRhdGVTZXJ2ZXJJbmZvKHNlcnZlckluZm86IHt9KSB7XG4gICAgaW52YXJpYW50KHNlcnZlckluZm8ucG9ydCk7XG4gICAgdGhpcy5fcmVtb3RlUG9ydCA9IHNlcnZlckluZm8ucG9ydDtcbiAgICB0aGlzLl9yZW1vdGVIb3N0ID0gYCR7c2VydmVySW5mby5ob3N0bmFtZSB8fCB0aGlzLl9jb25maWcuaG9zdH1gO1xuICAgIC8vIEJlY2F1c2UgdGhlIHZhbHVlIGZvciB0aGUgSW5pdGlhbCBEaXJlY3RvcnkgdGhhdCB0aGUgdXNlciBzdXBwbGllZCBtYXkgaGF2ZVxuICAgIC8vIGJlZW4gYSBzeW1saW5rIHRoYXQgd2FzIHJlc29sdmVkIGJ5IHRoZSBzZXJ2ZXIsIG92ZXJ3cml0ZSB0aGUgb3JpZ2luYWwgYGN3ZGBcbiAgICAvLyB2YWx1ZSB3aXRoIHRoZSByZXNvbHZlZCB2YWx1ZS5cbiAgICBpbnZhcmlhbnQoc2VydmVySW5mby53b3Jrc3BhY2UpO1xuICAgIHRoaXMuX2NvbmZpZy5jd2QgPSBzZXJ2ZXJJbmZvLndvcmtzcGFjZTtcbiAgICBpbnZhcmlhbnQoc2VydmVySW5mby5jYSk7XG4gICAgdGhpcy5fY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSA9IHNlcnZlckluZm8uY2E7XG4gICAgaW52YXJpYW50KHNlcnZlckluZm8uY2VydCk7XG4gICAgdGhpcy5fY2xpZW50Q2VydGlmaWNhdGUgPSBzZXJ2ZXJJbmZvLmNlcnQ7XG4gICAgaW52YXJpYW50KHNlcnZlckluZm8ua2V5KTtcbiAgICB0aGlzLl9jbGllbnRLZXkgPSBzZXJ2ZXJJbmZvLmtleTtcbiAgfVxuXG4gIF9pc1NlY3VyZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEodGhpcy5fY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZVxuICAgICAgICAmJiB0aGlzLl9jbGllbnRDZXJ0aWZpY2F0ZVxuICAgICAgICAmJiB0aGlzLl9jbGllbnRLZXkpO1xuICB9XG5cbiAgYXN5bmMgX3N0YXJ0UmVtb3RlU2VydmVyKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBzdGRPdXQgPSAnJztcbiAgICAgIGNvbnN0IHJlbW90ZVRlbXBGaWxlID0gYC90bXAvbnVjbGlkZS1zc2hoYW5kc2hha2UtJHtNYXRoLnJhbmRvbSgpfWA7XG4gICAgICAvL1RPRE86IGVzY2FwZSBhbnkgc2luZ2xlIHF1b3Rlc1xuICAgICAgLy9UT0RPOiB0aGUgdGltZW91dCB2YWx1ZSBzaGFsbCBiZSBjb25maWd1cmFibGUgdXNpbmcgLmpzb24gZmlsZSB0b28gKHQ2OTA0NjkxKS5cbiAgICAgIGNvbnN0IGNtZCA9IGAke3RoaXMuX2NvbmZpZy5yZW1vdGVTZXJ2ZXJDb21tYW5kfSAtLXdvcmtzcGFjZT0ke3RoaXMuX2NvbmZpZy5jd2R9YFxuICAgICAgICArIGAgLS1jb21tb24tbmFtZT0ke3RoaXMuX2NvbmZpZy5ob3N0fSAtLWpzb24tb3V0cHV0LWZpbGU9JHtyZW1vdGVUZW1wRmlsZX0gLXQgNjBgO1xuXG4gICAgICAvLyBUaGlzIGltaXRhdGVzIGEgdXNlciB0eXBpbmc6XG4gICAgICAvLyAgICQgVEVSTT1udWNsaWRlIHNzaCBzZXJ2ZXJcbiAgICAgIC8vIHRoZW4gb24gdGhlIGludGVyYWN0aXZlIHByb21wdCBleGVjdXRpbmcgdGhlIHJlbW90ZSBzZXJ2ZXIgY29tbWFuZC4gIElmXG4gICAgICAvLyB0aGF0IHdvcmtzLCB0aGVuIG51Y2xpZGUgc2hvdWxkIGFsc28gd29yay5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgcmVhc29uIHdlIGRvbid5IHVzZSBleGVjIGhlcmUgaXMgYmVjYXVzZSBwZW9wbGUgbGlrZSB0byBwdXQgYXMgdGhlXG4gICAgICAvLyBsYXN0IHN0YXRlbWVudCBpbiB0aGVpciAuYmFzaHJjIHpzaCBvciBmaXNoLiAgVGhpcyBzdGFydHMgYW5cbiAgICAgIC8vIGFuZCBpbnRlcmFjdGl2ZSBjaGlsZCBzaGVsbCB0aGF0IG5ldmVyIGV4aXRzIGlmIHlvdSBleGVjLlxuICAgICAgLy9cbiAgICAgIC8vIFRoaXMgaXMgYSBiYWQgaWRlYSBiZWNhdXNlIGJlc2lkZXMgYnJlYWtpbmcgdXMsIGl0IGFsc28gYnJlYWtzIHRoaXM6XG4gICAgICAvLyAkIHNzaCBzZXJ2ZXIgYW55X2NtZFxuICAgICAgLy9cbiAgICAgIC8vIEFzIGEgbGFzdCByZXNvcnQgd2UgYWxzbyBzZXQgdGVybSB0byAnbnVjbGlkZScgc28gdGhhdCBpZiBhbnl0aGluZyB3ZVxuICAgICAgLy8gaGF2ZW4ndCB0aG91Z2h0IG9mIGhhcHBlbnMsIHRoZSB1c2VyIGNhbiBhbHdheXMgYWRkIHRoZSBmb2xsb3dpbmcgdG9cbiAgICAgIC8vIHRoZSB0b3Agb2YgdGhlaXIgZmF2b3JpdGUgc2hlbGwgc3RhcnR1cCBmaWxlOlxuICAgICAgLy9cbiAgICAgIC8vICAgWyBcIiRURVJNXCIgPSBcIm51Y2xpZGVcIl0gJiYgcmV0dXJuO1xuICAgICAgdGhpcy5fY29ubmVjdGlvbi5zaGVsbCh7dGVybTogJ251Y2xpZGUnfSwgKGVyciwgc3RyZWFtKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICB0aGlzLl9vblNzaENvbm5lY3Rpb25FcnJvcihlcnIpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ub24oJ2Nsb3NlJywgYXN5bmMgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgICAgIC8vIE5vdGU6IHRoaXMgY29kZSBpcyBwcm9iYWJseSB0aGUgY29kZSBmcm9tIHRoZSBjaGlsZCBzaGVsbCBpZiBvbmVcbiAgICAgICAgICAvLyBpcyBpbiB1c2UuXG4gICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgIC8vIFNvbWUgc2VydmVycyBoYXZlIG1heCBjaGFubmVscyBzZXQgdG8gMSwgc28gYWRkIGEgZGVsYXkgdG8gZW5zdXJlXG4gICAgICAgICAgICAvLyB0aGUgb2xkIGNoYW5uZWwgaGFzIGJlZW4gY2xlYW5lZCB1cCBvbiB0aGUgc2VydmVyLlxuICAgICAgICAgICAgLy8gVE9ETyhoYW5zb253KTogSW1wbGVtZW50IGEgcHJvcGVyIHJldHJ5IG1lY2hhbmlzbS5cbiAgICAgICAgICAgIC8vIEJ1dCBmaXJzdCwgd2UgaGF2ZSB0byBjbGVhbiB1cCB0aGlzIGNhbGxiYWNrIGhlbGwuXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNlcy5hd2FpdE1pbGxpU2Vjb25kcygxMDApO1xuICAgICAgICAgICAgdGhpcy5fY29ubmVjdGlvbi5zZnRwKGFzeW5jIChlcnJvciwgc2Z0cCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gc3RhcnQgc2Z0cCBjb25uZWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuU0VSVkVSX1NUQVJUX0ZBSUxFRCxcbiAgICAgICAgICAgICAgICAgIGVycm9yLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IGxvY2FsVGVtcEZpbGUgPSBhd2FpdCBmc1Byb21pc2UudGVtcGZpbGUoKTtcbiAgICAgICAgICAgICAgc2Z0cC5mYXN0R2V0KHJlbW90ZVRlbXBGaWxlLCBsb2NhbFRlbXBGaWxlLCBhc3luYyAoc2Z0cEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgc2Z0cC5lbmQoKTtcbiAgICAgICAgICAgICAgICBpZiAoc2Z0cEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZCB0byB0cmFuc2ZlciBzZXJ2ZXIgc3RhcnQgaW5mb3JtYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNFUlZFUl9TVEFSVF9GQUlMRUQsXG4gICAgICAgICAgICAgICAgICAgIHNmdHBFcnJvcixcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IHNlcnZlckluZm86IGFueSA9IG51bGw7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VydmVySW5mb0pzb24gPSBhd2FpdCBmc1Byb21pc2UucmVhZEZpbGUobG9jYWxUZW1wRmlsZSk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIHNlcnZlckluZm8gPSBKU09OLnBhcnNlKHNlcnZlckluZm9Kc29uKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgJ01hbGZvcm1lZCBzZXJ2ZXIgc3RhcnQgaW5mb3JtYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNFUlZFUl9TVEFSVF9GQUlMRUQsXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvcihzZXJ2ZXJJbmZvSnNvbiksXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghc2VydmVySW5mby5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgJ1JlbW90ZSBzZXJ2ZXIgZmFpbGVkIHRvIHN0YXJ0JyxcbiAgICAgICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5TRVJWRVJfU1RBUlRfRkFJTEVELFxuICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3Ioc2VydmVySW5mby5sb2dzKSxcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFzZXJ2ZXJJbmZvLndvcmtzcGFjZSkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdDb3VsZCBub3QgZmluZCBkaXJlY3RvcnknLFxuICAgICAgICAgICAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLkRJUkVDVE9SWV9OT1RfRk9VTkQsXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvcihzZXJ2ZXJJbmZvLmxvZ3MpLFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgc2VydmVyIGluZm8gdGhhdCBpcyBuZWVkZWQgZm9yIHNldHRpbmcgdXAgY2xpZW50LlxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNlcnZlckluZm8oc2VydmVySW5mbyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgICAgICAnUmVtb3RlIHNoZWxsIGV4ZWN1dGlvbiBmYWlsZWQnLFxuICAgICAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlVOS05PV04sXG4gICAgICAgICAgICAgIG5ldyBFcnJvcihzdGRPdXQpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgICAgc3RkT3V0ICs9IGRhdGE7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBZZXMgd2UgZXhpdCB0d2ljZS4gIFRoaXMgaXMgYmVjYXVzZSBwZW9wbGUgd2hvIHVzZSBzaGVsbHMgbGlrZSB6c2hcbiAgICAgICAgLy8gb3IgZmlzaCwgZXRjIGxpa2UgdG8gcHV0IHpzaC9maXNoIGFzIHRoZSBsYXN0IHN0YXRlbWVudCBvZiB0aGVpclxuICAgICAgICAvLyAuYmFzaHJjLiAgVGhpcyBtZWFucyB0aGF0IHdoZW4gd2UgZXhpdCB6c2gvZmlzaCwgd2UgdGhlbiBoYXZlIHRvIGV4aXRcbiAgICAgICAgLy8gdGhlIHBhcmVudCBiYXNoIHNoZWxsLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGUgc2Vjb25kIGV4aXQgaXMgaWdub3JlZCB3aGVuIHRoZXJlIGlzIG9ubHkgb25lIHNoZWxsLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSB3aWxsIHN0aWxsIGhhbmcgZm9yZXZlciBpZiB0aGV5IGhhdmUgYSBzaGVsbCB3aXRoaW4gYSBzaGVsbCB3aXRoaW5cbiAgICAgICAgLy8gYSBzaGVsbC4gIEJ1dCBJIGNhbid0IGJyaW5nIG15c2VsZiB0byBleGl0IDMgdGltZXMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRPRE86IChtaWtlbykgVGhlcmUgaXMgYSBTSExWTCBlbnZpcm9ubWVudCB2YXJpYWJsZSBzZXQgdGhhdCBjYW4gYmVcbiAgICAgICAgLy8gdXNlZCB0byBkZWNpZGUgaG93IG1hbnkgdGltZXMgdG8gZXhpdFxuICAgICAgICBzdHJlYW0uZW5kKGAke2NtZH1cXG5leGl0XFxuZXhpdFxcbmApO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfb25Db25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuX3N0YXJ0UmVtb3RlU2VydmVyKCkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmluaXNoSGFuZHNoYWtlID0gYXN5bmMgKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGNvbm5lY3Rpb24uaW5pdGlhbGl6ZSgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAnQ29ubmVjdGlvbiBjaGVjayBmYWlsZWQnLFxuICAgICAgICAgIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuU0VSVkVSX1ZFUlNJT05fTUlTTUFUQ0gsXG4gICAgICAgICAgZSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2RpZENvbm5lY3QoY29ubmVjdGlvbik7XG4gICAgICAvLyBJZiB3ZSBhcmUgc2VjdXJlIHRoZW4gd2UgZG9uJ3QgbmVlZCB0aGUgc3NoIHR1bm5lbC5cbiAgICAgIGlmICh0aGlzLl9pc1NlY3VyZSgpKSB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uZW5kKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIFVzZSBhbiBzc2ggdHVubmVsIGlmIHNlcnZlciBpcyBub3Qgc2VjdXJlXG4gICAgaWYgKHRoaXMuX2lzU2VjdXJlKCkpIHtcbiAgICAgIGludmFyaWFudCh0aGlzLl9yZW1vdGVIb3N0KTtcbiAgICAgIGludmFyaWFudCh0aGlzLl9yZW1vdGVQb3J0KTtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgUmVtb3RlQ29ubmVjdGlvbih7XG4gICAgICAgIGhvc3Q6IHRoaXMuX3JlbW90ZUhvc3QsXG4gICAgICAgIHBvcnQ6IHRoaXMuX3JlbW90ZVBvcnQsXG4gICAgICAgIGN3ZDogdGhpcy5fY29uZmlnLmN3ZCxcbiAgICAgICAgY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZTogdGhpcy5fY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSxcbiAgICAgICAgY2xpZW50Q2VydGlmaWNhdGU6IHRoaXMuX2NsaWVudENlcnRpZmljYXRlLFxuICAgICAgICBjbGllbnRLZXk6IHRoaXMuX2NsaWVudEtleSxcbiAgICAgIH0pO1xuICAgICAgZmluaXNoSGFuZHNoYWtlKGNvbm5lY3Rpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvKiAkRmxvd0lzc3VlIHQ5MjEyMzc4ICovXG4gICAgICB0aGlzLl9mb3J3YXJkaW5nU2VydmVyID0gbmV0LmNyZWF0ZVNlcnZlcihzb2NrID0+IHtcbiAgICAgICAgdGhpcy5fZm9yd2FyZFNvY2tldChzb2NrKTtcbiAgICAgIH0pLmxpc3RlbigwLCAnbG9jYWxob3N0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBsb2NhbFBvcnQgPSB0aGlzLl9nZXRMb2NhbFBvcnQoKTtcbiAgICAgICAgaW52YXJpYW50KGxvY2FsUG9ydCk7XG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgUmVtb3RlQ29ubmVjdGlvbih7XG4gICAgICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgICAgICAgcG9ydDogbG9jYWxQb3J0LFxuICAgICAgICAgIGN3ZDogdGhpcy5fY29uZmlnLmN3ZCxcbiAgICAgICAgfSk7XG4gICAgICAgIGZpbmlzaEhhbmRzaGFrZShjb25uZWN0aW9uKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRMb2NhbFBvcnQoKTogP251bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2ZvcndhcmRpbmdTZXJ2ZXIgPyB0aGlzLl9mb3J3YXJkaW5nU2VydmVyLmFkZHJlc3MoKS5wb3J0IDogbnVsbDtcbiAgfVxuXG4gIGdldENvbmZpZygpOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcbiAgfVxufVxuXG5Tc2hIYW5kc2hha2UuU3VwcG9ydGVkTWV0aG9kcyA9IFN1cHBvcnRlZE1ldGhvZHM7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNvcmF0ZVNzaENvbm5lY3Rpb25EZWxlZ2F0ZVdpdGhUcmFja2luZyhcbiAgZGVsZWdhdGU6IFNzaENvbm5lY3Rpb25EZWxlZ2F0ZSxcbik6IFNzaENvbm5lY3Rpb25EZWxlZ2F0ZSB7XG4gIGxldCBjb25uZWN0aW9uVHJhY2tlcjtcblxuICByZXR1cm4ge1xuICAgIG9uS2V5Ym9hcmRJbnRlcmFjdGl2ZTogKFxuICAgICAgbmFtZTogc3RyaW5nLFxuICAgICAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmcsXG4gICAgICBpbnN0cnVjdGlvbnNMYW5nOiBzdHJpbmcsXG4gICAgICBwcm9tcHRzOiBBcnJheTx7cHJvbXB0OiBzdHJpbmc7IGVjaG86IGJvb2xlYW47fT4sXG4gICAgICBmaW5pc2g6IChhbnN3ZXJzOiBBcnJheTxzdHJpbmc+KSA9PiB2b2lkLFxuICAgICkgPT4ge1xuICAgICAgaW52YXJpYW50KGNvbm5lY3Rpb25UcmFja2VyKTtcbiAgICAgIGNvbm5lY3Rpb25UcmFja2VyLnRyYWNrUHJvbXB0WXViaWtleUlucHV0KCk7XG4gICAgICBkZWxlZ2F0ZS5vbktleWJvYXJkSW50ZXJhY3RpdmUoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGluc3RydWN0aW9ucyxcbiAgICAgICAgaW5zdHJ1Y3Rpb25zTGFuZyxcbiAgICAgICAgcHJvbXB0cyxcbiAgICAgICAgKGFuc3dlcnMpID0+IHtcbiAgICAgICAgICBpbnZhcmlhbnQoY29ubmVjdGlvblRyYWNrZXIpO1xuICAgICAgICAgIGNvbm5lY3Rpb25UcmFja2VyLnRyYWNrRmluaXNoWXViaWtleUlucHV0KCk7XG4gICAgICAgICAgZmluaXNoKGFuc3dlcnMpO1xuICAgICAgICB9LFxuICAgICAgKTtcbiAgICB9LFxuICAgIG9uV2lsbENvbm5lY3Q6IChjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB7XG4gICAgICBjb25uZWN0aW9uVHJhY2tlciA9IG5ldyBDb25uZWN0aW9uVHJhY2tlcihjb25maWcpO1xuICAgICAgZGVsZWdhdGUub25XaWxsQ29ubmVjdChjb25maWcpO1xuICAgIH0sXG4gICAgb25EaWRDb25uZWN0OiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbiwgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4ge1xuICAgICAgaW52YXJpYW50KGNvbm5lY3Rpb25UcmFja2VyKTtcbiAgICAgIGNvbm5lY3Rpb25UcmFja2VyLnRyYWNrU3VjY2VzcygpO1xuICAgICAgZGVsZWdhdGUub25EaWRDb25uZWN0KGNvbm5lY3Rpb24sIGNvbmZpZyk7XG4gICAgfSxcbiAgICBvbkVycm9yOiAoXG4gICAgICBlcnJvclR5cGU6IFNzaEhhbmRzaGFrZUVycm9yVHlwZSxcbiAgICAgIGVycm9yOiBFcnJvcixcbiAgICAgIGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG4gICAgKSA9PiB7XG4gICAgICBpbnZhcmlhbnQoY29ubmVjdGlvblRyYWNrZXIpO1xuICAgICAgY29ubmVjdGlvblRyYWNrZXIudHJhY2tGYWlsdXJlKGVycm9yVHlwZSwgZXJyb3IpO1xuICAgICAgZGVsZWdhdGUub25FcnJvcihlcnJvclR5cGUsIGVycm9yLCBjb25maWcpO1xuICAgIH0sXG4gIH07XG59XG4iXX0=