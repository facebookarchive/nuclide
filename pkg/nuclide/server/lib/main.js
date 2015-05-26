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
var logger = require('nuclide-logging').getLogger();
var NuclideServer = require('./NuclideServer');

var DEFAULT_PORT = 9090;

async function main(args) {
  try {
    var {port, key, cert, ca} = args;
    if (key && cert && ca) {
      key = fs.readFileSync(key);
      cert = fs.readFileSync(cert);
      ca = fs.readFileSync(ca);
    }
    var server = new NuclideServer({
      port,
      serverKey: key,
      serverCertificate: cert,
      certificateAuthorityCertificate: ca,
      trackEventLoop: true,
    });
    await server.connect();
    logger.info('NuclideServer started on port ' + port + '.');
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
}

// This should never happen because the server must be started with stderr redirected to a log file.
process.stderr.on('error', (error) => {
  throw new Error('Can not write to stderr! :' + error);
});

process.on('uncaughtException', (err) => {
  // Log the error and continue the server crash.
  logger.error('uncaughtException:', err);
  // According to the docs, we need to close our server when this happens once we logged or handled it:
  // https://nodejs.org/api/process.html#process_event_uncaughtexception
  process.exit(1);
});

var argv = require('yargs')
    .default('port', DEFAULT_PORT)
    .argv;

main(argv);
