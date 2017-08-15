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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Launch a NuclideServer with the specified parameters.
 *
 * One common this may fail is if the specified port is in use. The caller is responsible for
 * checking for this failure and retrying on a different port.
 *
 * The best way to avoid this is by specifying a port of 0, though that may not be an option if the
 * host machine does not allow HTTP traffic to be served on an arbitrary port.
 * Note that if options.port=0 is specified to choose an ephemeral port, then the caller should
 * check server.address().port to see what the actual port is.
 */
function launchServer(options) {
  const webServer = _https.default.createServer(options.webServer);

  return new Promise((resolve, reject) => {
    // TODO(mbolin): Once the webServer is up and running and this Promise is resolved,
    // rejecting the Promise will be a noop. We need better error handling here.
    const onError = error => {
      if (error.errno === 'EADDRINUSE') {
        // eslint-disable-next-line
        console.error(`ERROR: Port ${options.port} is already in use.`);
        process.exit(1);
      }
      // Note that `error` could be an EADDRINUSE error.
      webServer.removeAllListeners();
      reject(error);
    };
    // TODO(mbolin): If we want the new WebSocketServer to get the 'connection' event,
    // then we need to get it wired up before the webServer is connected.
    webServer.on('listening', () => {
      const webSocketServer = new (_ws || _load_ws()).default.Server({ server: webServer });
      webSocketServer.on('error', onError);

      const launcher = require(options.absolutePathToServerMain);

      const bigDigServer = new (_BigDigServer || _load_BigDigServer()).default(webServer, webSocketServer);
      launcher({
        server: bigDigServer,
        serverParams: options.serverParams
      }).then(() => {
        // Now the NuclideServer should have attached its own error handler.
        webServer.removeListener('error', onError);
        resolve(webServer.address().port);
      });
    });
    webServer.on('error', onError);
    webServer.listen(options.port);
  });
} /**
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