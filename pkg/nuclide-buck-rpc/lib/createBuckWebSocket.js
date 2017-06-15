'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createBuckWebSocket;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
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

function createBuckWebSocket(httpPort) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    const uri = `ws://localhost:${httpPort}/ws/build`;
    const socket = new (_ws || _load_ws()).default(uri);
    let buildId = null;

    socket.on('open', () => {
      // Emit a message so the client knows the socket is ready for Buck events.
      observer.next({ type: 'SocketConnected' });
    });

    socket.on('message', data => {
      let message;
      try {
        message = JSON.parse(data);
      } catch (err) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-buck-rpc').error('Error parsing Buck websocket message', err);
        return;
      }

      const type = message.type;
      if (buildId === null) {
        if (type === 'BuildStarted') {
          buildId = message.buildId;
        } else {
          return;
        }
      }

      if (buildId !== message.buildId) {
        return;
      }

      observer.next(message);
    });

    socket.on('error', e => {
      observer.error(e);
    });

    socket.on('close', () => {
      observer.complete();
    });

    return () => {
      socket.removeAllListeners();
      socket.close();
    };
  });
}