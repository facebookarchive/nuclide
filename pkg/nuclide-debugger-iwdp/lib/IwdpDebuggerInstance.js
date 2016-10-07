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
import type {
  IwdpDebuggerService as IwdpDebuggerServiceType,
} from '../../nuclide-debugger-iwdp-rpc/lib/IwdpDebuggerService';

import typeof * as IwdpDebuggerService
from '../../nuclide-debugger-iwdp-rpc/lib/IwdpDebuggerService';
import {DebuggerInstance} from '../../nuclide-debugger-base';
import {CompositeDisposable} from 'atom';
import {Disposable} from 'atom';
import WS from 'ws';
import {stringifyError} from '../../commons-node/string';
import {logger} from './logger';
import invariant from 'assert';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

const {log, logError, logInfo} = logger;

export class IwdpDebuggerInstance extends DebuggerInstance {
  _server: ?WS.Server;
  _webSocket: ?WebSocket;
  _disposables: CompositeDisposable;
  _proxy: ?IwdpDebuggerServiceType;

  constructor(processInfo: DebuggerProcessInfo) {
    super(processInfo);
    this._server = null;
    this._webSocket = null;
    this._proxy = null;
    this._disposables = new CompositeDisposable();
  }

  async getWebsocketAddress(): Promise<string> {
    const service: ?IwdpDebuggerService = getServiceByNuclideUri(
      'IwdpDebuggerService',
      this.getTargetUri(),
    );
    invariant(service != null);
    const proxy = new service.IwdpDebuggerService();
    this._disposables.add(proxy);
    this._proxy = proxy;
    await proxy.debug();
    // setup web socket
    // TODO: Assign random port rather than using fixed port.
    const wsPort = 2000;
    const server = new WS.Server({port: wsPort});
    this._server = server;
    server.on('error', error => {
      logError('Server error: ' + error);
      this.dispose();
    });
    server.on('headers', headers => {
      log('Server headers: ' + headers);
    });
    server.on('connection', webSocket => {
      if (this._webSocket) {
        log('Already connected to web socket. Discarding new connection.');
        return;
      }

      log('Connecting to web socket client.');
      this._webSocket = webSocket;
      webSocket.on('message', this._onSocketMessage.bind(this));
      webSocket.on('error', this._onSocketError.bind(this));
      webSocket.on('close', this._onSocketClose.bind(this));
    });
    this._disposables.add(new Disposable(() => this._disposeServer()));
    this._disposables.add(new Disposable(() => this._disposeWebSocket()));

    const result = 'ws=localhost:' + String(wsPort) + '/';
    log('Listening for connection at: ' + result);
    proxy.getServerMessageObservable().refCount().subscribe(
      message => this._sendServerMessageToChromeUi(message),
    );
    return result;
  }

  _sendServerMessageToChromeUi(message: string): void {
    const webSocket = this._webSocket;
    if (webSocket != null) {
      webSocket.send(message);
    }
  }

  _endSession(): void {
    log('Ending Session');
    this.dispose();
  }

  _onSocketMessage(message: string): void {
    log('Recieved webSocket message: ' + message);
    const proxy = this._proxy;
    if (proxy != null) {
      proxy.sendCommand(message);
    }
  }

  _onSocketError(error: Error): void {
    logError('webSocket error ' + stringifyError(error));
    this.dispose();
  }

  _onSocketClose(code: number): void {
    log('webSocket Closed ' + code);
  }

  _disposeWebSocket(): void {
    const webSocket = this._webSocket;
    if (webSocket) {
      this._webSocket = null;
      logInfo('closing webSocket');
      webSocket.close();
    }
  }

  _disposeServer(): void {
    const server = this._server;
    if (server) {
      this._server = null;
      logInfo('closing server');
      server.close();
    }
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
