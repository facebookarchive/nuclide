'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var path = require('path');
var {execSync} = require('child_process');
var NuclideServer = require('../lib/NuclideServer');
var NuclideClient = require('../lib/NuclideClient');
var NuclideRemoteEventbus = require('../lib/NuclideRemoteEventbus');
var {getVersion} = require('nuclide-version');

var server;
var client;

// Paths to certificate authority crt (certificate)
var ca_cert_path;

// Path to server key, and crt (certificate)
var server_cert_path;
var server_key_path;

// Path to client key, and crt (certificate)
var client_cert_path;
var client_key_path;

var gen_certs_path = path.resolve(__dirname, '../scripts/nuclide_certificates_generator.py');

describe('Nuclide Sercure Server test suite', () => {
  beforeEach(() => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;
    waitsForPromise(async () => {
      generateCertificates();

      server = new NuclideServer({
        port: 8176,
        serverKey: fs.readFileSync(server_key_path),
        serverCertificate: fs.readFileSync(server_cert_path),
        certificateAuthorityCertificate: fs.readFileSync(ca_cert_path),
      });

      await server.connect();

      client = new NuclideClient('test', new NuclideRemoteEventbus('https://localhost:8176', {
        certificateAuthorityCertificate: fs.readFileSync(ca_cert_path),
        clientCertificate: fs.readFileSync(client_cert_path),
        clientKey: fs.readFileSync(client_key_path),
      }));
    });
  });

  afterEach(() => {
    client.eventbus.socket.close();
    server.close();
  });

  it('responds to HTTPS request', () => {
    waitsForPromise(async () => {
      var version = await client.version();
      expect(version.toString()).toEqual(getVersion());
    });
  });
});

function generateCertificates() {
  var json = JSON.parse(execSync(`${gen_certs_path} -s localhost`));
  ca_cert_path = json.ca_cert;
  server_cert_path = json.server_cert;
  server_key_path = json.server_key;
  client_cert_path = json.client_cert;
  client_key_path = json.client_key;
}
