'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SftpClient = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _ssh;

function _load_ssh() {
  return _ssh = require('ssh2');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Represents an SFTP connection. This wraps the `SFTPWrapper` class from ssh2, but reinterprets the
 * API using promises instead of callbacks. The methods of this class generally correspond to the
 * same methods on `SFTPWrapper`. Instances of this class should typically be obtained from
 * `SshClient`.
 */
class SftpClient {

  /**
   * Wraps and takes ownership of the `SFTPWrapper`.
   */
  constructor(sftp) {
    this._deferredContinue = null;

    this._sftp = sftp;
    this._onError = _rxjsBundlesRxMinJs.Observable.fromEvent(this._sftp, 'error');
    this._onEnd = _rxjsBundlesRxMinJs.Observable.fromEvent(this._sftp, 'end');
    this._onClose = _rxjsBundlesRxMinJs.Observable.fromEvent(this._sftp, 'close');
    this._onContinue = _rxjsBundlesRxMinJs.Observable.fromEvent(this._sftp, 'continue');

    this._sftp.on('continue', () => this._resolveContinue());
    this._sftp.on('close', () => {
      this._resolveContinue();
    });
  }

  /**
   * @return `true` if the channel is ready for more data; `false` if the caller should wait for
   * the 'continue' event before sending more data. This variable is updated immediately after each
   * asynchronous call (i.e. when a Promise is returned; before it is necessarily resolved).
   */
  get continue() {
    return this._deferredContinue == null;
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
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this._readyForData();
      _this._sftp.end();
    })();
  }

  _resolveContinue() {
    if (this._deferredContinue != null) {
      const { resolve } = this._deferredContinue;
      this._deferredContinue = null;
      resolve();
    }
  }

  _readyForData() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      while (_this2._deferredContinue != null) {
        // eslint-disable-next-line no-await-in-loop
        yield _this2._deferredContinue.promise;
      }
    })();
  }

  _sftpToPromiseContinue(func, ...args) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this3._readyForData();
      return new Promise(function (resolve, reject) {
        args.push(function (err, result) {
          if (err != null) {
            return reject(err);
          }
          resolve(result);
        });

        const readyForData = func.apply(_this3._sftp, args);
        if (!readyForData && _this3._deferredContinue == null) {
          _this3._deferredContinue = new (_promise || _load_promise()).Deferred();
        }
      });
    })();
  }

  _sftpToPromise(func, ...args) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this4._readyForData();
      return new Promise(function (resolve, reject) {
        args.push(function (err, result) {
          if (err != null) {
            return reject(err);
          }
          resolve(result);
        });
        func.apply(_this4._sftp, args);
      });
    })();
  }
}
exports.SftpClient = SftpClient; /**
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