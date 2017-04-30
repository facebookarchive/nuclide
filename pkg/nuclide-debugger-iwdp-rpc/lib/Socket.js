/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import WS from 'ws';
import {createWebSocketListener} from './createWebSocketListener';
import invariant from 'assert';

import type {Observable} from 'rxjs';

type Id = number;
type onResponseReceived = (response: Object) => void;

export class Socket {
  _webSocket: ?WS;
  _webSocketOpenPromise: Promise<WS>;
  _disposables: UniversalDisposable;
  _pendingRequests: Map<Id, onResponseReceived>;
  _webSocketClosed: boolean;
  _id: number;
  _handleChromeEvent: (message: Object) => mixed;

  constructor(
    url: string,
    handleChromeEvent: (message: Object) => mixed,
    handleSocketEnd: () => mixed,
  ) {
    this._id = 0;
    this._handleChromeEvent = handleChromeEvent;
    this._webSocket = null;
    this._pendingRequests = new Map();
    this._webSocketClosed = false;
    const webSocket = new WS(url);
    // It's not enough to just construct the websocket -- we have to also wait for it to open.
    this._webSocketOpenPromise = new Promise(resolve =>
      webSocket.on('open', () => resolve(webSocket)),
    );
    webSocket.on('close', () => {
      this._webSocketClosed = true;
      handleSocketEnd();
    });
    const socketMessages: Observable<string> = createWebSocketListener(
      webSocket,
    );
    this._disposables = new UniversalDisposable(() => {
      if (!this._webSocketClosed) {
        webSocket.close();
      }
    }, socketMessages.subscribe(message => this._handleSocketMessage(message)));
  }

  async sendCommand(message: Object): Promise<Object> {
    if (this._webSocket == null) {
      this._webSocket = await this._webSocketOpenPromise;
    }
    const webSocket = this._webSocket;
    if (message.id == null) {
      message.id = this._id++;
    }
    return new Promise(resolve => {
      this._pendingRequests.set(message.id, resolve);
      webSocket.send(JSON.stringify(message));
    });
  }

  _handleSocketMessage(message: string): void {
    const obj = JSON.parse(message);
    if (isEvent(obj)) {
      this._handleChromeEvent(obj);
    } else {
      const resolve = this._pendingRequests.get(obj.id);
      invariant(
        resolve != null,
        `Got response for a request that wasn't sent: ${message}`,
      );
      this._pendingRequests.delete(obj.id);
      resolve(obj);
    }
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

function isEvent(obj: Object): boolean {
  return obj.id == null;
}
