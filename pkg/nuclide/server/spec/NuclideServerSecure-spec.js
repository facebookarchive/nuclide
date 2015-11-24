'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const NuclideServer = require('../lib/NuclideServer');
const NuclideClient = require('../lib/NuclideClient');
const NuclideRemoteEventbus = require('../lib/NuclideRemoteEventbus');
const {getVersion} = require('nuclide-version');

let server;
let client;

// Paths to certificate authority crt (certificate)
let ca_cert_path;

// Path to server key, and crt (certificate)
let server_cert_path;
let server_key_path;

// Path to client key, and crt (certificate)
let client_cert_path;
let client_key_path;

const gen_certs_path = path.resolve(__dirname, '../scripts/nuclide_certificates_generator.py');

describe('Nuclide Sercure Server test suite', () => {
  it('Starts a server', () => {
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

      client.eventbus.socket.close();
      server.close();
    });
  });
});

function generateCertificates() {
  const json = JSON.parse(execSync(`${gen_certs_path} -s localhost`));
  ca_cert_path = json.ca_cert;
  server_cert_path = json.server_cert;
  server_key_path = json.server_key;
  client_cert_path = json.client_cert;
  client_key_path = json.client_key;
}
