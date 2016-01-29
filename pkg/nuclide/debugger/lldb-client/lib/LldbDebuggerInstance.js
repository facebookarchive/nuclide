'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../../remote-uri';
import type {
  DebuggerRpcService as DebuggerRpcServiceType,
  DebuggerConnection as DebuggerConnectionType,
  AttachTargetInfo,
} from '../../lldb-server/lib/DebuggerRpcServiceInterface';

import invariant from 'assert';
import {EventEmitter} from 'events';
import utils from './utils';
import {DebuggerInstance} from '../../atom';
const {log, logInfo, logError} = utils;
const {translateMessageFromServer, translateMessageToServer} = require('./ChromeMessageRemoting');
const remoteUri = require('../../../remote-uri');
const {Disposable} = require('atom');
const WebSocketServer = require('ws').Server;
const {stringifyError} = require('../../../commons').error;

const SESSION_END_EVENT = 'session-end-event';

export class LldbDebuggerInstance extends DebuggerInstance {
  _targetUri: NuclideUri;
  _targetInfo: AttachTargetInfo;
  _rpcService: ?DebuggerRpcServiceType;
  _debuggerConnection: ?DebuggerConnectionType;
  _attachPromise: ?Promise<DebuggerConnectionType>;
  _chromeWebSocketServer: ?WebSocketServer;
  _chromeWebSocket: ?WebSocket;
  _disposables: atom$CompositeDisposable;
  _emitter: EventEmitter;

  constructor(targetUri: NuclideUri, targetInfo: AttachTargetInfo) {
    super();
    this._targetUri = targetUri;
    this._targetInfo = targetInfo;
    this._rpcService = null;
    this._debuggerConnection = null;
    this._attachPromise = null;
    this._chromeWebSocketServer = null;
    this._chromeWebSocket = null;
    const {CompositeDisposable} = require('atom');
    this._disposables = new CompositeDisposable();
    this._emitter = new EventEmitter();
  }

  attach(): void {
    const rpcService = this._getRpcService();
    this._attachPromise = rpcService.attach(this._targetInfo.pid);
  }

  _getRpcService(): DebuggerRpcServiceType {
    if (!this._rpcService) {
      const {DebuggerRpcService} = require('../../../client').
        getServiceByNuclideUri('LLDBDebuggerRpcService', this._targetUri);
      const rpcService = new DebuggerRpcService();
      this._rpcService = rpcService;
      this._disposables.add(rpcService);
    }
    invariant(this._rpcService);
    return this._rpcService;
  }

  async getWebsocketAddress(): Promise<string> {
    // Start websocket server with Chrome after attach completed.
    invariant(this._attachPromise);
    const connection = await this._attachPromise;
    this._registerConnection(connection);
    return Promise.resolve(this._startChromeWebSocketServer());
  }

  _registerConnection(connection: DebuggerConnectionType): void {
    this._debuggerConnection = connection;
    this._disposables.add(connection);
    this._disposables.add(connection.getServerMessageObservable().subscribe(
      this._handleServerMessage.bind(this),
      this._handleServerError.bind(this),
      this._handleSessionEnd.bind(this)
    ));
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

  _startChromeWebSocketServer(): string {
    // setup web socket
    // TODO: Assign random port rather than using fixed port.
    const wsPort = 2000;
    const server = new WebSocketServer({port: wsPort});
    this._chromeWebSocketServer = server;
    server.on('error', error => {
      logError('Server error: ' + error);
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
    log('Listening for connection at: ' + result);
    return result;
  }

  onSessionEnd(callback: () => void): Disposable {
    this._emitter.on(SESSION_END_EVENT, callback);
    return (new Disposable(() => this._emitter.removeListener(SESSION_END_EVENT, callback)));
  }

  _translateMessageIfNeeded(message: string): string {
    // TODO: do we really need isRemote() checking?
    if (remoteUri.isRemote(this._targetUri)) {
      message = translateMessageFromServer(
        remoteUri.getHostname(this._targetUri),
        remoteUri.getPort(this._targetUri),
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
