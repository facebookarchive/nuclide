"use strict";

var _net = _interopRequireDefault(require("net"));

function _SocketServer() {
  const data = require("../lib/SocketServer");

  _SocketServer = function () {
    return data;
  };

  return data;
}

function _SocketTransport() {
  const data = require("../lib/SocketTransport");

  _SocketTransport = function () {
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

function _loadServicesConfig() {
  const data = _interopRequireDefault(require("../lib/loadServicesConfig"));

  _loadServicesConfig = function () {
    return data;
  };

  return data;
}

function _testHelpers() {
  const data = require("../../../modules/nuclide-commons/test-helpers");

  _testHelpers = function () {
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

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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
 * @emails oncall+nuclide
 */
describe('SocketServer', () => {
  let configPath;
  beforeEach(async () => {
    const services3json = [{
      implementation: _nuclideUri().default.join(__dirname, '../__mocks__/EchoService.js'),
      name: 'EchoService'
    }];
    const fbservices3json = [];
    configPath = await (0, _testHelpers().generateFixture)('services', new Map([['services-3.json', JSON.stringify(services3json)], ['fb-services-3.json', JSON.stringify(fbservices3json)]]));
  });
  it.skip('connect and send message', async () => {
    // flowlint-next-line sketchy-null-string:off
    if (!configPath) {
      throw new Error("Invariant violation: \"configPath\"");
    }

    const services = (0, _loadServicesConfig().default)(configPath);
    const registry = new (_ServiceRegistry().ServiceRegistry)([_nuclideMarshalersCommon().localNuclideUriMarshalers], services);
    const server = new (_SocketServer().SocketServer)(registry);
    const address = await server.getAddress();

    if (!(address.port !== 0)) {
      throw new Error("Invariant violation: \"address.port !== 0\"");
    }

    const clientSocket = _net.default.connect(address.port);

    const clientTransport = new (_SocketTransport().SocketTransport)(clientSocket);

    const clientConnection = _RpcConnection().RpcConnection.createLocal(clientTransport, [_nuclideMarshalersCommon().localNuclideUriMarshalers], services);

    const echoService = clientConnection.getService('EchoService');
    const result = await echoService.echoString('Hello World!');
    expect(result).toBe('Hello World!');
    server.dispose();
  });
});