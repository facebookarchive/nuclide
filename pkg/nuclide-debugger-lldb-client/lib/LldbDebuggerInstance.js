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
  DebuggerConnection as DebuggerConnectionType,
} from '../../nuclide-debugger-lldb-server/lib/DebuggerRpcServiceInterface';
import type {DebuggerProcessInfo} from '../../nuclide-debugger-atom';

import {EventEmitter} from 'events';
import utils from './utils';
import {DebuggerInstance} from '../../nuclide-debugger-atom';
import {CompositeDisposable} from 'atom';
import {translateMessageFromServer, translateMessageToServer} from './ChromeMessageRemoting';
import remoteUri from '../../nuclide-remote-uri';
import {Disposable} from 'atom';
import {DisposableSubscription} from '../../nuclide-commons';
import {getConfig} from './utils';
import WS from 'ws';

const {stringifyError} = require('../../nuclide-commons').error;

const {log, logInfo, logError} = utils;

const SESSION_END_EVENT = 'session-end-event';

export class LldbDebuggerInstance extends DebuggerInstance {
  _debuggerConnection: ?DebuggerConnectionType;
  _attachPromise: ?Promise<DebuggerConnectionType>;
  _chromeWebSocketServer: ?WS.Server;
  _chromeWebSocket: ?WebSocket;
  _disposables: atom$CompositeDisposable;
  _emitter: EventEmitter;

  constructor(
    processInfo: DebuggerProcessInfo,
    connection: DebuggerConnectionType,
    outputDisposable: ?IDisposable,
  ) {
    super(processInfo);

    this._debuggerConnection = null;
    this._attachPromise = null;
    this._chromeWebSocketServer = null;
    this._chromeWebSocket = null;
    this._disposables = new CompositeDisposable();
    if (outputDisposable != null) {
      this._disposables.add(outputDisposable);
    }
    this._emitter = new EventEmitter();
    this._registerConnection(connection);
  }

  _registerConnection(connection: DebuggerConnectionType): void {
    this._debuggerConnection = connection;
    this._disposables.add(connection);
    this._disposables.add(new DisposableSubscription(
      connection.getServerMessageObservable().subscribe(
        this._handleServerMessage.bind(this),
        this._handleServerError.bind(this),
        this._handleSessionEnd.bind(this)
    )));
  }

  _handleServerMessage(message: string): void {
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

  onSessionEnd(callback: () => void): Disposable {
    this._emitter.on(SESSION_END_EVENT, callback);
    return (new Disposable(() => this._emitter.removeListener(SESSION_END_EVENT, callback)));
  }

  _translateMessageIfNeeded(message: string): string {
    // TODO: do we really need isRemote() checking?
    if (remoteUri.isRemote(this.getTargetUri())) {
      message = translateMessageFromServer(
        remoteUri.getHostname(this.getTargetUri()),
        remoteUri.getPort(this.getTargetUri()),
        message);
    }
    return message;
  }

  _onChromeSocketMessage(message: string): void {
    log('Recieved Chrome message: ' + message);
    const connection = this._debuggerConnection;
    if (connection) {
      connection.sendCommand(translateMessageToServer(message));
    } else {
      logError('Why isn\'t debuger RPC service available?');
    }
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
