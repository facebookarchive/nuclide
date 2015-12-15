'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {Disposable} = require('atom');
const WebSocketServer = require('ws').Server;
const Session = require('../VendorLib/session');

import invariant from 'assert';

import {DebuggerProcess} from '../../utils';

import type {nuclide_debugger$DebuggerProcessInfo,}
    from '../../interfaces/Service';

class NodeDebuggerProcess extends DebuggerProcess {
  _debugPort: number;
  _server: ?WebSocketServer;
  _sessionEndCallback: ?() => void;

  constructor(debugPort: number) {
    super();
    this._debugPort = debugPort;
    this._server = null;
  }

  dispose() {
    if (this._server) {
      this._server.close();
    }
  }

  getWebsocketAddress(): Promise<string> {
    // TODO(natthu): Assign random port instead.
    const wsPort = 8080;
    if (!this._server) {
      this._server = new WebSocketServer({port: wsPort});
      this._server.on('connection', websocket => {
        const config = {
          debugPort: this._debugPort,
          preload: false, // This makes the node inspector not load all the source files on startup.
        };
        const session = new Session(config, this._debugPort, websocket);
        session.on('close', this._handleSessionEnd.bind(this));
      });
    }
    // create an instance of DebugServer, and get its ws port.
    return Promise.resolve(`ws=localhost:${wsPort}/`);
  }

  _handleSessionEnd(): void {
    if (this._sessionEndCallback) {
      this._sessionEndCallback();
    }
    this.dispose();
  }

  onSessionEnd(callback: () => void): Disposable {
    this._sessionEndCallback = callback;
    return (new Disposable(() => this._sessionEndCallback = null));
  }
}

const {DebuggerProcessInfo} = require('../../utils');

class ProcessInfo extends DebuggerProcessInfo {
  pid: number;
  _command: string;

  constructor(pid: number, command: string) {
    super('node');

    this.pid = pid;
    this._command = command;
  }

  attach(): DebuggerProcess {
    // Enable debugging in the process.
    process.kill(this.pid, 'SIGUSR1');

    // This is the port that the V8 debugger usually listens on.
    // TODO(natthu): Provide a way to override this in the UI.
    const debugPort = 5858;
    return new NodeDebuggerProcess(debugPort);
  }

  compareDetails(other: nuclide_debugger$DebuggerProcessInfo): number {
    invariant(other instanceof ProcessInfo);
    return this._command === other._command
        ? (this.pid - other.pid)
        : (this._command < other._command) ? -1 : 1;
  }

  displayString(): string {
    return this._command + '(' + this.pid + ')';
  }
}

function getProcessInfoList():
    Promise<Array<nuclide_debugger$DebuggerProcessInfo>> {
  const {asyncExecute} = require('../../../commons');
  return asyncExecute('ps', ['-e', '-o', 'pid,comm'], {})
    .then(result => {
      // $FlowIssue -- https://github.com/facebook/flow/issues/1143
      return result.stdout.toString().split('\n').slice(1).map(line => {
        const words = line.trim().split(' ');
        const pid = Number(words[0]);
        const command = words.slice(1).join(' ');
        const components = command.split('/');
        const name = components[components.length - 1];
        if (name !== 'node') {
          return null;
        }
        return new ProcessInfo(pid, command, name);
      })
        .filter(item => item != null);
    },
    e => {
      return [];
    });
}

module.exports = {
  name: 'node',
  getProcessInfoList,
};
