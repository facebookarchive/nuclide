'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SftpClient = undefined;

var _ssh;

function _load_ssh() {
  return _ssh = require('ssh2');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * Represents an SFTP connection. This wraps the `SFTPWrapper` class from ssh2, but reinterprets the
 * API using promises instead of callbacks. The methods of this class generally correspond to the
 * same methods on `SFTPWrapper`. Instances of this class should typically be obtained from
 * `SshClient`.
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

class SftpClient {

  /**
   * Wraps and takes ownership of the `SFTPWrapper`.
   */
  constructor(sftp) {
    this._sftp = sftp;
    this._onError = _rxjsBundlesRxMinJs.Observable.fromEvent(this._sftp, 'error');
    this._onEnd = _rxjsBundlesRxMinJs.Observable.fromEvent(this._sftp, 'end');
    this._onClose = _rxjsBundlesRxMinJs.Observable.fromEvent(this._sftp, 'close');
    this._onContinue = _rxjsBundlesRxMinJs.Observable.fromEvent(this._sftp, 'continue');
  }

  /** Emitted when an error occurred. */
  onError() {
    return this._onError;
  }

  /** Emitted when the session has ended. */
  onEnd() {
    return this._onEnd;
  }

  /** Emitted when the session has closed. */
  onClose() {
    return this._onClose;
  }

  /** Emitted when more requests/data can be sent to the stream. */
  onContinue() {
    return this._onContinue;
  }

  /**
   * (Client-only)
   *
   * Downloads a file at `remotePath` to `localPath` using parallel reads for faster throughput.
   */
  fastGet(remotePath, localPath, options = {}) {
    return this._sftpToPromise(this._sftp.fastGet, remotePath, localPath, options);
  }

  /**
   * Ends the stream.
   */
  end() {
    this._sftp.end();
  }

  _sftpToPromise(func, ...args) {
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
exports.SftpClient = SftpClient;