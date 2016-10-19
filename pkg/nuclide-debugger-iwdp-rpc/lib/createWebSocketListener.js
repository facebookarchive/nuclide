Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createWebSocketListener = createWebSocketListener;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

function createWebSocketListener(webSocket) {
  var subject = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
  webSocket.on('message', function (message) {
    return subject.next(message);
  });
  webSocket.on('error', function (error) {
    return subject.error(error);
  });
  webSocket.on('close', function () {
    return subject.complete();
  });
  return subject.asObservable();
}