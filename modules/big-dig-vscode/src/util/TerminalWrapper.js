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

import {Deferred} from 'nuclide-commons/promise';

import * as vscode from 'vscode';
import Stream from 'stream';
import WS from 'ws';
import http from 'http';
import EventEmitter from 'events';

// Process to run in vscode's terminal
const PROCESS_WRAPPER = './proxy_executable.js';

type ParsedMessage =
  | {ch: 'stdin', data: string}
  | {ch: 'resize', columns: number, rows: number};

/**
 * Creates a vscode.Terminal with access to stdio and resizing.
 */
export class TerminalWrapper extends EventEmitter {
  _term: vscode.Terminal;
  _httpServer: http.Server;
  _sin = new class extends Stream.Readable {
    _read() {}
  }();

  _sout: Stream.Writable;
  _serr: Stream.Writable;
  _deferredReady: Deferred<void>;
  _tty: {columns: number, rows: number};

  get ready(): Promise<void> {
    return this._deferredReady.promise;
  }

  get stdin(): Stream.Readable {
    return this._sin;
  }

  get stdout(): Stream.Writable {
    return this._sout;
  }

  get stderr(): Stream.Writable {
    return this._serr;
  }

  get terminal(): vscode.Terminal {
    return this._term;
  }

  get columns(): number {
    return this._tty.columns;
  }

  get rows(): number {
    return this._tty.rows;
  }

  constructor(name: string) {
    super();
    this._deferredReady = new Deferred();
    // Note that we set this to a reasonable initial value so that both fields
    // are always set to positive integers.
    this._tty = {columns: 100, rows: 10};
    this._init(name).catch(err => {
      this._deferredReady.reject(err);
    });
  }

  async _init(name: string) {
    this._httpServer = await TerminalWrapper._makeHttpServer();

    const server = new WS.Server({
      server: this._httpServer,
      perMessageDeflate: true,
    });
    server.on('connection', (ws: WS) => {
      ws.on('message', (message: mixed) => {
        const msg: ParsedMessage = JSON.parse(String(message));
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
      this._sout = new class extends Stream.Writable {
        _write(
          chunk: Buffer | string,
          encoding: string,
          callback: Function,
        ): boolean {
          ws.send(JSON.stringify({ch: 'stdout', data: chunk.toString()}));
          callback();
          return false;
        }
      }();
      this._serr = new class extends Stream.Writable {
        _write(
          chunk: Buffer | string,
          encoding: string,
          callback: Function,
        ): boolean {
          ws.send(JSON.stringify({ch: 'stderr', data: chunk.toString()}));
          callback();
          return false;
        }
      }();

      this._deferredReady.resolve();
    });

    const wsAddress = `ws://${this._httpServer.address().address}:${
      this._httpServer.address().port
    }`;
    const args = [require.resolve(PROCESS_WRAPPER), wsAddress];
    this._term = vscode.window.createTerminal({
      name,
      shellPath: 'node',
      shellArgs: args,
    });
  }

  close(): void {
    this._term.dispose();
    this._httpServer.close();
    this.stdout.end();
    this.stderr.end();
  }

  static _makeHttpServer(
    port: number = 0,
    hostname: string = 'localhost',
    backlog?: number,
  ): Promise<http.Server> {
    return new Promise((resolve, reject) => {
      const server = http.createServer();
      server.listen(port, hostname, backlog, (e: any) => {
        if (e) {
          reject(e);
        } else {
          resolve(server);
        }
      });
    });
  }
}
