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
import type {Subscription} from 'rxjs';
import type {SshTunnelService} from '../../nuclide-ssh-tunnel/lib/types';

import invariant from 'assert';
import {SimpleCache} from 'nuclide-commons/SimpleCache';
import nullthrows from 'nullthrows';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Observable, Subject} from 'rxjs';
import consumeFirstProvider from 'nuclide-commons-atom/consumeFirstProvider';
import {getAdbServiceByNuclideUri} from 'nuclide-adb/lib/utils';

export type AdbTunnelingOptions = {
  retries?: number,
  adbMismatchErrorMessage?: string,
};

export function startTunnelingAdb(
  uri: NuclideUri,
  options?: AdbTunnelingOptions = {},
): Observable<'ready'> {
  if (!nuclideUri.isRemote(uri)) {
    return Observable.of('ready').concat(Observable.never());
  }
  let retries = options.retries || 0;
  let isTunnelOpen = false;
  const {tunnels} = activeTunnels.getOrCreate(uri, (_, serviceUri) => {
    invariant(typeof serviceUri === 'string');
    const adbService = getAdbServiceByNuclideUri(serviceUri);
    const localAdbService = getAdbServiceByNuclideUri('');

    const observable = Observable.defer(async () => {
      const [adbVersion, localAdbVersion] = await Promise.all([
        adbService.getVersion(),
        localAdbService.getVersion(),
      ]);
      if (adbVersion !== localAdbVersion) {
        // eslint-disable-next-line no-throw-literal
        throw `Your remote adb version differs from the local one: ${adbVersion}(remote) != ${localAdbVersion}(local).\n\n${options.adbMismatchErrorMessage ||
          ''}`;
      }
      return adbService.killServer();
    })
      .timeout(5000)
      .switchMap(() => {
        return openTunnels(serviceUri).do(() => (isTunnelOpen = true));
      })
      .retryWhen(errors => {
        return errors.do(error => {
          if (retries-- <= 0) {
            throw error;
          }
        });
      })
      .catch(e => {
        if (isTunnelOpen) {
          stopTunnelingAdb(uri);
        }
        throw e;
      })
      .publishReplay(1);
    const subscription = observable.connect();
    return {
      tunnels: observable,
      subscription,
    };
  });
  changes.next();

  return tunnels;
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

const activeTunnels: SimpleCache<
  NuclideUri,
  {tunnels: Observable<'ready'>, subscription: Subscription},
> = new SimpleCache({
  keyFactory: uri =>
    nuclideUri.createRemoteUri(nuclideUri.getHostname(uri), '/'),
  dispose: value => value.subscription.unsubscribe(),
});
const changes: Subject<void> = new Subject();

function openTunnels(host: NuclideUri): Observable<'ready'> {
  const tunnels = [
    {
      description: 'adb',
      from: {host, port: 5037, family: 4},
      to: {host: 'localhost', port: 5037, family: 4},
    },
    {
      description: 'emulator console',
      from: {host, port: 5554, family: 4},
      to: {host: 'localhost', port: 5554, family: 4},
    },
    {
      description: 'emulator adb',
      from: {host, port: 5555, family: 4},
      to: {host: 'localhost', port: 5555, family: 4},
    },
    {
      description: 'exopackage',
      from: {host, port: 2829, family: 4},
      to: {host: 'localhost', port: 2829, family: 4},
    },
  ];

  return Observable.defer(() =>
    nullthrows(consumeFirstProvider('nuclide.ssh-tunnel')),
  ).switchMap((service: SshTunnelService) => service.openTunnels(tunnels));
}
