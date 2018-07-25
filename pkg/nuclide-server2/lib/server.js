"use strict";

function _nuclideLogging() {
  const data = require("../../nuclide-logging");

  _nuclideLogging = function () {
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

function _nuclideRpc() {
  const data = require("../../nuclide-rpc");

  _nuclideRpc = function () {
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

function _constants() {
  const data = require("./constants");

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
(0, _nuclideLogging().initializeLogging)();

function launch(server) {
  const rpcServiceRegistry = new (_nuclideRpc().ServiceRegistry)(_nuclideMarshalersCommon().getServerSideMarshalers, _servicesConfig().default);
  server.addSubscriber(_constants().NUCLIDE_RPC_TAG, {
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

      _nuclideRpc().RpcConnection.createServer(rpcServiceRegistry, rpcTransport, {});
    }

  });
  return Promise.resolve();
} // eslint-disable-next-line nuclide-internal/no-commonjs


module.exports = launch;