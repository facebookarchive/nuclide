'use strict';

var _net = _interopRequireDefault(require('net'));

var _SocketServer;

function _load_SocketServer() {
  return _SocketServer = require('../lib/SocketServer');
}

var _SocketTransport;

function _load_SocketTransport() {
  return _SocketTransport = require('../lib/SocketTransport');
}

var _RpcConnection;

function _load_RpcConnection() {
  return _RpcConnection = require('../lib/RpcConnection');
}

var _loadServicesConfig;

function _load_loadServicesConfig() {
  return _loadServicesConfig = _interopRequireDefault(require('../lib/loadServicesConfig'));
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
}

var _ServiceRegistry;

function _load_ServiceRegistry() {
  return _ServiceRegistry = require('../lib/ServiceRegistry');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('SocketServer', () => {
  let configPath;

  beforeEach(async () => {
    await (async () => {
      const services3json = [{
        implementation: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/EchoService.js'),
        name: 'EchoService'
      }];
      const fbservices3json = [];
      configPath = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('services', new Map([['services-3.json', JSON.stringify(services3json)], ['fb-services-3.json', JSON.stringify(fbservices3json)]]));
    })();
  });

  it.skip('connect and send message', async () => {
    await (async () => {
      // flowlint-next-line sketchy-null-string:off
      if (!configPath) {
        throw new Error('Invariant violation: "configPath"');
      }

      const services = (0, (_loadServicesConfig || _load_loadServicesConfig()).default)(configPath);
      const registry = new (_ServiceRegistry || _load_ServiceRegistry()).ServiceRegistry([(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], services);
      const server = new (_SocketServer || _load_SocketServer()).SocketServer(registry);
      const address = await server.getAddress();

      if (!(address.port !== 0)) {
        throw new Error('Invariant violation: "address.port !== 0"');
      }

      const clientSocket = _net.default.connect(address.port);
      const clientTransport = new (_SocketTransport || _load_SocketTransport()).SocketTransport(clientSocket);
      const clientConnection = (_RpcConnection || _load_RpcConnection()).RpcConnection.createLocal(clientTransport, [(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], services);

      const echoService = clientConnection.getService('EchoService');
      const result = await echoService.echoString('Hello World!');

      expect(result).toBe('Hello World!');

      server.dispose();
    })();
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */