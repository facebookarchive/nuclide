"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDescriptor = getDescriptor;

function _ProxyConfigUtils() {
  const data = require("./ProxyConfigUtils");

  _ProxyConfigUtils = function () {
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
 *  strict-local
 * @format
 */
function getDescriptor(tunnelConfig, isReverse) {
  return `${getDescriptorForProxyConfig(tunnelConfig.local)}${isReverse ? '<-' : '->'}${getDescriptorForProxyConfig(tunnelConfig.remote)}`;
}

function getDescriptorForProxyConfig(proxyConfig) {
  return (0, _ProxyConfigUtils().matchProxyConfig)({
    tcp: config => String(config.port),
    ipcSocket: config => config.path
  }, proxyConfig);
}