'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCommandServer = getCommandServer;

var _CommandServer;

function _load_CommandServer() {
  return _CommandServer = require('./CommandServer');
}

const commandServerInstance = new (_CommandServer || _load_CommandServer()).CommandServer();

/** @return singleton instance of CommandServer. */
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

function getCommandServer() {
  return commandServerInstance;
}