'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  NativeDebuggerService,
} from '../../nuclide-debugger-native-rpc/lib/NativeDebuggerService';
import type {DebuggerProcessInfo} from '../../nuclide-debugger-base';

import utils from './utils';
import {DebuggerInstance} from '../../nuclide-debugger-base';
import {CompositeDisposable, Emitter} from 'atom';
import {translateMessageFromServer, translateMessageToServer} from './ChromeMessageRemoting';
import nuclideUri from '../../commons-node/nuclideUri';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {getConfig} from './utils';
import WS from 'ws';
import {stringifyError} from '../../commons-node/string';

const {log, logInfo, logError} = utils;

const SESSION_END_EVENT = 'session-end-event';

export class LldbDebuggerInstance extends DebuggerInstance {
  _rpcService: NativeDebuggerService;
  _attachPromise: ?Promise<NativeDebuggerService>;
  _chromeWebSocketServer: ?WS.Server;
  _chromeWebSocket: ?WebSocket;
  _disposables: atom$CompositeDisposable;
  _emitter: Emitter;

  constructor(
    processInfo: DebuggerProcessInfo,
    rpcService: NativeDebuggerService,
    outputDisposable: IDisposable,
  ) {
    super(processInfo);
    this._rpcService = rpcService;
    this._attachPromise = null;
    this._chromeWebSocketServer = null;
    this._chromeWebSocket = null;
    this._disposables = new CompositeDisposable();
    this._disposables.add(outputDisposable);
    this._emitter = new Emitter();
    this._registerServerHandlers(rpcService);
  }

  _registerServerHandlers(rpcService: NativeDebuggerService): void {
    this._disposables.add(rpcService);
    this._disposables.add(new UniversalDisposable(
      rpcService.getServerMessageObservable().refCount().subscribe(
        this._handleServerMessage.bind(this),
        this._handleServerError.bind(this),
        this._handleSessionEnd.bind(this),
    )));
  }

  _handleServerMessage(message_: string): void {
    let message = message_;
    log('Recieved server message: ' + message);
    const webSocket = this._chromeWebSocket;
    if (webSocket) {
      message = this._translateMessageIfNeeded(message);
      webSocket.send(message);
    } else {
      logError('Why isn\'t chrome websocket available?');
    }
  }

  _handleServerError(error: string): void {
    logError('Received server error: ' + error);
  }

  _handleSessionEnd(): void {
    log('Ending Session');
    this._emitter.emit(SESSION_END_EVENT);
    this.dispose();
  }

  getWebsocketAddress(): Promise<string> {
    return Promise.resolve(this._startChromeWebSocketServer());
  }

  _startChromeWebSocketServer(): string {
    // setup web socket
    const wsPort = this._getWebSocketPort();
    const server = new WS.Server({port: wsPort});
    this._chromeWebSocketServer = server;
    server.on('error', error => {
      let errorMessage = `Server error: ${error}`;
      if (error.code === 'EADDRINUSE') {
        errorMessage = `The debug port ${error.port} is in use.
        Please choose a different port in the debugger config settings.`;
      }
      atom.notifications.addError(errorMessage);
      logError(errorMessage);
      this.dispose();
    });
    server.on('headers', headers => {
      log('Server headers: ' + headers);
    });
    server.on('connection', webSocket => {
      if (this._chromeWebSocket) {
        log('Already connected to Chrome WebSocket. Discarding new connection.');
        return;
      }

      log('Connecting to Chrome WebSocket client.');
      this._chromeWebSocket = webSocket;
      webSocket.on('message', this._onChromeSocketMessage.bind(this));
      webSocket.on('error', this._onChromeSocketError.bind(this));
      webSocket.on('close', this._onChromeSocketClose.bind(this));
    });

    const result = 'ws=localhost:' + String(wsPort) + '/';
    logInfo('Listening for connection at: ' + result);
    return result;
  }

  _getWebSocketPort(): number {
    // Use the port from config setting if set, otherwise
    // generate a random port.
    const configPort = Number(getConfig().debugPort);
    return Number.isInteger(configPort) && configPort > 0 ?
      configPort :
      this._generateRandomInteger(2000, 65535);
  }

  _generateRandomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  onSessionEnd(callback: () => void): IDisposable {
    return this._emitter.on(SESSION_END_EVENT, callback);
  }

  _translateMessageIfNeeded(message_: string): string {
    let message = message_;
    // TODO: do we really need isRemote() checking?
    if (nuclideUri.isRemote(this.getTargetUri())) {
      message = translateMessageFromServer(
        nuclideUri.getHostname(this.getTargetUri()),
        message);
    }
    return message;
  }

  _onChromeSocketMessage(message: string): void {
    log('Recieved Chrome message: ' + message);
    this._rpcService.sendCommand(translateMessageToServer(message));
  }

  _onChromeSocketError(error: Error): void {
    logError('Chrome webSocket error ' + stringifyError(error));
    this.dispose();
  }

  _onChromeSocketClose(code: number): void {
    log('Chrome webSocket Closed ' + code);
    this.dispose();
  }

  dispose() {
    this._disposables.dispose();
    const webSocket = this._chromeWebSocket;
    if (webSocket) {
      logInfo('closing Chrome webSocket');
      webSocket.close();
      this._chromeWebSocket = null;
    }
    const server = this._chromeWebSocketServer;
    if (server) {
      logInfo('closing Chrome server');
      server.close();
      this._chromeWebSocketServer = null;
    }
  }
}
