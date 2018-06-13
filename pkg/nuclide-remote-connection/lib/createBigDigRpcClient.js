'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _client;

function _load_client() {
  return _client = require('../../../modules/big-dig/src/client');
}

var _nuclideMarshalersAtom;

function _load_nuclideMarshalersAtom() {
  return _nuclideMarshalersAtom = require('../../nuclide-marshalers-atom');
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _config;

function _load_config() {
  return _config = require('../../nuclide-rpc/lib/config');
}

var _servicesConfig;

function _load_servicesConfig() {
  return _servicesConfig = _interopRequireDefault(require('../../nuclide-server/lib/servicesConfig'));
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-server/lib/utils');
}

var _constants;

function _load_constants() {
  return _constants = require('../../nuclide-server2/lib/constants');
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

exports.default = async function createBigDigRpcClient(config) {
  const bigDigClient = await (0, (_client || _load_client()).createBigDigClient)(Object.assign({}, config, {
    ignoreIntransientErrors: true,
    protocolLogger: (_utils || _load_utils()).protocolLogger
  }));
  const bigDigTransport = {
    send(message) {
      bigDigClient.sendMessage((_constants || _load_constants()).NUCLIDE_RPC_TAG, message);
    },
    onMessage() {
      return bigDigClient.onMessage((_constants || _load_constants()).NUCLIDE_RPC_TAG);
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
    rpcConnection: (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createRemote(bigDigTransport, (0, (_nuclideMarshalersAtom || _load_nuclideMarshalersAtom()).getAtomSideMarshalers)(config.host), (_servicesConfig || _load_servicesConfig()).default, { trackSampleRate: 10 }, (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL, null, (_utils || _load_utils()).protocolLogger)
  };
};