"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchProxyConfig = matchProxyConfig;
exports.isProxyConfigEqual = isProxyConfigEqual;
exports.isProxyConfigOverlapping = isProxyConfigOverlapping;
exports.getProxyConfigDescriptor = getProxyConfigDescriptor;

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
function matchProxyConfig(matcher, proxyConfig) {
  if (proxyConfig.path === undefined) {
    return matcher.tcp(proxyConfig);
  }

  if (proxyConfig.port === undefined) {
    return matcher.ipcSocket(proxyConfig);
  }

  throw new Error('unreachable');
}

function isProxyConfigEqual(a, b) {
  if (a.path === undefined && b.path === undefined) {
    return a.port === b.port && a.useIPv4 === b.useIPv4;
  }

  if (a.port === undefined && b.port === undefined) {
    return a.path === b.path;
  }

  return false;
}

function isProxyConfigOverlapping(a, b) {
  if (a.port !== undefined && b.port !== undefined && a.port === b.port) {
    return true;
  }

  if (a.path !== undefined && b.path !== undefined && a.path === b.path) {
    return true;
  }

  return false;
}

function getProxyConfigDescriptor(config) {
  return matchProxyConfig({
    tcp: c => `port=${c.port}`,
    ipcSocket: c => `socket=${c.path}`
  }, config);
}