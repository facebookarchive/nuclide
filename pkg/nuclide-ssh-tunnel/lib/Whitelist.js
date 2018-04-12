/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {ResolvedTunnel} from '../../nuclide-socket-rpc/lib/types';

import {memoize} from 'lodash';

export async function validateTunnel(tunnel: ResolvedTunnel): Promise<boolean> {
  if (tunnel.to.host === 'localhost') {
    return true;
  }
  const allowedPorts = await getAllowedPorts();
  if (allowedPorts == null) {
    return true;
  }

  return allowedPorts.includes(tunnel.to.port);
}

// require fb-sitevar module lazily
const requireFetchSitevarOnce = memoize(() => {
  try {
    // $FlowFB
    return require('../../commons-node/fb-sitevar').fetchSitevarOnce;
  } catch (e) {
    return null;
  }
});

// returns either a list of allowed ports, or null if not restricted
async function getAllowedPorts(): Promise<?Array<number>> {
  const fetchSitevarOnce = requireFetchSitevarOnce();
  if (fetchSitevarOnce == null) {
    return null;
  }
  const allowedPorts = await fetchSitevarOnce('NUCLIDE_TUNNEL_ALLOWED_PORTS');
  if (allowedPorts == null) {
    return [];
  }
  return allowedPorts;
}
