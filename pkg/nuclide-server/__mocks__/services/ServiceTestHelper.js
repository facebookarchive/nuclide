'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _NuclideServer;

function _load_NuclideServer() {
  return _NuclideServer = _interopRequireDefault(require('../../lib/NuclideServer'));
}

var _ReliableSocket;

function _load_ReliableSocket() {
  return _ReliableSocket = require('../../../../modules/big-dig/src/socket/ReliableSocket');
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../../nuclide-rpc');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../../nuclide-marshalers-common');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HEARTBEAT_CHANNEL = 'test-heartbeat'; /**
                                             * Copyright (c) 2015-present, Facebook, Inc.
                                             * All rights reserved.
                                             *
                                             * This source code is licensed under the license found in the LICENSE file in
                                             * the root directory of this source tree.
                                             *
                                             * 
                                             * @format
                                             */

class ServiceTestHelper {

  async start(customServices) {
    this._server = new (_NuclideServer || _load_NuclideServer()).default({ port: 0 }, customServices);
    await this._server.connect();

    const port = this._server._webServer.address().port;
    this._client = (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createRemote(new (_ReliableSocket || _load_ReliableSocket()).ReliableSocket(`http://localhost:${port}`, HEARTBEAT_CHANNEL, null), [(0, (_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).getRemoteNuclideUriMarshalers)('localhost')], customServices);
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