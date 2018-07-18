"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertToServerConfig = convertToServerConfig;
exports.genConfigId = genConfigId;
exports.encodeMessage = encodeMessage;
exports.decodeMessage = decodeMessage;

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
function convertToServerConfig(serviceConfig) {
  return {
    name: serviceConfig.name,
    remoteCommand: serviceConfig.remoteCommand,
    remoteCommandArgs: serviceConfig.remoteCommandArgs,
    remotePort: serviceConfig.remotePort,
    killOldThriftServerProcess: serviceConfig.killOldThriftServerProcess
  };
}

function genConfigId(config) {
  return [config.name, config.remoteCommand, ...config.remoteCommandArgs, config.remotePort].join('#');
}

function encodeMessage(message) {
  return JSON.stringify(message);
}

function decodeMessage(message) {
  return JSON.parse(message);
}