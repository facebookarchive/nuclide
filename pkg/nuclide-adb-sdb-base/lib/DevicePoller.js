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

import type {DeviceDescription} from 'nuclide-adb/lib/types';
import type {Expected} from 'nuclide-commons/expected';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Device} from '../../nuclide-device-panel/lib/types';
import type {DBPlatform, DBType} from './Platforms';

import {getLogger} from 'log4js';
import {arrayEqual} from 'nuclide-commons/collection';
import {SimpleCache} from 'nuclide-commons/SimpleCache';
import shallowEqual from 'shallowequal';
import {Observable} from 'rxjs';
import {Expect} from 'nuclide-commons/expected';
import {track} from '../../nuclide-analytics';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {getPlatform} from './Platforms';

class DevicePoller {
  _platform: DBPlatform;
  _observables: SimpleCache<
    string,
    Observable<Expected<Device[]>>,
  > = new SimpleCache();

  constructor(type: DBType) {
    this._platform = getPlatform(type);
  }

  observe(_host: NuclideUri): Observable<Expected<Device[]>> {
    const host = nuclideUri.isRemote(_host) ? _host : '';
    let fetching = false;
    return this._observables.getOrCreate(host, () =>
      Observable.interval(10 * 1000)
        .startWith(0)
        .filter(() => !fetching)
        .switchMap(() => {
          fetching = true;
          return this.fetch(host)
            .map(devices => Expect.value(devices))
            .catch(err => {
              const logger = getLogger('nuclide-adb-sdb-base');
              if (err.stack.startsWith('TimeoutError')) {
                logger.debug(`Error polling for devices: ${err.message}`);
              } else {
                logger.warn(`Error polling for devices: ${err.message}`);
              }
              return Observable.of(
                Expect.error(
                  new Error(
                    `Can't fetch ${
                      this._platform.name
                    } devices. Make sure that ${
                      this._platform.command
                    } is in your $PATH and that it works properly.`,
                  ),
                ),
              );
            })
            .do(() => {
              fetching = false;
            });
        })
        .distinctUntilChanged((a, b) => {
          if (a.isError && b.isError) {
            return a.error.message === b.error.message;
          } else if (a.isPending && b.isPending) {
            return true;
          } else if (!a.isError && !b.isError && !a.isPending && !b.isPending) {
            return arrayEqual(a.value, b.value, shallowEqual);
          } else {
            return false;
          }
        })
        .publishReplay(1)
        .refCount(),
    );
  }

  fetch(host: NuclideUri): Observable<Device[]> {
    try {
      return this._platform
        .getService(host)
        .getDeviceList()
        .refCount()
        .map(devices => devices.map(device => this.parseRawDevice(device)));
    } catch (e) {
      // The remote host connection can go away while we are fetching if the user
      // removes it from the file tree or the network connection is lost.
      return Observable.of([]);
    }
  }

  parseRawDevice(device: DeviceDescription): Device {
    let deviceArchitecture = '';
    for (const arch of ['arm64', 'arm', 'x86']) {
      if (device.architecture.startsWith(arch)) {
        deviceArchitecture = arch;
        break;
      }
    }
    if (deviceArchitecture.length === 0) {
      track('nuclide-adb-sdb-base.unknown_device_arch', {deviceArchitecture});
    }

    const displayName = device.name.startsWith('emulator')
      ? device.name
      : device.model;

    return {
      name: device.name,
      port: device.port,
      displayName,
      architecture: deviceArchitecture,
      rawArchitecture: device.architecture,
    };
  }
}

const pollers: Map<string, DevicePoller> = new Map();

export function observeDevices(
  type: DBType,
  host: NuclideUri,
): Observable<Expected<Device[]>> {
  const pollerKey = `${type}:${host}`;
  let poller = pollers.get(pollerKey);
  if (poller == null) {
    poller = new DevicePoller(type);
    pollers.set(pollerKey, poller);
  }
  return poller.observe(host);
}
