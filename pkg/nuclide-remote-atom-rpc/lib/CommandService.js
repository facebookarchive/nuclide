'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAtomCommands = getAtomCommands;
exports.getConnectionDetails = getConnectionDetails;

var _commandServerSingleton;

function _load_commandServerSingleton() {
  return _commandServerSingleton = require('./command-server-singleton');
}

// This file defines a service that is expected to be used by
// command-line tools that run local to a Nuclide server.
// To that end, it is defined in ../services-3.json, which can
// be loaded via the Nuclide-RPC framework.

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

function getAtomCommands() {
  return Promise.resolve((0, (_commandServerSingleton || _load_commandServerSingleton()).getCommandServer)().getMultiConnectionAtomCommands());
}

function getConnectionDetails() {
  return (0, (_commandServerSingleton || _load_commandServerSingleton()).getCommandServer)().getConnectionDetails();
}