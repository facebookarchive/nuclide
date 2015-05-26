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
  useSshAgent: boolean; // Whether to use the system ssh agent to connect to the sevcer.
}

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
    this._connection.on('error', (e) => this._delegate.onError(e, this._config));
    this._connection.on('keyboard-interactive', this._onKeyboardInteractive.bind(this));
  }

  connect(config: SshConnectionConfiguration): void {
    var existingConnection = RemoteConnection.getByHostnameAndPath(config.host, config.cwd);
    if (existingConnection) {
      this._delegate.onConnect(existingConnection, this._config);
      return;
    }

    this._config = config;
    if (config.useSshAgent) {
      this._connection.connect({
        host: config.host,
        port: config.sshPort,
        username: config.username,
        // Point to ssh-agent's socket for ssh-agent-based authentication.
        agent: process.env.SSH_AUTH_SOCK,
        tryKeyboard: true,
      });
    } else {
      fsPromise.readFile(config.pathToPrivateKey).then((privateKey) => {
        this._connection.connect({
          host: config.host,
          port: config.sshPort,
          username: config.username,
          privateKey: privateKey,
          tryKeyboard: true,
        });
      }).catch((e) => {
        this._delegate.onError(e, this._config);
      });
    }
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
      // Note that without 'bash -ic' in the following, .bash_profile gets run
      // which may import .bashrc in some setup.
      this._connection.exec(`bash -ic 'echo ${SYNC_WORD};${cmd};echo ${SYNC_WORD}'`, (err, stream) => {
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
        await connection.verifyServer();
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

module.exports = SshHandshake;
