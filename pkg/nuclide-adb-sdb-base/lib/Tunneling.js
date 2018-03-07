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

import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {BehaviorSubject, Observable} from 'rxjs';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
import {getAdbServiceByNuclideUri} from '../../nuclide-remote-connection';

export function startTunnelingAdb(host: NuclideUri) {
  stopTunnelingAdb();
  const adbService = getAdbServiceByNuclideUri(host);
  Observable.fromPromise(adbService.killServer())
    .switchMap(async () => {
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
      return Promise.all(
        tunnels.map(t => _requestTunnelFromService(t, tunnelService)),
      );
    })
    .subscribe(result => {
      const disposable = new UniversalDisposable();
      result.forEach(d => disposable.add(d));
      activeTunnels.next({host, disposable});
    });
}

export function isAdbTunneled(host: NuclideUri): Observable<boolean> {
  return activeTunnels
    .publishReplay(1)
    .refCount()
    .map(active => active != null && active.host === host);
}

export function stopTunnelingAdb() {
  const active = activeTunnels.getValue();
  if (active != null) {
    active.disposable.dispose();
    activeTunnels.next(null);
  }
}

const activeTunnels: BehaviorSubject<?{
  host: NuclideUri,
  disposable: UniversalDisposable,
}> = new BehaviorSubject(null);

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
          reject(error);
        }
      },
      () => {},
    );
  });
}
