"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _client() {
  const data = require("../../../modules/big-dig/src/client");

  _client = function () {
    return data;
  };

  return data;
}

function _nuclideMarshalersAtom() {
  const data = require("../../nuclide-marshalers-atom");

  _nuclideMarshalersAtom = function () {
    return data;
  };

  return data;
}

function _nuclideRpc() {
  const data = require("../../nuclide-rpc");

  _nuclideRpc = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("../../nuclide-rpc/lib/config");

  _config = function () {
    return data;
  };

  return data;
}

function _servicesConfig() {
  const data = _interopRequireDefault(require("../../nuclide-server/lib/servicesConfig"));

  _servicesConfig = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("../../nuclide-server/lib/utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../../nuclide-server2/lib/constants");

  _constants = function () {
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
 *  strict-local
 * @format
 */
var createBigDigRpcClient = async function createBigDigRpcClient(config) {
  const bigDigClient = await (0, _client().createBigDigClient)(Object.assign({}, config, {
    ignoreIntransientErrors: true,
    protocolLogger: _utils().protocolLogger
  }));
  const bigDigTransport = {
    send(message) {
      bigDigClient.sendMessage(_constants().NUCLIDE_RPC_TAG, message);
    },

    onMessage() {
      return bigDigClient.onMessage(_constants().NUCLIDE_RPC_TAG);
    },

    close() {
      bigDigClient.close();
    },

    isClosed() {
      return bigDigClient.isClosed();
    }

  };
  return {
    bigDigClient,
    rpcConnection: _nuclideRpc().RpcConnection.createRemote(bigDigTransport, (0, _nuclideMarshalersAtom().getAtomSideMarshalers)(config.host), _servicesConfig().default, {
      trackSampleRate: 10
    }, _config().SERVICE_FRAMEWORK3_PROTOCOL, null, _utils().protocolLogger)
  };
};

exports.default = createBigDigRpcClient;