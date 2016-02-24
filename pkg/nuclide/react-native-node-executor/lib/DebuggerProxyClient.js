'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ChildManager from './ChildManager';
import {CompositeDisposable, Disposable} from 'atom';
import {EventEmitter} from 'events';
import Rx from 'rx';
import WebSocket from 'ws';

const EXECUTOR_PORT = 8081;
const WS_URL = `ws://localhost:${EXECUTOR_PORT}/debugger-proxy?role=debugger&name=Nuclide`;

export class DebuggerProxyClient {

  _children: Set;
  _shouldConnect: boolean;
  _emitter: EventEmitter;
  _wsDisposable: ?IDisposable;

  constructor() {
    this._children = new Set();
    this._shouldConnect = false;
    this._emitter = new EventEmitter();
  }

  connect(): void {
    if (this._shouldConnect) {
      return;
    }
    this._shouldConnect = true;
    this._tryToConnect();
  }

  disconnect(): void {
    this._shouldConnect = false;
    this._killConnection();
  }

  onDidEvalApplicationScript(callback: (pid: number) => void | Promise<void>): IDisposable {
    this._emitter.on('eval_application_script', callback);
    return new Disposable(() => {
      this._emitter.removeListener('eval_application_script', callback);
    });
  }

  _tryToConnect(): void {
    this._killConnection();

    if (!this._shouldConnect) {
      return;
    }

    const ws = new WebSocket(WS_URL);
    const onReply = (replyID, result) => { ws.send(JSON.stringify({replyID, result})); };

    // TODO(matthewwithanm): Don't share an emitter; add API for subscribing to what we want to
    //   ChildManager.
    const childManager = new ChildManager(onReply, this._emitter);
    this._children.add(childManager);

    this._wsDisposable = new CompositeDisposable(
      new Disposable(() => {
        childManager.killChild();
        this._children.delete(childManager);
      }),
      Rx.Observable.fromEvent(ws, 'message')
        .subscribe(rawMessage => {
          const message = JSON.parse(rawMessage);
          if (message.$close) {
            this.disconnect();
            return;
          }
          childManager.handleMessage(message);
        }),
      Rx.Observable.fromEvent(ws, 'close').subscribe(() => {
        this._killConnection();

        // Keep attempting to connect.
        setTimeout(this._tryToConnect.bind(this), 500);
      }),
      new Disposable(() => { ws.close(); }),
    );
  }

  _killConnection(): void {
    if (this._wsDisposable) {
      this._wsDisposable.dispose();
      this._wsDisposable = null;
    }
  }

}
