'use strict';

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _servicesConfig;

function _load_servicesConfig() {
  return _servicesConfig = _interopRequireDefault(require('../../nuclide-server/lib/servicesConfig'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
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

(0, (_nuclideLogging || _load_nuclideLogging()).initializeLogging)();

function launch(server) {
  const rpcServiceRegistry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry((_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).getServerSideMarshalers, (_servicesConfig || _load_servicesConfig()).default);

  server.addSubscriber((_constants || _load_constants()).NUCLIDE_RPC_TAG, {
    onConnection(transport) {
      const rpcTransport = {
        send(message) {
          transport.send(message);
        },
        onMessage() {
          return transport.onMessage();
        },
        // TODO: Right now, connections are never closed.
        close() {},
        isClosed() {
          return false;
        }
      };
      (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createServer(rpcServiceRegistry, rpcTransport, {});
    }
  });

  return Promise.resolve();
}

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = launch;