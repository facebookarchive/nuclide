'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _NuclideServer;

function _load_NuclideServer() {
  return _NuclideServer = _interopRequireDefault(require('../lib/NuclideServer'));
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _servicesConfig;

function _load_servicesConfig() {
  return _servicesConfig = _interopRequireDefault(require('../lib/servicesConfig'));
}

var _ReliableSocket;

function _load_ReliableSocket() {
  return _ReliableSocket = require('../../../modules/big-dig/src/socket/ReliableSocket');
}

var _WebSocketTransport;

function _load_WebSocketTransport() {
  return _WebSocketTransport = require('../../../modules/big-dig/src/socket/WebSocketTransport');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _nuclideVersion;

function _load_nuclideVersion() {
  return _nuclideVersion = require('../../nuclide-version');
}

var _child_process = _interopRequireDefault(require('child_process'));

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.setTimeout(30000); /**
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

let server;
let socket;

// Paths to certificate authority crt (certificate)
let ca_cert_path;

// Path to server key, and crt (certificate)
let server_cert_path;
let server_key_path;

// Path to client key, and crt (certificate)
let client_cert_path;
let client_key_path;

const gen_certs_path = (_nuclideUri || _load_nuclideUri()).default.resolve(__dirname, '../scripts/nuclide_certificates_generator.py');

describe('Nuclide Secure Server test suite', () => {
  it.skip('Starts a server', async () => {
    // generating certificates step fails because of missing `propmt = no` in
    // the config.
    generateCertificates();

    server = new (_NuclideServer || _load_NuclideServer()).default({
      port: 8176,
      serverKey: _fs.default.readFileSync(server_key_path),
      serverCertificate: _fs.default.readFileSync(server_cert_path),
      certificateAuthorityCertificate: _fs.default.readFileSync(ca_cert_path)
    }, (_servicesConfig || _load_servicesConfig()).default);

    await server.connect();

    socket = new (_ReliableSocket || _load_ReliableSocket()).ReliableSocket('https://localhost:8176', HEARTBEAT_CHANNEL, {
      ca: _fs.default.readFileSync(ca_cert_path),
      cert: _fs.default.readFileSync(client_cert_path),
      key: _fs.default.readFileSync(client_key_path),
      family: 6
    });
    const client = (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createRemote(socket, [(0, (_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).getRemoteNuclideUriMarshalers)('localhost')], (_servicesConfig || _load_servicesConfig()).default);

    if (!client) {
      throw new Error('Invariant violation: "client"');
    }

    const version = await client.getService('InfoService').getServerVersion();
    expect(version).toBe((0, (_nuclideVersion || _load_nuclideVersion()).getVersion)());

    // Ensure that we resolved the IPv6 address.
    const rpcTransport = client._transport;
    const queuedTransport = (0, (_nullthrows || _load_nullthrows()).default)(rpcTransport)._transport;
    const webSocketTransport = (0, (_nullthrows || _load_nullthrows()).default)(queuedTransport)._transport;

    if (!(webSocketTransport instanceof (_WebSocketTransport || _load_WebSocketTransport()).WebSocketTransport)) {
      throw new Error('Invariant violation: "webSocketTransport instanceof WebSocketTransport"');
    }

    const webSocket = (0, (_nullthrows || _load_nullthrows()).default)(webSocketTransport._socket);
    expect(webSocket._socket.remoteAddress).toBe('::1');

    socket.close();
    server.close();
  });
});

function generateCertificates() {
  const out = _child_process.default.execSync(`${gen_certs_path} -s localhost`).toString('utf8');
  const json = JSON.parse(out);
  ca_cert_path = json.ca_cert;
  server_cert_path = json.server_cert;
  server_key_path = json.server_key;
  client_cert_path = json.client_cert;
  client_key_path = json.client_key;
}