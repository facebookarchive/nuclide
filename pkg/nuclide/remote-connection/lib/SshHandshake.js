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
          clientKey: this._clientKey
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
            cwd: _this2._config.cwd
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

/** Invoked when server requests keyboard interaction */

/** Invoked when trying to connect */

/** Invoked when connection is sucessful */

/** Invoked when connection is fails */
//# sourceMappingURL=data:application/json;base64,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QUM7QUFDN0IsdUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDakMsY0FBUSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDM0M7QUFDRCxXQUFPLEVBQUUsaUJBQ1AsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ0g7QUFDSCxlQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM3Qix1QkFBaUIsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pELGNBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztLQUM1QztHQUNGLENBQUM7Q0FDSCIsImZpbGUiOiJTc2hIYW5kc2hha2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgQ29ubmVjdGlvblRyYWNrZXIgZnJvbSAnLi9Db25uZWN0aW9uVHJhY2tlcic7XG5pbXBvcnQgdHlwZSB7UmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb259IGZyb20gJy4vUmVtb3RlQ29ubmVjdGlvbic7XG5cbmNvbnN0IFNzaENvbm5lY3Rpb24gPSByZXF1aXJlKCdzc2gyJykuQ2xpZW50O1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcy1wbHVzJyk7XG5jb25zdCBuZXQgPSByZXF1aXJlKCduZXQnKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG5jb25zdCB7UmVtb3RlQ29ubmVjdGlvbn0gPSByZXF1aXJlKCcuL1JlbW90ZUNvbm5lY3Rpb24nKTtcbmNvbnN0IHtmc1Byb21pc2UsIHByb21pc2VzfSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKTtcblxuLy8gU3luYyB3b3JkIGFuZCByZWdleCBwYXR0ZXJuIGZvciBwYXJzaW5nIGNvbW1hbmQgc3Rkb3V0LlxuY29uc3QgUkVBRFlfVElNRU9VVF9NUyA9IDYwICogMTAwMDtcblxuZXhwb3J0IHR5cGUgU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24gPSB7XG4gIGhvc3Q6IHN0cmluZzsgLy8gaG9zdCBudWNsaWRlIHNlcnZlciBpcyBydW5uaW5nIG9uXG4gIHNzaFBvcnQ6IG51bWJlcjsgLy8gc3NoIHBvcnQgb2YgaG9zdCBudWNsaWRlIHNlcnZlciBpcyBydW5uaW5nIG9uXG4gIHVzZXJuYW1lOiBzdHJpbmc7IC8vIHVzZXJuYW1lIHRvIGF1dGhlbnRpY2F0ZSBhc1xuICBwYXRoVG9Qcml2YXRlS2V5OiBzdHJpbmc7IC8vIFRoZSBwYXRoIHRvIHByaXZhdGUga2V5XG4gIHJlbW90ZVNlcnZlckNvbW1hbmQ6IHN0cmluZzsgLy8gQ29tbWFuZCB0byB1c2UgdG8gc3RhcnQgc2VydmVyXG4gIGN3ZDogc3RyaW5nOyAvLyBQYXRoIHRvIHJlbW90ZSBkaXJlY3RvcnkgdXNlciBzaG91bGQgc3RhcnQgaW4gdXBvbiBjb25uZWN0aW9uLlxuICBhdXRoTWV0aG9kOiBzdHJpbmc7IC8vIFdoaWNoIG9mIHRoZSBhdXRoZW50aWNhdGlvbiBtZXRob2RzIGluIGBTdXBwb3J0ZWRNZXRob2RzYCB0byB1c2UuXG4gIHBhc3N3b3JkOiBzdHJpbmc7IC8vIGZvciBzaW1wbGUgcGFzc3dvcmQtYmFzZWQgYXV0aGVudGljYXRpb25cbn1cblxuY29uc3QgU3VwcG9ydGVkTWV0aG9kcyA9IHtcbiAgU1NMX0FHRU5UOiAnU1NMX0FHRU5UJyxcbiAgUEFTU1dPUkQ6ICdQQVNTV09SRCcsXG4gIFBSSVZBVEVfS0VZOiAnUFJJVkFURV9LRVknLFxufTtcblxuY29uc3QgRXJyb3JUeXBlID0ge1xuICBVTktOT1dOOiAnVU5LTk9XTicsXG4gIEhPU1RfTk9UX0ZPVU5EOiAnSE9TVF9OT1RfRk9VTkQnLFxuICBDQU5UX1JFQURfUFJJVkFURV9LRVk6ICdDQU5UX1JFQURfUFJJVkFURV9LRVknLFxuICBTU0hfQ09OTkVDVF9USU1FT1VUOiAnU1NIX0NPTk5FQ1RfVElNRU9VVCcsXG4gIFNTSF9DT05ORUNUX0ZBSUxFRDogJ1NTSF9DT05ORUNUX0ZBSUxFRCcsXG4gIFNTSF9BVVRIRU5USUNBVElPTjogJ1NTSF9BVVRIRU5USUNBVElPTicsXG4gIERJUkVDVE9SWV9OT1RfRk9VTkQ6ICdESVJFQ1RPUllfTk9UX0ZPVU5EJyxcbiAgU0VSVkVSX1NUQVJUX0ZBSUxFRDogJ1NFUlZFUl9TVEFSVF9GQUlMRUQnLFxuICBTRVJWRVJfVkVSU0lPTl9NSVNNQVRDSDogJ1NFUlZFUl9WRVJTSU9OX01JU01BVENIJyxcbn07XG5cbmV4cG9ydCB0eXBlIFNzaEhhbmRzaGFrZUVycm9yVHlwZSA9ICdVTktOT1dOJyB8ICdIT1NUX05PVF9GT1VORCcgfCAnQ0FOVF9SRUFEX1BSSVZBVEVfS0VZJyB8XG4gICdTU0hfQ09OTkVDVF9USU1FT1VUJyB8ICdTU0hfQ09OTkVDVF9GQUlMRUQnIHwgJ1NTSF9BVVRIRU5USUNBVElPTicgfCAnRElSRUNUT1JZX05PVF9GT1VORCcgfFxuICAnU0VSVkVSX1NUQVJUX0ZBSUxFRCcgfCAnU0VSVkVSX1ZFUlNJT05fTUlTTUFUQ0gnO1xuXG50eXBlIFNzaENvbm5lY3Rpb25FcnJvckxldmVsID0gJ2NsaWVudC10aW1lb3V0JyB8ICdjbGllbnQtc29ja2V0JyB8ICdwcm90b2NhbCcgfFxuICAnY2xpZW50LWF1dGhlbnRpY2F0aW9uJyB8ICdhZ2VudCcgfCAnY2xpZW50LWRucyc7XG5cbi8qKlxuICogVGhlIHNlcnZlciBpcyBhc2tpbmcgZm9yIHJlcGxpZXMgdG8gdGhlIGdpdmVuIHByb21wdHMgZm9yXG4gKiBrZXlib2FyZC1pbnRlcmFjdGl2ZSB1c2VyIGF1dGhlbnRpY2F0aW9uLlxuICpcbiAqIEBwYXJhbSBuYW1lIGlzIGdlbmVyYWxseSB3aGF0IHlvdSdkIHVzZSBhc1xuICogICAgIGEgd2luZG93IHRpdGxlIChmb3IgR1VJIGFwcHMpLlxuICogQHBhcmFtIHByb21wdHMgaXMgYW4gYXJyYXkgb2YgeyBwcm9tcHQ6ICdQYXNzd29yZDogJyxcbiAqICAgICBlY2hvOiBmYWxzZSB9IHN0eWxlIG9iamVjdHMgKGhlcmUgZWNobyBpbmRpY2F0ZXMgd2hldGhlciB1c2VyIGlucHV0XG4gKiAgICAgc2hvdWxkIGJlIGRpc3BsYXllZCBvbiB0aGUgc2NyZWVuKS5cbiAqIEBwYXJhbSBmaW5pc2g6IFRoZSBhbnN3ZXJzIGZvciBhbGwgcHJvbXB0cyBtdXN0IGJlIHByb3ZpZGVkIGFzIGFuXG4gKiAgICAgYXJyYXkgb2Ygc3RyaW5ncyBhbmQgcGFzc2VkIHRvIGZpbmlzaCB3aGVuIHlvdSBhcmUgcmVhZHkgdG8gY29udGludWUuIE5vdGU6XG4gKiAgICAgSXQncyBwb3NzaWJsZSBmb3IgdGhlIHNlcnZlciB0byBjb21lIGJhY2sgYW5kIGFzayBtb3JlIHF1ZXN0aW9ucy5cbiAqL1xuZXhwb3J0IHR5cGUgS2V5Ym9hcmRJbnRlcmFjdGl2ZUNhbGxiYWNrID0gKFxuICBuYW1lOiBzdHJpbmcsXG4gIGluc3RydWN0aW9uczogc3RyaW5nLFxuICBpbnN0cnVjdGlvbnNMYW5nOiBzdHJpbmcsXG4gIHByb21wdHM6IEFycmF5PHtwcm9tcHQ6IHN0cmluZzsgZWNobzogYm9vbGVhbjt9PixcbiAgZmluaXNoOiAoYW5zd2VyczogQXJyYXk8c3RyaW5nPikgPT4gdm9pZCkgID0+IHZvaWQ7XG5cbmV4cG9ydCB0eXBlIFNzaENvbm5lY3Rpb25EZWxlZ2F0ZSA9IHtcbiAgLyoqIEludm9rZWQgd2hlbiBzZXJ2ZXIgcmVxdWVzdHMga2V5Ym9hcmQgaW50ZXJhY3Rpb24gKi9cbiAgb25LZXlib2FyZEludGVyYWN0aXZlOiBLZXlib2FyZEludGVyYWN0aXZlQ2FsbGJhY2s7XG4gIC8qKiBJbnZva2VkIHdoZW4gdHJ5aW5nIHRvIGNvbm5lY3QgKi9cbiAgb25XaWxsQ29ubmVjdDogKGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IHZvaWQ7XG4gIC8qKiBJbnZva2VkIHdoZW4gY29ubmVjdGlvbiBpcyBzdWNlc3NmdWwgKi9cbiAgb25EaWRDb25uZWN0OiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbiwgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4gdm9pZDtcbiAgLyoqIEludm9rZWQgd2hlbiBjb25uZWN0aW9uIGlzIGZhaWxzICovXG4gIG9uRXJyb3I6XG4gICAgKGVycm9yVHlwZTogU3NoSGFuZHNoYWtlRXJyb3JUeXBlLCBlcnJvcjogRXJyb3IsIGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IHZvaWQ7XG59O1xuXG5jb25zdCBTc2hDb25uZWN0aW9uRXJyb3JMZXZlbE1hcDogTWFwPFNzaENvbm5lY3Rpb25FcnJvckxldmVsLCBTc2hIYW5kc2hha2VFcnJvclR5cGU+ID0gbmV3IE1hcChbXG4gIFsnY2xpZW50LXRpbWVvdXQnLCBFcnJvclR5cGUuU1NIX0NPTk5FQ1RfVElNRU9VVF0sXG4gIFsnY2xpZW50LXNvY2tldCcsIEVycm9yVHlwZS5TU0hfQ09OTkVDVF9GQUlMRURdLFxuICBbJ3Byb3RvY2FsJywgRXJyb3JUeXBlLlNTSF9DT05ORUNUX0ZBSUxFRF0sXG4gIFsnY2xpZW50LWF1dGhlbnRpY2F0aW9uJywgRXJyb3JUeXBlLlNTSF9BVVRIRU5USUNBVElPTl0sXG4gIFsnYWdlbnQnLCBFcnJvclR5cGUuU1NIX0FVVEhFTlRJQ0FUSU9OXSxcbiAgWydjbGllbnQtZG5zJywgRXJyb3JUeXBlLlNTSF9BVVRIRU5USUNBVElPTl0sXG5dKTtcblxuZXhwb3J0IGNsYXNzIFNzaEhhbmRzaGFrZSB7XG4gIF9kZWxlZ2F0ZTogU3NoQ29ubmVjdGlvbkRlbGVnYXRlO1xuICBfY29ubmVjdGlvbjogU3NoQ29ubmVjdGlvbjtcbiAgX2NvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb247XG4gIF9mb3J3YXJkaW5nU2VydmVyOiBuZXQuU2VydmVyO1xuICBfcmVtb3RlSG9zdDogP3N0cmluZztcbiAgX3JlbW90ZVBvcnQ6ID9udW1iZXI7XG4gIF9jZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlOiBCdWZmZXI7XG4gIF9jbGllbnRDZXJ0aWZpY2F0ZTogQnVmZmVyO1xuICBfY2xpZW50S2V5OiBCdWZmZXI7XG4gIHN0YXRpYyBTdXBwb3J0ZWRNZXRob2RzOiB0eXBlb2YgU3VwcG9ydGVkTWV0aG9kcztcblxuICBzdGF0aWMgRXJyb3JUeXBlID0gRXJyb3JUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKGRlbGVnYXRlOiBTc2hDb25uZWN0aW9uRGVsZWdhdGUsIGNvbm5lY3Rpb24/OiBTc2hDb25uZWN0aW9uKSB7XG4gICAgdGhpcy5fZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcbiAgICB0aGlzLl9jb25uZWN0aW9uID0gY29ubmVjdGlvbiA/IGNvbm5lY3Rpb24gOiBuZXcgU3NoQ29ubmVjdGlvbigpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24ub24oJ3JlYWR5JywgdGhpcy5fb25Db25uZWN0LmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24ub24oJ2Vycm9yJywgdGhpcy5fb25Tc2hDb25uZWN0aW9uRXJyb3IuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5vbigna2V5Ym9hcmQtaW50ZXJhY3RpdmUnLCB0aGlzLl9vbktleWJvYXJkSW50ZXJhY3RpdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBfd2lsbENvbm5lY3QoKTogdm9pZCB7XG4gICAgdGhpcy5fZGVsZWdhdGUub25XaWxsQ29ubmVjdCh0aGlzLl9jb25maWcpO1xuICB9XG5cbiAgX2RpZENvbm5lY3QoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2RlbGVnYXRlLm9uRGlkQ29ubmVjdChjb25uZWN0aW9uLCB0aGlzLl9jb25maWcpO1xuICB9XG5cbiAgX2Vycm9yKG1lc3NhZ2U6IHN0cmluZywgZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsIGVycm9yOiBFcnJvcik6IHZvaWQge1xuICAgIGxvZ2dlci5lcnJvcihgU3NoSGFuZHNoYWtlIGZhaWxlZDogJHtlcnJvclR5cGV9LCAke21lc3NhZ2V9YCwgZXJyb3IpO1xuICAgIHRoaXMuX2RlbGVnYXRlLm9uRXJyb3IoZXJyb3JUeXBlLCBlcnJvciwgdGhpcy5fY29uZmlnKTtcbiAgfVxuXG4gIF9vblNzaENvbm5lY3Rpb25FcnJvcihlcnJvcjogRXJyb3IpOiB2b2lkIHtcbiAgICBjb25zdCBlcnJvckxldmVsID0gKChlcnJvcjogT2JqZWN0KS5sZXZlbDogU3NoQ29ubmVjdGlvbkVycm9yTGV2ZWwpO1xuICAgIGNvbnN0IGVycm9yVHlwZSA9IFNzaENvbm5lY3Rpb25FcnJvckxldmVsTWFwLmdldChlcnJvckxldmVsKSB8fCBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlVOS05PV047XG4gICAgdGhpcy5fZXJyb3IoJ1NzaCBjb25uZWN0aW9uIGZhaWxlZC4nLCBlcnJvclR5cGUsIGVycm9yKTtcbiAgfVxuXG4gIGFzeW5jIGNvbm5lY3QoY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbik6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl93aWxsQ29ubmVjdCgpO1xuXG4gICAgY29uc3QgZXhpc3RpbmdDb25uZWN0aW9uID0gUmVtb3RlQ29ubmVjdGlvblxuICAgICAgLmdldEJ5SG9zdG5hbWVBbmRQYXRoKHRoaXMuX2NvbmZpZy5ob3N0LCB0aGlzLl9jb25maWcuY3dkKTtcblxuICAgIGlmIChleGlzdGluZ0Nvbm5lY3Rpb24pIHtcbiAgICAgIHRoaXMuX2RpZENvbm5lY3QoZXhpc3RpbmdDb25uZWN0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgUmVtb3RlQ29ubmVjdGlvbi5jcmVhdGVDb25uZWN0aW9uQnlTYXZlZENvbmZpZyhcbiAgICAgIHRoaXMuX2NvbmZpZy5ob3N0LFxuICAgICAgdGhpcy5fY29uZmlnLmN3ZCxcbiAgICApO1xuXG4gICAgaWYgKGNvbm5lY3Rpb24pIHtcbiAgICAgIHRoaXMuX2RpZENvbm5lY3QoY29ubmVjdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge2xvb2t1cFByZWZlcklwdjZ9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpLmRuc1V0aWxzO1xuICAgIGxldCBhZGRyZXNzID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgYWRkcmVzcyA9IGF3YWl0IGxvb2t1cFByZWZlcklwdjYoY29uZmlnLmhvc3QpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAnRmFpbGVkIHRvIHJlc29sdmUgRE5TLicsXG4gICAgICAgIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuSE9TVF9OT1RfRk9VTkQsXG4gICAgICAgIGUsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuYXV0aE1ldGhvZCA9PT0gU3VwcG9ydGVkTWV0aG9kcy5TU0xfQUdFTlQpIHtcbiAgICAgIC8vIFBvaW50IHRvIHNzaC1hZ2VudCdzIHNvY2tldCBmb3Igc3NoLWFnZW50LWJhc2VkIGF1dGhlbnRpY2F0aW9uLlxuICAgICAgbGV0IGFnZW50ID0gcHJvY2Vzcy5lbnZbJ1NTSF9BVVRIX1NPQ0snXTtcbiAgICAgIGlmICghYWdlbnQgJiYgL153aW4vLnRlc3QocHJvY2Vzcy5wbGF0Zm9ybSkpIHtcbiAgICAgICAgLy8gIzEwMDogT24gV2luZG93cywgZmFsbCBiYWNrIHRvIHBhZ2VhbnQuXG4gICAgICAgIGFnZW50ID0gJ3BhZ2VhbnQnO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29ubmVjdGlvbi5jb25uZWN0KHtcbiAgICAgICAgaG9zdDogYWRkcmVzcyxcbiAgICAgICAgcG9ydDogY29uZmlnLnNzaFBvcnQsXG4gICAgICAgIHVzZXJuYW1lOiBjb25maWcudXNlcm5hbWUsXG4gICAgICAgIGFnZW50LFxuICAgICAgICB0cnlLZXlib2FyZDogdHJ1ZSxcbiAgICAgICAgcmVhZHlUaW1lb3V0OiBSRUFEWV9USU1FT1VUX01TLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChjb25maWcuYXV0aE1ldGhvZCA9PT0gU3VwcG9ydGVkTWV0aG9kcy5QQVNTV09SRCkge1xuICAgICAgICAvLyBXaGVuIHRoZSB1c2VyIGNob29zZXMgcGFzc3dvcmQtYmFzZWQgYXV0aGVudGljYXRpb24sIHdlIHNwZWNpZnlcbiAgICAgICAgLy8gdGhlIGNvbmZpZyBhcyBmb2xsb3dzIHNvIHRoYXQgaXQgdHJpZXMgc2ltcGxlIHBhc3N3b3JkIGF1dGggYW5kXG4gICAgICAgIC8vIGZhaWxpbmcgdGhhdCBpdCBmYWxscyB0aHJvdWdoIHRvIHRoZSBrZXlib2FyZCBpbnRlcmFjdGl2ZSBwYXRoXG4gICAgICB0aGlzLl9jb25uZWN0aW9uLmNvbm5lY3Qoe1xuICAgICAgICBob3N0OiBhZGRyZXNzLFxuICAgICAgICBwb3J0OiBjb25maWcuc3NoUG9ydCxcbiAgICAgICAgdXNlcm5hbWU6IGNvbmZpZy51c2VybmFtZSxcbiAgICAgICAgcGFzc3dvcmQ6IGNvbmZpZy5wYXNzd29yZCxcbiAgICAgICAgdHJ5S2V5Ym9hcmQ6IHRydWUsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5hdXRoTWV0aG9kID09PSBTdXBwb3J0ZWRNZXRob2RzLlBSSVZBVEVfS0VZKSB7XG4gICAgICAvLyBXZSB1c2UgZnMtcGx1cydzIG5vcm1hbGl6ZSgpIGZ1bmN0aW9uIGJlY2F1c2UgaXQgd2lsbCBleHBhbmQgdGhlIH4sIGlmIHByZXNlbnQuXG4gICAgICBjb25zdCBleHBhbmRlZFBhdGggPSBmcy5ub3JtYWxpemUoY29uZmlnLnBhdGhUb1ByaXZhdGVLZXkpO1xuICAgICAgbGV0IHByaXZhdGVLZXk6IHN0cmluZyA9IChudWxsIDogYW55KTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHByaXZhdGVLZXkgPSBhd2FpdCBmc1Byb21pc2UucmVhZEZpbGUoZXhwYW5kZWRQYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgYEZhaWxlZCB0byByZWFkIHByaXZhdGUga2V5YCxcbiAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLkNBTlRfUkVBRF9QUklWQVRFX0tFWSxcbiAgICAgICAgICBlLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29ubmVjdGlvbi5jb25uZWN0KHtcbiAgICAgICAgaG9zdDogYWRkcmVzcyxcbiAgICAgICAgcG9ydDogY29uZmlnLnNzaFBvcnQsXG4gICAgICAgIHVzZXJuYW1lOiBjb25maWcudXNlcm5hbWUsXG4gICAgICAgIHByaXZhdGVLZXksXG4gICAgICAgIHRyeUtleWJvYXJkOiB0cnVlLFxuICAgICAgICByZWFkeVRpbWVvdXQ6IFJFQURZX1RJTUVPVVRfTVMsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5lbmQoKTtcbiAgfVxuXG4gIF9vbktleWJvYXJkSW50ZXJhY3RpdmUoXG4gICAgICBuYW1lOiBzdHJpbmcsXG4gICAgICBpbnN0cnVjdGlvbnM6IHN0cmluZyxcbiAgICAgIGluc3RydWN0aW9uc0xhbmc6IHN0cmluZyxcbiAgICAgIHByb21wdHM6IEFycmF5PHtwcm9tcHQ6IHN0cmluZzsgZWNobzogYm9vbGVhbjt9PixcbiAgICAgIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZS5vbktleWJvYXJkSW50ZXJhY3RpdmUobmFtZSwgaW5zdHJ1Y3Rpb25zLCBpbnN0cnVjdGlvbnNMYW5nLCBwcm9tcHRzLCBmaW5pc2gpO1xuICB9XG5cbiAgX2ZvcndhcmRTb2NrZXQoc29ja2V0OiBuZXQuU29ja2V0KTogdm9pZCB7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5mb3J3YXJkT3V0KFxuICAgICAgc29ja2V0LnJlbW90ZUFkZHJlc3MsXG4gICAgICBzb2NrZXQucmVtb3RlUG9ydCxcbiAgICAgICdsb2NhbGhvc3QnLFxuICAgICAgdGhpcy5fcmVtb3RlUG9ydCxcbiAgICAgIChlcnIsIHN0cmVhbSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgc29ja2V0LmVuZCgpO1xuICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzb2NrZXQucGlwZShzdHJlYW0pO1xuICAgICAgICBzdHJlYW0ucGlwZShzb2NrZXQpO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBfdXBkYXRlU2VydmVySW5mbyhzZXJ2ZXJJbmZvOiB7fSkge1xuICAgIGludmFyaWFudChzZXJ2ZXJJbmZvLnBvcnQpO1xuICAgIHRoaXMuX3JlbW90ZVBvcnQgPSBzZXJ2ZXJJbmZvLnBvcnQ7XG4gICAgdGhpcy5fcmVtb3RlSG9zdCA9IGAke3NlcnZlckluZm8uaG9zdG5hbWUgfHwgdGhpcy5fY29uZmlnLmhvc3R9YDtcbiAgICAvLyBCZWNhdXNlIHRoZSB2YWx1ZSBmb3IgdGhlIEluaXRpYWwgRGlyZWN0b3J5IHRoYXQgdGhlIHVzZXIgc3VwcGxpZWQgbWF5IGhhdmVcbiAgICAvLyBiZWVuIGEgc3ltbGluayB0aGF0IHdhcyByZXNvbHZlZCBieSB0aGUgc2VydmVyLCBvdmVyd3JpdGUgdGhlIG9yaWdpbmFsIGBjd2RgXG4gICAgLy8gdmFsdWUgd2l0aCB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gICAgaW52YXJpYW50KHNlcnZlckluZm8ud29ya3NwYWNlKTtcbiAgICB0aGlzLl9jb25maWcuY3dkID0gc2VydmVySW5mby53b3Jrc3BhY2U7XG4gICAgaW52YXJpYW50KHNlcnZlckluZm8uY2EpO1xuICAgIHRoaXMuX2NlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUgPSBzZXJ2ZXJJbmZvLmNhO1xuICAgIGludmFyaWFudChzZXJ2ZXJJbmZvLmNlcnQpO1xuICAgIHRoaXMuX2NsaWVudENlcnRpZmljYXRlID0gc2VydmVySW5mby5jZXJ0O1xuICAgIGludmFyaWFudChzZXJ2ZXJJbmZvLmtleSk7XG4gICAgdGhpcy5fY2xpZW50S2V5ID0gc2VydmVySW5mby5rZXk7XG4gIH1cblxuICBfaXNTZWN1cmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKHRoaXMuX2NlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGVcbiAgICAgICAgJiYgdGhpcy5fY2xpZW50Q2VydGlmaWNhdGVcbiAgICAgICAgJiYgdGhpcy5fY2xpZW50S2V5KTtcbiAgfVxuXG4gIGFzeW5jIF9zdGFydFJlbW90ZVNlcnZlcigpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgc3RkT3V0ID0gJyc7XG4gICAgICBjb25zdCByZW1vdGVUZW1wRmlsZSA9IGAvdG1wL251Y2xpZGUtc3NoaGFuZHNoYWtlLSR7TWF0aC5yYW5kb20oKX1gO1xuICAgICAgLy9UT0RPOiBlc2NhcGUgYW55IHNpbmdsZSBxdW90ZXNcbiAgICAgIC8vVE9ETzogdGhlIHRpbWVvdXQgdmFsdWUgc2hhbGwgYmUgY29uZmlndXJhYmxlIHVzaW5nIC5qc29uIGZpbGUgdG9vICh0NjkwNDY5MSkuXG4gICAgICBjb25zdCBjbWQgPSBgJHt0aGlzLl9jb25maWcucmVtb3RlU2VydmVyQ29tbWFuZH0gLS13b3Jrc3BhY2U9JHt0aGlzLl9jb25maWcuY3dkfWBcbiAgICAgICAgKyBgIC0tY29tbW9uLW5hbWU9JHt0aGlzLl9jb25maWcuaG9zdH0gLS1qc29uLW91dHB1dC1maWxlPSR7cmVtb3RlVGVtcEZpbGV9IC10IDYwYDtcblxuICAgICAgdGhpcy5fY29ubmVjdGlvbi5leGVjKGNtZCwge3B0eToge3Rlcm06ICdudWNsaWRlJ319LCAoZXJyLCBzdHJlYW0pID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHRoaXMuX29uU3NoQ29ubmVjdGlvbkVycm9yKGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIHN0cmVhbS5vbignY2xvc2UnLCBhc3luYyAoY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAgICAgLy8gTm90ZTogdGhpcyBjb2RlIGlzIHByb2JhYmx5IHRoZSBjb2RlIGZyb20gdGhlIGNoaWxkIHNoZWxsIGlmIG9uZVxuICAgICAgICAgIC8vIGlzIGluIHVzZS5cbiAgICAgICAgICBpZiAoY29kZSA9PT0gMCkge1xuICAgICAgICAgICAgLy8gU29tZSBzZXJ2ZXJzIGhhdmUgbWF4IGNoYW5uZWxzIHNldCB0byAxLCBzbyBhZGQgYSBkZWxheSB0byBlbnN1cmVcbiAgICAgICAgICAgIC8vIHRoZSBvbGQgY2hhbm5lbCBoYXMgYmVlbiBjbGVhbmVkIHVwIG9uIHRoZSBzZXJ2ZXIuXG4gICAgICAgICAgICAvLyBUT0RPKGhhbnNvbncpOiBJbXBsZW1lbnQgYSBwcm9wZXIgcmV0cnkgbWVjaGFuaXNtLlxuICAgICAgICAgICAgLy8gQnV0IGZpcnN0LCB3ZSBoYXZlIHRvIGNsZWFuIHVwIHRoaXMgY2FsbGJhY2sgaGVsbC5cbiAgICAgICAgICAgIGF3YWl0IHByb21pc2VzLmF3YWl0TWlsbGlTZWNvbmRzKDEwMCk7XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLnNmdHAoYXN5bmMgKGVycm9yLCBzZnRwKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgICAgICAgICAgJ0ZhaWxlZCB0byBzdGFydCBzZnRwIGNvbm5lY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5TRVJWRVJfU1RBUlRfRkFJTEVELFxuICAgICAgICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgbG9jYWxUZW1wRmlsZSA9IGF3YWl0IGZzUHJvbWlzZS50ZW1wZmlsZSgpO1xuICAgICAgICAgICAgICBzZnRwLmZhc3RHZXQocmVtb3RlVGVtcEZpbGUsIGxvY2FsVGVtcEZpbGUsIGFzeW5jIHNmdHBFcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgc2Z0cC5lbmQoKTtcbiAgICAgICAgICAgICAgICBpZiAoc2Z0cEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZCB0byB0cmFuc2ZlciBzZXJ2ZXIgc3RhcnQgaW5mb3JtYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNFUlZFUl9TVEFSVF9GQUlMRUQsXG4gICAgICAgICAgICAgICAgICAgIHNmdHBFcnJvcixcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IHNlcnZlckluZm86IGFueSA9IG51bGw7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VydmVySW5mb0pzb24gPSBhd2FpdCBmc1Byb21pc2UucmVhZEZpbGUobG9jYWxUZW1wRmlsZSk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIHNlcnZlckluZm8gPSBKU09OLnBhcnNlKHNlcnZlckluZm9Kc29uKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgJ01hbGZvcm1lZCBzZXJ2ZXIgc3RhcnQgaW5mb3JtYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNFUlZFUl9TVEFSVF9GQUlMRUQsXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvcihzZXJ2ZXJJbmZvSnNvbiksXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghc2VydmVySW5mby5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgJ1JlbW90ZSBzZXJ2ZXIgZmFpbGVkIHRvIHN0YXJ0JyxcbiAgICAgICAgICAgICAgICAgICAgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5TRVJWRVJfU1RBUlRfRkFJTEVELFxuICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3Ioc2VydmVySW5mby5sb2dzKSxcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFzZXJ2ZXJJbmZvLndvcmtzcGFjZSkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICdDb3VsZCBub3QgZmluZCBkaXJlY3RvcnknLFxuICAgICAgICAgICAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLkRJUkVDVE9SWV9OT1RfRk9VTkQsXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvcihzZXJ2ZXJJbmZvLmxvZ3MpLFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgc2VydmVyIGluZm8gdGhhdCBpcyBuZWVkZWQgZm9yIHNldHRpbmcgdXAgY2xpZW50LlxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNlcnZlckluZm8oc2VydmVySW5mbyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgICAgICAnUmVtb3RlIHNoZWxsIGV4ZWN1dGlvbiBmYWlsZWQnLFxuICAgICAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlVOS05PV04sXG4gICAgICAgICAgICAgIG5ldyBFcnJvcihzdGRPdXQpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgICAgc3RkT3V0ICs9IGRhdGE7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfb25Db25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuX3N0YXJ0UmVtb3RlU2VydmVyKCkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29ubmVjdCA9IGFzeW5jIChjb25maWc6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB7XG4gICAgICBsZXQgY29ubmVjdGlvbiA9IG51bGw7XG4gICAgICB0cnkge1xuICAgICAgICBjb25uZWN0aW9uID0gYXdhaXQgUmVtb3RlQ29ubmVjdGlvbi5maW5kT3JDcmVhdGUoY29uZmlnKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgJ0Nvbm5lY3Rpb24gY2hlY2sgZmFpbGVkJyxcbiAgICAgICAgICBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNFUlZFUl9WRVJTSU9OX01JU01BVENILFxuICAgICAgICAgIGUsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAoY29ubmVjdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2RpZENvbm5lY3QoY29ubmVjdGlvbik7XG4gICAgICAgIC8vIElmIHdlIGFyZSBzZWN1cmUgdGhlbiB3ZSBkb24ndCBuZWVkIHRoZSBzc2ggdHVubmVsLlxuICAgICAgICBpZiAodGhpcy5faXNTZWN1cmUoKSkge1xuICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uZW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVXNlIGFuIHNzaCB0dW5uZWwgaWYgc2VydmVyIGlzIG5vdCBzZWN1cmVcbiAgICBpZiAodGhpcy5faXNTZWN1cmUoKSkge1xuICAgICAgaW52YXJpYW50KHRoaXMuX3JlbW90ZUhvc3QpO1xuICAgICAgaW52YXJpYW50KHRoaXMuX3JlbW90ZVBvcnQpO1xuICAgICAgY29ubmVjdCh7XG4gICAgICAgIGhvc3Q6IHRoaXMuX3JlbW90ZUhvc3QsXG4gICAgICAgIHBvcnQ6IHRoaXMuX3JlbW90ZVBvcnQsXG4gICAgICAgIGN3ZDogdGhpcy5fY29uZmlnLmN3ZCxcbiAgICAgICAgY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZTogdGhpcy5fY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSxcbiAgICAgICAgY2xpZW50Q2VydGlmaWNhdGU6IHRoaXMuX2NsaWVudENlcnRpZmljYXRlLFxuICAgICAgICBjbGllbnRLZXk6IHRoaXMuX2NsaWVudEtleSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvKiAkRmxvd0lzc3VlIHQ5MjEyMzc4ICovXG4gICAgICB0aGlzLl9mb3J3YXJkaW5nU2VydmVyID0gbmV0LmNyZWF0ZVNlcnZlcihzb2NrID0+IHtcbiAgICAgICAgdGhpcy5fZm9yd2FyZFNvY2tldChzb2NrKTtcbiAgICAgIH0pLmxpc3RlbigwLCAnbG9jYWxob3N0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBsb2NhbFBvcnQgPSB0aGlzLl9nZXRMb2NhbFBvcnQoKTtcbiAgICAgICAgaW52YXJpYW50KGxvY2FsUG9ydCk7XG4gICAgICAgIGNvbm5lY3Qoe1xuICAgICAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgICAgICAgIHBvcnQ6IGxvY2FsUG9ydCxcbiAgICAgICAgICBjd2Q6IHRoaXMuX2NvbmZpZy5jd2QsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgX2dldExvY2FsUG9ydCgpOiA/bnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZm9yd2FyZGluZ1NlcnZlciA/IHRoaXMuX2ZvcndhcmRpbmdTZXJ2ZXIuYWRkcmVzcygpLnBvcnQgOiBudWxsO1xuICB9XG5cbiAgZ2V0Q29uZmlnKCk6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICB9XG59XG5cblNzaEhhbmRzaGFrZS5TdXBwb3J0ZWRNZXRob2RzID0gU3VwcG9ydGVkTWV0aG9kcztcblxuZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlU3NoQ29ubmVjdGlvbkRlbGVnYXRlV2l0aFRyYWNraW5nKFxuICBkZWxlZ2F0ZTogU3NoQ29ubmVjdGlvbkRlbGVnYXRlLFxuKTogU3NoQ29ubmVjdGlvbkRlbGVnYXRlIHtcbiAgbGV0IGNvbm5lY3Rpb25UcmFja2VyO1xuXG4gIHJldHVybiB7XG4gICAgb25LZXlib2FyZEludGVyYWN0aXZlOiAoXG4gICAgICBuYW1lOiBzdHJpbmcsXG4gICAgICBpbnN0cnVjdGlvbnM6IHN0cmluZyxcbiAgICAgIGluc3RydWN0aW9uc0xhbmc6IHN0cmluZyxcbiAgICAgIHByb21wdHM6IEFycmF5PHtwcm9tcHQ6IHN0cmluZzsgZWNobzogYm9vbGVhbjt9PixcbiAgICAgIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IHZvaWQsXG4gICAgKSA9PiB7XG4gICAgICBpbnZhcmlhbnQoY29ubmVjdGlvblRyYWNrZXIpO1xuICAgICAgY29ubmVjdGlvblRyYWNrZXIudHJhY2tQcm9tcHRZdWJpa2V5SW5wdXQoKTtcbiAgICAgIGRlbGVnYXRlLm9uS2V5Ym9hcmRJbnRlcmFjdGl2ZShcbiAgICAgICAgbmFtZSxcbiAgICAgICAgaW5zdHJ1Y3Rpb25zLFxuICAgICAgICBpbnN0cnVjdGlvbnNMYW5nLFxuICAgICAgICBwcm9tcHRzLFxuICAgICAgICBhbnN3ZXJzID0+IHtcbiAgICAgICAgICBpbnZhcmlhbnQoY29ubmVjdGlvblRyYWNrZXIpO1xuICAgICAgICAgIGNvbm5lY3Rpb25UcmFja2VyLnRyYWNrRmluaXNoWXViaWtleUlucHV0KCk7XG4gICAgICAgICAgZmluaXNoKGFuc3dlcnMpO1xuICAgICAgICB9LFxuICAgICAgKTtcbiAgICB9LFxuICAgIG9uV2lsbENvbm5lY3Q6IChjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB7XG4gICAgICBjb25uZWN0aW9uVHJhY2tlciA9IG5ldyBDb25uZWN0aW9uVHJhY2tlcihjb25maWcpO1xuICAgICAgZGVsZWdhdGUub25XaWxsQ29ubmVjdChjb25maWcpO1xuICAgIH0sXG4gICAgb25EaWRDb25uZWN0OiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbiwgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4ge1xuICAgICAgaW52YXJpYW50KGNvbm5lY3Rpb25UcmFja2VyKTtcbiAgICAgIGNvbm5lY3Rpb25UcmFja2VyLnRyYWNrU3VjY2VzcygpO1xuICAgICAgZGVsZWdhdGUub25EaWRDb25uZWN0KGNvbm5lY3Rpb24sIGNvbmZpZyk7XG4gICAgfSxcbiAgICBvbkVycm9yOiAoXG4gICAgICBlcnJvclR5cGU6IFNzaEhhbmRzaGFrZUVycm9yVHlwZSxcbiAgICAgIGVycm9yOiBFcnJvcixcbiAgICAgIGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG4gICAgKSA9PiB7XG4gICAgICBpbnZhcmlhbnQoY29ubmVjdGlvblRyYWNrZXIpO1xuICAgICAgY29ubmVjdGlvblRyYWNrZXIudHJhY2tGYWlsdXJlKGVycm9yVHlwZSwgZXJyb3IpO1xuICAgICAgZGVsZWdhdGUub25FcnJvcihlcnJvclR5cGUsIGVycm9yLCBjb25maWcpO1xuICAgIH0sXG4gIH07XG59XG4iXX0=