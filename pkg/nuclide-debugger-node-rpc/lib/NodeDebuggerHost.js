'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeDebuggerHost = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _WebSocketServer;

function _load_WebSocketServer() {
  return _WebSocketServer = require('../../nuclide-debugger-common/lib/WebSocketServer');
}

var _Session;

function _load_Session() {
  return _Session = require('./Session');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { log } = (_utils || _load_utils()).default;

/**
 * Responsible for bootstrap and host node inspector backend.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class NodeDebuggerHost {

  constructor() {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._nodeSocketServer = new (_WebSocketServer || _load_WebSocketServer()).WebSocketServer();
    this._subscriptions.add(this._nodeSocketServer);
    this._close$ = new _rxjsBundlesRxMinJs.Subject();
    this._close$.first().subscribe(() => {
      this.dispose();
    });
  }

  start() {
    // This is the port that the V8 debugger usually listens on.
    // TODO(natthu): Provide a way to override this in the UI.
    const debugPort = 5858;
    const wsPort = this._generateRandomInteger(2000, 65535);
    this._nodeSocketServer.start(wsPort).then(websocket => {
      log(`Websocket server created for port: ${wsPort}`);
      // TODO: do we need to add webSocket into CompositeDisposable?
      const config = {
        debugPort,
        preload: false, // This makes the node inspector not load all the source files on startup.
        inject: false };
      const session = new (_Session || _load_Session()).Session(config, debugPort, websocket);
      _rxjsBundlesRxMinJs.Observable.fromEvent(session, 'close').subscribe(this._close$);
    });
    return `ws://127.0.0.1:${wsPort}/`;
  }

  _generateRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  onSessionEnd(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._close$.first().subscribe(callback));
  }

  dispose() {
    this._subscriptions.dispose();
  }
}
exports.NodeDebuggerHost = NodeDebuggerHost;