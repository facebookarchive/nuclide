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

exports.getAtomCommands = getAtomCommands;

var _CommandServer2;

function _CommandServer() {
  return _CommandServer2 = require('./CommandServer');
}

// Called by the server side command line 'atom' command.

function getAtomCommands() {
  return Promise.resolve((_CommandServer2 || _CommandServer()).CommandServer.getAtomCommands());
}