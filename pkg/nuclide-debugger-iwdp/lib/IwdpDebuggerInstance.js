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
exports.IwdpDebuggerInstance = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

var _logger;

function _load_logger() {
  return _logger = require('./logger');
}

var _WebSocketServer;

function _load_WebSocketServer() {
  return _WebSocketServer = require('../../nuclide-debugger-common/lib/WebSocketServer');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (_logger || _load_logger()).logger.log;

const logError = (_logger || _load_logger()).logger.logError;

const logInfo = (_logger || _load_logger()).logger.logInfo;

let IwdpDebuggerInstance = exports.IwdpDebuggerInstance = class IwdpDebuggerInstance extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerInstance {

  constructor(processInfo, rpcService) {
    super(processInfo);
    this._server = new (_WebSocketServer || _load_WebSocketServer()).WebSocketServer();
    this._webSocket = null;
    this._rpcService = rpcService;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._server, rpcService.getServerMessageObservable().refCount().subscribe(this._sendServerMessageToChromeUi.bind(this), this._onServerError.bind(this), this._onServerEnd.bind(this)), rpcService);
  }

  getWebsocketAddress() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const wsPort = 2000;
      _this._server.start(wsPort).then(function (webSocket) {
        return _this._handleWebSocketServerConnection(webSocket);
      }).catch(function (error) {
        return logError(`Server encountered error: ${ error }`);
      });
      const result = 'ws=localhost:' + String(wsPort) + '/';
      log('Listening for connection at: ' + result);
      return result;
    })();
  }

  _handleWebSocketServerConnection(webSocket) {
    this._webSocket = webSocket;
    webSocket.on('message', this._onSocketMessage.bind(this));
    webSocket.on('error', this._onSocketError.bind(this));
    webSocket.on('close', this._onSocketClose.bind(this));
    this._disposables.add(this._disposeWebSocket.bind(this));
  }

  _onSocketMessage(message) {
    log(`Received webSocket message: ${ message }`);
    const rpcService = this._rpcService;
    if (rpcService != null) {
      rpcService.sendCommand(message);
    }
  }

  _onSocketError(error) {
    logError('webSocket error ' + (0, (_string || _load_string()).stringifyError)(error));
    this.dispose();
  }

  _onSocketClose(code) {
    log('webSocket Closed ' + code);
  }

  _sendServerMessageToChromeUi(message) {
    // Some messages are so big they aren't helpful to log, such as the source map URL, which can
    // be many thousands of bytes.  So we substring for logs, since most messages smaller than 5000.
    log(`Sending message to client: ${ message.substring(0, 5000) }`);
    const webSocket = this._webSocket;
    if (webSocket != null) {
      webSocket.send(message);
    }
  }

  _onServerError(error) {
    logError(`RPC service error: ${ error }`);
  }

  _onServerEnd() {
    logError('RPC service server messages completed.');
  }

  _disposeWebSocket() {
    const webSocket = this._webSocket;
    if (webSocket) {
      this._webSocket = null;
      logInfo('closing webSocket');
      webSocket.close();
    }
  }

  dispose() {
    this._disposables.dispose();
  }
};