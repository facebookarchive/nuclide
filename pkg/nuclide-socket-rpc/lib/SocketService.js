'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConnectionFactory = getConnectionFactory;
exports.createTunnel = createTunnel;
exports.getAvailableServerPort = getAvailableServerPort;

var _Tunnel;

function _load_Tunnel() {
  return _Tunnel = _interopRequireWildcard(require('./Tunnel'));
}

var _Connection;

function _load_Connection() {
  return _Connection = require('./Connection');
}

var _serverPort;

function _load_serverPort() {
  return _serverPort = require('../../../modules/nuclide-commons/serverPort');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * The role of the Connection Factory is to create
 * connections on the remote host. There is no easy
 * built-in way to do this with the current RPC framework
 */
function getConnectionFactory() {
  return Promise.resolve(new (_Connection || _load_Connection()).ConnectionFactory());
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */

function createTunnel(t, cf) {
  return (_Tunnel || _load_Tunnel()).createTunnel(t, cf);
}

async function getAvailableServerPort() {
  return (0, (_serverPort || _load_serverPort()).getAvailableServerPort)();
}