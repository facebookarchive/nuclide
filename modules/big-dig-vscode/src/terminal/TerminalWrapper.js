"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TerminalWrapper = void 0;

function _promise() {
  const data = require("../../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

var _stream = _interopRequireDefault(require("stream"));

function _ws() {
  const data = _interopRequireDefault(require("ws"));

  _ws = function () {
    return data;
  };

  return data;
}

var _http = _interopRequireDefault(require("http"));

var _events = _interopRequireDefault(require("events"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
// Process to run in vscode's terminal
const PROCESS_WRAPPER = './process_wrapper.js';

/**
 * Creates a vscode.Terminal with access to stdio and resizing.
 */
class TerminalWrapper extends _events.default {
  get ready() {
    return this._deferredReady.promise;
  }

  get stdin() {
    return this._sin;
  }

  get stdout() {
    return this._sout;
  }

  get stderr() {
    return this._serr;
  }

  get terminal() {
    return this._term;
  }

  get columns() {
    return this._tty.columns;
  }

  get rows() {
    return this._tty.rows;
  }

  constructor(name) {
    super();
    this._sin = new class extends _stream.default.Readable {
      _read() {}

    }();
    this._deferredReady = new (_promise().Deferred)(); // Note that we set this to a reasonable initial value so that both fields
    // are always set to positive integers.

    this._tty = {
      columns: 100,
      rows: 10
    };

    this._init(name).catch(err => {
      this._deferredReady.reject(err);
    });
  }

  async _init(name) {
    this._httpServer = await TerminalWrapper._makeHttpServer();
    const server = new (_ws().default.Server)({
      server: this._httpServer,
      perMessageDeflate: true
    });
    server.on('connection', ws => {
      ws.on('message', message => {
        const msg = JSON.parse(String(message));

        switch (msg.ch) {
          case 'stdin':
            this._sin.push(msg.data);

            break;

          case 'resize':
            this._tty.columns = msg.columns;
            this._tty.rows = msg.rows;
            this.emit('resize');
            break;
        }
      });
      this._sout = new class extends _stream.default.Writable {
        _write(chunk, encoding, callback) {
          ws.send(JSON.stringify({
            ch: 'stdout',
            data: chunk.toString()
          }));
          callback();
          return false;
        }

      }();
      this._serr = new class extends _stream.default.Writable {
        _write(chunk, encoding, callback) {
          ws.send(JSON.stringify({
            ch: 'stderr',
            data: chunk.toString()
          }));
          callback();
          return false;
        }

      }();

      this._deferredReady.resolve();
    });
    const wsAddress = `ws://${this._httpServer.address().address}:${this._httpServer.address().port}`;
    const args = [require.resolve(PROCESS_WRAPPER), wsAddress];
    this._term = vscode().window.createTerminal({
      name,
      shellPath: 'node',
      shellArgs: args
    });
  }

  close() {
    this._term.dispose();

    this._httpServer.close();

    this.stdout.end();
    this.stderr.end();
  }

  static _makeHttpServer(port = 0, hostname = 'localhost', backlog) {
    return new Promise((resolve, reject) => {
      const server = _http.default.createServer();

      server.listen(port, hostname, backlog, e => {
        if (e) {
          reject(e);
        } else {
          resolve(server);
        }
      });
    });
  }

}

exports.TerminalWrapper = TerminalWrapper;