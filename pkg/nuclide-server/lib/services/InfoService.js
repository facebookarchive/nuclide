'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getServerVersion = getServerVersion;
exports.closeConnection = closeConnection;

var _nuclideVersion;

function _load_nuclideVersion() {
  return _nuclideVersion = require('../../../nuclide-version');
}

var _NuclideServer;

function _load_NuclideServer() {
  return _NuclideServer = _interopRequireDefault(require('../NuclideServer'));
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
  return Promise.resolve((0, (_nuclideVersion || _load_nuclideVersion()).getVersion)());
}

// Mark this as async so the client can wait for an acknowledgement.
// However, we can't close the connection right away, as otherwise the response never gets sent!
// Add a small delay to allow the return message to go through.
function closeConnection(shutdownServer) {
  const client = this;
  setTimeout(() => {
    (_NuclideServer || _load_NuclideServer()).default.closeConnection(client);
    if (shutdownServer) {
      (_NuclideServer || _load_NuclideServer()).default.shutdown();
    }
  }, 1000);
  return Promise.resolve();
}