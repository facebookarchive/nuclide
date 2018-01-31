'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _https = _interopRequireDefault(require('https'));

var _WebSocketTransport;

function _load_WebSocketTransport() {
  return _WebSocketTransport = require('./WebSocketTransport');
}

var _BigDigClient;

function _load_BigDigClient() {
  return _BigDigClient = require('./BigDigClient');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a Big Dig client that speaks the v1 protocol.
 */
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
    const options = {
      ca: config.certificateAuthorityCertificate,
      cert: config.clientCertificate,
      key: config.clientKey
    };
    const socket = new (_ws || _load_ws()).default(`wss://${config.host}:${config.port}/v1`, options);
    yield new Promise(function (resolve, reject) {
      socket.once('open', resolve);
      socket.once('error', reject);
    });
    const agent = new _https.default.Agent(options);
    const webSocketTransport = new (_WebSocketTransport || _load_WebSocketTransport()).WebSocketTransport('test', agent, socket);
    return new (_BigDigClient || _load_BigDigClient()).BigDigClient(webSocketTransport);
  });

  function createBigDigClient(_x) {
    return _ref.apply(this, arguments);
  }

  return createBigDigClient;
})();