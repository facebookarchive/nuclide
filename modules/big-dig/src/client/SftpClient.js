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

import {SFTPWrapper} from 'ssh2';
import {Observable} from 'rxjs';
import {Deferred} from 'nuclide-commons/promise';

import type {TransferOptions} from 'ssh2';
export type {TransferOptions} from 'ssh2';

/**
 * Represents an SFTP connection. This wraps the `SFTPWrapper` class from ssh2, but reinterprets the
 * API using promises instead of callbacks. The methods of this class generally correspond to the
 * same methods on `SFTPWrapper`. Instances of this class should typically be obtained from
 * `SshClient`.
 */
export class SftpClient {
  _sftp: SFTPWrapper;
  _onError: Observable<any>;
  _onEnd: Observable<void>;
  _onClose: Observable<void>;
  _onContinue: Observable<void>;
  _deferredContinue: ?Deferred<void> = null;
  _endPromise: Deferred<void>;
  _closePromise: Deferred<void>;

  /**
   * Wraps and takes ownership of the `SFTPWrapper`.
   */
  constructor(sftp: SFTPWrapper) {
    this._sftp = sftp;
    this._onError = Observable.fromEvent(this._sftp, 'error');
    this._onEnd = Observable.fromEvent(this._sftp, 'end');
    this._onClose = Observable.fromEvent(this._sftp, 'close');
    this._onContinue = Observable.fromEvent(this._sftp, 'continue');
    this._closePromise = new Deferred();
    this._endPromise = new Deferred();

    this._sftp.on('end', this._endPromise.resolve);
    this._sftp.on('continue', () => this._resolveContinue());
    this._sftp.on('close', () => {
      this._resolveContinue();
      this._endPromise.resolve();
      this._closePromise.resolve();
    });
  }

  /**
   * @return `true` if the channel is ready for more data; `false` if the caller should wait for
   * the 'continue' event before sending more data. This variable is updated immediately after each
   * asynchronous call (i.e. when a Promise is returned; before it is necessarily resolved).
   */
  get continue(): boolean {
    return this._deferredContinue == null;
  }

  /** Emitted when an error occurred. */
  onError(): Observable<any> {
    return this._onError;
  }

  /** Emitted when the session has ended. */
  onEnd(): Observable<void> {
    return this._onEnd;
  }

  /** Emitted when the session has closed. */
  onClose(): Observable<void> {
    return this._onClose;
  }

  /** Emitted when more requests/data can be sent to the stream. */
  onContinue(): Observable<void> {
    return this._onContinue;
  }

  /**
   * (Client-only)
   *
   * Downloads a file at `remotePath` to `localPath` using parallel reads for faster throughput.
   */
  fastGet(
    remotePath: string,
    localPath: string,
    options: TransferOptions = {},
  ): Promise<void> {
    return this._sftpToPromise(
      this._sftp.fastGet,
      remotePath,
      localPath,
      options,
    );
  }

  /**
   * Ends the stream.
   */
  async end(): Promise<void> {
    await this._readyForData();
    this._sftp.end();
    return this._endPromise.promise;
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

  async _sftpToPromiseContinue(func: Function, ...args: any): Promise<any> {
    await this._readyForData();
    return new Promise((resolve, reject) => {
      args.push((err, result) => {
        if (err != null) {
          return reject(err);
        }
        resolve(result);
      });

      const readyForData = func.apply(this._sftp, args);
      if (!readyForData && this._deferredContinue == null) {
        this._deferredContinue = new Deferred();
      }
    });
  }

  async _sftpToPromise(func: any, ...args: any): Promise<any> {
    await this._readyForData();
    return new Promise((resolve, reject) => {
      args.push((err, result) => {
        if (err != null) {
          return reject(err);
        }
        resolve(result);
      });
      func.apply(this._sftp, args);
    });
  }
}
