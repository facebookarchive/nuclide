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
import EventEmitter from 'events';
import {attachEvent} from '../../commons-node/event';

const WEBSOCKETSERVER_EVENT = 'WEBSOCKETSERVER_EVENT';
export const WEBSOCKETSERVER_STATUS_ERROR = 'WEBSOCKETSERVER_STATUS_ERROR';
export const WEBSOCKETSERVER_STATUS_HEADERS = 'WEBSOCKETSERVER_STATUS_HEADERS';

export class WebSocketServer {
  _webSocketServer: ?WS.Server;
  _eventEmitter: EventEmitter;

  constructor() {
    this._webSocketServer = null;
    this._eventEmitter = new EventEmitter();
  }

  onStatus(callback: (event: string, params: ?Object) => void): IDisposable {
    return attachEvent(this._eventEmitter, WEBSOCKETSERVER_EVENT, callback);
  }

  start(port: number): Promise<WebSocket> {
    const server = new WS.Server({port});
    server.on('error', error => {
      this._emitStatus(WEBSOCKETSERVER_STATUS_ERROR, error);
    });
    server.on('headers', headers => {
      this._emitStatus(WEBSOCKETSERVER_STATUS_HEADERS, headers);
    });
    return new Promise((resolve, reject) => {
      server.once('connection', webSocket => {
        resolve(webSocket);
      });
    });
  }

  _emitStatus(status: string, args: Object): void {
    this._eventEmitter.emit(WEBSOCKETSERVER_EVENT, status, args);
  }

  dispose(): void {
    if (this._webSocketServer != null) {
      this._webSocketServer.close();
    }
  }
}
