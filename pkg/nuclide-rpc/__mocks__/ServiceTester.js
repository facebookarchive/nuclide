"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServiceTester = void 0;

function _LoopbackTransports() {
  const data = require("../lib/LoopbackTransports");

  _LoopbackTransports = function () {
    return data;
  };

  return data;
}

function _RpcConnection() {
  const data = require("../lib/RpcConnection");

  _RpcConnection = function () {
    return data;
  };

  return data;
}

function _ServiceRegistry() {
  const data = require("../lib/ServiceRegistry");

  _ServiceRegistry = function () {
    return data;
  };

  return data;
}

function _nuclideMarshalersCommon() {
  const data = require("../../nuclide-marshalers-common");

  _nuclideMarshalersCommon = function () {
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
 * 
 * @format
 */
class ServiceTester {
  async start(customServices, protocol) {
    const transports = new (_LoopbackTransports().LoopbackTransports)();
    this._serviceRegistry = new (_ServiceRegistry().ServiceRegistry)([_nuclideMarshalersCommon().localNuclideUriMarshalers], customServices, protocol);
    this._clientConnection = _RpcConnection().RpcConnection.createServer(this._serviceRegistry, transports.serverTransport);
    this._client = _RpcConnection().RpcConnection.createRemote(transports.clientTransport, [(0, _nuclideMarshalersCommon().getRemoteNuclideUriMarshalers)('localhost')], customServices, {}, protocol);
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