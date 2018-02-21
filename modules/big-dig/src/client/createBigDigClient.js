/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import {HEARTBEAT_CHANNEL} from '../server/BigDigServer';
import {BigDigClient} from './BigDigClient';
import {NuclideSocket} from '../socket/NuclideSocket';

export type BigDigClientConfig = {
  +host: string,
  +port: number,
  +certificateAuthorityCertificate?: Buffer | string,
  +clientCertificate?: Buffer | string,
  +clientKey?: Buffer | string,
};

/**
 * Creates a Big Dig client that speaks the v1 protocol.
 */
export default (async function createBigDigClient(
  config: BigDigClientConfig,
): Promise<BigDigClient> {
  const options = {
    ca: config.certificateAuthorityCertificate,
    cert: config.clientCertificate,
    key: config.clientKey,
  };

  const serverUri = `https://${config.host}:${config.port}/v1`;

  const nuclideSocket = new NuclideSocket(
    serverUri,
    HEARTBEAT_CHANNEL,
    options,
  );

  return new BigDigClient(nuclideSocket, nuclideSocket.getHeartbeat());
});
