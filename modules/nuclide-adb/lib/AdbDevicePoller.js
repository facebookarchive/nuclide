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

import type {Expected} from 'nuclide-commons/expected';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Device} from 'nuclide-debugger-common/types';
import type {DeviceDescription} from 'nuclide-adb/lib/types';

import {getLogger} from 'log4js';
import {arrayEqual} from 'nuclide-commons/collection';
import {SimpleCache} from 'nuclide-commons/SimpleCache';
// $FlowIgnore untyped import
import shallowEqual from 'shallowequal';
import {Observable} from 'rxjs';
import {Expect} from 'nuclide-commons/expected';
import {track} from 'nuclide-commons/analytics';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {getAdbServiceByNuclideUri} from './utils';

export function observeAndroidDevices(
  host: NuclideUri,
): Observable<Array<Device>> {
  return observeAndroidDevicesX(host).map(devices => devices.getOrDefault([]));
}

const pollersForUris: SimpleCache<
  string,
  Observable<Expected<Array<Device>>>,
> = new SimpleCache();

export function observeAndroidDevicesX(
  host: NuclideUri,
): Observable<Expected<Array<Device>>> {
  const serviceUri = nuclideUri.isRemote(host)
    ? nuclideUri.createRemoteUri(nuclideUri.getHostname(host), '/')
    : '';
  return pollersForUris.getOrCreate(serviceUri, () => {
    let fetching = false;
    return Observable.interval(2000)
      .startWith(0)
      .filter(() => !fetching)
      .switchMap(() => {
        fetching = true;
        return fetch(serviceUri)
          .map(devices => Expect.value(devices))
          .catch(err => {
            const logger = getLogger('nuclide-adb');
            if (err.stack.startsWith('TimeoutError')) {
              logger.debug('Error polling for devices: ' + err.message);
            } else {
              logger.warn('Error polling for devices: ' + err.message);
            }
            return Observable.of(
              Expect.error(
                new Error("Can't fetch Android devices.\n\n" + err.message),
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
      .refCount();
  });
}

function fetch(hostname: NuclideUri): Observable<Array<Device>> {
  try {
    return getAdbServiceByNuclideUri(hostname)
      .getDeviceList()
      .refCount()
      .map(devices => devices.map(device => parseRawDevice(device)));
  } catch (e) {
    // The remote host connection can go away while we are fetching if the user
    // removes it from the file tree or the network connection is lost.
    return Observable.of([]);
  }
}

function parseRawDevice(device: DeviceDescription): Device {
  let deviceArchitecture = '';
  for (const arch of ['arm64', 'arm', 'x86']) {
    if (device.architecture.startsWith(arch)) {
      deviceArchitecture = arch;
      break;
    }
  }
  if (deviceArchitecture.length === 0) {
    track('nuclide-adb.unknown_device_arch', {deviceArchitecture});
  }

  const displayName =
    device.name.startsWith('emulator') || device.name.startsWith('localhost:')
      ? device.name
      : device.model;

  return {
    name: device.name,
    displayName,
    architecture: deviceArchitecture,
    rawArchitecture: device.architecture,
  };
}
