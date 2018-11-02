"use strict";

var _fs = _interopRequireDefault(require("fs"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _NuclideServer() {
  const data = _interopRequireDefault(require("../lib/NuclideServer"));

  _NuclideServer = function () {
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
  const data = _interopRequireDefault(require("../lib/servicesConfig"));

  _servicesConfig = function () {
    return data;
  };

  return data;
}

function _ReliableSocket() {
  const data = require("../../../modules/big-dig/src/socket/ReliableSocket");

  _ReliableSocket = function () {
    return data;
  };

  return data;
}

function _WebSocketTransport() {
  const data = require("../../../modules/big-dig/src/socket/WebSocketTransport");

  _WebSocketTransport = function () {
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

function _nuclideVersion() {
  const data = require("../../nuclide-version");

  _nuclideVersion = function () {
    return data;
  };

  return data;
}

var _child_process = _interopRequireDefault(require("child_process"));

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
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
 * @emails oncall+nuclide
 */
jest.setTimeout(30000);
const HEARTBEAT_CHANNEL = 'test-heartbeat';
let server;
let socket; // Paths to certificate authority crt (certificate)

let ca_cert_path; // Path to server key, and crt (certificate)

let server_cert_path;
let server_key_path; // Path to client key, and crt (certificate)

let client_cert_path;
let client_key_path;

const gen_certs_path = _nuclideUri().default.resolve(__dirname, '../scripts/nuclide_certificates_generator.py');

describe('Nuclide Secure Server test suite', () => {
  it.skip('Starts a server', async () => {
    // generating certificates step fails because of missing `propmt = no` in
    // the config.
    generateCertificates();
    server = new (_NuclideServer().default)({
      port: 8176,
      serverKey: _fs.default.readFileSync(server_key_path),
      serverCertificate: _fs.default.readFileSync(server_cert_path),
      certificateAuthorityCertificate: _fs.default.readFileSync(ca_cert_path)
    }, _servicesConfig().default);
    await server.connect();
    socket = new (_ReliableSocket().ReliableSocket)('https://localhost:8176', HEARTBEAT_CHANNEL, {
      ca: _fs.default.readFileSync(ca_cert_path),
      cert: _fs.default.readFileSync(client_cert_path),
      key: _fs.default.readFileSync(client_key_path),
      family: 6
    });

    const client = _nuclideRpc().RpcConnection.createRemote(socket, [(0, _nuclideMarshalersCommon().getRemoteNuclideUriMarshalers)('localhost')], _servicesConfig().default);

    if (!client) {
      throw new Error("Invariant violation: \"client\"");
    }

    const version = await client.getService('InfoService').getServerVersion();
    expect(version).toBe((0, _nuclideVersion().getVersion)()); // Ensure that we resolved the IPv6 address.

    const rpcTransport = client._transport;

    const queuedTransport = (0, _nullthrows().default)(rpcTransport)._transport;

    const webSocketTransport = (0, _nullthrows().default)(queuedTransport)._transport;

    if (!(webSocketTransport instanceof _WebSocketTransport().WebSocketTransport)) {
      throw new Error("Invariant violation: \"webSocketTransport instanceof WebSocketTransport\"");
    }

    const webSocket = (0, _nullthrows().default)(webSocketTransport._socket);
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