"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTransport = getTransport;
exports.getProtocol = getProtocol;
exports.convertToServerConfig = convertToServerConfig;
exports.genConfigId = genConfigId;

function _thrift() {
  const data = _interopRequireDefault(require("thrift"));

  _thrift = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
function getTransport(config) {
  switch (config.thriftTransport) {
    case 'framed':
      return _thrift().default.TFramedTransport;

    case 'buffered':
      return _thrift().default.TBufferedTransport;

    default:
      config.thriftTransport;
      throw new Error(`Invalid Thrift Transport ${config.thriftTransport}`);
  }
}

function getProtocol(config) {
  switch (config.thriftProtocol) {
    case 'binary':
      return _thrift().default.TBinaryProtocol;

    case 'compact':
      return _thrift().default.TCompactProtocol;

    case 'json':
      return _thrift().default.TJSONProtocol;

    default:
      config.thriftProtocol;
      throw new Error(`Invalid Thrift Protocol ${config.thriftProtocol}`);
  }
}

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