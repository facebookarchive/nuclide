'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.launchServer = launchServer;

var _https = _interopRequireDefault(require('https'));

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

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

function launchServer(options) {
  // TODO(mbolin): Must specify a requestListener to createServer().
  const requestListener = (req, res) => {
    console.log('Received a request!'); // eslint-disable-line no-console
  };

  const webServer = _https.default.createServer(options.webServer, requestListener);
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

      // TODO(mbolin): Expand the launcher API to let it add extra properties to the JSON file that
      // gets written.
      // TODO(mbolin): Expand the launcher API so that it can receive additional command-line
      // arguments from the caller.

      // The server that is created is responsible for closing webServer and webSocketServer.
      launcher({
        webServer,
        webSocketServer,
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
}