'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs';

import path from 'path';
import NuclideServer from '../lib/NuclideServer';
import ClientComponent from '../lib/serviceframework/ClientComponent';
import {loadServicesConfig} from '../lib/serviceframework/config';
import NuclideSocket from '../lib/NuclideSocket';
import invariant from 'assert';
import child_process from 'child_process';

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

const gen_certs_path = path.resolve(__dirname, '../scripts/nuclide_certificates_generator.py');

describe('Nuclide Secure Server test suite', () => {
  it('Starts a server', () => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;
    waitsForPromise(async () => {
      generateCertificates();

      server = new NuclideServer({
        port: 8176,
        serverKey: fs.readFileSync(server_key_path),
        serverCertificate: fs.readFileSync(server_cert_path),
        certificateAuthorityCertificate: fs.readFileSync(ca_cert_path),
      }, loadServicesConfig());

      await server.connect();

      socket = new NuclideSocket('https://localhost:8176', {
        certificateAuthorityCertificate: fs.readFileSync(ca_cert_path),
        clientCertificate: fs.readFileSync(client_cert_path),
        clientKey: fs.readFileSync(client_key_path),
      });
      const client = new ClientComponent('localhost', 8176, socket, loadServicesConfig());
      invariant(client);

      socket.close();
      server.close();
    });
  });
});

function generateCertificates() {
  const out = child_process.execSync(`${gen_certs_path} -s localhost`).toString('utf8');
  const json = JSON.parse(out);
  ca_cert_path = json.ca_cert;
  server_cert_path = json.server_cert;
  server_key_path = json.server_key;
  client_cert_path = json.client_cert;
  client_key_path = json.client_key;
}
