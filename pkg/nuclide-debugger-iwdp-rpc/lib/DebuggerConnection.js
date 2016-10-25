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
exports.DebuggerConnection = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _createWebSocketListener;

function _load_createWebSocketListener() {
  return _createWebSocketListener = require('./createWebSocketListener');
}

var _logger;

function _load_logger() {
  return _logger = require('./logger');
}

var _FileCache;

function _load_FileCache() {
  return _FileCache = require('./FileCache');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (_logger || _load_logger()).logger.log;

let DebuggerConnection = exports.DebuggerConnection = class DebuggerConnection {

  constructor(iosDeviceInfo, sendMessageToClient) {
    this._sendMessageToClient = sendMessageToClient;
    this._fileCache = new (_FileCache || _load_FileCache()).FileCache();
    const webSocketDebuggerUrl = iosDeviceInfo.webSocketDebuggerUrl;

    const webSocket = new (_ws || _load_ws()).default(webSocketDebuggerUrl);
    this._webSocket = webSocket;
    const socketMessages = (0, (_createWebSocketListener || _load_createWebSocketListener()).createWebSocketListener)(webSocket);
    const translatedMessages = this._translateMessagesForClient(socketMessages);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(translatedMessages.subscribe(sendMessageToClient), () => webSocket.close(), this._fileCache);
    log(`DebuggerConnection created with device info: ${ JSON.stringify(iosDeviceInfo) }`);
  }

  sendCommand(message) {
    this._webSocket.send(this._translateMessageForServer(message));
  }

  _translateMessagesForClient(socketMessages) {
    return socketMessages.map(JSON.parse).mergeMap(message => {
      if (message.method === 'Debugger.scriptParsed') {
        return _rxjsBundlesRxMinJs.Observable.fromPromise(this._fileCache.handleScriptParsed(message));
      } else {
        return _rxjsBundlesRxMinJs.Observable.of(message);
      }
    }).map(JSON.stringify);
  }

  _translateMessageForServer(message) {
    const obj = JSON.parse(message);
    switch (obj.method) {
      case 'Debugger.setBreakpointByUrl':
        {
          const updatedObj = this._fileCache.handleSetBreakpointByUrl(obj);
          const updatedMessage = JSON.stringify(updatedObj);
          log(`Sending message to proxy: ${ updatedMessage }`);
          return updatedMessage;
        }
      case 'Debugger.enable':
        {
          // Nuclide's debugger will auto-resume the first pause event, so we send a dummy pause
          // when the debugger initially attaches.
          this._sendFakeLoaderBreakpointPause();
          return message;
        }
      default:
        {
          return message;
        }
    }
  }

  _sendFakeLoaderBreakpointPause() {
    const debuggerPausedMessage = {
      method: 'Debugger.paused',
      params: {
        callFrames: [],
        reason: 'breakpoint',
        data: {}
      }
    };
    this._sendMessageToClient(JSON.stringify(debuggerPausedMessage));
  }

  dispose() {
    this._disposables.dispose();
  }
};