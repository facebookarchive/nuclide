'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ConnectableObservable} from 'rxjs';
import type {CategoryLogger} from '../../nuclide-logging';

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
    this._logger = getCategoryLogger(`nuclide-debugger-${debuggerRpcServiceName}`);
    this._subscriptions = new UniversalDisposable(this._clientCallback);
  }

  getClientCallback(): ClientCallback {
    return this._clientCallback;
  }

  getLogger(): CategoryLogger {
    return this._logger;
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

export class DebuggerWebsocketRpcService extends DebuggerRpcServiceBase {
  _webSocket: ?WS;

  async registerWebsocketClient(
    websocketAddress: string,
  ): Promise<void> {
    const webSocket = await this._startWebsocketClient(websocketAddress);
    this._webSocket = webSocket;
    this._subscriptions.add(() => webSocket.terminate());
    webSocket.on('message', this._handleWebsocketServerMessage.bind(this));
  }

  _handleWebsocketServerMessage(message: string): void {
    this._clientCallback.sendChromeMessage(message);
  }

  _startWebsocketClient(websocketAddress: string): Promise<WS> {
    return new Promise((resolve, reject) => {
      const ws = new WS(websocketAddress);
      ws.on('open', () => {
        // Successfully connected with lldb python process, fulfill the promise.
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
