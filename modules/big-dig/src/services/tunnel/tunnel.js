'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTunnel = createTunnel;

var _Proxy;

function _load_Proxy() {
  return _Proxy = require('./Proxy');
}

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

async function createTunnel(localPort, remotePort, transport) {
  return (_Proxy || _load_Proxy()).Proxy.createProxy(localPort, remotePort, transport);
}