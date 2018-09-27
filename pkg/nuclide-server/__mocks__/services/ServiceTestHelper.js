"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _NuclideServer() {
  const data = _interopRequireDefault(require("../../lib/NuclideServer"));

  _NuclideServer = function () {
    return data;
  };

  return data;
}

function _ReliableSocket() {
  const data = require("../../../../modules/big-dig/src/socket/ReliableSocket");

  _ReliableSocket = function () {
    return data;
  };

  return data;
}

function _nuclideRpc() {
  const data = require("../../../nuclide-rpc");

  _nuclideRpc = function () {
    return data;
  };

  return data;
}

function _nuclideMarshalersCommon() {
  const data = require("../../../nuclide-marshalers-common");

  _nuclideMarshalersCommon = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const HEARTBEAT_CHANNEL = 'test-heartbeat';

class ServiceTestHelper {
  async start(customServices) {
    this._server = new (_NuclideServer().default)({
      port: 0
    }, customServices);
    await this._server.connect();

    const port = this._server._webServer.address().port;

    this._client = _nuclideRpc().RpcConnection.createRemote(new (_ReliableSocket().ReliableSocket)(`http://localhost:${port}`, HEARTBEAT_CHANNEL, null), [(0, _nuclideMarshalersCommon().getRemoteNuclideUriMarshalers)('localhost')], customServices);
  }

  async stop() {
    this._client.dispose();

    await this._server.close();
  }

  getRemoteService(serviceName) {
    return this._client.getService(serviceName);
  }

  getUriOfRemotePath(remotePath) {
    return `nuclide://localhost${remotePath}`;
  }

}

exports.default = ServiceTestHelper;