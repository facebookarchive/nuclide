'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var SshConnection = require('ssh2').Client;
var fs = require('fs-plus');
var net = require('net');
var url = require('url');
var logger = require('nuclide-logging').getLogger();

var RemoteConnection = require('./RemoteConnection');
var {fsPromise} = require('nuclide-commons');

// Sync word and regex pattern for parsing command stdout.
var SYNC_WORD = 'SYNSYN';
var STDOUT_REGEX = /SYNSYN\n([\s\S]*)\nSYNSYN/;

type SshConnectionConfiguration = {
  host: string; // host nuclide server is running on
  sshPort: number; // ssh port of host nuclide server is running on
  username: string; // username to authenticate as
  pathToPrivateKey: string; // The path to private key
  remoteServerCommand: string; // Command to use to start server
  cwd: string; // Path to remote directory user should start in upon connection.
  authMethod: string; // Which of the authentication methods in `SupportedMethods` to use.
  password: string; // for simple password-based authentication
}

var SupportedMethods = {
  SSL_AGENT: 'SSL_AGENT',
  PASSWORD: 'PASSWORD',
  PRIVATE_KEY: 'PRIVATE_KEY',
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
type KeyboardInteractiveCallback = (
  name: string,
  instructions: string,
  instructionsLang: string,
  prompts: Array<{prompt: string; echo: boolean;}>,
  finish: (answers: Array<string>) => void)  => void;

type SshConnectionDelegate = {
  /** Invoked when server requests keyboard interaction */
  onKeyboardInteractive: KeyboardInteractiveCallback;
  /** Invoked when connection is sucessful */
  onConnect: (connection: RemoteConnection) => void;
  /** Invoked when connection is fails */
  onError: (error: Error, config: SshConnectionConfiguration) => void;
}

class SshHandshake {
  _delegate: SshConnectionDelegate;
  _connection: SshConnection;
  _config: SshConnectionConfiguration;
  _forwardingServer: net.Socket;
  _remoteHost: ?string;
  _remotePort: ?number;
  _certificateAuthorityCertificate: ?Buffer;
  _clientCertificate: ?Buffer;
  _clientKey: ?Buffer;
  _heartbeatNetworkAwayCount: int;
  _lastHeartbeatNotification: ?HeartbeatNotification;

  constructor(delegate: SshConnectionDelegate, connection?: SshConnection) {
    this._delegate = delegate;
    this._heartbeatNetworkAwayCount = 0;
    this._connection = connection ? connection : new SshConnection();
    this._connection.on('ready', this._onConnect.bind(this));
    this._connection.on('error', e => this._delegate.onError(e, this._config));
    this._connection.on('keyboard-interactive', this._onKeyboardInteractive.bind(this));
  }

  connect(config: SshConnectionConfiguration): void {
    var existingConnection = RemoteConnection.getByHostnameAndPath(config.host, config.cwd);
    if (existingConnection) {
      this._delegate.onConnect(existingConnection, this._config);
      return;
    }

    this._config = config;

    var {lookupPreferIpv6} = require('nuclide-commons').dnsUtils;

    lookupPreferIpv6(config.host).then((address) => {
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
          agent,
          tryKeyboard: true,
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
            tryKeyboard: true,
          });
      } else if (config.authMethod === SupportedMethods.PRIVATE_KEY) {
        // We use fs-plus's normalize() function because it will expand the ~, if present.
        var expandedPath = fs.normalize(config.pathToPrivateKey);
        fsPromise.readFile(expandedPath).then(privateKey => {
          this._connection.connect({
            host: address,
            port: config.sshPort,
            username: config.username,
            privateKey,
            tryKeyboard: true,
          });
        }).catch((e) => {
          this._delegate.onError(e, this._config);
        });
      } else {
        throw new Error('Invalid authentication method');
      }
    }).catch((e) => {
      this._delegate.onError(e, this._config);
    });
  }

  cancel() {
    this._connection.end();
  }

  _onKeyboardInteractive(
      name: string,
      instructions: string,
      instructionsLang: string,
      prompts: Array<{prompt: string; echo: boolean;}>,
      finish: (answers: Array<string>) => void): void {
    this._delegate.onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish);
  }

  _forwardSocket(socket: net.Socket): void {
    this._connection.forwardOut(
      socket.remoteAddress,
      socket.remotePort,
      'localhost',
      this._remotePort,
      (err, stream) => {
        if (err) {
          socket.end();
          logger.error(err);
          return;
        }

        socket.pipe(stream);
        stream.pipe(socket);
      }
    );
  }

  _updateServerInfo(serverInfo) {
    this._remotePort = serverInfo.port;
    this._remoteHost = `${serverInfo.hostname || this._config.host}`;
    // Because the value for the Initial Directory that the user supplied may have
    // been a symlink that was resolved by the server, overwrite the original `cwd`
    // value with the resolved value.
    this._config.cwd = serverInfo.workspace;
    this._certificateAuthorityCertificate = serverInfo.ca;
    this._clientCertificate = serverInfo.cert;
    this._clientKey = serverInfo.key;
  }

  _isSecure(): boolean {
    return this._certificateAuthorityCertificate
        && this._clientCertificate
        && this._clientKey;
  }

  _startRemoteServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      var errorText = '';
      var stdOut = '';

      //TODO: escape any single quotes
      //TODO: the timeout value shall be configurable using .json file too (t6904691).
      var cmd = `${this._config.remoteServerCommand} --workspace=${this._config.cwd} --common_name=${this._config.host} -t 20`;
      // Add sync word before and after the remote command, so that we can extract the stdout
      // without noises from .bashrc or .bash_profile.
      // Note: we use --login to imitate a login shell.  This will only execute
      // .profile/.bash_profile/.bash_login.  .bashrc will only be loaded if
      // it is sourced in one of the login scripts.  This is pretty typical
      // though so likely .bashrc will be loaded.
      // Note 2: We also run this as an interactive shell, even though it isn't.
      // That is so anything behind an `if [ -z $PS1 ]`, such as adding entries
      // to the $PATH, will not be skipped
      this._connection.exec(`bash --login -i -c 'echo ${SYNC_WORD};${cmd};echo ${SYNC_WORD}'`, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }
        stream.on('close', async (code, signal) => {
          var rejectWithError = (error) => {
              logger.error(error);
              errorText = `${error}\n\nstderr:${errorText}`;
              reject(new Error(errorText));
          };

          if (code === 0) {
            var serverInfo;
            var match = STDOUT_REGEX.exec(stdOut);
            if (!match) {
              rejectWithError(`Bad stdout from remote server: ${stdOut}`);
              return;
            }
            try {
              serverInfo = JSON.parse(match[1]);
            } catch (e) {
              rejectWithError(`Bad JSON reply from Nuclide server: ${match[1]}`);
              return;
            }
            if (!serverInfo.workspace) {
              rejectWithError(`Could not find directory: ${this._config.cwd}`);
              return;
            }

            // Update server info that is needed for setting up client.
            this._updateServerInfo(serverInfo);
            resolve(undefined);
          } else {
            reject(new Error(errorText));
          }
        }).on('data', (data) => {
          stdOut += data;
        }).stderr.on('data', (data) => {
          errorText += data;
        });
      });
    });
  }

  async _onConnect(): void {
    try {
      await this._startRemoteServer();
    } catch (e) {
      this._delegate.onError(e, this._config);
      return;
    }

    var finishHandshake = async(connection: RemoteConnection) => {
      try {
        await connection.initialize();
      } catch (e) {
        error = new Error(`Failed to connect to Nuclide server on ${this._config.host}: ${e.message}`);
        this._delegate.onError(error, this._config);
      }
      this._delegate.onConnect(connection, this._config);
    };

    // Use an ssh tunnel if server is not secure
    if (this._isSecure()) {
      var connection = new RemoteConnection({
        host: this._remoteHost,
        port: this._remotePort,
        cwd: this._config.cwd,
        certificateAuthorityCertificate: this._certificateAuthorityCertificate,
        clientCertificate: this._clientCertificate,
        clientKey: this._clientKey
      });
      finishHandshake(connection);
    } else {
      this._forwardingServer = net.createServer((sock) => {
        this._forwardSocket(sock);
      }).listen(0, 'localhost', () => {
        var connection = new RemoteConnection({
          host: 'localhost',
          port: this._getLocalPort(),
          cwd: this._config.cwd
        });
        finishHandshake(connection);
      });
    }
  }

  _getLocalPort(): ?number {
    return this._forwardingServer ? this._forwardingServer.address().port : null;
  }

  getConfig(): SshConnectionConfiguration{
    return this._config;
  }
}

SshHandshake.SupportedMethods = SupportedMethods;

module.exports = SshHandshake;
