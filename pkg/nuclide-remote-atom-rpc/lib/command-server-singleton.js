"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCommandServer = getCommandServer;

function _CommandServer() {
  const data = require("./CommandServer");

  _CommandServer = function () {
    return data;
  };

  return data;
}

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
const commandServerInstance = new (_CommandServer().CommandServer)();
/** @return singleton instance of CommandServer. */

function getCommandServer() {
  return commandServerInstance;
}