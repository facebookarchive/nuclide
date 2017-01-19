'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createWebSocketListener = createWebSocketListener;

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function createWebSocketListener(webSocket) {
  const subject = new _rxjsBundlesRxMinJs.Subject();
  webSocket.on('message', message => subject.next(message));
  webSocket.on('error', error => subject.error(error));
  webSocket.on('close', () => subject.complete());
  return subject.asObservable();
}