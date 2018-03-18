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
import type {
  Tunnel,
  SshTunnelService,
} from '../../nuclide-ssh-tunnel/lib/types';

import invariant from 'assert';
import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable, Subject} from 'rxjs';
import {Cache} from '../../commons-node/cache';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
import {getAdbServiceByNuclideUri} from '../../nuclide-remote-connection';

export function startTunnelingAdb(uri: NuclideUri): Promise<void> {
  const {onReady} = activeTunnels.getOrCreate(uri, (_, serviceUri) => {
    invariant(typeof serviceUri === 'string');
    const adbService = getAdbServiceByNuclideUri(serviceUri);
    const tunnelsOpen = adbService.killServer().then(() => {
      return openTunnels(serviceUri);
    });
    return {
      onReady: tunnelsOpen.then(() => {}),
      dispose: () => {
        tunnelsOpen.then(disposables => disposables.forEach(d => d.dispose()));
      },
    };
  });
  changes.next();

  return onReady.catch(error => {
    // We don't want to keep a failed open tunnel in the cache, otherwise
    // when there's an error we're not able to retry the operation.
    activeTunnels.delete(uri);
    throw error;
  });
}

export function stopTunnelingAdb(uri: NuclideUri) {
  activeTunnels.delete(uri);
  changes.next();
}

export function isAdbTunneled(uri: NuclideUri): Observable<boolean> {
  return changes
    .startWith(undefined)
    .map(() => activeTunnels.get(uri) != null)
    .distinctUntilChanged();
}

const activeTunnels: Cache<
  NuclideUri,
  {onReady: Promise<void>, dispose: () => void},
> = new Cache({
  keyFactory: uri =>
    nuclideUri.createRemoteUri(nuclideUri.getHostname(uri), '/'),
  dispose: value => value.dispose(),
});
const changes: Subject<void> = new Subject();

async function openTunnels(host: NuclideUri): Promise<Array<IDisposable>> {
  const tunnelService: ?SshTunnelService = await consumeFirstProvider(
    'nuclide.ssh-tunnel',
  );
  if (tunnelService == null) {
    throw new Error(
      'No package to open a tunnel to the remote host available.',
    );
  }
  const tunnels = [
    {
      description: 'adb',
      from: {host: nuclideUri.getHostname(host), port: 5037, family: 4},
      to: {host: 'localhost', port: 5037, family: 4},
    },
    {
      description: 'emulator console',
      from: {host: nuclideUri.getHostname(host), port: 5554, family: 4},
      to: {host: 'localhost', port: 5554, family: 4},
    },
    {
      description: 'emulator adb',
      from: {host: nuclideUri.getHostname(host), port: 5555, family: 4},
      to: {host: 'localhost', port: 5555, family: 4},
    },
    {
      description: 'exopackage',
      from: {host: nuclideUri.getHostname(host), port: 2829, family: 4},
      to: {host: 'localhost', port: 2829, family: 4},
    },
  ];

  const rejectedErrors = [];
  return Promise.all(
    tunnels.map(tunnel => {
      return _requestTunnelFromService(tunnel, tunnelService).catch(error => {
        rejectedErrors.push(error);
        return new UniversalDisposable();
      });
    }),
  ).then(disposables => {
    if (rejectedErrors.length > 0) {
      disposables.forEach(disposable => disposable.dispose());
      return Promise.reject(new Error(rejectedErrors));
    }
    return disposables;
  });
}

async function _requestTunnelFromService(
  tunnel: Tunnel,
  service: SshTunnelService,
): Promise<IDisposable> {
  return new Promise((resolve, reject) => {
    const disposable = service.openTunnel(
      tunnel,
      error => {
        if (error == null) {
          resolve(disposable);
        } else {
          reject(new Error(error));
        }
      },
      () => {},
    );
  });
}
