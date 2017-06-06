'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebSocketServer = undefined;

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _events = _interopRequireDefault(require('events'));

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

class WebSocketServer {

  constructor() {
    this._webSocketServer = null;
    this._eventEmitter = new _events.default();
  }

  // Promise only resolves when one WebSocket client connect to it.
  start(port) {
    return new Promise((resolve, reject) => {
      const server = new (_ws || _load_ws()).default.Server({ port });
      this._webSocketServer = server;
      server.on('error', error => {
        reject(error);
      });
      server.once('connection', webSocket => {
        resolve(webSocket);
      });
    });
  }

  dispose() {
    if (this._webSocketServer != null) {
      this._webSocketServer.close();
    }
  }
}
exports.WebSocketServer = WebSocketServer;