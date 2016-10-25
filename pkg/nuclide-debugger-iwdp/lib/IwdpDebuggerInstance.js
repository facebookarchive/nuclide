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
import type {IwdpDebuggerService} from '../../nuclide-debugger-iwdp-rpc/lib/IwdpDebuggerService';

import {DebuggerInstanceBase} from '../../nuclide-debugger-base';
import WS from 'ws';
import {stringifyError} from '../../commons-node/string';
import {logger} from './logger';
import {WebSocketServer} from '../../nuclide-debugger-common/lib/WebSocketServer';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

const {log, logError, logInfo} = logger;

export class IwdpDebuggerInstance extends DebuggerInstanceBase {
  _server: WebSocketServer;
  _webSocket: ?WS;
  _disposables: UniversalDisposable;
  _rpcService: IwdpDebuggerService;

  constructor(processInfo: DebuggerProcessInfo, rpcService: IwdpDebuggerService) {
    super(processInfo);
    this._server = new WebSocketServer();
    this._webSocket = null;
    this._rpcService = rpcService;
    this._disposables = new UniversalDisposable(
      this._server,
      rpcService.getServerMessageObservable().refCount().subscribe(
        this._sendServerMessageToChromeUi.bind(this),
        this._onServerError.bind(this),
        this._onServerEnd.bind(this),
      ),
      rpcService,
    );
  }

  async getWebsocketAddress(): Promise<string> {
    const wsPort = 2000;
    this._server
      .start(wsPort)
      .then(webSocket => this._handleWebSocketServerConnection(webSocket))
      .catch(error => logError(`Server encountered error: ${error}`));
    const result = 'ws=localhost:' + String(wsPort) + '/';
    log('Listening for connection at: ' + result);
    return result;
  }

  _handleWebSocketServerConnection(webSocket: WS): void {
    this._webSocket = webSocket;
    webSocket.on('message', this._onSocketMessage.bind(this));
    webSocket.on('error', this._onSocketError.bind(this));
    webSocket.on('close', this._onSocketClose.bind(this));
    this._disposables.add(this._disposeWebSocket.bind(this));
  }

  _onSocketMessage(message: string): void {
    log(`Received webSocket message: ${message}`);
    const rpcService = this._rpcService;
    if (rpcService != null) {
      rpcService.sendCommand(message);
    }
  }

  _onSocketError(error: Error): void {
    logError('webSocket error ' + stringifyError(error));
    this.dispose();
  }

  _onSocketClose(code: number): void {
    log('webSocket Closed ' + code);
  }

  _sendServerMessageToChromeUi(message: string): void {
    // Some messages are so big they aren't helpful to log, such as the source map URL, which can
    // be many thousands of bytes.  So we substring for logs, since most messages smaller than 5000.
    log(`Sending message to client: ${message.substring(0, 5000)}`);
    const webSocket = this._webSocket;
    if (webSocket != null) {
      webSocket.send(message);
    }
  }

  _onServerError(error: string): void {
    logError(`RPC service error: ${error}`);
  }

  _onServerEnd(): void {
    logError('RPC service server messages completed.');
  }

  _disposeWebSocket(): void {
    const webSocket = this._webSocket;
    if (webSocket) {
      this._webSocket = null;
      logInfo('closing webSocket');
      webSocket.close();
    }
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
