'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerRpcWebSocketService = exports.DebuggerRpcServiceBase = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _ClientCallback;

function _load_ClientCallback() {
  return _ClientCallback = _interopRequireDefault(require('./ClientCallback'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class DebuggerRpcServiceBase {

  constructor(debuggerRpcServiceName) {
    this._clientCallback = new (_ClientCallback || _load_ClientCallback()).default();
    this._logger = (0, (_log4js || _load_log4js()).getLogger)(`nuclide-debugger-${debuggerRpcServiceName}-rpc`);
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._clientCallback);
  }

  getClientCallback() {
    return this._clientCallback;
  }

  getLogger() {
    return this._logger;
  }

  getSubscriptions() {
    return this._subscriptions;
  }

  getOutputWindowObservable() {
    return this._clientCallback.getOutputWindowObservable().publish();
  }

  getAtomNotificationObservable() {
    return this._clientCallback.getAtomNotificationObservable().publish();
  }

  getServerMessageObservable() {
    return this._clientCallback.getServerMessageObservable().publish();
  }

  dispose() {
    this._subscriptions.dispose();
    return Promise.resolve();
  }
}

exports.DebuggerRpcServiceBase = DebuggerRpcServiceBase; // TODO: make this transportation plugable.
/**
 * Debugger base rpc service using WebSocket protocol to communicate with backend.
 */

class DebuggerRpcWebSocketService extends DebuggerRpcServiceBase {

  connectToWebSocketServer(webSocketServerAddress) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const webSocket = yield _this._startWebSocketClient(webSocketServerAddress);
      _this._webSocket = webSocket;
      _this._subscriptions.add(function () {
        return webSocket.terminate();
      });
      webSocket.on('message', _this._handleWebSocketServerMessage.bind(_this));
    })();
  }

  getWebSocket() {
    return this._webSocket;
  }

  _handleWebSocketServerMessage(message) {
    this._clientCallback.sendChromeMessage(message);
  }

  _startWebSocketClient(webSocketServerAddress) {
    return new Promise((resolve, reject) => {
      const ws = new (_ws || _load_ws()).default(webSocketServerAddress);
      ws.on('open', () => {
        // Successfully connected with WS server, fulfill the promise.
        resolve(ws);
      });
      ws.on('error', error => {
        reject(error);
        this.dispose();
      });
      ws.on('close', (code, reason) => {
        const message = `WebSocket closed with: ${code}, ${reason}`;
        reject(Error(message));
        this.dispose();
      });
    });
  }

  sendCommand(message) {
    const webSocket = this._webSocket;
    if (webSocket != null) {
      this.getLogger().trace(`forward client message to server: ${message}`);
      webSocket.send(message);
    } else {
      this.getLogger().info(`Nuclide sent message to server after socket closed: ${message}`);
    }
    return Promise.resolve();
  }
}
exports.DebuggerRpcWebSocketService = DebuggerRpcWebSocketService;