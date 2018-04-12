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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {TunnelDescriptor} from '../../nuclide-socket-rpc/lib/types';
import type {Tunnel} from './types';
import typeof * as SocketService from '../../nuclide-socket-rpc';

import nuclideUri from 'nuclide-commons/nuclideUri';
import {getSocketServiceByNuclideUri} from '../../nuclide-remote-connection';
import * as SocketServiceImpl from '../../nuclide-socket-rpc';

export function descriptorForTunnel(tunnel: Tunnel): TunnelDescriptor {
  const {from, to} = tunnel;
  return {
    from: {
      host: getSharedHostUri(from.host),
      port: from.port,
      family: from.family || 6,
    },
    to: {
      host: getSharedHostUri(to.host),
      port: to.port,
      family: to.family || 6,
    },
  };
}

// From tunneling perspective, host is a "singleton", all roots can reuse the same socket service.
export function getSharedHostUri(
  host: 'localhost' | NuclideUri | string,
): 'localhost' | NuclideUri {
  if (host === 'localhost' || host === '') {
    return 'localhost';
  } else if (nuclideUri.isRemote(host)) {
    return nuclideUri.createRemoteUri(nuclideUri.getHostname(host), '/');
  } else {
    // We assume that the passed string is a hostname.
    return nuclideUri.createRemoteUri(host, '/');
  }
}

// We assume `host`  has already been processed by getSharedHostUri
export function getSocketServiceByHost(
  host: 'localhost' | NuclideUri,
): SocketService {
  if (host === 'localhost') {
    // Bypass the RPC framework to avoid extra marshal/unmarshaling.
    return SocketServiceImpl;
  } else {
    return getSocketServiceByNuclideUri(host);
  }
}
