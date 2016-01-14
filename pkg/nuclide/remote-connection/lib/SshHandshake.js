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
var SYNC_WORD = 'SYNSYN';
var STDOUT_REGEX = /SYNSYN[\s\S\n]*({.*})[\s\S\n]*SYNSYN/;
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
    value: function _startRemoteServer() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var stdOut = '';

        //TODO: escape any single quotes
        //TODO: the timeout value shall be configurable using .json file too (t6904691).
        var cmd = _this._config.remoteServerCommand + ' --workspace=' + _this._config.cwd + (' --common_name=' + _this._config.host + ' -t 60');

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
            resolve(false);
          }
          stream.on('close', function (code, signal) {
            // Note: this code is probably the code from the child shell if one
            // is in use.
            if (code === 0) {
              var serverInfo = undefined;
              var match = STDOUT_REGEX.exec(stdOut);
              if (!match) {
                _this._error('Remote server failed to start', SshHandshake.ErrorType.SERVER_START_FAILED, new Error(stdOut));
                resolve(false);
                return;
              }
              try {
                serverInfo = JSON.parse(match[1]);
              } catch (e) {
                _this._error('Remote server failed to start', SshHandshake.ErrorType.SERVER_START_FAILED, new Error(stdOut));
                resolve(false);
                return;
              }
              if (!serverInfo.workspace) {
                _this._error('Could not find directory', SshHandshake.ErrorType.DIRECTORY_NOT_FOUND, new Error(stdOut));
                resolve(false);
                return;
              }

              // Update server info that is needed for setting up client.
              _this._updateServerInfo(serverInfo);
              resolve(true);
            } else {
              _this._error('Remote shell execution failed', SshHandshake.ErrorType.UNKNOWN, new Error(stdOut));
              resolve(false);
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
          stream.end('echo ' + SYNC_WORD + ';' + cmd + ';echo ' + SYNC_WORD + '\nexit\nexit\n');
        });
      });
    }
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
      connectionTracker.trackFailure(error);
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
//# sourceMappingURL=data:application/json;base64,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QWdCLEVBQ2hCLE9BQU8sRUFDUCxVQUFDLE9BQU8sRUFBSztBQUNYLGlCQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM3Qix5QkFBaUIsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0FBQzVDLGNBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUNqQixDQUNGLENBQUM7S0FDSDtBQUNELGlCQUFhLEVBQUUsdUJBQUMsTUFBTSxFQUFpQztBQUNyRCx1QkFBaUIsR0FBRyxtQ0FBc0IsTUFBTSxDQUFDLENBQUM7QUFDbEQsY0FBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNoQztBQUNELGdCQUFZLEVBQUUsc0JBQUMsVUFBVSxFQUFvQixNQUFNLEVBQWlDO0FBQ2xGLGVBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdCLHVCQUFpQixDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ2pDLGNBQVEsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzNDO0FBQ0QsV0FBTyxFQUFFLGlCQUNQLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNIO0FBQ0gsZUFBUyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDN0IsdUJBQWlCLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RDLGNBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztLQUM1QztHQUNGLENBQUM7Q0FDSCIsImZpbGUiOiJTc2hIYW5kc2hha2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgQ29ubmVjdGlvblRyYWNrZXIgZnJvbSAnLi9Db25uZWN0aW9uVHJhY2tlcic7XG5cbmNvbnN0IFNzaENvbm5lY3Rpb24gPSByZXF1aXJlKCdzc2gyJykuQ2xpZW50O1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcy1wbHVzJyk7XG5jb25zdCBuZXQgPSByZXF1aXJlKCduZXQnKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG5jb25zdCB7UmVtb3RlQ29ubmVjdGlvbn0gPSByZXF1aXJlKCcuL1JlbW90ZUNvbm5lY3Rpb24nKTtcbmNvbnN0IHtmc1Byb21pc2V9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuXG4vLyBTeW5jIHdvcmQgYW5kIHJlZ2V4IHBhdHRlcm4gZm9yIHBhcnNpbmcgY29tbWFuZCBzdGRvdXQuXG5jb25zdCBTWU5DX1dPUkQgPSAnU1lOU1lOJztcbmNvbnN0IFNURE9VVF9SRUdFWCA9IC9TWU5TWU5bXFxzXFxTXFxuXSooey4qfSlbXFxzXFxTXFxuXSpTWU5TWU4vO1xuY29uc3QgUkVBRFlfVElNRU9VVF9NUyA9IDYwICogMTAwMDtcblxuZXhwb3J0IHR5cGUgU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24gPSB7XG4gIGhvc3Q6IHN0cmluZzsgLy8gaG9zdCBudWNsaWRlIHNlcnZlciBpcyBydW5uaW5nIG9uXG4gIHNzaFBvcnQ6IG51bWJlcjsgLy8gc3NoIHBvcnQgb2YgaG9zdCBudWNsaWRlIHNlcnZlciBpcyBydW5uaW5nIG9uXG4gIHVzZXJuYW1lOiBzdHJpbmc7IC8vIHVzZXJuYW1lIHRvIGF1dGhlbnRpY2F0ZSBhc1xuICBwYXRoVG9Qcml2YXRlS2V5OiBzdHJpbmc7IC8vIFRoZSBwYXRoIHRvIHByaXZhdGUga2V5XG4gIHJlbW90ZVNlcnZlckNvbW1hbmQ6IHN0cmluZzsgLy8gQ29tbWFuZCB0byB1c2UgdG8gc3RhcnQgc2VydmVyXG4gIGN3ZDogc3RyaW5nOyAvLyBQYXRoIHRvIHJlbW90ZSBkaXJlY3RvcnkgdXNlciBzaG91bGQgc3RhcnQgaW4gdXBvbiBjb25uZWN0aW9uLlxuICBhdXRoTWV0aG9kOiBzdHJpbmc7IC8vIFdoaWNoIG9mIHRoZSBhdXRoZW50aWNhdGlvbiBtZXRob2RzIGluIGBTdXBwb3J0ZWRNZXRob2RzYCB0byB1c2UuXG4gIHBhc3N3b3JkOiBzdHJpbmc7IC8vIGZvciBzaW1wbGUgcGFzc3dvcmQtYmFzZWQgYXV0aGVudGljYXRpb25cbn1cblxuY29uc3QgU3VwcG9ydGVkTWV0aG9kcyA9IHtcbiAgU1NMX0FHRU5UOiAnU1NMX0FHRU5UJyxcbiAgUEFTU1dPUkQ6ICdQQVNTV09SRCcsXG4gIFBSSVZBVEVfS0VZOiAnUFJJVkFURV9LRVknLFxufTtcblxuY29uc3QgRXJyb3JUeXBlID0ge1xuICBVTktOT1dOOiAnVU5LTk9XTicsXG4gIEhPU1RfTk9UX0ZPVU5EOiAnSE9TVF9OT1RfRk9VTkQnLFxuICBDQU5UX1JFQURfUFJJVkFURV9LRVk6ICdDQU5UX1JFQURfUFJJVkFURV9LRVknLFxuICBTU0hfQ09OTkVDVF9USU1FT1VUOiAnU1NIX0NPTk5FQ1RfVElNRU9VVCcsXG4gIFNTSF9DT05ORUNUX0ZBSUxFRDogJ1NTSF9DT05ORUNUX0ZBSUxFRCcsXG4gIFNTSF9BVVRIRU5USUNBVElPTjogJ1NTSF9BVVRIRU5USUNBVElPTicsXG4gIERJUkVDVE9SWV9OT1RfRk9VTkQ6ICdESVJFQ1RPUllfTk9UX0ZPVU5EJyxcbiAgU0VSVkVSX1NUQVJUX0ZBSUxFRDogJ1NFUlZFUl9TVEFSVF9GQUlMRUQnLFxuICBTRVJWRVJfVkVSU0lPTl9NSVNNQVRDSDogJ1NFUlZFUl9WRVJTSU9OX01JU01BVENIJyxcbn07XG5cbmV4cG9ydCB0eXBlIFNzaEhhbmRzaGFrZUVycm9yVHlwZSA9ICdVTktOT1dOJyB8ICdIT1NUX05PVF9GT1VORCcgfCAnQ0FOVF9SRUFEX1BSSVZBVEVfS0VZJyB8XG4gICdTU0hfQ09OTkVDVF9USU1FT1VUJyB8ICdTU0hfQ09OTkVDVF9GQUlMRUQnIHwgJ1NTSF9BVVRIRU5USUNBVElPTicgfCAnRElSRUNUT1JZX05PVF9GT1VORCcgfFxuICAnU0VSVkVSX1NUQVJUX0ZBSUxFRCcgfCAnU0VSVkVSX1ZFUlNJT05fTUlTTUFUQ0gnO1xuXG50eXBlIFNzaENvbm5lY3Rpb25FcnJvckxldmVsID0gJ2NsaWVudC10aW1lb3V0JyB8ICdjbGllbnQtc29ja2V0JyB8ICdwcm90b2NhbCcgfFxuICAnY2xpZW50LWF1dGhlbnRpY2F0aW9uJyB8ICdhZ2VudCcgfCAnY2xpZW50LWRucyc7XG5cbi8qKlxuICogVGhlIHNlcnZlciBpcyBhc2tpbmcgZm9yIHJlcGxpZXMgdG8gdGhlIGdpdmVuIHByb21wdHMgZm9yXG4gKiBrZXlib2FyZC1pbnRlcmFjdGl2ZSB1c2VyIGF1dGhlbnRpY2F0aW9uLlxuICpcbiAqIEBwYXJhbSBuYW1lIGlzIGdlbmVyYWxseSB3aGF0IHlvdSdkIHVzZSBhc1xuICogICAgIGEgd2luZG93IHRpdGxlIChmb3IgR1VJIGFwcHMpLlxuICogQHBhcmFtIHByb21wdHMgaXMgYW4gYXJyYXkgb2YgeyBwcm9tcHQ6ICdQYXNzd29yZDogJyxcbiAqICAgICBlY2hvOiBmYWxzZSB9IHN0eWxlIG9iamVjdHMgKGhlcmUgZWNobyBpbmRpY2F0ZXMgd2hldGhlciB1c2VyIGlucHV0XG4gKiAgICAgc2hvdWxkIGJlIGRpc3BsYXllZCBvbiB0aGUgc2NyZWVuKS5cbiAqIEBwYXJhbSBmaW5pc2g6IFRoZSBhbnN3ZXJzIGZvciBhbGwgcHJvbXB0cyBtdXN0IGJlIHByb3ZpZGVkIGFzIGFuXG4gKiAgICAgYXJyYXkgb2Ygc3RyaW5ncyBhbmQgcGFzc2VkIHRvIGZpbmlzaCB3aGVuIHlvdSBhcmUgcmVhZHkgdG8gY29udGludWUuIE5vdGU6XG4gKiAgICAgSXQncyBwb3NzaWJsZSBmb3IgdGhlIHNlcnZlciB0byBjb21lIGJhY2sgYW5kIGFzayBtb3JlIHF1ZXN0aW9ucy5cbiAqL1xuZXhwb3J0IHR5cGUgS2V5Ym9hcmRJbnRlcmFjdGl2ZUNhbGxiYWNrID0gKFxuICBuYW1lOiBzdHJpbmcsXG4gIGluc3RydWN0aW9uczogc3RyaW5nLFxuICBpbnN0cnVjdGlvbnNMYW5nOiBzdHJpbmcsXG4gIHByb21wdHM6IEFycmF5PHtwcm9tcHQ6IHN0cmluZzsgZWNobzogYm9vbGVhbjt9PixcbiAgZmluaXNoOiAoYW5zd2VyczogQXJyYXk8c3RyaW5nPikgPT4gdm9pZCkgID0+IHZvaWQ7XG5cbmV4cG9ydCB0eXBlIFNzaENvbm5lY3Rpb25EZWxlZ2F0ZSA9IHtcbiAgLyoqIEludm9rZWQgd2hlbiBzZXJ2ZXIgcmVxdWVzdHMga2V5Ym9hcmQgaW50ZXJhY3Rpb24gKi9cbiAgb25LZXlib2FyZEludGVyYWN0aXZlOiBLZXlib2FyZEludGVyYWN0aXZlQ2FsbGJhY2s7XG4gIC8qKiBJbnZva2VkIHdoZW4gdHJ5aW5nIHRvIGNvbm5lY3QgKi9cbiAgb25XaWxsQ29ubmVjdDogKGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IHZvaWQ7XG4gIC8qKiBJbnZva2VkIHdoZW4gY29ubmVjdGlvbiBpcyBzdWNlc3NmdWwgKi9cbiAgb25EaWRDb25uZWN0OiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbiwgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4gdm9pZDtcbiAgLyoqIEludm9rZWQgd2hlbiBjb25uZWN0aW9uIGlzIGZhaWxzICovXG4gIG9uRXJyb3I6XG4gICAgKGVycm9yVHlwZTogU3NoSGFuZHNoYWtlRXJyb3JUeXBlLCBlcnJvcjogRXJyb3IsIGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IHZvaWQ7XG59O1xuXG5jb25zdCBTc2hDb25uZWN0aW9uRXJyb3JMZXZlbE1hcDogTWFwPFNzaENvbm5lY3Rpb25FcnJvckxldmVsLCBTc2hIYW5kc2hha2VFcnJvclR5cGU+ID0gbmV3IE1hcChbXG4gIFsnY2xpZW50LXRpbWVvdXQnLCBFcnJvclR5cGUuU1NIX0NPTk5FQ1RfVElNRU9VVF0sXG4gIFsnY2xpZW50LXNvY2tldCcsIEVycm9yVHlwZS5TU0hfQ09OTkVDVF9GQUlMRURdLFxuICBbJ3Byb3RvY2FsJywgRXJyb3JUeXBlLlNTSF9DT05ORUNUX0ZBSUxFRF0sXG4gIFsnY2xpZW50LWF1dGhlbnRpY2F0aW9uJywgRXJyb3JUeXBlLlNTSF9BVVRIRU5USUNBVElPTl0sXG4gIFsnYWdlbnQnLCBFcnJvclR5cGUuU1NIX0FVVEhFTlRJQ0FUSU9OXSxcbiAgWydjbGllbnQtZG5zJywgRXJyb3JUeXBlLlNTSF9BVVRIRU5USUNBVElPTl0sXG5dKTtcblxuZXhwb3J0IGNsYXNzIFNzaEhhbmRzaGFrZSB7XG4gIF9kZWxlZ2F0ZTogU3NoQ29ubmVjdGlvbkRlbGVnYXRlO1xuICBfY29ubmVjdGlvbjogU3NoQ29ubmVjdGlvbjtcbiAgX2NvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb247XG4gIF9mb3J3YXJkaW5nU2VydmVyOiBuZXQuU2VydmVyO1xuICBfcmVtb3RlSG9zdDogP3N0cmluZztcbiAgX3JlbW90ZVBvcnQ6ID9udW1iZXI7XG4gIF9jZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlOiBCdWZmZXI7XG4gIF9jbGllbnRDZXJ0aWZpY2F0ZTogQnVmZmVyO1xuICBfY2xpZW50S2V5OiBCdWZmZXI7XG4gIHN0YXRpYyBTdXBwb3J0ZWRNZXRob2RzOiB0eXBlb2YgU3VwcG9ydGVkTWV0aG9kcztcblxuICBzdGF0aWMgRXJyb3JUeXBlID0gRXJyb3JUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKGRlbGVnYXRlOiBTc2hDb25uZWN0aW9uRGVsZWdhdGUsIGNvbm5lY3Rpb24/OiBTc2hDb25uZWN0aW9uKSB7XG4gICAgdGhpcy5fZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcbiAgICB0aGlzLl9jb25uZWN0aW9uID0gY29ubmVjdGlvbiA/IGNvbm5lY3Rpb24gOiBuZXcgU3NoQ29ubmVjdGlvbigpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24ub24oJ3JlYWR5JywgdGhpcy5fb25Db25uZWN0LmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24ub24oJ2Vycm9yJywgdGhpcy5fb25Tc2hDb25uZWN0aW9uRXJyb3IuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5vbigna2V5Ym9hcmQtaW50ZXJhY3RpdmUnLCB0aGlzLl9vbktleWJvYXJkSW50ZXJhY3RpdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBfd2lsbENvbm5lY3QoKTogdm9pZCB7XG4gICAgdGhpcy5fZGVsZWdhdGUub25XaWxsQ29ubmVjdCh0aGlzLl9jb25maWcpO1xuICB9XG5cbiAgX2RpZENvbm5lY3QoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2RlbGVnYXRlLm9uRGlkQ29ubmVjdChjb25uZWN0aW9uLCB0aGlzLl9jb25maWcpO1xuICB9XG5cbiAgX2Vycm9yKG1lc3NhZ2U6IHN0cmluZywgZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsIGVycm9yOiBFcnJvcik6IHZvaWQge1xuICAgIGxvZ2dlci5lcnJvcihgU3NoSGFuZHNoYWtlIGZhaWxlZDogJHtlcnJvclR5cGV9LCAke21lc3NhZ2V9YCwgZXJyb3IpO1xuICAgIHRoaXMuX2RlbGVnYXRlLm9uRXJyb3IoZXJyb3JUeXBlLCBlcnJvciwgdGhpcy5fY29uZmlnKTtcbiAgfVxuXG4gIF9vblNzaENvbm5lY3Rpb25FcnJvcihlcnJvcjogRXJyb3IpOiB2b2lkIHtcbiAgICBjb25zdCBlcnJvckxldmVsID0gKChlcnJvcjogT2JqZWN0KS5sZXZlbDogU3NoQ29ubmVjdGlvbkVycm9yTGV2ZWwpO1xuICAgIGNvbnN0IGVycm9yVHlwZSA9IFNzaENvbm5lY3Rpb25FcnJvckxldmVsTWFwLmdldChlcnJvckxldmVsKSB8fCBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlVOS05PV047XG4gICAgdGhpcy5fZXJyb3IoJ1NzaCBjb25uZWN0aW9uIGZhaWxlZC4nLCBlcnJvclR5cGUsIGVycm9yKTtcbiAgfVxuXG4gIGFzeW5jIGNvbm5lY3QoY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbik6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl93aWxsQ29ubmVjdCgpO1xuXG4gICAgY29uc3QgZXhpc3RpbmdDb25uZWN0aW9uID0gUmVtb3RlQ29ubmVjdGlvblxuICAgICAgLmdldEJ5SG9zdG5hbWVBbmRQYXRoKHRoaXMuX2NvbmZpZy5ob3N0LCB0aGlzLl9jb25maWcuY3dkKTtcblxuICAgIGlmIChleGlzdGluZ0Nvbm5lY3Rpb24pIHtcbiAgICAgIHRoaXMuX2RpZENvbm5lY3QoZXhpc3RpbmdDb25uZWN0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgUmVtb3RlQ29ubmVjdGlvbi5jcmVhdGVDb25uZWN0aW9uQnlTYXZlZENvbmZpZyhcbiAgICAgIHRoaXMuX2NvbmZpZy5ob3N0LFxuICAgICAgdGhpcy5fY29uZmlnLmN3ZCxcbiAgICApO1xuXG4gICAgaWYgKGNvbm5lY3Rpb24pIHtcbiAgICAgIHRoaXMuX2RpZENvbm5lY3QoY29ubmVjdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge2xvb2t1cFByZWZlcklwdjZ9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpLmRuc1V0aWxzO1xuICAgIGxldCBhZGRyZXNzID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgYWRkcmVzcyA9IGF3YWl0IGxvb2t1cFByZWZlcklwdjYoY29uZmlnLmhvc3QpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAnRmFpbGVkIHRvIHJlc29sdmUgRE5TLicsXG4gICAgICAgIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuSE9TVF9OT1RfRk9VTkQsXG4gICAgICAgIGUsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuYXV0aE1ldGhvZCA9PT0gU3VwcG9ydGVkTWV0aG9kcy5TU0xfQUdFTlQpIHtcbiAgICAgIC8vIFBvaW50IHRvIHNzaC1hZ2VudCdzIHNvY2tldCBmb3Igc3NoLWFnZW50LWJhc2VkIGF1dGhlbnRpY2F0aW9uLlxuICAgICAgbGV0IGFnZW50ID0gcHJvY2Vzcy5lbnZbJ1NTSF9BVVRIX1NPQ0snXTtcbiAgICAgIGlmICghYWdlbnQgJiYgL153aW4vLnRlc3QocHJvY2Vzcy5wbGF0Zm9ybSkpIHtcbiAgICAgICAgLy8gIzEwMDogT24gV2luZG93cywgZmFsbCBiYWNrIHRvIHBhZ2VhbnQuXG4gICAgICAgIGFnZW50ID0gJ3BhZ2VhbnQnO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29ubmVjdGlvbi5jb25uZWN0KHtcbiAgICAgICAgaG9zdDogYWRkcmVzcyxcbiAgICAgICAgcG9ydDogY29uZmlnLnNzaFBvcnQsXG4gICAgICAgIHVzZXJuYW1lOiBjb25maWcudXNlcm5hbWUsXG4gICAgICAgIGFnZW50LFxuICAgICAgICB0cnlLZXlib2FyZDogdHJ1ZSxcbiAgICAgICAgcmVhZHlUaW1lb3V0OiBSRUFEWV9USU1FT1VUX01TLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChjb25maWcuYXV0aE1ldGhvZCA9PT0gU3VwcG9ydGVkTWV0aG9kcy5QQVNTV09SRCkge1xuICAgICAgICAvLyBXaGVuIHRoZSB1c2VyIGNob29zZXMgcGFzc3dvcmQtYmFzZWQgYXV0aGVudGljYXRpb24sIHdlIHNwZWNpZnlcbiAgICAgICAgLy8gdGhlIGNvbmZpZyBhcyBmb2xsb3dzIHNvIHRoYXQgaXQgdHJpZXMgc2ltcGxlIHBhc3N3b3JkIGF1dGggYW5kXG4gICAgICAgIC8vIGZhaWxpbmcgdGhhdCBpdCBmYWxscyB0aHJvdWdoIHRvIHRoZSBrZXlib2FyZCBpbnRlcmFjdGl2ZSBwYXRoXG4gICAgICB0aGlzLl9jb25uZWN0aW9uLmNvbm5lY3Qoe1xuICAgICAgICBob3N0OiBhZGRyZXNzLFxuICAgICAgICBwb3J0OiBjb25maWcuc3NoUG9ydCxcbiAgICAgICAgdXNlcm5hbWU6IGNvbmZpZy51c2VybmFtZSxcbiAgICAgICAgcGFzc3dvcmQ6IGNvbmZpZy5wYXNzd29yZCxcbiAgICAgICAgdHJ5S2V5Ym9hcmQ6IHRydWUsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5hdXRoTWV0aG9kID09PSBTdXBwb3J0ZWRNZXRob2RzLlBSSVZBVEVfS0VZKSB7XG4gICAgICAvLyBXZSB1c2UgZnMtcGx1cydzIG5vcm1hbGl6ZSgpIGZ1bmN0aW9uIGJlY2F1c2UgaXQgd2lsbCBleHBhbmQgdGhlIH4sIGlmIHByZXNlbnQuXG4gICAgICBjb25zdCBleHBhbmRlZFBhdGggPSBmcy5ub3JtYWxpemUoY29uZmlnLnBhdGhUb1ByaXZhdGVLZXkpO1xuICAgICAgbGV0IHByaXZhdGVLZXk6IHN0cmluZyA9IChudWxsIDogYW55KTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHByaXZhdGVLZXkgPSBhd2FpdCBmc1Byb21pc2UucmVhZEZpbGUoZXhwYW5kZWRQYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgYEZhaWxlZCB0byByZWFkIHByaXZhdGUga2V5YCxcbiAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLkNBTlRfUkVBRF9QUklWQVRFX0tFWSxcbiAgICAgICAgICBlLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29ubmVjdGlvbi5jb25uZWN0KHtcbiAgICAgICAgaG9zdDogYWRkcmVzcyxcbiAgICAgICAgcG9ydDogY29uZmlnLnNzaFBvcnQsXG4gICAgICAgIHVzZXJuYW1lOiBjb25maWcudXNlcm5hbWUsXG4gICAgICAgIHByaXZhdGVLZXksXG4gICAgICAgIHRyeUtleWJvYXJkOiB0cnVlLFxuICAgICAgICByZWFkeVRpbWVvdXQ6IFJFQURZX1RJTUVPVVRfTVMsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5lbmQoKTtcbiAgfVxuXG4gIF9vbktleWJvYXJkSW50ZXJhY3RpdmUoXG4gICAgICBuYW1lOiBzdHJpbmcsXG4gICAgICBpbnN0cnVjdGlvbnM6IHN0cmluZyxcbiAgICAgIGluc3RydWN0aW9uc0xhbmc6IHN0cmluZyxcbiAgICAgIHByb21wdHM6IEFycmF5PHtwcm9tcHQ6IHN0cmluZzsgZWNobzogYm9vbGVhbjt9PixcbiAgICAgIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZS5vbktleWJvYXJkSW50ZXJhY3RpdmUobmFtZSwgaW5zdHJ1Y3Rpb25zLCBpbnN0cnVjdGlvbnNMYW5nLCBwcm9tcHRzLCBmaW5pc2gpO1xuICB9XG5cbiAgX2ZvcndhcmRTb2NrZXQoc29ja2V0OiBuZXQuU29ja2V0KTogdm9pZCB7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5mb3J3YXJkT3V0KFxuICAgICAgLyogJEZsb3dJc3N1ZSB0OTIxMjM3OCAqL1xuICAgICAgc29ja2V0LnJlbW90ZUFkZHJlc3MsXG4gICAgICAvKiAkRmxvd0lzc3VlIHQ5MjEyMzc4ICovXG4gICAgICBzb2NrZXQucmVtb3RlUG9ydCxcbiAgICAgICdsb2NhbGhvc3QnLFxuICAgICAgdGhpcy5fcmVtb3RlUG9ydCxcbiAgICAgIChlcnIsIHN0cmVhbSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgc29ja2V0LmVuZCgpO1xuICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzb2NrZXQucGlwZShzdHJlYW0pO1xuICAgICAgICBzdHJlYW0ucGlwZShzb2NrZXQpO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBfdXBkYXRlU2VydmVySW5mbyhzZXJ2ZXJJbmZvOiB7fSkge1xuICAgIGludmFyaWFudChzZXJ2ZXJJbmZvLnBvcnQpO1xuICAgIHRoaXMuX3JlbW90ZVBvcnQgPSBzZXJ2ZXJJbmZvLnBvcnQ7XG4gICAgdGhpcy5fcmVtb3RlSG9zdCA9IGAke3NlcnZlckluZm8uaG9zdG5hbWUgfHwgdGhpcy5fY29uZmlnLmhvc3R9YDtcbiAgICAvLyBCZWNhdXNlIHRoZSB2YWx1ZSBmb3IgdGhlIEluaXRpYWwgRGlyZWN0b3J5IHRoYXQgdGhlIHVzZXIgc3VwcGxpZWQgbWF5IGhhdmVcbiAgICAvLyBiZWVuIGEgc3ltbGluayB0aGF0IHdhcyByZXNvbHZlZCBieSB0aGUgc2VydmVyLCBvdmVyd3JpdGUgdGhlIG9yaWdpbmFsIGBjd2RgXG4gICAgLy8gdmFsdWUgd2l0aCB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gICAgaW52YXJpYW50KHNlcnZlckluZm8ud29ya3NwYWNlKTtcbiAgICB0aGlzLl9jb25maWcuY3dkID0gc2VydmVySW5mby53b3Jrc3BhY2U7XG4gICAgaW52YXJpYW50KHNlcnZlckluZm8uY2EpO1xuICAgIHRoaXMuX2NlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUgPSBzZXJ2ZXJJbmZvLmNhO1xuICAgIGludmFyaWFudChzZXJ2ZXJJbmZvLmNlcnQpO1xuICAgIHRoaXMuX2NsaWVudENlcnRpZmljYXRlID0gc2VydmVySW5mby5jZXJ0O1xuICAgIGludmFyaWFudChzZXJ2ZXJJbmZvLmtleSk7XG4gICAgdGhpcy5fY2xpZW50S2V5ID0gc2VydmVySW5mby5rZXk7XG4gIH1cblxuICBfaXNTZWN1cmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKHRoaXMuX2NlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGVcbiAgICAgICAgJiYgdGhpcy5fY2xpZW50Q2VydGlmaWNhdGVcbiAgICAgICAgJiYgdGhpcy5fY2xpZW50S2V5KTtcbiAgfVxuXG4gIF9zdGFydFJlbW90ZVNlcnZlcigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IHN0ZE91dCA9ICcnO1xuXG4gICAgICAvL1RPRE86IGVzY2FwZSBhbnkgc2luZ2xlIHF1b3Rlc1xuICAgICAgLy9UT0RPOiB0aGUgdGltZW91dCB2YWx1ZSBzaGFsbCBiZSBjb25maWd1cmFibGUgdXNpbmcgLmpzb24gZmlsZSB0b28gKHQ2OTA0NjkxKS5cbiAgICAgIGNvbnN0IGNtZCA9IGAke3RoaXMuX2NvbmZpZy5yZW1vdGVTZXJ2ZXJDb21tYW5kfSAtLXdvcmtzcGFjZT0ke3RoaXMuX2NvbmZpZy5jd2R9YFxuICAgICAgICArIGAgLS1jb21tb25fbmFtZT0ke3RoaXMuX2NvbmZpZy5ob3N0fSAtdCA2MGA7XG5cbiAgICAgIC8vIFRoaXMgaW1pdGF0ZXMgYSB1c2VyIHR5cGluZzpcbiAgICAgIC8vICAgJCBURVJNPW51Y2xpZGUgc3NoIHNlcnZlclxuICAgICAgLy8gdGhlbiBvbiB0aGUgaW50ZXJhY3RpdmUgcHJvbXB0IGV4ZWN1dGluZyB0aGUgcmVtb3RlIHNlcnZlciBjb21tYW5kLiAgSWZcbiAgICAgIC8vIHRoYXQgd29ya3MsIHRoZW4gbnVjbGlkZSBzaG91bGQgYWxzbyB3b3JrLlxuICAgICAgLy9cbiAgICAgIC8vIFRoZSByZWFzb24gd2UgZG9uJ3kgdXNlIGV4ZWMgaGVyZSBpcyBiZWNhdXNlIHBlb3BsZSBsaWtlIHRvIHB1dCBhcyB0aGVcbiAgICAgIC8vIGxhc3Qgc3RhdGVtZW50IGluIHRoZWlyIC5iYXNocmMgenNoIG9yIGZpc2guICBUaGlzIHN0YXJ0cyBhblxuICAgICAgLy8gYW5kIGludGVyYWN0aXZlIGNoaWxkIHNoZWxsIHRoYXQgbmV2ZXIgZXhpdHMgaWYgeW91IGV4ZWMuXG4gICAgICAvL1xuICAgICAgLy8gVGhpcyBpcyBhIGJhZCBpZGVhIGJlY2F1c2UgYmVzaWRlcyBicmVha2luZyB1cywgaXQgYWxzbyBicmVha3MgdGhpczpcbiAgICAgIC8vICQgc3NoIHNlcnZlciBhbnlfY21kXG4gICAgICAvL1xuICAgICAgLy8gQXMgYSBsYXN0IHJlc29ydCB3ZSBhbHNvIHNldCB0ZXJtIHRvICdudWNsaWRlJyBzbyB0aGF0IGlmIGFueXRoaW5nIHdlXG4gICAgICAvLyBoYXZlbid0IHRob3VnaHQgb2YgaGFwcGVucywgdGhlIHVzZXIgY2FuIGFsd2F5cyBhZGQgdGhlIGZvbGxvd2luZyB0b1xuICAgICAgLy8gdGhlIHRvcCBvZiB0aGVpciBmYXZvcml0ZSBzaGVsbCBzdGFydHVwIGZpbGU6XG4gICAgICAvL1xuICAgICAgLy8gICBbIFwiJFRFUk1cIiA9IFwibnVjbGlkZVwiXSAmJiByZXR1cm47XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLnNoZWxsKHt0ZXJtOiAnbnVjbGlkZSd9LCAoZXJyLCBzdHJlYW0pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHRoaXMuX29uU3NoQ29ubmVjdGlvbkVycm9yKGVycik7XG4gICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RyZWFtLm9uKCdjbG9zZScsIChjb2RlLCBzaWduYWwpID0+IHtcbiAgICAgICAgICAvLyBOb3RlOiB0aGlzIGNvZGUgaXMgcHJvYmFibHkgdGhlIGNvZGUgZnJvbSB0aGUgY2hpbGQgc2hlbGwgaWYgb25lXG4gICAgICAgICAgLy8gaXMgaW4gdXNlLlxuICAgICAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgICAgICBsZXQgc2VydmVySW5mbztcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gU1RET1VUX1JFR0VYLmV4ZWMoc3RkT3V0KTtcbiAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgJ1JlbW90ZSBzZXJ2ZXIgZmFpbGVkIHRvIHN0YXJ0JyxcbiAgICAgICAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNFUlZFUl9TVEFSVF9GQUlMRUQsXG4gICAgICAgICAgICAgICAgbmV3IEVycm9yKHN0ZE91dCksXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzZXJ2ZXJJbmZvID0gSlNPTi5wYXJzZShtYXRjaFsxXSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgICAgICAgICdSZW1vdGUgc2VydmVyIGZhaWxlZCB0byBzdGFydCcsXG4gICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5TRVJWRVJfU1RBUlRfRkFJTEVELFxuICAgICAgICAgICAgICAgIG5ldyBFcnJvcihzdGRPdXQpLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFzZXJ2ZXJJbmZvLndvcmtzcGFjZSkge1xuICAgICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgICAnQ291bGQgbm90IGZpbmQgZGlyZWN0b3J5JyxcbiAgICAgICAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLkRJUkVDVE9SWV9OT1RfRk9VTkQsXG4gICAgICAgICAgICAgICAgbmV3IEVycm9yKHN0ZE91dCksXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSBzZXJ2ZXIgaW5mbyB0aGF0IGlzIG5lZWRlZCBmb3Igc2V0dGluZyB1cCBjbGllbnQuXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVTZXJ2ZXJJbmZvKHNlcnZlckluZm8pO1xuICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICdSZW1vdGUgc2hlbGwgZXhlY3V0aW9uIGZhaWxlZCcsXG4gICAgICAgICAgICAgIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuVU5LTk9XTixcbiAgICAgICAgICAgICAgbmV3IEVycm9yKHN0ZE91dCksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICAgIHN0ZE91dCArPSBkYXRhO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gWWVzIHdlIGV4aXQgdHdpY2UuICBUaGlzIGlzIGJlY2F1c2UgcGVvcGxlIHdobyB1c2Ugc2hlbGxzIGxpa2UgenNoXG4gICAgICAgIC8vIG9yIGZpc2gsIGV0YyBsaWtlIHRvIHB1dCB6c2gvZmlzaCBhcyB0aGUgbGFzdCBzdGF0ZW1lbnQgb2YgdGhlaXJcbiAgICAgICAgLy8gLmJhc2hyYy4gIFRoaXMgbWVhbnMgdGhhdCB3aGVuIHdlIGV4aXQgenNoL2Zpc2gsIHdlIHRoZW4gaGF2ZSB0byBleGl0XG4gICAgICAgIC8vIHRoZSBwYXJlbnQgYmFzaCBzaGVsbC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIHNlY29uZCBleGl0IGlzIGlnbm9yZWQgd2hlbiB0aGVyZSBpcyBvbmx5IG9uZSBzaGVsbC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2Ugd2lsbCBzdGlsbCBoYW5nIGZvcmV2ZXIgaWYgdGhleSBoYXZlIGEgc2hlbGwgd2l0aGluIGEgc2hlbGwgd2l0aGluXG4gICAgICAgIC8vIGEgc2hlbGwuICBCdXQgSSBjYW4ndCBicmluZyBteXNlbGYgdG8gZXhpdCAzIHRpbWVzLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUT0RPOiAobWlrZW8pIFRoZXJlIGlzIGEgU0hMVkwgZW52aXJvbm1lbnQgdmFyaWFibGUgc2V0IHRoYXQgY2FuIGJlXG4gICAgICAgIC8vIHVzZWQgdG8gZGVjaWRlIGhvdyBtYW55IHRpbWVzIHRvIGV4aXRcbiAgICAgICAgc3RyZWFtLmVuZChgZWNobyAke1NZTkNfV09SRH07JHtjbWR9O2VjaG8gJHtTWU5DX1dPUkR9XFxuZXhpdFxcbmV4aXRcXG5gKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX29uQ29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLl9zdGFydFJlbW90ZVNlcnZlcigpKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbmlzaEhhbmRzaGFrZSA9IGFzeW5jIChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBjb25uZWN0aW9uLmluaXRpYWxpemUoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgJ0Nvbm5lY3Rpb24gY2hlY2sgZmFpbGVkJyxcbiAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNFUlZFUl9WRVJTSU9OX01JU01BVENILFxuICAgICAgICAgIGUsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLl9kaWRDb25uZWN0KGNvbm5lY3Rpb24pO1xuICAgICAgLy8gSWYgd2UgYXJlIHNlY3VyZSB0aGVuIHdlIGRvbid0IG5lZWQgdGhlIHNzaCB0dW5uZWwuXG4gICAgICBpZiAodGhpcy5faXNTZWN1cmUoKSkge1xuICAgICAgICB0aGlzLl9jb25uZWN0aW9uLmVuZCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBVc2UgYW4gc3NoIHR1bm5lbCBpZiBzZXJ2ZXIgaXMgbm90IHNlY3VyZVxuICAgIGlmICh0aGlzLl9pc1NlY3VyZSgpKSB7XG4gICAgICBpbnZhcmlhbnQodGhpcy5fcmVtb3RlSG9zdCk7XG4gICAgICBpbnZhcmlhbnQodGhpcy5fcmVtb3RlUG9ydCk7XG4gICAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IFJlbW90ZUNvbm5lY3Rpb24oe1xuICAgICAgICBob3N0OiB0aGlzLl9yZW1vdGVIb3N0LFxuICAgICAgICBwb3J0OiB0aGlzLl9yZW1vdGVQb3J0LFxuICAgICAgICBjd2Q6IHRoaXMuX2NvbmZpZy5jd2QsXG4gICAgICAgIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU6IHRoaXMuX2NlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUsXG4gICAgICAgIGNsaWVudENlcnRpZmljYXRlOiB0aGlzLl9jbGllbnRDZXJ0aWZpY2F0ZSxcbiAgICAgICAgY2xpZW50S2V5OiB0aGlzLl9jbGllbnRLZXksXG4gICAgICB9KTtcbiAgICAgIGZpbmlzaEhhbmRzaGFrZShjb25uZWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLyogJEZsb3dJc3N1ZSB0OTIxMjM3OCAqL1xuICAgICAgdGhpcy5fZm9yd2FyZGluZ1NlcnZlciA9IG5ldC5jcmVhdGVTZXJ2ZXIoc29jayA9PiB7XG4gICAgICAgIHRoaXMuX2ZvcndhcmRTb2NrZXQoc29jayk7XG4gICAgICB9KS5saXN0ZW4oMCwgJ2xvY2FsaG9zdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgbG9jYWxQb3J0ID0gdGhpcy5fZ2V0TG9jYWxQb3J0KCk7XG4gICAgICAgIGludmFyaWFudChsb2NhbFBvcnQpO1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IFJlbW90ZUNvbm5lY3Rpb24oe1xuICAgICAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgICAgICAgIHBvcnQ6IGxvY2FsUG9ydCxcbiAgICAgICAgICBjd2Q6IHRoaXMuX2NvbmZpZy5jd2QsXG4gICAgICAgIH0pO1xuICAgICAgICBmaW5pc2hIYW5kc2hha2UoY29ubmVjdGlvbik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfZ2V0TG9jYWxQb3J0KCk6ID9udW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9mb3J3YXJkaW5nU2VydmVyID8gdGhpcy5fZm9yd2FyZGluZ1NlcnZlci5hZGRyZXNzKCkucG9ydCA6IG51bGw7XG4gIH1cblxuICBnZXRDb25maWcoKTogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24ge1xuICAgIHJldHVybiB0aGlzLl9jb25maWc7XG4gIH1cbn1cblxuU3NoSGFuZHNoYWtlLlN1cHBvcnRlZE1ldGhvZHMgPSBTdXBwb3J0ZWRNZXRob2RzO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVjb3JhdGVTc2hDb25uZWN0aW9uRGVsZWdhdGVXaXRoVHJhY2tpbmcoXG4gIGRlbGVnYXRlOiBTc2hDb25uZWN0aW9uRGVsZWdhdGUsXG4pOiBTc2hDb25uZWN0aW9uRGVsZWdhdGUge1xuICBsZXQgY29ubmVjdGlvblRyYWNrZXI7XG5cbiAgcmV0dXJuIHtcbiAgICBvbktleWJvYXJkSW50ZXJhY3RpdmU6IChcbiAgICAgIG5hbWU6IHN0cmluZyxcbiAgICAgIGluc3RydWN0aW9uczogc3RyaW5nLFxuICAgICAgaW5zdHJ1Y3Rpb25zTGFuZzogc3RyaW5nLFxuICAgICAgcHJvbXB0czogQXJyYXk8e3Byb21wdDogc3RyaW5nOyBlY2hvOiBib29sZWFuO30+LFxuICAgICAgZmluaXNoOiAoYW5zd2VyczogQXJyYXk8c3RyaW5nPikgPT4gdm9pZCxcbiAgICApID0+IHtcbiAgICAgIGludmFyaWFudChjb25uZWN0aW9uVHJhY2tlcik7XG4gICAgICBjb25uZWN0aW9uVHJhY2tlci50cmFja1Byb21wdFl1YmlrZXlJbnB1dCgpO1xuICAgICAgZGVsZWdhdGUub25LZXlib2FyZEludGVyYWN0aXZlKFxuICAgICAgICBuYW1lLFxuICAgICAgICBpbnN0cnVjdGlvbnMsXG4gICAgICAgIGluc3RydWN0aW9uc0xhbmcsXG4gICAgICAgIHByb21wdHMsXG4gICAgICAgIChhbnN3ZXJzKSA9PiB7XG4gICAgICAgICAgaW52YXJpYW50KGNvbm5lY3Rpb25UcmFja2VyKTtcbiAgICAgICAgICBjb25uZWN0aW9uVHJhY2tlci50cmFja0ZpbmlzaFl1YmlrZXlJbnB1dCgpO1xuICAgICAgICAgIGZpbmlzaChhbnN3ZXJzKTtcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSxcbiAgICBvbldpbGxDb25uZWN0OiAoY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4ge1xuICAgICAgY29ubmVjdGlvblRyYWNrZXIgPSBuZXcgQ29ubmVjdGlvblRyYWNrZXIoY29uZmlnKTtcbiAgICAgIGRlbGVnYXRlLm9uV2lsbENvbm5lY3QoY29uZmlnKTtcbiAgICB9LFxuICAgIG9uRGlkQ29ubmVjdDogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24sIGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IHtcbiAgICAgIGludmFyaWFudChjb25uZWN0aW9uVHJhY2tlcik7XG4gICAgICBjb25uZWN0aW9uVHJhY2tlci50cmFja1N1Y2Nlc3MoKTtcbiAgICAgIGRlbGVnYXRlLm9uRGlkQ29ubmVjdChjb25uZWN0aW9uLCBjb25maWcpO1xuICAgIH0sXG4gICAgb25FcnJvcjogKFxuICAgICAgZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsXG4gICAgICBlcnJvcjogRXJyb3IsXG4gICAgICBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxuICAgICkgPT4ge1xuICAgICAgaW52YXJpYW50KGNvbm5lY3Rpb25UcmFja2VyKTtcbiAgICAgIGNvbm5lY3Rpb25UcmFja2VyLnRyYWNrRmFpbHVyZShlcnJvcik7XG4gICAgICBkZWxlZ2F0ZS5vbkVycm9yKGVycm9yVHlwZSwgZXJyb3IsIGNvbmZpZyk7XG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==