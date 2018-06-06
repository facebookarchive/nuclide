'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServiceTester = undefined;

var _LoopbackTransports;

function _load_LoopbackTransports() {
  return _LoopbackTransports = require('../lib/LoopbackTransports');
}

var _RpcConnection;

function _load_RpcConnection() {
  return _RpcConnection = require('../lib/RpcConnection');
}

var _ServiceRegistry;

function _load_ServiceRegistry() {
  return _ServiceRegistry = require('../lib/ServiceRegistry');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

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

class ServiceTester {

  async start(customServices, protocol) {
    const transports = new (_LoopbackTransports || _load_LoopbackTransports()).LoopbackTransports();
    this._serviceRegistry = new (_ServiceRegistry || _load_ServiceRegistry()).ServiceRegistry([(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], customServices, protocol);
    this._clientConnection = (_RpcConnection || _load_RpcConnection()).RpcConnection.createServer(this._serviceRegistry, transports.serverTransport);

    this._client = (_RpcConnection || _load_RpcConnection()).RpcConnection.createRemote(transports.clientTransport, [(0, (_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).getRemoteNuclideUriMarshalers)('localhost')], customServices, {}, protocol);
  }

  stop() {
    this._client.dispose();
    this._clientConnection.dispose();
  }

  getRemoteService(serviceName) {
    return this._client.getService(serviceName);
  }

  getUriOfRemotePath(remotePath) {
    return `nuclide://localhost${remotePath}`;
  }
}
exports.ServiceTester = ServiceTester;