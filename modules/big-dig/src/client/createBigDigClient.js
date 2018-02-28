'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _BigDigServer;

function _load_BigDigServer() {
  return _BigDigServer = require('../server/BigDigServer');
}

var _BigDigClient;

function _load_BigDigClient() {
  return _BigDigClient = require('./BigDigClient');
}

var _NuclideSocket;

function _load_NuclideSocket() {
  return _NuclideSocket = require('../socket/NuclideSocket');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a Big Dig client that speaks the v1 protocol.
 */
exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (config) {
    const options = {
      ca: config.certificateAuthorityCertificate,
      cert: config.clientCertificate,
      key: config.clientKey
    };

    const serverUri = `https://${config.host}:${config.port}/v1`;

    const nuclideSocket = new (_NuclideSocket || _load_NuclideSocket()).NuclideSocket(serverUri, (_BigDigServer || _load_BigDigServer()).HEARTBEAT_CHANNEL, options);

    return new (_BigDigClient || _load_BigDigClient()).BigDigClient(nuclideSocket, nuclideSocket.getHeartbeat());
  });

  function createBigDigClient(_x) {
    return _ref.apply(this, arguments);
  }

  return createBigDigClient;
})(); /**
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