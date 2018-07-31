"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exec = exec;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _events = _interopRequireDefault(require("events"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var child_process = _interopRequireWildcard(require("child_process"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const logger = (0, _log4js().getLogger)('exec');
/** Wraps a running process. */

function exec(params) {
  const {
    cmd,
    args,
    cwd,
    env,
    shell,
    usePty
  } = params;

  if (usePty) {
    try {
      // We optimistically attempt to spawn the process on a pty shell,
      // but pty may not be available
      return new ExecProcessPty(cmd, args, cwd, env, shell);
    } catch (err) {
      // Assume the above failed because pty was not available.
      // (It may actually exist, but not have the native bindings
      // for the current platform.)
      logger.warn('pty terminal failed to load:', err);
    }
  } // Fall back to a plain old pipe for communication.


  return new ExecProcessNodeJs(cmd, args, cwd, env, shell);
}

class ExecProcessNodeJs {
  constructor(cmd, args, cwd, env, shell) {
    this._stream = new _RxMin.Subject();
    this._isClosed = false;
    this._isExited = false;
    this._emitter = new _events.default();
    this.isTty = false;
    this.stream = _RxMin.Observable.defer(() => _RxMin.Observable.of({
      kind: 'spawn',
      pid: this._process.pid,
      isTty: this.isTty
    }).concat(this._stream));
    logger.info(`spawn: ${cmd} ${args.join(' ')}`);
    const process = child_process.spawn(cmd, args, {
      cwd,
      shell,
      env,
      detached: false,
      stdio: 'pipe'
    });
    logger.info(`spawned ${process.pid}`);
    this._process = process;
    process.stdout.on('data', data => {
      this._stream.next({
        kind: 'stdout',
        data: data.toString()
      });
    });
    process.stdout.on('end', () => {
      this._stream.next({
        kind: 'stdout-end'
      });
    });
    process.stderr.on('data', data => {
      this._stream.next({
        kind: 'stderr',
        data: data.toString()
      });
    });
    process.stderr.on('end', () => {
      this._stream.next({
        kind: 'stderr-end'
      });
    });
    process.stdin.on('error', err => {
      this._stream.next({
        kind: 'stdin-error',
        message: err.toString()
      });
    });
    process.once('error', err => {
      this._stream.next({
        kind: 'error',
        message: err.toString()
      });
    });
    process.once('close', (code, signal) => {
      logger.info(`closed ${process.pid} with code=${code} signal=${signal}`);

      this._stream.next({
        kind: 'close'
      });

      this._isClosed = true;

      this._checkComplete();
    });
    process.once('exit', (code, signal) => {
      this._stream.next({
        kind: 'exit',
        code,
        signal
      });

      this._isExited = true;

      this._checkComplete();
    });
    process.stdout.resume();
  }

  kill(signal) {
    logger.info(`killed ${process.pid} with signal=${signal}`);

    this._process.kill(signal);
  }

  resize(columns, rows) {}

  write(message) {
    this._process.stdin.write(message);
  }

  get pid() {
    return this._process.pid;
  }

  onComplete(listener) {
    return new (_UniversalDisposable().default)(this._stream.subscribe({
      complete: listener
    }));
  }

  _checkComplete() {
    if (this._isClosed && this._isExited) {
      this._stream.complete();
    }
  }

}

class ExecProcessPty {
  constructor(cmd, args, cwd, env, shell) {
    this._stream = new _RxMin.Subject();
    this._isClosed = false;
    this._isExited = false;
    this._emitter = new _events.default();
    this.isTty = true;
    this.stream = _RxMin.Observable.defer(() => _RxMin.Observable.of({
      kind: 'spawn',
      pid: this._process.pid,
      isTty: this.isTty
    }).concat(this._stream));

    // Lazy load pty.js because it may fail if native bindings cannot be found.
    // If this fails, then the caller should create a ExecProcessNodeJs
    // instead.
    const spawn = require('nuclide-prebuilt-libs/pty').spawn;

    logger.info(`spawn: ${cmd} ${args.join(' ')}`); // $FlowIssue

    const process = spawn(cmd, args, {
      cwd,
      env
    });
    logger.info(`spawned ${process.pid}`);
    this._process = process; // pty.spawn forwards events from a Node net.Socket.

    process.on('data', data => {
      this._stream.next({
        kind: 'stdout',
        data: data.toString()
      });
    }); // The 'close' event is actually for the pty socket connecting to the
    // process. The event will generally occur before exit :/
    // We'll issue 'close' when 'exit' occurs.
    // process.once('close', () => { ... });

    process.once('error', err => {
      // When the pty's child process is closed, an EIO error is emitted.
      // This is safe to interpret as a 'stdout-end'.
      // flowlint-next-line sketchy-null-string:off
      if (err.code && err.code.includes('EIO')) {
        this._stream.next({
          kind: 'stdout-end'
        });
      } else {
        this._stream.error({
          kind: 'error',
          message: err.toString()
        });
      }
    });
    process.once('close', () => {
      this._isClosed = true;

      this._stream.next({
        kind: 'close'
      });

      this._checkComplete();
    });
    process.once('exit', (code, signal) => {
      logger.info(`exited ${process.pid} with code=${code} signal=${signal}`);

      this._stream.next({
        kind: 'exit',
        code,
        signal
      });

      this._isExited = true;

      this._checkComplete();
    });
  }

  kill(signal) {
    logger.info(`killed ${this._process.pid} with signal=${signal}`);

    this._process.destroy();
  }

  resize(columns, rows) {
    this._process.resize(columns, rows);
  }

  write(message) {
    this._process.write(message);
  }

  get pid() {
    return this._process.pid;
  }

  onComplete(listener) {
    return new (_UniversalDisposable().default)(this._stream.subscribe({
      complete: listener
    }));
  }

  _checkComplete() {
    if (this._isClosed && this._isExited) {
      this._stream.complete();
    }
  }

}