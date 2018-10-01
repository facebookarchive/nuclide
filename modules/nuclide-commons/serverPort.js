"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAvailableServerPort = getAvailableServerPort;

var _net = _interopRequireDefault(require("net"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */
async function getAvailableServerPort() {
  return new Promise((resolve, reject) => {
    const server = _net.default.createServer();

    server.unref();
    server.on('error', reject);
    server.listen({
      port: 0
    }, () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
  });
}