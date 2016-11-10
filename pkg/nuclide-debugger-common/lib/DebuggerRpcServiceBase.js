'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CategoryLogger} from '../../nuclide-logging';
import type {ConnectableObservable} from 'rxjs';

import WS from 'ws';
import {ClientCallback} from '../../nuclide-debugger-common';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {getCategoryLogger} from '../../nuclide-logging';

export class DebuggerRpcServiceBase {
  _clientCallback: ClientCallback;
  _logger: CategoryLogger;
  _subscriptions: UniversalDisposable;

  constructor(debuggerRpcServiceName: string) {
    this._clientCallback = new ClientCallback();
    this._logger = getCategoryLogger(`nuclide-debugger-${debuggerRpcServiceName}-rpc`);
    this._subscriptions = new UniversalDisposable(this._clientCallback);
  }

  getClientCallback(): ClientCallback {
    return this._clientCallback;
  }

  getLogger(): CategoryLogger {
    return this._logger;
  }

  getSubscriptions(): UniversalDisposable {
    return this._subscriptions;
  }

  getOutputWindowObservable(): ConnectableObservable<string> {
    return this._clientCallback.getOutputWindowObservable().publish();
  }

  getServerMessageObservable(): ConnectableObservable<string> {
    return this._clientCallback.getServerMessageObservable().publish();
  }

  dispose(): Promise<void> {
    this._subscriptions.dispose();
    return Promise.resolve();
  }
}

// TODO: make this transportation plugable.
/**
 * Debugger base rpc service using WebSocket protocol to communicate with backend.
 */
export class DebuggerRpcWebSocketService extends DebuggerRpcServiceBase {
  _webSocket: ?WS;

  async connectToWebSocketServer(
    webSocketServerAddress: string,
  ): Promise<void> {
    const webSocket = await this._startWebSocketClient(webSocketServerAddress);
    this._webSocket = webSocket;
    this._subscriptions.add(() => webSocket.terminate());
    webSocket.on('message', this._handleWebSocketServerMessage.bind(this));
  }

  _handleWebSocketServerMessage(message: string): void {
    this._clientCallback.sendChromeMessage(message);
  }

  _startWebSocketClient(webSocketServerAddress: string): Promise<WS> {
    return new Promise((resolve, reject) => {
      const ws = new WS(webSocketServerAddress);
      ws.on('open', () => {
        // Successfully connected with WS server, fulfill the promise.
        resolve(ws);
      });
    });
  }

  sendCommand(message: string): Promise<void> {
    const webSocket = this._webSocket;
    if (webSocket != null) {
      this.getLogger().logTrace(`forward client message to server: ${message}`);
      webSocket.send(message);
    } else {
      this.getLogger().logInfo(`Nuclide sent message to server after socket closed: ${message}`);
    }
    return Promise.resolve();
  }
}
