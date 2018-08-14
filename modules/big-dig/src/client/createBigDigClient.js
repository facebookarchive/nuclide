"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _BigDigServer() {
  const data = require("../server/BigDigServer");

  _BigDigServer = function () {
    return data;
  };

  return data;
}

function _BigDigClient() {
  const data = require("./BigDigClient");

  _BigDigClient = function () {
    return data;
  };

  return data;
}

function _ReliableSocket() {
  const data = require("../socket/ReliableSocket");

  _ReliableSocket = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

/**
 * Creates a Big Dig client that speaks the v1 protocol.
 */
var createBigDigClient = async function createBigDigClient(config) {
  const reliableSocket = createReliableSocket(config);
  const client = new (_BigDigClient().BigDigClient)(reliableSocket);

  try {
    // Make sure we're able to make the initial connection
    await reliableSocket.testConnection();
    return client;
  } catch (error) {
    client.close();
    throw error;
  }
};

exports.default = createBigDigClient;

function createReliableSocket(config) {
  const options = {
    ca: config.certificateAuthorityCertificate,
    cert: config.clientCertificate,
    key: config.clientKey,
    family: config.family
  };
  const serverUri = `https://${config.host}:${config.port}/v1`;
  const reliableSocket = new (_ReliableSocket().ReliableSocket)(serverUri, _BigDigServer().HEARTBEAT_CHANNEL, options, config.protocolLogger);

  if (!config.ignoreIntransientErrors) {
    reliableSocket.onIntransientError(error => reliableSocket.close());
  }

  return reliableSocket;
}