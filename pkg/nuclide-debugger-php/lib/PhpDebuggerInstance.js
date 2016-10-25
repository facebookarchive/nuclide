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
  PhpDebuggerService as PhpDebuggerServiceType,
} from '../../nuclide-debugger-php-rpc/lib/PhpDebuggerService';

import utils from './utils';
const {log, logInfo, logError, setLogLevel} = utils;

import {DebuggerInstance} from '../../nuclide-debugger-base';
import {ObservableManager} from './ObservableManager';
import {CompositeDisposable} from 'atom';
import {translateMessageFromServer, translateMessageToServer} from './ChromeMessageRemoting';
import nuclideUri from '../../commons-node/nuclideUri';
import {Disposable} from 'atom';
import WS from 'ws';
import {stringifyError} from '../../commons-node/string';
import {getConfig} from './utils';


export class PhpDebuggerInstance extends DebuggerInstance {
  _rpcService: PhpDebuggerServiceType;
  _server: ?WS.Server;
  _webSocket: ?WebSocket;
  _sessionEndCallback: ?() => void;
  _disposables: CompositeDisposable;

  constructor(
    processInfo: DebuggerProcessInfo,
    rpcService: PhpDebuggerServiceType,
  ) {
    super(processInfo);
    this._rpcService = rpcService;
    this._server = null;
    this._webSocket = null;
    this._sessionEndCallback = null;
    this._disposables = new CompositeDisposable(
      new ObservableManager(
        rpcService.getNotificationObservable().refCount(),
        rpcService.getServerMessageObservable().refCount(),
        rpcService.getOutputWindowObservable().refCount().map(message => {
          const serverMessage = translateMessageFromServer(
            nuclideUri.getHostname(this.getTargetUri()),
            message,
          );
          return JSON.parse(serverMessage);
        }),
        this._sendServerMessageToChromeUi.bind(this),
        this._endSession.bind(this),
      ),
    );
    setLogLevel(getConfig().logLevel);
  }

  async getWebsocketAddress(): Promise<string> {
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
    return result;
  }

  onSessionEnd(callback: () => void): Disposable {
    this._sessionEndCallback = callback;
    return new Disposable(() => { this._sessionEndCallback = null; });
  }

  _sendServerMessageToChromeUi(message: string): void {
    const webSocket = this._webSocket;
    if (webSocket != null) {
      webSocket.send(
        translateMessageFromServer(
          nuclideUri.getHostname(this.getTargetUri()),
          message,
        ),
      );
    }
  }

  _endSession(): void {
    log('Ending Session');
    if (this._sessionEndCallback) {
      this._sessionEndCallback();
    }
    this.dispose();
  }

  _onSocketMessage(message: string): void {
    log('Recieved webSocket message: ' + message);
    this._rpcService.sendCommand(translateMessageToServer(message));
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
