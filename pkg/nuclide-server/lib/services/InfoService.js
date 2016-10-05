Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.getServerVersion = getServerVersion;
exports.closeConnection = closeConnection;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideVersion2;

function _nuclideVersion() {
  return _nuclideVersion2 = require('../../../nuclide-version');
}

var _NuclideServer2;

function _NuclideServer() {
  return _NuclideServer2 = _interopRequireDefault(require('../NuclideServer'));
}

function getServerVersion() {
  return Promise.resolve((0, (_nuclideVersion2 || _nuclideVersion()).getVersion)());
}

// Mark this as async so the client can wait for an acknowledgement.
// However, we can't close the connection right away, as otherwise the response never gets sent!
// Add a small delay to allow the return message to go through.

function closeConnection(shutdownServer) {
  var client = this;
  setTimeout(function () {
    (_NuclideServer2 || _NuclideServer()).default.closeConnection(client);
    if (shutdownServer) {
      (_NuclideServer2 || _NuclideServer()).default.shutdown();
    }
  }, 1000);
  return Promise.resolve();
}