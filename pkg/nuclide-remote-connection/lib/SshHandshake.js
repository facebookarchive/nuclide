'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RemoteConnectionConfiguration} from './RemoteConnection';

import ConnectionTracker from './ConnectionTracker';
import {Client as SshConnection} from 'ssh2';
import fs from 'fs-plus';
import net from 'net';
import invariant from 'assert';
import {RemoteConnection} from './RemoteConnection';
import {fsPromise, promises} from '../../nuclide-commons';

const logger = require('../../nuclide-logging').getLogger();

// Sync word and regex pattern for parsing command stdout.
const READY_TIMEOUT_MS = 60 * 1000;

export type SshConnectionConfiguration = {
  host: string; // host nuclide server is running on
  sshPort: number; // ssh port of host nuclide server is running on
  username: string; // username to authenticate as
  pathToPrivateKey: string; // The path to private key
  remoteServerCommand: string; // Command to use to start server
  cwd: string; // Path to remote directory user should start in upon connection.
  authMethod: string; // Which of the authentication methods in `SupportedMethods` to use.
  password: string; // for simple password-based authentication
  displayTitle: string; // Name of the saved connection profile.
};

const SupportedMethods = Object.freeze({
  SSL_AGENT: 'SSL_AGENT',
  PASSWORD: 'PASSWORD',
  PRIVATE_KEY: 'PRIVATE_KEY',
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
  SERVER_VERSION_MISMATCH: 'SERVER_VERSION_MISMATCH',
});

export type SshHandshakeErrorType = 'UNKNOWN' | 'HOST_NOT_FOUND' | 'CANT_READ_PRIVATE_KEY' |
  'SSH_CONNECT_TIMEOUT' | 'SSH_CONNECT_FAILED' | 'SSH_AUTHENTICATION' | 'DIRECTORY_NOT_FOUND' |
  'SERVER_START_FAILED' | 'SERVER_VERSION_MISMATCH';

type SshConnectionErrorLevel = 'client-timeout' | 'client-socket' | 'protocal' |
  'client-authentication' | 'agent' | 'client-dns';

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
export type KeyboardInteractiveCallback = (
  name: string,
  instructions: string,
  instructionsLang: string,
  prompts: Array<{prompt: string; echo: boolean;}>,
  finish: (answers: Array<string>) => void)  => void;

export type SshConnectionDelegate = {
  /** Invoked when server requests keyboard interaction */
  onKeyboardInteractive: KeyboardInteractiveCallback;
  /** Invoked when trying to connect */
  onWillConnect: (config: SshConnectionConfiguration) => void;
  /** Invoked when connection is sucessful */
  onDidConnect: (connection: RemoteConnection, config: SshConnectionConfiguration) => void;
  /** Invoked when connection is fails */
  onError:
    (errorType: SshHandshakeErrorType, error: Error, config: SshConnectionConfiguration) => void;
};

const SshConnectionErrorLevelMap: Map<SshConnectionErrorLevel, SshHandshakeErrorType> = new Map([
  ['client-timeout', ErrorType.SSH_CONNECT_TIMEOUT],
  ['client-socket', ErrorType.SSH_CONNECT_FAILED],
  ['protocal', ErrorType.SSH_CONNECT_FAILED],
  ['client-authentication', ErrorType.SSH_AUTHENTICATION],
  ['agent', ErrorType.SSH_AUTHENTICATION],
  ['client-dns', ErrorType.SSH_AUTHENTICATION],
]);

export class SshHandshake {
  _delegate: SshConnectionDelegate;
  _connection: SshConnection;
  _config: SshConnectionConfiguration;
  _forwardingServer: net.Server;
  _remoteHost: ?string;
  _remotePort: ?number;
  _certificateAuthorityCertificate: Buffer;
  _clientCertificate: Buffer;
  _clientKey: Buffer;
  static SupportedMethods: typeof SupportedMethods;

  static ErrorType = ErrorType;

  constructor(delegate: SshConnectionDelegate, connection?: SshConnection) {
    this._delegate = delegate;
    this._connection = connection ? connection : new SshConnection();
    this._connection.on('ready', this._onConnect.bind(this));
    this._connection.on('error', this._onSshConnectionError.bind(this));
    this._connection.on('keyboard-interactive', this._onKeyboardInteractive.bind(this));
  }

  _willConnect(): void {
    this._delegate.onWillConnect(this._config);
  }

  _didConnect(connection: RemoteConnection): void {
    this._delegate.onDidConnect(connection, this._config);
  }

  _error(message: string, errorType: SshHandshakeErrorType, error: Error): void {
    logger.error(`SshHandshake failed: ${errorType}, ${message}`, error);
    this._delegate.onError(errorType, error, this._config);
  }

  _onSshConnectionError(error: Error): void {
    const errorLevel = ((error: Object).level: SshConnectionErrorLevel);
    const errorType = SshConnectionErrorLevelMap.get(errorLevel) || SshHandshake.ErrorType.UNKNOWN;
    this._error('Ssh connection failed.', errorType, error);
  }

  async connect(config: SshConnectionConfiguration): Promise<void> {
    this._config = config;
    this._willConnect();

    const existingConnection = RemoteConnection
      .getByHostnameAndPath(this._config.host, this._config.cwd);

    if (existingConnection) {
      this._didConnect(existingConnection);
      return;
    }

    const connection = await RemoteConnection.createConnectionBySavedConfig(
      this._config.host,
      this._config.cwd,
      this._config.displayTitle,
    );

    if (connection) {
      this._didConnect(connection);
      return;
    }

    const {lookupPreferIpv6} = require('../../nuclide-commons').dnsUtils;
    let address = null;
    try {
      address = await lookupPreferIpv6(config.host);
    } catch (e) {
      this._error(
        'Failed to resolve DNS.',
        SshHandshake.ErrorType.HOST_NOT_FOUND,
        e,
      );
    }

    if (config.authMethod === SupportedMethods.SSL_AGENT) {
      // Point to ssh-agent's socket for ssh-agent-based authentication.
      let agent = process.env['SSH_AUTH_SOCK'];
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
        readyTimeout: READY_TIMEOUT_MS,
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
      const expandedPath = fs.normalize(config.pathToPrivateKey);
      let privateKey: string = (null : any);
      try {
        privateKey = await fsPromise.readFile(expandedPath);
      } catch (e) {
        this._error(
          'Failed to read private key',
          SshHandshake.ErrorType.CANT_READ_PRIVATE_KEY,
          e,
        );
      }
      this._connection.connect({
        host: address,
        port: config.sshPort,
        username: config.username,
        privateKey,
        tryKeyboard: true,
        readyTimeout: READY_TIMEOUT_MS,
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

  _updateServerInfo(serverInfo: {}) {
    invariant(serverInfo.port);
    this._remotePort = serverInfo.port;
    this._remoteHost = `${serverInfo.hostname || this._config.host}`;

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
    if (serverInfo.ca != null) { this._certificateAuthorityCertificate = serverInfo.ca; }
    if (serverInfo.cert != null) { this._clientCertificate = serverInfo.cert; }
    if (serverInfo.key != null) { this._clientKey = serverInfo.key; }
  }

  _isSecure(): boolean {
    return !!(this._certificateAuthorityCertificate
        && this._clientCertificate
        && this._clientKey);
  }

  async _startRemoteServer(): Promise<boolean> {

    return new Promise((resolve, reject) => {
      let stdOut = '';
      const remoteTempFile = `/tmp/nuclide-sshhandshake-${Math.random()}`;
      //TODO: escape any single quotes
      //TODO: the timeout value shall be configurable using .json file too (t6904691).
      const cmd = `${this._config.remoteServerCommand} --workspace=${this._config.cwd}`
        + ` --common-name=${this._config.host} --json-output-file=${remoteTempFile} -t 60`;

      this._connection.exec(cmd, {pty: {term: 'nuclide'}}, (err, stream) => {
        if (err) {
          this._onSshConnectionError(err);
          return resolve(false);
        }
        stream.on('close', async (code, signal) => {
          // Note: this code is probably the code from the child shell if one
          // is in use.
          if (code === 0) {
            // Some servers have max channels set to 1, so add a delay to ensure
            // the old channel has been cleaned up on the server.
            // TODO(hansonw): Implement a proper retry mechanism.
            // But first, we have to clean up this callback hell.
            await promises.awaitMilliSeconds(100);
            this._connection.sftp(async (error, sftp) => {
              if (error) {
                this._error(
                  'Failed to start sftp connection',
                  SshHandshake.ErrorType.SERVER_START_FAILED,
                  error,
                );
                return resolve(false);
              }
              const localTempFile = await fsPromise.tempfile();
              sftp.fastGet(remoteTempFile, localTempFile, async sftpError => {
                sftp.end();
                if (sftpError) {
                  this._error(
                    'Failed to transfer server start information',
                    SshHandshake.ErrorType.SERVER_START_FAILED,
                    sftpError,
                  );
                  return resolve(false);
                }

                let serverInfo: any = null;
                const serverInfoJson = await fsPromise.readFile(localTempFile);
                try {
                  serverInfo = JSON.parse(serverInfoJson);
                } catch (e) {
                  this._error(
                    'Malformed server start information',
                    SshHandshake.ErrorType.SERVER_START_FAILED,
                    new Error(serverInfoJson),
                  );
                  return resolve(false);
                }

                if (!serverInfo.success) {
                  this._error(
                    'Remote server failed to start',
                    SshHandshake.ErrorType.SERVER_START_FAILED,
                    new Error(serverInfo.logs),
                  );
                  return resolve(false);
                }

                if (!serverInfo.workspace) {
                  this._error(
                    'Could not find directory',
                    SshHandshake.ErrorType.DIRECTORY_NOT_FOUND,
                    new Error(serverInfo.logs),
                  );
                  return resolve(false);
                }

                // Update server info that is needed for setting up client.
                this._updateServerInfo(serverInfo);
                return resolve(true);
              });
            });
          } else {
            this._error(
              'Remote shell execution failed',
              SshHandshake.ErrorType.UNKNOWN,
              new Error(stdOut),
            );
            return resolve(false);
          }
        }).on('data', data => {
          stdOut += data;
        });
      });
    });
  }

  async _onConnect(): Promise<void> {
    if (!(await this._startRemoteServer())) {
      return;
    }

    const connect = async (config: RemoteConnectionConfiguration) => {
      let connection = null;
      try {
        connection = await RemoteConnection.findOrCreate(config);
      } catch (e) {
        this._error(
          'Connection check failed',
          SshHandshake.ErrorType.SERVER_VERSION_MISMATCH,
          e,
        );
      }
      if (connection != null) {
        this._didConnect(connection);
        // If we are secure then we don't need the ssh tunnel.
        if (this._isSecure()) {
          this._connection.end();
        }
      }
    };

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
        displayTitle: this._config.displayTitle,
      });
    } else {
      /* $FlowIssue t9212378 */
      this._forwardingServer = net.createServer(sock => {
        this._forwardSocket(sock);
      }).listen(0, 'localhost', () => {
        const localPort = this._getLocalPort();
        invariant(localPort);
        connect({
          host: 'localhost',
          port: localPort,
          cwd: this._config.cwd,
          displayTitle: this._config.displayTitle,
        });
      });
    }
  }

  _getLocalPort(): ?number {
    return this._forwardingServer ? this._forwardingServer.address().port : null;
  }

  getConfig(): SshConnectionConfiguration {
    return this._config;
  }
}

SshHandshake.SupportedMethods = SupportedMethods;

export function decorateSshConnectionDelegateWithTracking(
  delegate: SshConnectionDelegate,
): SshConnectionDelegate {
  let connectionTracker;

  return {
    onKeyboardInteractive: (
      name: string,
      instructions: string,
      instructionsLang: string,
      prompts: Array<{prompt: string; echo: boolean;}>,
      finish: (answers: Array<string>) => void,
    ) => {
      invariant(connectionTracker);
      connectionTracker.trackPromptYubikeyInput();
      delegate.onKeyboardInteractive(
        name,
        instructions,
        instructionsLang,
        prompts,
        answers => {
          invariant(connectionTracker);
          connectionTracker.trackFinishYubikeyInput();
          finish(answers);
        },
      );
    },
    onWillConnect: (config: SshConnectionConfiguration) => {
      connectionTracker = new ConnectionTracker(config);
      delegate.onWillConnect(config);
    },
    onDidConnect: (connection: RemoteConnection, config: SshConnectionConfiguration) => {
      invariant(connectionTracker);
      connectionTracker.trackSuccess();
      delegate.onDidConnect(connection, config);
    },
    onError: (
      errorType: SshHandshakeErrorType,
      error: Error,
      config: SshConnectionConfiguration,
    ) => {
      invariant(connectionTracker);
      connectionTracker.trackFailure(errorType, error);
      delegate.onError(errorType, error, config);
    },
  };
}
