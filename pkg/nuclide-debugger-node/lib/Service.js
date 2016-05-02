'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import WS from 'ws';
import invariant from 'assert';
import {DebuggerInstance, DebuggerProcessInfo} from '../../nuclide-debugger-atom';
import {DisposableSubscription} from '../../nuclide-commons';
import Rx from 'rxjs';

import type {NuclideUri} from '../../nuclide-remote-uri';

class NodeDebuggerInstance extends DebuggerInstance {
  _close$: Rx.Subject<mixed>;
  _debugPort: number;
  _server: ?WS.Server;
  _sessionEndCallback: ?() => void;

  constructor(processInfo: DebuggerProcessInfo, debugPort: number) {
    super(processInfo);
    this._debugPort = debugPort;
    this._server = null;
    this._close$ = new Rx.Subject();
    this._close$.first().subscribe(() => { this.dispose(); });
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
      this._server = new WS.Server({port: wsPort});
      this._server.on('connection', websocket => {
        const config = {
          debugPort: this._debugPort,
          preload: false, // This makes the node inspector not load all the source files on startup.
        };
        const {Session} = require('./Session');
        const session = new Session(config, this._debugPort, websocket);
        Rx.Observable.fromEvent(session, 'close').subscribe(this._close$);
      });
    }
    // create an instance of DebugServer, and get its ws port.
    return Promise.resolve(`ws=localhost:${wsPort}/`);
  }

  onSessionEnd(callback: () => mixed): IDisposable {
    return new DisposableSubscription(this._close$.first().subscribe(callback));
  }
}

class NodeDebuggerProcessInfo extends DebuggerProcessInfo {
  pid: number;
  _command: string;

  constructor(pid: number, command: string, targetUri: NuclideUri) {
    super('node', targetUri);

    this.pid = pid;
    this._command = command;
  }

  async debug(): Promise<DebuggerInstance> {
    // Enable debugging in the process.
    process.kill(this.pid, 'SIGUSR1');

    // This is the port that the V8 debugger usually listens on.
    // TODO(natthu): Provide a way to override this in the UI.
    const debugPort = 5858;
    return new NodeDebuggerInstance(this, debugPort);
  }

  compareDetails(other: DebuggerProcessInfo): number {
    invariant(other instanceof NodeDebuggerProcessInfo);
    return this._command === other._command
        ? (this.pid - other.pid)
        : (this._command < other._command) ? -1 : 1;
  }

  displayString(): string {
    return this._command + '(' + this.pid + ')';
  }
}

function getProcessInfoList(): Promise<Array<DebuggerProcessInfo>> {
  const {asyncExecute} = require('../../nuclide-commons');
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
        // TODO(jonaldislarry): currently first dir only
        const targetUri = atom.project.getDirectories()[0].getPath();
        return new NodeDebuggerProcessInfo(pid, command, targetUri);
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
  NodeDebuggerInstance,
};
