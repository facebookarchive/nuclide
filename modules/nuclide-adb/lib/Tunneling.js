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

import type {SshTunnelService} from 'nuclide-adb/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Subscription} from 'rxjs';

import invariant from 'assert';
import {getLogger} from 'log4js';
import {SimpleCache} from 'nuclide-commons/SimpleCache';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Observable, Subject} from 'rxjs';
import consumeFirstProvider from 'nuclide-commons-atom/consumeFirstProvider';
import {getAdbServiceByNuclideUri} from './utils';
import {track} from 'nuclide-commons/analytics';

export type AdbTunnelingOptions = {
  adbMismatchErrorMessage?: string,
};

export function startTunnelingAdb(
  uri: NuclideUri,
  options?: AdbTunnelingOptions = {},
): Observable<'ready'> {
  if (!nuclideUri.isRemote(uri)) {
    return Observable.of('ready').concat(Observable.never());
  }
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
        throw new Error(
          `Your remote adb version differs from the local one: ${adbVersion} (remote) != ${localAdbVersion} (local).\n\n${options.adbMismatchErrorMessage ||
            ''}`,
        );
      }
      return adbService.checkMuxStatus();
    })
      .switchMap(
        useAdbmux =>
          useAdbmux
            ? checkInToAdbmux(serviceUri)
            : openTunnelsManually(serviceUri),
      )
      .catch(e => {
        getLogger('nuclide-adb').error(e);
        track('nuclide-adb:tunneling:error', {host: uri, error: e});
        throw e;
      })
      .publishReplay(1);

    let adbmuxPort;
    const subscription = observable
      .subscribe(port => (adbmuxPort = port))
      .add(() => {
        if (adbmuxPort != null) {
          adbService.checkOutMuxPort(adbmuxPort);
          adbmuxPort = null;
        }
        stopTunnelingAdb(uri);
      })
      // Start everything!
      .add(observable.connect());

    return {
      subscription,
      tunnels: observable,
    };
  });
  changes.next();

  return tunnels.mapTo('ready');
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
  {tunnels: Observable<?number>, subscription: Subscription},
> = new SimpleCache({
  keyFactory: uri =>
    nuclideUri.createRemoteUri(nuclideUri.getHostname(uri), '/'),
  dispose: value => value.subscription.unsubscribe(),
});
const changes: Subject<void> = new Subject();

function checkInToAdbmux(host: NuclideUri): Observable<?number> {
  return Observable.defer(async () => {
    const service: SshTunnelService = await consumeFirstProvider(
      'nuclide.ssh-tunnel',
    );
    invariant(service);
    const port = await service.getAvailableServerPort(host);
    return {service, port};
  })
    .switchMap(({service, port}) =>
      service
        .openTunnels([
          {
            description: 'adbmux',
            from: {host, port, family: 4},
            to: {host: 'localhost', port: 5037, family: 4},
          },
          {
            description: 'exopackage',
            from: {host, port: 2829, family: 4},
            to: {host: 'localhost', port: 2829, family: 4},
          },
        ])
        .mapTo(port),
    )
    .switchMap(async port => {
      const service = getAdbServiceByNuclideUri(host);
      await service.checkInMuxPort(port);
      return port;
    });
}

function openTunnelsManually(host: NuclideUri): Observable<?number> {
  let retries = 3;
  return Observable.defer(async () => {
    await getAdbServiceByNuclideUri(host).killServer();

    const service: SshTunnelService = await consumeFirstProvider(
      'nuclide.ssh-tunnel',
    );
    invariant(service);
    return service;
  })
    .timeout(5000)
    .switchMap(service =>
      service.openTunnels([
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
      ]),
    )
    .retryWhen(errors => {
      return errors.do(error => {
        if (retries-- <= 0) {
          throw error;
        }
      });
    })
    .mapTo(null);
}
