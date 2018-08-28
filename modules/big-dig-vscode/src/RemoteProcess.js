"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spawnRemote = spawnRemote;

var _events = _interopRequireDefault(require("events"));

var _stream = _interopRequireDefault(require("stream"));

var rxjs = _interopRequireWildcard(require("rxjs/bundles/Rx.min.js"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _ConnectionWrapper() {
  const data = require("./ConnectionWrapper");

  _ConnectionWrapper = function () {
    return data;
  };

  return data;
}

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
const logger = (0, _log4js().getLogger)('remote-process');

/**
 * Create a remote process.
 * @param conn remote server to create the process on
 * @param cmd path of the command/process to run
 * @param args arguments to pass to the process
 * @param opts options for starting the process
 */
async function spawnRemote(conn, cmd, args, opts) {
  const options = opts == null ? {} : opts; // flowlint-next-line sketchy-null-string:off

  options.term = options.term || 'xterm';
  const proc = await conn.execSpawn({
    cmd,
    args,
    env: Object.assign({
      TERM: options.term
    }, options.env),
    shell: options.shell,
    cwd: options.cwd,
    usePty: options.usePty,
    addBigDigToPath: options.addBigDigToPath,
    inheritEnv: options.inheritEnv === undefined ? true : options.inheritEnv
  });
  return RemoteProcess.create(conn, proc.share());
}
/**
 * Module-internal class to wrap a remote process after it has been spawned.
 */


class RemoteProcess extends _events.default {
  /** @private */
  constructor(conn, params, stdio) {
    super();
    this.stdout = new class extends _stream.default.Readable {
      _read() {}

    }();
    this.stderr = new class extends _stream.default.Readable {
      _read() {}

    }();
    this._conn = conn;
    this.pid = params.pid;
    this.isTty = params.isTty;
    this.stdin = new RemoteStdin(conn, this.pid);
    this._sub = stdio.subscribe(message => this._handleExecMessages(message), error => {
      this.emit('error', error);
    });
  }

  static create(conn, stdio) {
    return new Promise((resolve, reject) => {
      const sub = stdio.subscribe(message => handleSpawnMessage(message), error => reject(error));

      function handleSpawnMessage(message) {
        try {
          if (message.kind === 'spawn') {
            resolve(new RemoteProcess(conn, message, stdio));
          } else {
            throw new Error(`Message of kind "${message.kind}" was received before "spawn".`);
          }
        } catch (error) {
          reject(error);
        } finally {
          sub.unsubscribe();
        }
      }
    });
  }

  async kill(signal) {
    return this._conn.execKill(this.pid, signal).then(() => {});
  }

  async resize(columns, rows) {
    return this._conn.execResize(this.pid, columns, rows).then(() => {});
  }

  _handleExecMessages(message) {
    try {
      switch (message.kind) {
        case 'spawn':
          logger.warn(`Ignoring duplicate spawn message for process ${message.pid}`);
          return;

        case 'stdout':
          return this.stdout.push(message.data);

        case 'stderr':
          return this.stderr.push(message.data);

        case 'stdout-end':
          return this.stdout.emit('end');

        case 'stderr-end':
          return this.stderr.emit('end');

        case 'stdin-error':
          return this.stdin.emit('error', message.message);

        case 'error':
          return this.emit('error', message.message);

        case 'close':
          return this.emit('close');

        case 'exit':
          return this.emit('exit', message.code, message.signal);

        default:
          return logger.warn('Unknown remote process message: ' + message.kind);
      }
    } catch (error) {
      logger.error(`Unhandled exception in event handling of message kind ${message.kind} of remote process.`, error);
    }
  }

}
/**
 * A writable stream that wraps a remote process.
 */


class RemoteStdin extends _stream.default.Writable {
  constructor(conn, pid) {
    super();
    this._conn = conn;
    this._pid = pid;
  }

  async _do_write(data, callback) {
    try {
      if (this._pid == null) {
        logger.error('Attempt to write to process that has been spawned yet');
      } else {
        await this._conn.execStdin(this._pid, data);
      }

      callback();
    } catch (error) {
      this.emit('error', error);
      callback(error);
    }
  }

  _write(chunk, encoding, callback) {
    const data = typeof chunk === 'string' ? Buffer.from(chunk, encoding).toString('utf8') : chunk.toString('utf8');

    this._do_write(data, callback);

    return false;
  }

}