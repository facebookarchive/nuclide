'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAtomCommands = getAtomCommands;
exports.getConnectionDetails = getConnectionDetails;

var _CommandServer;

function _load_CommandServer() {
  return _CommandServer = require('./CommandServer');
}

// Called by the server side command line 'atom' command.
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

function getAtomCommands() {
  return Promise.resolve((_CommandServer || _load_CommandServer()).CommandServer.getAtomCommands());
}

function getConnectionDetails() {
  return (_CommandServer || _load_CommandServer()).CommandServer.getConnectionDetails();
}