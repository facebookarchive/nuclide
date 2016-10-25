'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeDebuggerInstance = undefined;

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _utils2;

function _load_utils2() {
  return _utils2 = require('./utils');
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _atom = require('atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _ChromeMessageRemoting;

function _load_ChromeMessageRemoting() {
  return _ChromeMessageRemoting = require('./ChromeMessageRemoting');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _WebSocketServer;

function _load_WebSocketServer() {
  return _WebSocketServer = require('../../nuclide-debugger-common/lib/WebSocketServer');
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (_utils || _load_utils()).default.log;

const logInfo = (_utils || _load_utils()).default.logInfo;

const logError = (_utils || _load_utils()).default.logError;

const SESSION_END_EVENT = 'session-end-event';

let NodeDebuggerInstance = exports.NodeDebuggerInstance = class NodeDebuggerInstance extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerInstance {

  constructor(processInfo, rpcService) {
    super(processInfo);
    this._rpcService = rpcService;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._disposables.add(rpcService);
    this._chromeWebSocketServer = new (_WebSocketServer || _load_WebSocketServer()).WebSocketServer();
    this._chromeWebSocket = null;
    this._emitter = new _atom.Emitter();
    this._disposables.add(this._chromeWebSocketServer);
    this._registerServerHandlers();
  }

  _registerServerHandlers() {
    this._disposables.add(this._rpcService.getServerMessageObservable().refCount().subscribe(this._handleServerMessage.bind(this), this._handleServerError.bind(this), this._handleSessionEnd.bind(this)));
  }

  getWebsocketAddress() {
    return Promise.resolve(this._startChromeWebSocketServer());
  }

  _startChromeWebSocketServer() {
    // setup web socket
    const wsPort = this._getWebSocketPort();
    this._chromeWebSocketServer.start(wsPort).catch(this._handleWebSocketServerError.bind(this)).then(this._handleWebSocketServerConnection.bind(this));
    const result = 'ws=localhost:' + String(wsPort) + '/';
    logInfo('Listening for connection at: ' + result);
    return result;
  }

  _handleWebSocketServerError(error) {
    let errorMessage = `Server error: ${ JSON.stringify(error) }`;
    if (error.code === 'EADDRINUSE') {
      errorMessage = `The debug port ${ error.port } is in use.
      Please choose a different port in the debugger config settings.`;
    }
    atom.notifications.addError(errorMessage);
    logError(errorMessage);
    this.dispose();
  }

  _handleWebSocketServerConnection(webSocket) {
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

  _getWebSocketPort() {
    // Use the port from config setting if set, otherwise
    // generate a random port.
    const configPort = Number((0, (_utils2 || _load_utils2()).getConfig)().debugPort);
    return Number.isInteger(configPort) && configPort > 0 ? configPort : this._generateRandomInteger(2000, 65535);
  }

  _generateRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  onSessionEnd(callback) {
    return this._emitter.on(SESSION_END_EVENT, callback);
  }

  _translateMessageIfNeeded(message_) {
    let message = message_;
    // TODO: do we really need isRemote() checking?
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(this.getTargetUri())) {
      message = (0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageFromServer)((_nuclideUri || _load_nuclideUri()).default.getHostname(this.getTargetUri()), message);
    }
    return message;
  }

  _handleServerMessage(message_) {
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

  _handleServerError(error) {
    logError('Received server error: ' + error);
  }

  _handleSessionEnd() {
    log('Ending Session');
    this._emitter.emit(SESSION_END_EVENT);
    this.dispose();
  }

  _handleChromeSocketMessage(message) {
    log('Recieved Chrome message: ' + message);
    this._rpcService.sendCommand((0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageToServer)(message));
  }

  _handleChromeSocketError(error) {
    logError('Chrome webSocket error ' + (0, (_string || _load_string()).stringifyError)(error));
    this.dispose();
  }

  _handleChromeSocketClose(code) {
    log(`Chrome webSocket closed: ${ code }`);
    this.dispose();
  }

  dispose() {
    this._disposables.dispose();
  }
};