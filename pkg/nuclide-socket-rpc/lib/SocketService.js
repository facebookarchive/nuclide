"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConnectionFactory = getConnectionFactory;
exports.createTunnel = createTunnel;
exports.getAvailableServerPort = getAvailableServerPort;

function Tunnel() {
  const data = _interopRequireWildcard(require("./Tunnel"));

  Tunnel = function () {
    return data;
  };

  return data;
}

function _Connection() {
  const data = require("./Connection");

  _Connection = function () {
    return data;
  };

  return data;
}

function _serverPort() {
  const data = require("../../../modules/nuclide-commons/serverPort");

  _serverPort = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

/**
 * The role of the Connection Factory is to create
 * connections on the remote host. There is no easy
 * built-in way to do this with the current RPC framework
 */
function getConnectionFactory() {
  return Promise.resolve(new (_Connection().ConnectionFactory)());
}

function createTunnel(t, cf) {
  return Tunnel().createTunnel(t, cf);
}

async function getAvailableServerPort() {
  return (0, _serverPort().getAvailableServerPort)();
}