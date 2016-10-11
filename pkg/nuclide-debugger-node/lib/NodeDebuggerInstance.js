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
  NodeDebuggerService,
} from '../../nuclide-debugger-node-rpc/lib/NodeDebuggerService';

import utils from './utils';
import {DebuggerInstance} from '../../nuclide-debugger-base';
import {Emitter} from 'atom';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {translateMessageFromServer, translateMessageToServer} from './ChromeMessageRemoting';
import nuclideUri from '../../commons-node/nuclideUri';
import {getConfig} from './utils';
import {
  WebSocketServer,
} from '../../nuclide-debugger-common/lib/WebSocketServer';
import {stringifyError} from '../../commons-node/string';

const {log, logInfo, logError} = utils;
const SESSION_END_EVENT = 'session-end-event';

export class NodeDebuggerInstance extends DebuggerInstance {
  _rpcService: NodeDebuggerService;
  _disposables: UniversalDisposable;
  _chromeWebSocketServer: WebSocketServer;
  _chromeWebSocket: ?WebSocket;
  _emitter: Emitter;

  constructor(processInfo: DebuggerProcessInfo, rpcService: NodeDebuggerService) {
    super(processInfo);
    this._rpcService = rpcService;
    this._disposables = new UniversalDisposable();
    this._disposables.add(rpcService);
    this._chromeWebSocketServer = new WebSocketServer();
    this._chromeWebSocket = null;
    this._emitter = new Emitter();
    this._disposables.add(this._chromeWebSocketServer);
    this._registerServerHandlers();
  }

  _registerServerHandlers(): void {
    this._disposables.add(
      this._rpcService.getServerMessageObservable().refCount().subscribe(
        this._handleServerMessage.bind(this),
        this._handleServerError.bind(this),
        this._handleSessionEnd.bind(this),
      ),
    );
  }

  getWebsocketAddress(): Promise<string> {
    return Promise.resolve(this._startChromeWebSocketServer());
  }

  _startChromeWebSocketServer(): string {
    // setup web socket
    const wsPort = this._getWebSocketPort();
    this._chromeWebSocketServer.start(wsPort)
      .catch(this._handleWebSocketServerError.bind(this))
      .then(this._handleWebSocketServerConnection.bind(this));
    const result = 'ws=localhost:' + String(wsPort) + '/';
    logInfo('Listening for connection at: ' + result);
    return result;
  }

  _handleWebSocketServerError(error: Object): void {
    let errorMessage = `Server error: ${JSON.stringify(error)}`;
    if (error.code === 'EADDRINUSE') {
      errorMessage = `The debug port ${error.port} is in use.
      Please choose a different port in the debugger config settings.`;
    }
    atom.notifications.addError(errorMessage);
    logError(errorMessage);
    this.dispose();
  }

  _handleWebSocketServerConnection(webSocket: WebSocket): void {
    if (this._chromeWebSocket) {
      log('Already connected to Chrome WebSocket. Discarding new connection.');
      webSocket.close();
      return;
    }
    log('Connecting to Chrome WebSocket client.');
    this._chromeWebSocket = webSocket;
    // $FlowIssue.
    webSocket.on('message', this._handleChromeSocketMessage.bind(this));
    // $FlowIssue.
    webSocket.on('error', this._handleChromeSocketError.bind(this));
    // $FlowIssue.
    webSocket.on('close', this._handleChromeSocketClose.bind(this));
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

  onSessionEnd(callback: () => mixed): IDisposable {
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

  _handleChromeSocketMessage(message: string): void {
    log('Recieved Chrome message: ' + message);
    this._rpcService.sendCommand(translateMessageToServer(message));
  }

  _handleChromeSocketError(error: Error): void {
    logError('Chrome webSocket error ' + stringifyError(error));
    this.dispose();
  }

  _handleChromeSocketClose(code: number): void {
    log(`Chrome webSocket closed: ${code}`);
    this.dispose();
  }

  dispose() {
    this._disposables.dispose();
  }
}
