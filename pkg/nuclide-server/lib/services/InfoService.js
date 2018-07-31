"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getServerVersion = getServerVersion;
exports.getServerPlatform = getServerPlatform;
exports.closeConnection = closeConnection;

function _nuclideVersion() {
  const data = require("../../../nuclide-version");

  _nuclideVersion = function () {
    return data;
  };

  return data;
}

function _NuclideServer() {
  const data = _interopRequireDefault(require("../NuclideServer"));

  _NuclideServer = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
function getServerVersion() {
  return Promise.resolve((0, _nuclideVersion().getVersion)());
}

async function getServerPlatform() {
  return process.platform;
} // Mark this as async so the client can wait for an acknowledgement.
// However, we can't close the connection right away, as otherwise the response never gets sent!
// Add a small delay to allow the return message to go through.


function closeConnection(shutdownServer) {
  const client = this;
  setTimeout(() => {
    // TODO(T29368542): Remove references to NuclideServer here.
    _NuclideServer().default.closeConnection(client);

    client.dispose();

    if (shutdownServer) {
      _NuclideServer().default.shutdown();
    }
  }, 1000);
  return Promise.resolve();
}