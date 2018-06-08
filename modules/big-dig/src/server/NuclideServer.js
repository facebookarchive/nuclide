/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import BigDigServer from './BigDigServer';
import WS from 'ws';
import https from 'https';
import {scanPortsToListen} from '../common/ports';

export type LauncherParameters = {
  server: BigDigServer,
  // Any sort of JSON-serializable object is fine.
  serverParams: mixed,
};

// The absolutePathToServerMain must export a single function of this type.
export type LauncherType = (params: LauncherParameters) => Promise<void>;

export type NuclideServerOptions = {
  // These options will be passed verbatim to https.createServer(). Admittedly,
  // this is not the complete list of options that it takes, but these are the
  // ones we intentionally work with.
  webServer: {
    // Optional private keys in PEM format.
    key?: string | Array<string> | Buffer | Array<Buffer>,
    // Optional cert chains in PEM format
    cert?: string | Array<string> | Buffer | Array<Buffer>,
    // Optionally override the trusted CA certificates.
    ca?: string | Array<string> | Buffer | Array<Buffer>,
  },
  ports: string,
  absolutePathToServerMain: string,
  // Any sort of JSON-serializable object is fine.
  serverParams: mixed,
};

/**
 * Launch a NuclideServer with the specified parameters.
 *
 * One common this may fail is if the specified port is in use. The caller is responsible for
 * checking for this failure and retrying on a different port.
 *
 * The best way to avoid this is by specifying a port of 0, though that may not be an option if the
 * host machine does not allow HTTP traffic to be served on an arbitrary port.
 * Note that if options.port=0 is specified to choose an ephemeral port, then the caller should
 * check server.address().port to see what the actual port is.
 */
export async function launchServer(
  options: NuclideServerOptions,
): Promise<number> {
  const webServer = https.createServer(options.webServer);

  if (!(await scanPortsToListen(webServer, options.ports))) {
    throw new Error(`All ports in range "${options.ports}" are already in use`);
  }

  const webSocketServer = new WS.Server({
    server: webServer,
    perMessageDeflate: true,
  });

  // Let unhandled WS server errors go through to the global exception handler.

  // $FlowIgnore
  const launcher: LauncherType = require(options.absolutePathToServerMain);
  const tunnelLauncher: LauncherType = require('../services/tunnel/launcher');

  const bigDigServer = new BigDigServer(webServer, webSocketServer);

  await launcher({
    server: bigDigServer,
    serverParams: options.serverParams,
  });

  await tunnelLauncher({
    server: bigDigServer,
    serverParams: options.serverParams,
  });

  return webServer.address().port;
}
