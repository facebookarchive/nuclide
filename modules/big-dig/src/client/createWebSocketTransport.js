'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _WebSocketTransport;

function _load_WebSocketTransport() {
  return _WebSocketTransport = require('../common/WebSocketTransport');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (config) {
    const socket = new (_ws || _load_ws()).default(`wss://${config.host}:${config.port}`, {
      ca: config.certificateAuthorityCertificate,
      cert: config.clientCertificate,
      key: config.clientKey
    });
    yield new Promise(function (resolve, reject) {
      socket.once('open', resolve);
      socket.once('error', reject);
    });
    return new (_WebSocketTransport || _load_WebSocketTransport()).WebSocketTransport('test', socket);
  });

  function createWebSocketTransport(_x) {
    return _ref.apply(this, arguments);
  }

  return createWebSocketTransport;
})();