'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RpcProcess = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _StreamTransport;

function _load_StreamTransport() {
  return _StreamTransport = require('./StreamTransport');
}

var _RpcConnection;

function _load_RpcConnection() {
  return _RpcConnection = require('./RpcConnection');
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

/**
 * A generic process wrapper around a stdio-based child process, providing a simple
 * promise-based call API. Commonly used to wrap a python (or any other language)
 * process, making it invokable through JS code.
 *
 * This class can be generalized further (to not require stdin/stdout as the communication method)
 * by having the Transport class injected, which is currently defaulted to StreamTransport.
 *
 * Child Process Implementation Notes:
 * - See Rpc.js for the JSON protocol that the child process implementation must follow.
 * - Note that stdin, stdout, and stderr must be piped, done by node by default.
 *   Don't override the stdio to close off any of these streams in the constructor opts.
 */
class RpcProcess {

  /**
   * @param name           a name for this server, used to tag log entries
   * @param processStream  a (cold) Observable that creates processes upon subscription,
   *                       both during initialization and on restart (see createProcessStream)
   */
  constructor(name, serviceRegistry, processStream, messageLogger = (direction, message) => {
    return;
  }) {
    this._processStream = processStream;
    this._messageLogger = messageLogger;
    this._name = name;
    this._disposed = false;
    this._process = null;
    this._subscription = null;
    this._serviceRegistry = serviceRegistry;
    this._rpcConnection = new _rxjsBundlesRxMinJs.BehaviorSubject(null);
    this._exitCode = new _rxjsBundlesRxMinJs.Subject();
  }

  getName() {
    return this._name;
  }

  isDisposed() {
    return this._disposed;
  }

  getService(serviceName) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._ensureConnection();
      let connection = _this._rpcConnection.getValue();
      if (connection == null) {
        connection = yield _this._rpcConnection.skip(1).take(1).toPromise();
        // The only source of null connections is dispose().
        if (connection == null) {
          throw new Error('RpcProcess was disposed during getService');
        }
      }
      return connection.getService(serviceName);
    })();
  }

  observeExitCode() {
    return this._exitCode.asObservable();
  }

  /**
   * Ensures that the child process is available. Asynchronously creates the child process,
   * only if it is currently null.
   */
  _ensureConnection() {
    if (this._subscription == null) {
      this._subscription = this._processStream.do({
        next: proc => {
          this._process = proc;
          logger.info(`${this._name} - created child process with PID: `, proc.pid);

          proc.stdin.on('error', error => {
            logger.error(`${this._name} - error writing data: `, error);
          });

          this._rpcConnection.next(new (_RpcConnection || _load_RpcConnection()).RpcConnection('client', this._serviceRegistry, new (_StreamTransport || _load_StreamTransport()).StreamTransport(proc.stdin, proc.stdout, this._messageLogger)));
        },
        error: e => {
          logger.error(`${this._name} - error spawning child process: `, e);
          this.dispose();
        }
      }).switchMap((_process || _load_process()).getOutputStream).subscribe(this._onProcessMessage.bind(this));
    }
    this._disposed = false;
  }

  /**
   * Handles lifecycle messages from stderr, exit, and error streams,
   * responding by logging and staging for process restart.
   */
  _onProcessMessage(message) {
    switch (message.kind) {
      case 'stdout':
        break;
      case 'stderr':
        logger.warn(`${this._name} - error from stderr received: `, message.data.toString());
        break;
      case 'exit':
        // Log exit code if process exited not as a result of being disposed.
        if (!this._disposed) {
          logger.error(`${this._name} - exited before dispose: `, message.exitCode);
        }
        this.dispose();
        this._exitCode.next(message);
        break;
      case 'error':
        logger.error(`${this._name} - error received: `, message.error.message);
        this.dispose();
        break;
      default:
        // This case should never be reached.
        if (!false) {
          throw new Error(`${this._name} - unknown message received: ${message}`);
        }

    }
  }

  /**
   * Cleans up in case of disposal or failure, clearing all pending calls,
   * and killing the child process if necessary.
   */
  dispose() {
    logger.info(`${this._name} - disposing connection.`);
    this._disposed = true;

    const connection = this._rpcConnection.getValue();
    if (connection != null) {
      connection.dispose();
    }
    // Terminate any pending getService() calls.
    this._rpcConnection.next(null);

    if (this._subscription != null) {
      // Note that this will kill the process if it is still live.
      this._subscription.unsubscribe();
      this._subscription = null;
      this._process = null;
    }
  }
}
exports.RpcProcess = RpcProcess;