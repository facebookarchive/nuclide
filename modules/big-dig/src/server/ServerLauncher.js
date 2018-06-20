'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.launchServer = launchServer;

var _BigDigServer;

function _load_BigDigServer() {
  return _BigDigServer = _interopRequireDefault(require('./BigDigServer'));
}

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _https = _interopRequireDefault(require('https'));

var _ports;

function _load_ports() {
  return _ports = require('../common/ports');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Launch a big-dig server with the specified parameters.
 *
 * One common this may fail is if the specified port is in use. The caller is responsible for
 * checking for this failure and retrying on a different port.
 *
 * The best way to avoid this is by specifying a port of 0, though that may not be an option if the
 * host machine does not allow HTTP traffic to be served on an arbitrary port.
 * Note that if options.port=0 is specified to choose an ephemeral port, then the caller should
 * check server.address().port to see what the actual port is.
 */


// The absolutePathToServerMain must export a single function of this type.
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

async function launchServer(options) {
  const webServer = _https.default.createServer(options.webServer);

  if (!(await (0, (_ports || _load_ports()).scanPortsToListen)(webServer, options.ports))) {
    throw new Error(`All ports in range "${options.ports}" are already in use`);
  }

  const webSocketServer = new (_ws || _load_ws()).default.Server({
    server: webServer,
    perMessageDeflate: true
  });

  // Let unhandled WS server errors go through to the global exception handler.

  // $FlowIgnore
  const launcher = require(options.absolutePathToServerMain);
  const tunnelLauncher = require('../services/tunnel/launcher');

  const bigDigServer = new (_BigDigServer || _load_BigDigServer()).default(webServer, webSocketServer);

  await launcher({
    server: bigDigServer,
    serverParams: options.serverParams
  });

  await tunnelLauncher({
    server: bigDigServer,
    serverParams: options.serverParams
  });

  return webServer.address().port;
}