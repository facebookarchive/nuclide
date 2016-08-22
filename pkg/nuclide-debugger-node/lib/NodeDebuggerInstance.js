'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebuggerProcessInfo} from '../../nuclide-debugger-base';

import WS from 'ws';
import {DisposableSubscription} from '../../commons-node/stream';
import Rx from 'rxjs';
import {Session} from './Session';
import {DebuggerInstance} from '../../nuclide-debugger-base';

export class NodeDebuggerInstance extends DebuggerInstance {
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
