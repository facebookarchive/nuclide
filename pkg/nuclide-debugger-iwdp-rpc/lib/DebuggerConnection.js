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

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (_logger || _load_logger()).logger.log;

/**
 * A connection to a JSContext on the device (or simulator/emulator).  There are 2 channels of
 * Communication provided by this class.
 *
 * 1. Bi-directional communcation for Chrome Protocol (CP) requests and responses.  This is via the
 * `sendCommand` API, which sends a CP request to the target, and returns a promise which resolves
 * with the response when it's received.
 *
 * 2. One-way communication for CP events that are emitted by the target, for example
 * `Debugger.paused` events.  Interested parties can subscribe to these events via the
 * `subscribeToEvents` API, which accepts a callback called when events are emitted from the target.
 */


let DebuggerConnection = exports.DebuggerConnection = class DebuggerConnection {

  constructor(iosDeviceInfo) {
    this._webSocket = null;
    this._events = new _rxjsBundlesRxMinJs.Subject();
    this._id = 0;
    this._pendingRequests = new Map();
    this._status = new _rxjsBundlesRxMinJs.BehaviorSubject((_constants || _load_constants()).RUNNING);
    const webSocketDebuggerUrl = iosDeviceInfo.webSocketDebuggerUrl;

    const webSocket = new (_ws || _load_ws()).default(webSocketDebuggerUrl);
    // It's not enough to just construct the websocket -- we have to also wait for it to open.
    this._webSocketPromise = new Promise(resolve => webSocket.on('open', () => resolve(webSocket)));
    const socketMessages = (0, (_createWebSocketListener || _load_createWebSocketListener()).createWebSocketListener)(webSocket);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => webSocket.close(), socketMessages.subscribe(message => this._handleSocketMessage(message)));
    log(`DebuggerConnection created with device info: ${ JSON.stringify(iosDeviceInfo) }`);
  }

  sendCommand(message) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this._webSocket == null) {
        _this._webSocket = yield _this._webSocketPromise;
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
        throw new Error(`Got response for a request that wasn't sent: ${ message }`);
      }

      this._pendingRequests.delete(obj.id);
      resolve(obj);
    }
  }

  _handleChromeEvent(message) {
    switch (message.method) {
      case 'Debugger.paused':
        {
          this._status.next((_constants || _load_constants()).PAUSED);
          break;
        }
      case 'Debugger.resumed':
        {
          this._status.next((_constants || _load_constants()).RUNNING);
          break;
        }
    }
    this._events.next(message);
  }

  subscribeToEvents(toFrontend) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._events.subscribe(toFrontend));
  }

  isPaused() {
    return this._status.getValue() === (_constants || _load_constants()).PAUSED;
  }

  getStatusChanges() {
    return this._status.asObservable();
  }

  dispose() {
    this._disposables.dispose();
  }
};


function isEvent(obj) {
  return obj.id == null;
}