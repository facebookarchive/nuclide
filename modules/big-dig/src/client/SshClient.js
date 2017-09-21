/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {
  ClientErrorExtensions,
  ConnectConfig,
  ExecOptions,
  Prompt,
} from 'ssh2';

import {lastly, Deferred} from 'nuclide-commons/promise';
import {Client, ClientChannel} from 'ssh2';
import {Observable} from 'rxjs';
import {SftpClient} from './SftpClient';

export type {
  ClientChannel,
  ClientErrorExtensions,
  ConnectConfig,
  ExecOptions,
  Prompt,
} from 'ssh2';

/**
 * Emitted when the server is asking for replies to the given `prompts` for keyboard-
 * interactive user authentication.
 *
 * * `name` is generally what you'd use as a window title (for GUI apps).
 * * `prompts` is an array of `Prompt` objects.
 *
 * The answers for all prompts must be returned as an array of strings in the same order.
 *
 * NOTE: It's possible for the server to come back and ask more questions.
 */
export type KeyboardInteractiveHandler = (
  name: string,
  instructions: string,
  lang: string,
  prompts: Prompt[],
) => Promise<Array<string>>;

export class SshClosedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Represents an SSH connection. This wraps the `Client` class from ssh2, but reinterprets the
 * API using promises instead of callbacks. The methods of this class generally correspond to the
 * same methods on `Client`.
 */
export class SshClient {
  _client: Client;
  _onError: Observable<Error & ClientErrorExtensions>;
  _onClose: Observable<{hadError: boolean}>;
  _deferredContinue: ?Deferred<void> = null;

  /**
   * Wraps and takes ownership of the ssh2 Client.
   * @param {*} client
   * @param {*} onKeyboard - a callback to provide interactive prompts to the user
   */
  constructor(client?: Client, onKeyboard: KeyboardInteractiveHandler) {
    this._client = client || new Client();
    this._onError = Observable.fromEvent(this._client, 'error');
    this._onClose = Observable.fromEvent(
      this._client,
      'close',
      (hadError: boolean) => ({
        hadError,
      }),
    );

    this._client.on('continue', () => this._resolveContinue());
    this._client.on('close', (hadError: boolean) => {
      this._resolveContinue();
    });
    this._client.on(
      'keyboard-interactive',
      (
        name: string,
        instructions: string,
        lang: string,
        prompts: Prompt[],
        finish: (responses: Array<string>) => void,
      ) => onKeyboard(name, instructions, lang, prompts).then(finish),
    );
  }

  /**
   * Emitted when an error occurred.
   */
  onError(): Observable<Error & ClientErrorExtensions> {
    return this._onError;
  }

  /**
   * Emitted when the socket was closed.
   */
  onClose(): Observable<{hadError: boolean}> {
    return this._onClose;
  }

  /**
   * @return `true` if the channel is ready for more data; `false` if the caller should wait for
   * the 'continue' event before sending more data. This variable is updated immediately after each
   * asynchronous call (i.e. when a Promise is returned; before it is necessarily resolved).
   */
  continue(): boolean {
    return this._deferredContinue == null;
  }

  /**
   * Attempts a connection to a server.
   *
   * @throws `Error & ClientErrorExtensions` if the connection failed
   */
  connect(config: ConnectConfig): Promise<void> {
    const {promise, resolve, reject} = new Deferred();
    function onClose() {
      reject(new SshClosedError('Connection closed before completion'));
    }
    this._client
      .once('ready', resolve)
      .once('close', onClose)
      .once('error', reject);
    this._client.connect(config);

    return lastly(promise, () => {
      this._client
        .removeListener('ready', resolve)
        .removeListener('close', onClose)
        .removeListener('error', reject);
    });
  }

  /**
   * Executes a command on the server.
   *
   * @param command The command to execute.
   * @param options Options for the command.
   */
  exec(command: string, options: ExecOptions = {}): Promise<ClientChannel> {
    return this._clientToPromiseContinue(this._client.exec, command, options);
  }

  /**
   * Open a connection with `srcIP` and `srcPort` as the originating address and port and
   * `dstIP` and `dstPort` as the remote destination address and port.
   *
   * Updates 'continue'
   *
   * @param srcIP The originating address.
   * @param srcPort The originating port.
   * @param dstIP The destination address.
   * @param dstPort The destination port.
   */
  forwardOut(
    srcIP: string,
    srcPort: number,
    dstIP: string,
    dstPort: number,
  ): Promise<ClientChannel> {
    return this._clientToPromiseContinue(
      this._client.forwardOut,
      srcIP,
      srcPort,
      dstIP,
      dstPort,
    );
  }

  /**
   * Starts an SFTP session.
   *
   * Updates 'continue'
   */
  sftp(timeoutMs?: number): Promise<SftpClient> {
    return this._clientToPromiseContinue(this._client.sftp).then(
      sftp => new SftpClient(sftp),
    );
  }

  /**
   * Disconnects the socket.
   */
  async end(): Promise<void> {
    await this._readyForData();
    this._client.end();
  }

  /**
   * Destroys the socket.
   */
  destroy() {
    this._client.destroy();
  }

  _resolveContinue() {
    if (this._deferredContinue != null) {
      const {resolve} = this._deferredContinue;
      this._deferredContinue = null;
      resolve();
    }
  }

  async _readyForData() {
    while (this._deferredContinue != null) {
      // eslint-disable-next-line no-await-in-loop
      await this._deferredContinue.promise;
    }
  }

  _clientToPromiseContinue(func: Function, ...args: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const self = this;
      function doOperation() {
        self._readyForData().then(() => {
          const readyForData = func.apply(self._client, args);
          if (!readyForData && this._deferredContinue == null) {
            self._deferredContinue = new Deferred();
          }
        });
      }

      args.push((err, result) => {
        if (err != null) {
          return reject(err);
        }
        resolve(result);
      });

      doOperation();
    });
  }
}
