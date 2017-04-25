'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Socket = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _createWebSocketListener;

function _load_createWebSocketListener() {
  return _createWebSocketListener = require('./createWebSocketListener');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Socket {

  constructor(url, handleChromeEvent, handleSocketEnd) {
    this._id = 0;
    this._handleChromeEvent = handleChromeEvent;
    this._webSocket = null;
    this._pendingRequests = new Map();
    this._webSocketClosed = false;
    const webSocket = new (_ws || _load_ws()).default(url);
    // It's not enough to just construct the websocket -- we have to also wait for it to open.
    this._webSocketOpenPromise = new Promise(resolve => webSocket.on('open', () => resolve(webSocket)));
    webSocket.on('close', () => {
      this._webSocketClosed = true;
      handleSocketEnd();
    });
    const socketMessages = (0, (_createWebSocketListener || _load_createWebSocketListener()).createWebSocketListener)(webSocket);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      if (!this._webSocketClosed) {
        webSocket.close();
      }
    }, socketMessages.subscribe(message => this._handleSocketMessage(message)));
  }

  sendCommand(message) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this._webSocket == null) {
        _this._webSocket = yield _this._webSocketOpenPromise;
      }
      const webSocket = _this._webSocket;
      if (message.id == null) {
        message.id = _this._id++;
      }
      return new Promise(function (resolve) {
        _this._pendingRequests.set(message.id, resolve);
        webSocket.send(JSON.stringify(message));
      });
    })();
  }

  _handleSocketMessage(message) {
    const obj = JSON.parse(message);
    if (isEvent(obj)) {
      this._handleChromeEvent(obj);
    } else {
      const resolve = this._pendingRequests.get(obj.id);

      if (!(resolve != null)) {
        throw new Error(`Got response for a request that wasn't sent: ${message}`);
      }

      this._pendingRequests.delete(obj.id);
      resolve(obj);
    }
  }

  dispose() {
    this._disposables.dispose();
  }
}

exports.Socket = Socket; /**
                          * Copyright (c) 2015-present, Facebook, Inc.
                          * All rights reserved.
                          *
                          * This source code is licensed under the license found in the LICENSE file in
                          * the root directory of this source tree.
                          *
                          * 
                          */

function isEvent(obj) {
  return obj.id == null;
}