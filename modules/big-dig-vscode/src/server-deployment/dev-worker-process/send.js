"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = send;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

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
if (process.send == null) {
  (0, _log4js().getLogger)('deploy').warn('This program is intended to be run as a child process using Node IPC ' + 'communication, but process.send is null.');
}

function send(msg) {
  if (process.send != null) {
    process.send(msg);
  }
}