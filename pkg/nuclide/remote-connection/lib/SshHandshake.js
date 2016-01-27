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
          stream.on('close', function (code, signal) {
            // Note: this code is probably the code from the child shell if one
            // is in use.
            if (code === 0) {
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
          }).on('data', function (data) {
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
//# sourceMappingURL=data:application/json;base64,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dUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDakMsY0FBUSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDM0M7QUFDRCxXQUFPLEVBQUUsaUJBQ1AsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ0g7QUFDSCxlQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM3Qix1QkFBaUIsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pELGNBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztLQUM1QztHQUNGLENBQUM7Q0FDSCIsImZpbGUiOiJTc2hIYW5kc2hha2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgQ29ubmVjdGlvblRyYWNrZXIgZnJvbSAnLi9Db25uZWN0aW9uVHJhY2tlcic7XG5cbmNvbnN0IFNzaENvbm5lY3Rpb24gPSByZXF1aXJlKCdzc2gyJykuQ2xpZW50O1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcy1wbHVzJyk7XG5jb25zdCBuZXQgPSByZXF1aXJlKCduZXQnKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG5jb25zdCB7UmVtb3RlQ29ubmVjdGlvbn0gPSByZXF1aXJlKCcuL1JlbW90ZUNvbm5lY3Rpb24nKTtcbmNvbnN0IHtmc1Byb21pc2V9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuXG4vLyBTeW5jIHdvcmQgYW5kIHJlZ2V4IHBhdHRlcm4gZm9yIHBhcnNpbmcgY29tbWFuZCBzdGRvdXQuXG5jb25zdCBSRUFEWV9USU1FT1VUX01TID0gNjAgKiAxMDAwO1xuXG5leHBvcnQgdHlwZSBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbiA9IHtcbiAgaG9zdDogc3RyaW5nOyAvLyBob3N0IG51Y2xpZGUgc2VydmVyIGlzIHJ1bm5pbmcgb25cbiAgc3NoUG9ydDogbnVtYmVyOyAvLyBzc2ggcG9ydCBvZiBob3N0IG51Y2xpZGUgc2VydmVyIGlzIHJ1bm5pbmcgb25cbiAgdXNlcm5hbWU6IHN0cmluZzsgLy8gdXNlcm5hbWUgdG8gYXV0aGVudGljYXRlIGFzXG4gIHBhdGhUb1ByaXZhdGVLZXk6IHN0cmluZzsgLy8gVGhlIHBhdGggdG8gcHJpdmF0ZSBrZXlcbiAgcmVtb3RlU2VydmVyQ29tbWFuZDogc3RyaW5nOyAvLyBDb21tYW5kIHRvIHVzZSB0byBzdGFydCBzZXJ2ZXJcbiAgY3dkOiBzdHJpbmc7IC8vIFBhdGggdG8gcmVtb3RlIGRpcmVjdG9yeSB1c2VyIHNob3VsZCBzdGFydCBpbiB1cG9uIGNvbm5lY3Rpb24uXG4gIGF1dGhNZXRob2Q6IHN0cmluZzsgLy8gV2hpY2ggb2YgdGhlIGF1dGhlbnRpY2F0aW9uIG1ldGhvZHMgaW4gYFN1cHBvcnRlZE1ldGhvZHNgIHRvIHVzZS5cbiAgcGFzc3dvcmQ6IHN0cmluZzsgLy8gZm9yIHNpbXBsZSBwYXNzd29yZC1iYXNlZCBhdXRoZW50aWNhdGlvblxufVxuXG5jb25zdCBTdXBwb3J0ZWRNZXRob2RzID0ge1xuICBTU0xfQUdFTlQ6ICdTU0xfQUdFTlQnLFxuICBQQVNTV09SRDogJ1BBU1NXT1JEJyxcbiAgUFJJVkFURV9LRVk6ICdQUklWQVRFX0tFWScsXG59O1xuXG5jb25zdCBFcnJvclR5cGUgPSB7XG4gIFVOS05PV046ICdVTktOT1dOJyxcbiAgSE9TVF9OT1RfRk9VTkQ6ICdIT1NUX05PVF9GT1VORCcsXG4gIENBTlRfUkVBRF9QUklWQVRFX0tFWTogJ0NBTlRfUkVBRF9QUklWQVRFX0tFWScsXG4gIFNTSF9DT05ORUNUX1RJTUVPVVQ6ICdTU0hfQ09OTkVDVF9USU1FT1VUJyxcbiAgU1NIX0NPTk5FQ1RfRkFJTEVEOiAnU1NIX0NPTk5FQ1RfRkFJTEVEJyxcbiAgU1NIX0FVVEhFTlRJQ0FUSU9OOiAnU1NIX0FVVEhFTlRJQ0FUSU9OJyxcbiAgRElSRUNUT1JZX05PVF9GT1VORDogJ0RJUkVDVE9SWV9OT1RfRk9VTkQnLFxuICBTRVJWRVJfU1RBUlRfRkFJTEVEOiAnU0VSVkVSX1NUQVJUX0ZBSUxFRCcsXG4gIFNFUlZFUl9WRVJTSU9OX01JU01BVENIOiAnU0VSVkVSX1ZFUlNJT05fTUlTTUFUQ0gnLFxufTtcblxuZXhwb3J0IHR5cGUgU3NoSGFuZHNoYWtlRXJyb3JUeXBlID0gJ1VOS05PV04nIHwgJ0hPU1RfTk9UX0ZPVU5EJyB8ICdDQU5UX1JFQURfUFJJVkFURV9LRVknIHxcbiAgJ1NTSF9DT05ORUNUX1RJTUVPVVQnIHwgJ1NTSF9DT05ORUNUX0ZBSUxFRCcgfCAnU1NIX0FVVEhFTlRJQ0FUSU9OJyB8ICdESVJFQ1RPUllfTk9UX0ZPVU5EJyB8XG4gICdTRVJWRVJfU1RBUlRfRkFJTEVEJyB8ICdTRVJWRVJfVkVSU0lPTl9NSVNNQVRDSCc7XG5cbnR5cGUgU3NoQ29ubmVjdGlvbkVycm9yTGV2ZWwgPSAnY2xpZW50LXRpbWVvdXQnIHwgJ2NsaWVudC1zb2NrZXQnIHwgJ3Byb3RvY2FsJyB8XG4gICdjbGllbnQtYXV0aGVudGljYXRpb24nIHwgJ2FnZW50JyB8ICdjbGllbnQtZG5zJztcblxuLyoqXG4gKiBUaGUgc2VydmVyIGlzIGFza2luZyBmb3IgcmVwbGllcyB0byB0aGUgZ2l2ZW4gcHJvbXB0cyBmb3JcbiAqIGtleWJvYXJkLWludGVyYWN0aXZlIHVzZXIgYXV0aGVudGljYXRpb24uXG4gKlxuICogQHBhcmFtIG5hbWUgaXMgZ2VuZXJhbGx5IHdoYXQgeW91J2QgdXNlIGFzXG4gKiAgICAgYSB3aW5kb3cgdGl0bGUgKGZvciBHVUkgYXBwcykuXG4gKiBAcGFyYW0gcHJvbXB0cyBpcyBhbiBhcnJheSBvZiB7IHByb21wdDogJ1Bhc3N3b3JkOiAnLFxuICogICAgIGVjaG86IGZhbHNlIH0gc3R5bGUgb2JqZWN0cyAoaGVyZSBlY2hvIGluZGljYXRlcyB3aGV0aGVyIHVzZXIgaW5wdXRcbiAqICAgICBzaG91bGQgYmUgZGlzcGxheWVkIG9uIHRoZSBzY3JlZW4pLlxuICogQHBhcmFtIGZpbmlzaDogVGhlIGFuc3dlcnMgZm9yIGFsbCBwcm9tcHRzIG11c3QgYmUgcHJvdmlkZWQgYXMgYW5cbiAqICAgICBhcnJheSBvZiBzdHJpbmdzIGFuZCBwYXNzZWQgdG8gZmluaXNoIHdoZW4geW91IGFyZSByZWFkeSB0byBjb250aW51ZS4gTm90ZTpcbiAqICAgICBJdCdzIHBvc3NpYmxlIGZvciB0aGUgc2VydmVyIHRvIGNvbWUgYmFjayBhbmQgYXNrIG1vcmUgcXVlc3Rpb25zLlxuICovXG5leHBvcnQgdHlwZSBLZXlib2FyZEludGVyYWN0aXZlQ2FsbGJhY2sgPSAoXG4gIG5hbWU6IHN0cmluZyxcbiAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmcsXG4gIGluc3RydWN0aW9uc0xhbmc6IHN0cmluZyxcbiAgcHJvbXB0czogQXJyYXk8e3Byb21wdDogc3RyaW5nOyBlY2hvOiBib29sZWFuO30+LFxuICBmaW5pc2g6IChhbnN3ZXJzOiBBcnJheTxzdHJpbmc+KSA9PiB2b2lkKSAgPT4gdm9pZDtcblxuZXhwb3J0IHR5cGUgU3NoQ29ubmVjdGlvbkRlbGVnYXRlID0ge1xuICAvKiogSW52b2tlZCB3aGVuIHNlcnZlciByZXF1ZXN0cyBrZXlib2FyZCBpbnRlcmFjdGlvbiAqL1xuICBvbktleWJvYXJkSW50ZXJhY3RpdmU6IEtleWJvYXJkSW50ZXJhY3RpdmVDYWxsYmFjaztcbiAgLyoqIEludm9rZWQgd2hlbiB0cnlpbmcgdG8gY29ubmVjdCAqL1xuICBvbldpbGxDb25uZWN0OiAoY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4gdm9pZDtcbiAgLyoqIEludm9rZWQgd2hlbiBjb25uZWN0aW9uIGlzIHN1Y2Vzc2Z1bCAqL1xuICBvbkRpZENvbm5lY3Q6IChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uLCBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB2b2lkO1xuICAvKiogSW52b2tlZCB3aGVuIGNvbm5lY3Rpb24gaXMgZmFpbHMgKi9cbiAgb25FcnJvcjpcbiAgICAoZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsIGVycm9yOiBFcnJvciwgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4gdm9pZDtcbn07XG5cbmNvbnN0IFNzaENvbm5lY3Rpb25FcnJvckxldmVsTWFwOiBNYXA8U3NoQ29ubmVjdGlvbkVycm9yTGV2ZWwsIFNzaEhhbmRzaGFrZUVycm9yVHlwZT4gPSBuZXcgTWFwKFtcbiAgWydjbGllbnQtdGltZW91dCcsIEVycm9yVHlwZS5TU0hfQ09OTkVDVF9USU1FT1VUXSxcbiAgWydjbGllbnQtc29ja2V0JywgRXJyb3JUeXBlLlNTSF9DT05ORUNUX0ZBSUxFRF0sXG4gIFsncHJvdG9jYWwnLCBFcnJvclR5cGUuU1NIX0NPTk5FQ1RfRkFJTEVEXSxcbiAgWydjbGllbnQtYXV0aGVudGljYXRpb24nLCBFcnJvclR5cGUuU1NIX0FVVEhFTlRJQ0FUSU9OXSxcbiAgWydhZ2VudCcsIEVycm9yVHlwZS5TU0hfQVVUSEVOVElDQVRJT05dLFxuICBbJ2NsaWVudC1kbnMnLCBFcnJvclR5cGUuU1NIX0FVVEhFTlRJQ0FUSU9OXSxcbl0pO1xuXG5leHBvcnQgY2xhc3MgU3NoSGFuZHNoYWtlIHtcbiAgX2RlbGVnYXRlOiBTc2hDb25uZWN0aW9uRGVsZWdhdGU7XG4gIF9jb25uZWN0aW9uOiBTc2hDb25uZWN0aW9uO1xuICBfY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbjtcbiAgX2ZvcndhcmRpbmdTZXJ2ZXI6IG5ldC5TZXJ2ZXI7XG4gIF9yZW1vdGVIb3N0OiA/c3RyaW5nO1xuICBfcmVtb3RlUG9ydDogP251bWJlcjtcbiAgX2NlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU6IEJ1ZmZlcjtcbiAgX2NsaWVudENlcnRpZmljYXRlOiBCdWZmZXI7XG4gIF9jbGllbnRLZXk6IEJ1ZmZlcjtcbiAgc3RhdGljIFN1cHBvcnRlZE1ldGhvZHM6IHR5cGVvZiBTdXBwb3J0ZWRNZXRob2RzO1xuXG4gIHN0YXRpYyBFcnJvclR5cGUgPSBFcnJvclR5cGU7XG5cbiAgY29uc3RydWN0b3IoZGVsZWdhdGU6IFNzaENvbm5lY3Rpb25EZWxlZ2F0ZSwgY29ubmVjdGlvbj86IFNzaENvbm5lY3Rpb24pIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZSA9IGRlbGVnYXRlO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24gPSBjb25uZWN0aW9uID8gY29ubmVjdGlvbiA6IG5ldyBTc2hDb25uZWN0aW9uKCk7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5vbigncmVhZHknLCB0aGlzLl9vbkNvbm5lY3QuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5vbignZXJyb3InLCB0aGlzLl9vblNzaENvbm5lY3Rpb25FcnJvci5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9jb25uZWN0aW9uLm9uKCdrZXlib2FyZC1pbnRlcmFjdGl2ZScsIHRoaXMuX29uS2V5Ym9hcmRJbnRlcmFjdGl2ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIF93aWxsQ29ubmVjdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZS5vbldpbGxDb25uZWN0KHRoaXMuX2NvbmZpZyk7XG4gIH1cblxuICBfZGlkQ29ubmVjdChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5fZGVsZWdhdGUub25EaWRDb25uZWN0KGNvbm5lY3Rpb24sIHRoaXMuX2NvbmZpZyk7XG4gIH1cblxuICBfZXJyb3IobWVzc2FnZTogc3RyaW5nLCBlcnJvclR5cGU6IFNzaEhhbmRzaGFrZUVycm9yVHlwZSwgZXJyb3I6IEVycm9yKTogdm9pZCB7XG4gICAgbG9nZ2VyLmVycm9yKGBTc2hIYW5kc2hha2UgZmFpbGVkOiAke2Vycm9yVHlwZX0sICR7bWVzc2FnZX1gLCBlcnJvcik7XG4gICAgdGhpcy5fZGVsZWdhdGUub25FcnJvcihlcnJvclR5cGUsIGVycm9yLCB0aGlzLl9jb25maWcpO1xuICB9XG5cbiAgX29uU3NoQ29ubmVjdGlvbkVycm9yKGVycm9yOiBFcnJvcik6IHZvaWQge1xuICAgIGNvbnN0IGVycm9yTGV2ZWwgPSAoKGVycm9yOiBPYmplY3QpLmxldmVsOiBTc2hDb25uZWN0aW9uRXJyb3JMZXZlbCk7XG4gICAgY29uc3QgZXJyb3JUeXBlID0gU3NoQ29ubmVjdGlvbkVycm9yTGV2ZWxNYXAuZ2V0KGVycm9yTGV2ZWwpIHx8IFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuVU5LTk9XTjtcbiAgICB0aGlzLl9lcnJvcignU3NoIGNvbm5lY3Rpb24gZmFpbGVkLicsIGVycm9yVHlwZSwgZXJyb3IpO1xuICB9XG5cbiAgYXN5bmMgY29ubmVjdChjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuX3dpbGxDb25uZWN0KCk7XG5cbiAgICBjb25zdCBleGlzdGluZ0Nvbm5lY3Rpb24gPSBSZW1vdGVDb25uZWN0aW9uXG4gICAgICAuZ2V0QnlIb3N0bmFtZUFuZFBhdGgodGhpcy5fY29uZmlnLmhvc3QsIHRoaXMuX2NvbmZpZy5jd2QpO1xuXG4gICAgaWYgKGV4aXN0aW5nQ29ubmVjdGlvbikge1xuICAgICAgdGhpcy5fZGlkQ29ubmVjdChleGlzdGluZ0Nvbm5lY3Rpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBSZW1vdGVDb25uZWN0aW9uLmNyZWF0ZUNvbm5lY3Rpb25CeVNhdmVkQ29uZmlnKFxuICAgICAgdGhpcy5fY29uZmlnLmhvc3QsXG4gICAgICB0aGlzLl9jb25maWcuY3dkLFxuICAgICk7XG5cbiAgICBpZiAoY29ubmVjdGlvbikge1xuICAgICAgdGhpcy5fZGlkQ29ubmVjdChjb25uZWN0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7bG9va3VwUHJlZmVySXB2Nn0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJykuZG5zVXRpbHM7XG4gICAgbGV0IGFkZHJlc3MgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBhZGRyZXNzID0gYXdhaXQgbG9va3VwUHJlZmVySXB2Nihjb25maWcuaG9zdCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICdGYWlsZWQgdG8gcmVzb2x2ZSBETlMuJyxcbiAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5IT1NUX05PVF9GT1VORCxcbiAgICAgICAgZSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5hdXRoTWV0aG9kID09PSBTdXBwb3J0ZWRNZXRob2RzLlNTTF9BR0VOVCkge1xuICAgICAgLy8gUG9pbnQgdG8gc3NoLWFnZW50J3Mgc29ja2V0IGZvciBzc2gtYWdlbnQtYmFzZWQgYXV0aGVudGljYXRpb24uXG4gICAgICBsZXQgYWdlbnQgPSBwcm9jZXNzLmVudlsnU1NIX0FVVEhfU09DSyddO1xuICAgICAgaWYgKCFhZ2VudCAmJiAvXndpbi8udGVzdChwcm9jZXNzLnBsYXRmb3JtKSkge1xuICAgICAgICAvLyAjMTAwOiBPbiBXaW5kb3dzLCBmYWxsIGJhY2sgdG8gcGFnZWFudC5cbiAgICAgICAgYWdlbnQgPSAncGFnZWFudCc7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLmNvbm5lY3Qoe1xuICAgICAgICBob3N0OiBhZGRyZXNzLFxuICAgICAgICBwb3J0OiBjb25maWcuc3NoUG9ydCxcbiAgICAgICAgdXNlcm5hbWU6IGNvbmZpZy51c2VybmFtZSxcbiAgICAgICAgYWdlbnQsXG4gICAgICAgIHRyeUtleWJvYXJkOiB0cnVlLFxuICAgICAgICByZWFkeVRpbWVvdXQ6IFJFQURZX1RJTUVPVVRfTVMsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5hdXRoTWV0aG9kID09PSBTdXBwb3J0ZWRNZXRob2RzLlBBU1NXT1JEKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIHVzZXIgY2hvb3NlcyBwYXNzd29yZC1iYXNlZCBhdXRoZW50aWNhdGlvbiwgd2Ugc3BlY2lmeVxuICAgICAgICAvLyB0aGUgY29uZmlnIGFzIGZvbGxvd3Mgc28gdGhhdCBpdCB0cmllcyBzaW1wbGUgcGFzc3dvcmQgYXV0aCBhbmRcbiAgICAgICAgLy8gZmFpbGluZyB0aGF0IGl0IGZhbGxzIHRocm91Z2ggdG8gdGhlIGtleWJvYXJkIGludGVyYWN0aXZlIHBhdGhcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uY29ubmVjdCh7XG4gICAgICAgIGhvc3Q6IGFkZHJlc3MsXG4gICAgICAgIHBvcnQ6IGNvbmZpZy5zc2hQb3J0LFxuICAgICAgICB1c2VybmFtZTogY29uZmlnLnVzZXJuYW1lLFxuICAgICAgICBwYXNzd29yZDogY29uZmlnLnBhc3N3b3JkLFxuICAgICAgICB0cnlLZXlib2FyZDogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnLmF1dGhNZXRob2QgPT09IFN1cHBvcnRlZE1ldGhvZHMuUFJJVkFURV9LRVkpIHtcbiAgICAgIC8vIFdlIHVzZSBmcy1wbHVzJ3Mgbm9ybWFsaXplKCkgZnVuY3Rpb24gYmVjYXVzZSBpdCB3aWxsIGV4cGFuZCB0aGUgfiwgaWYgcHJlc2VudC5cbiAgICAgIGNvbnN0IGV4cGFuZGVkUGF0aCA9IGZzLm5vcm1hbGl6ZShjb25maWcucGF0aFRvUHJpdmF0ZUtleSk7XG4gICAgICBsZXQgcHJpdmF0ZUtleTogc3RyaW5nID0gKG51bGwgOiBhbnkpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcHJpdmF0ZUtleSA9IGF3YWl0IGZzUHJvbWlzZS5yZWFkRmlsZShleHBhbmRlZFBhdGgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICBgRmFpbGVkIHRvIHJlYWQgcHJpdmF0ZSBrZXlgLFxuICAgICAgICAgIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuQ0FOVF9SRUFEX1BSSVZBVEVfS0VZLFxuICAgICAgICAgIGUsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLmNvbm5lY3Qoe1xuICAgICAgICBob3N0OiBhZGRyZXNzLFxuICAgICAgICBwb3J0OiBjb25maWcuc3NoUG9ydCxcbiAgICAgICAgdXNlcm5hbWU6IGNvbmZpZy51c2VybmFtZSxcbiAgICAgICAgcHJpdmF0ZUtleSxcbiAgICAgICAgdHJ5S2V5Ym9hcmQ6IHRydWUsXG4gICAgICAgIHJlYWR5VGltZW91dDogUkVBRFlfVElNRU9VVF9NUyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNhbmNlbCgpIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uLmVuZCgpO1xuICB9XG5cbiAgX29uS2V5Ym9hcmRJbnRlcmFjdGl2ZShcbiAgICAgIG5hbWU6IHN0cmluZyxcbiAgICAgIGluc3RydWN0aW9uczogc3RyaW5nLFxuICAgICAgaW5zdHJ1Y3Rpb25zTGFuZzogc3RyaW5nLFxuICAgICAgcHJvbXB0czogQXJyYXk8e3Byb21wdDogc3RyaW5nOyBlY2hvOiBib29sZWFuO30+LFxuICAgICAgZmluaXNoOiAoYW5zd2VyczogQXJyYXk8c3RyaW5nPikgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2RlbGVnYXRlLm9uS2V5Ym9hcmRJbnRlcmFjdGl2ZShuYW1lLCBpbnN0cnVjdGlvbnMsIGluc3RydWN0aW9uc0xhbmcsIHByb21wdHMsIGZpbmlzaCk7XG4gIH1cblxuICBfZm9yd2FyZFNvY2tldChzb2NrZXQ6IG5ldC5Tb2NrZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uLmZvcndhcmRPdXQoXG4gICAgICAvKiAkRmxvd0lzc3VlIHQ5MjEyMzc4ICovXG4gICAgICBzb2NrZXQucmVtb3RlQWRkcmVzcyxcbiAgICAgIC8qICRGbG93SXNzdWUgdDkyMTIzNzggKi9cbiAgICAgIHNvY2tldC5yZW1vdGVQb3J0LFxuICAgICAgJ2xvY2FsaG9zdCcsXG4gICAgICB0aGlzLl9yZW1vdGVQb3J0LFxuICAgICAgKGVyciwgc3RyZWFtKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBzb2NrZXQuZW5kKCk7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNvY2tldC5waXBlKHN0cmVhbSk7XG4gICAgICAgIHN0cmVhbS5waXBlKHNvY2tldCk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIF91cGRhdGVTZXJ2ZXJJbmZvKHNlcnZlckluZm86IHt9KSB7XG4gICAgaW52YXJpYW50KHNlcnZlckluZm8ucG9ydCk7XG4gICAgdGhpcy5fcmVtb3RlUG9ydCA9IHNlcnZlckluZm8ucG9ydDtcbiAgICB0aGlzLl9yZW1vdGVIb3N0ID0gYCR7c2VydmVySW5mby5ob3N0bmFtZSB8fCB0aGlzLl9jb25maWcuaG9zdH1gO1xuICAgIC8vIEJlY2F1c2UgdGhlIHZhbHVlIGZvciB0aGUgSW5pdGlhbCBEaXJlY3RvcnkgdGhhdCB0aGUgdXNlciBzdXBwbGllZCBtYXkgaGF2ZVxuICAgIC8vIGJlZW4gYSBzeW1saW5rIHRoYXQgd2FzIHJlc29sdmVkIGJ5IHRoZSBzZXJ2ZXIsIG92ZXJ3cml0ZSB0aGUgb3JpZ2luYWwgYGN3ZGBcbiAgICAvLyB2YWx1ZSB3aXRoIHRoZSByZXNvbHZlZCB2YWx1ZS5cbiAgICBpbnZhcmlhbnQoc2VydmVySW5mby53b3Jrc3BhY2UpO1xuICAgIHRoaXMuX2NvbmZpZy5jd2QgPSBzZXJ2ZXJJbmZvLndvcmtzcGFjZTtcbiAgICBpbnZhcmlhbnQoc2VydmVySW5mby5jYSk7XG4gICAgdGhpcy5fY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSA9IHNlcnZlckluZm8uY2E7XG4gICAgaW52YXJpYW50KHNlcnZlckluZm8uY2VydCk7XG4gICAgdGhpcy5fY2xpZW50Q2VydGlmaWNhdGUgPSBzZXJ2ZXJJbmZvLmNlcnQ7XG4gICAgaW52YXJpYW50KHNlcnZlckluZm8ua2V5KTtcbiAgICB0aGlzLl9jbGllbnRLZXkgPSBzZXJ2ZXJJbmZvLmtleTtcbiAgfVxuXG4gIF9pc1NlY3VyZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEodGhpcy5fY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZVxuICAgICAgICAmJiB0aGlzLl9jbGllbnRDZXJ0aWZpY2F0ZVxuICAgICAgICAmJiB0aGlzLl9jbGllbnRLZXkpO1xuICB9XG5cbiAgYXN5bmMgX3N0YXJ0UmVtb3RlU2VydmVyKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBzdGRPdXQgPSAnJztcbiAgICAgIGNvbnN0IHJlbW90ZVRlbXBGaWxlID0gYC90bXAvbnVjbGlkZS1zc2hoYW5kc2hha2UtJHtNYXRoLnJhbmRvbSgpfWA7XG4gICAgICAvL1RPRE86IGVzY2FwZSBhbnkgc2luZ2xlIHF1b3Rlc1xuICAgICAgLy9UT0RPOiB0aGUgdGltZW91dCB2YWx1ZSBzaGFsbCBiZSBjb25maWd1cmFibGUgdXNpbmcgLmpzb24gZmlsZSB0b28gKHQ2OTA0NjkxKS5cbiAgICAgIGNvbnN0IGNtZCA9IGAke3RoaXMuX2NvbmZpZy5yZW1vdGVTZXJ2ZXJDb21tYW5kfSAtLXdvcmtzcGFjZT0ke3RoaXMuX2NvbmZpZy5jd2R9YFxuICAgICAgICArIGAgLS1jb21tb24tbmFtZT0ke3RoaXMuX2NvbmZpZy5ob3N0fSAtLWpzb24tb3V0cHV0LWZpbGU9JHtyZW1vdGVUZW1wRmlsZX0gLXQgNjBgO1xuXG4gICAgICAvLyBUaGlzIGltaXRhdGVzIGEgdXNlciB0eXBpbmc6XG4gICAgICAvLyAgICQgVEVSTT1udWNsaWRlIHNzaCBzZXJ2ZXJcbiAgICAgIC8vIHRoZW4gb24gdGhlIGludGVyYWN0aXZlIHByb21wdCBleGVjdXRpbmcgdGhlIHJlbW90ZSBzZXJ2ZXIgY29tbWFuZC4gIElmXG4gICAgICAvLyB0aGF0IHdvcmtzLCB0aGVuIG51Y2xpZGUgc2hvdWxkIGFsc28gd29yay5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgcmVhc29uIHdlIGRvbid5IHVzZSBleGVjIGhlcmUgaXMgYmVjYXVzZSBwZW9wbGUgbGlrZSB0byBwdXQgYXMgdGhlXG4gICAgICAvLyBsYXN0IHN0YXRlbWVudCBpbiB0aGVpciAuYmFzaHJjIHpzaCBvciBmaXNoLiAgVGhpcyBzdGFydHMgYW5cbiAgICAgIC8vIGFuZCBpbnRlcmFjdGl2ZSBjaGlsZCBzaGVsbCB0aGF0IG5ldmVyIGV4aXRzIGlmIHlvdSBleGVjLlxuICAgICAgLy9cbiAgICAgIC8vIFRoaXMgaXMgYSBiYWQgaWRlYSBiZWNhdXNlIGJlc2lkZXMgYnJlYWtpbmcgdXMsIGl0IGFsc28gYnJlYWtzIHRoaXM6XG4gICAgICAvLyAkIHNzaCBzZXJ2ZXIgYW55X2NtZFxuICAgICAgLy9cbiAgICAgIC8vIEFzIGEgbGFzdCByZXNvcnQgd2UgYWxzbyBzZXQgdGVybSB0byAnbnVjbGlkZScgc28gdGhhdCBpZiBhbnl0aGluZyB3ZVxuICAgICAgLy8gaGF2ZW4ndCB0aG91Z2h0IG9mIGhhcHBlbnMsIHRoZSB1c2VyIGNhbiBhbHdheXMgYWRkIHRoZSBmb2xsb3dpbmcgdG9cbiAgICAgIC8vIHRoZSB0b3Agb2YgdGhlaXIgZmF2b3JpdGUgc2hlbGwgc3RhcnR1cCBmaWxlOlxuICAgICAgLy9cbiAgICAgIC8vICAgWyBcIiRURVJNXCIgPSBcIm51Y2xpZGVcIl0gJiYgcmV0dXJuO1xuICAgICAgdGhpcy5fY29ubmVjdGlvbi5zaGVsbCh7dGVybTogJ251Y2xpZGUnfSwgKGVyciwgc3RyZWFtKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICB0aGlzLl9vblNzaENvbm5lY3Rpb25FcnJvcihlcnIpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ub24oJ2Nsb3NlJywgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgICAgIC8vIE5vdGU6IHRoaXMgY29kZSBpcyBwcm9iYWJseSB0aGUgY29kZSBmcm9tIHRoZSBjaGlsZCBzaGVsbCBpZiBvbmVcbiAgICAgICAgICAvLyBpcyBpbiB1c2UuXG4gICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uc2Z0cChhc3luYyAoZXJyb3IsIHNmdHApID0+IHtcbiAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgICAnRmFpbGVkIHRvIHN0YXJ0IHNmdHAgY29ubmVjdGlvbicsXG4gICAgICAgICAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNFUlZFUl9TVEFSVF9GQUlMRUQsXG4gICAgICAgICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBsb2NhbFRlbXBGaWxlID0gYXdhaXQgZnNQcm9taXNlLnRlbXBmaWxlKCk7XG4gICAgICAgICAgICAgIHNmdHAuZmFzdEdldChyZW1vdGVUZW1wRmlsZSwgbG9jYWxUZW1wRmlsZSwgYXN5bmMgKHNmdHBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHNmdHAuZW5kKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNmdHBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gdHJhbnNmZXIgc2VydmVyIHN0YXJ0IGluZm9ybWF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5TRVJWRVJfU1RBUlRfRkFJTEVELFxuICAgICAgICAgICAgICAgICAgICBzZnRwRXJyb3IsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBzZXJ2ZXJJbmZvOiBhbnkgPSBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlcnZlckluZm9Kc29uID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKGxvY2FsVGVtcEZpbGUpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBzZXJ2ZXJJbmZvID0gSlNPTi5wYXJzZShzZXJ2ZXJJbmZvSnNvbik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdNYWxmb3JtZWQgc2VydmVyIHN0YXJ0IGluZm9ybWF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5TRVJWRVJfU1RBUlRfRkFJTEVELFxuICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3Ioc2VydmVySW5mb0pzb24pLFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXNlcnZlckluZm8uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdSZW1vdGUgc2VydmVyIGZhaWxlZCB0byBzdGFydCcsXG4gICAgICAgICAgICAgICAgICAgIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuU0VSVkVSX1NUQVJUX0ZBSUxFRCxcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yKHNlcnZlckluZm8ubG9ncyksXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghc2VydmVySW5mby53b3Jrc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgICAgICAgICAgICAnQ291bGQgbm90IGZpbmQgZGlyZWN0b3J5JyxcbiAgICAgICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5ESVJFQ1RPUllfTk9UX0ZPVU5ELFxuICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3Ioc2VydmVySW5mby5sb2dzKSxcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIHNlcnZlciBpbmZvIHRoYXQgaXMgbmVlZGVkIGZvciBzZXR0aW5nIHVwIGNsaWVudC5cbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTZXJ2ZXJJbmZvKHNlcnZlckluZm8pO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgJ1JlbW90ZSBzaGVsbCBleGVjdXRpb24gZmFpbGVkJyxcbiAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5VTktOT1dOLFxuICAgICAgICAgICAgICBuZXcgRXJyb3Ioc3RkT3V0KSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICAgIHN0ZE91dCArPSBkYXRhO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gWWVzIHdlIGV4aXQgdHdpY2UuICBUaGlzIGlzIGJlY2F1c2UgcGVvcGxlIHdobyB1c2Ugc2hlbGxzIGxpa2UgenNoXG4gICAgICAgIC8vIG9yIGZpc2gsIGV0YyBsaWtlIHRvIHB1dCB6c2gvZmlzaCBhcyB0aGUgbGFzdCBzdGF0ZW1lbnQgb2YgdGhlaXJcbiAgICAgICAgLy8gLmJhc2hyYy4gIFRoaXMgbWVhbnMgdGhhdCB3aGVuIHdlIGV4aXQgenNoL2Zpc2gsIHdlIHRoZW4gaGF2ZSB0byBleGl0XG4gICAgICAgIC8vIHRoZSBwYXJlbnQgYmFzaCBzaGVsbC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIHNlY29uZCBleGl0IGlzIGlnbm9yZWQgd2hlbiB0aGVyZSBpcyBvbmx5IG9uZSBzaGVsbC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2Ugd2lsbCBzdGlsbCBoYW5nIGZvcmV2ZXIgaWYgdGhleSBoYXZlIGEgc2hlbGwgd2l0aGluIGEgc2hlbGwgd2l0aGluXG4gICAgICAgIC8vIGEgc2hlbGwuICBCdXQgSSBjYW4ndCBicmluZyBteXNlbGYgdG8gZXhpdCAzIHRpbWVzLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUT0RPOiAobWlrZW8pIFRoZXJlIGlzIGEgU0hMVkwgZW52aXJvbm1lbnQgdmFyaWFibGUgc2V0IHRoYXQgY2FuIGJlXG4gICAgICAgIC8vIHVzZWQgdG8gZGVjaWRlIGhvdyBtYW55IHRpbWVzIHRvIGV4aXRcbiAgICAgICAgc3RyZWFtLmVuZChgJHtjbWR9XFxuZXhpdFxcbmV4aXRcXG5gKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX29uQ29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLl9zdGFydFJlbW90ZVNlcnZlcigpKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbmlzaEhhbmRzaGFrZSA9IGFzeW5jIChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBjb25uZWN0aW9uLmluaXRpYWxpemUoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgJ0Nvbm5lY3Rpb24gY2hlY2sgZmFpbGVkJyxcbiAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNFUlZFUl9WRVJTSU9OX01JU01BVENILFxuICAgICAgICAgIGUsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLl9kaWRDb25uZWN0KGNvbm5lY3Rpb24pO1xuICAgICAgLy8gSWYgd2UgYXJlIHNlY3VyZSB0aGVuIHdlIGRvbid0IG5lZWQgdGhlIHNzaCB0dW5uZWwuXG4gICAgICBpZiAodGhpcy5faXNTZWN1cmUoKSkge1xuICAgICAgICB0aGlzLl9jb25uZWN0aW9uLmVuZCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBVc2UgYW4gc3NoIHR1bm5lbCBpZiBzZXJ2ZXIgaXMgbm90IHNlY3VyZVxuICAgIGlmICh0aGlzLl9pc1NlY3VyZSgpKSB7XG4gICAgICBpbnZhcmlhbnQodGhpcy5fcmVtb3RlSG9zdCk7XG4gICAgICBpbnZhcmlhbnQodGhpcy5fcmVtb3RlUG9ydCk7XG4gICAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IFJlbW90ZUNvbm5lY3Rpb24oe1xuICAgICAgICBob3N0OiB0aGlzLl9yZW1vdGVIb3N0LFxuICAgICAgICBwb3J0OiB0aGlzLl9yZW1vdGVQb3J0LFxuICAgICAgICBjd2Q6IHRoaXMuX2NvbmZpZy5jd2QsXG4gICAgICAgIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU6IHRoaXMuX2NlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUsXG4gICAgICAgIGNsaWVudENlcnRpZmljYXRlOiB0aGlzLl9jbGllbnRDZXJ0aWZpY2F0ZSxcbiAgICAgICAgY2xpZW50S2V5OiB0aGlzLl9jbGllbnRLZXksXG4gICAgICB9KTtcbiAgICAgIGZpbmlzaEhhbmRzaGFrZShjb25uZWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLyogJEZsb3dJc3N1ZSB0OTIxMjM3OCAqL1xuICAgICAgdGhpcy5fZm9yd2FyZGluZ1NlcnZlciA9IG5ldC5jcmVhdGVTZXJ2ZXIoc29jayA9PiB7XG4gICAgICAgIHRoaXMuX2ZvcndhcmRTb2NrZXQoc29jayk7XG4gICAgICB9KS5saXN0ZW4oMCwgJ2xvY2FsaG9zdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgbG9jYWxQb3J0ID0gdGhpcy5fZ2V0TG9jYWxQb3J0KCk7XG4gICAgICAgIGludmFyaWFudChsb2NhbFBvcnQpO1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IFJlbW90ZUNvbm5lY3Rpb24oe1xuICAgICAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgICAgICAgIHBvcnQ6IGxvY2FsUG9ydCxcbiAgICAgICAgICBjd2Q6IHRoaXMuX2NvbmZpZy5jd2QsXG4gICAgICAgIH0pO1xuICAgICAgICBmaW5pc2hIYW5kc2hha2UoY29ubmVjdGlvbik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfZ2V0TG9jYWxQb3J0KCk6ID9udW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9mb3J3YXJkaW5nU2VydmVyID8gdGhpcy5fZm9yd2FyZGluZ1NlcnZlci5hZGRyZXNzKCkucG9ydCA6IG51bGw7XG4gIH1cblxuICBnZXRDb25maWcoKTogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24ge1xuICAgIHJldHVybiB0aGlzLl9jb25maWc7XG4gIH1cbn1cblxuU3NoSGFuZHNoYWtlLlN1cHBvcnRlZE1ldGhvZHMgPSBTdXBwb3J0ZWRNZXRob2RzO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVjb3JhdGVTc2hDb25uZWN0aW9uRGVsZWdhdGVXaXRoVHJhY2tpbmcoXG4gIGRlbGVnYXRlOiBTc2hDb25uZWN0aW9uRGVsZWdhdGUsXG4pOiBTc2hDb25uZWN0aW9uRGVsZWdhdGUge1xuICBsZXQgY29ubmVjdGlvblRyYWNrZXI7XG5cbiAgcmV0dXJuIHtcbiAgICBvbktleWJvYXJkSW50ZXJhY3RpdmU6IChcbiAgICAgIG5hbWU6IHN0cmluZyxcbiAgICAgIGluc3RydWN0aW9uczogc3RyaW5nLFxuICAgICAgaW5zdHJ1Y3Rpb25zTGFuZzogc3RyaW5nLFxuICAgICAgcHJvbXB0czogQXJyYXk8e3Byb21wdDogc3RyaW5nOyBlY2hvOiBib29sZWFuO30+LFxuICAgICAgZmluaXNoOiAoYW5zd2VyczogQXJyYXk8c3RyaW5nPikgPT4gdm9pZCxcbiAgICApID0+IHtcbiAgICAgIGludmFyaWFudChjb25uZWN0aW9uVHJhY2tlcik7XG4gICAgICBjb25uZWN0aW9uVHJhY2tlci50cmFja1Byb21wdFl1YmlrZXlJbnB1dCgpO1xuICAgICAgZGVsZWdhdGUub25LZXlib2FyZEludGVyYWN0aXZlKFxuICAgICAgICBuYW1lLFxuICAgICAgICBpbnN0cnVjdGlvbnMsXG4gICAgICAgIGluc3RydWN0aW9uc0xhbmcsXG4gICAgICAgIHByb21wdHMsXG4gICAgICAgIChhbnN3ZXJzKSA9PiB7XG4gICAgICAgICAgaW52YXJpYW50KGNvbm5lY3Rpb25UcmFja2VyKTtcbiAgICAgICAgICBjb25uZWN0aW9uVHJhY2tlci50cmFja0ZpbmlzaFl1YmlrZXlJbnB1dCgpO1xuICAgICAgICAgIGZpbmlzaChhbnN3ZXJzKTtcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSxcbiAgICBvbldpbGxDb25uZWN0OiAoY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4ge1xuICAgICAgY29ubmVjdGlvblRyYWNrZXIgPSBuZXcgQ29ubmVjdGlvblRyYWNrZXIoY29uZmlnKTtcbiAgICAgIGRlbGVnYXRlLm9uV2lsbENvbm5lY3QoY29uZmlnKTtcbiAgICB9LFxuICAgIG9uRGlkQ29ubmVjdDogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24sIGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IHtcbiAgICAgIGludmFyaWFudChjb25uZWN0aW9uVHJhY2tlcik7XG4gICAgICBjb25uZWN0aW9uVHJhY2tlci50cmFja1N1Y2Nlc3MoKTtcbiAgICAgIGRlbGVnYXRlLm9uRGlkQ29ubmVjdChjb25uZWN0aW9uLCBjb25maWcpO1xuICAgIH0sXG4gICAgb25FcnJvcjogKFxuICAgICAgZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsXG4gICAgICBlcnJvcjogRXJyb3IsXG4gICAgICBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxuICAgICkgPT4ge1xuICAgICAgaW52YXJpYW50KGNvbm5lY3Rpb25UcmFja2VyKTtcbiAgICAgIGNvbm5lY3Rpb25UcmFja2VyLnRyYWNrRmFpbHVyZShlcnJvclR5cGUsIGVycm9yKTtcbiAgICAgIGRlbGVnYXRlLm9uRXJyb3IoZXJyb3JUeXBlLCBlcnJvciwgY29uZmlnKTtcbiAgICB9LFxuICB9O1xufVxuIl19