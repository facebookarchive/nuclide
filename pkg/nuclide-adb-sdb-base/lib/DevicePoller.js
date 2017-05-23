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

import {getAdbServiceByNuclideUri} from '../../nuclide-remote-connection';
import {getSdbServiceByNuclideUri} from '../../nuclide-remote-connection';
import {Observable} from 'rxjs';

import type {DeviceDescription} from '../../nuclide-adb-sdb-rpc/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Device, Expected} from '../../nuclide-devices/lib/types';

export type DBType = 'sdb' | 'adb';

class DevicePoller {
  _type: DBType;
  _observables: Map<NuclideUri, Observable<Expected<Device[]>>> = new Map();

  constructor(type: DBType) {
    this._type = type;
  }

  _getPlatform(): string {
    return this._type === 'adb' ? 'android' : 'tizen';
  }

  observe(host: NuclideUri): Observable<Expected<Device[]>> {
    let observable = this._observables.get(host);
    if (observable != null) {
      return observable;
    }
    observable = Observable.interval(3000)
      .startWith(0)
      .switchMap(() =>
        Observable.fromPromise(this.fetch(host))
          .map(devices => ({
            value: devices,
          }))
          .catch(() =>
            Observable.of({
              isError: true,
              error: new Error(
                `Can't fetch ${this._getPlatform()} devices. Make sure that ${this._type} is in your $PATH and that it works properly.`,
              ),
            }),
          ),
      )
      .publishReplay(1)
      .refCount();
    this._observables.set(host, observable);
    return observable;
  }

  async fetch(host: NuclideUri): Promise<Device[]> {
    const rpc = this._type === 'adb'
      ? getAdbServiceByNuclideUri(host)
      : getSdbServiceByNuclideUri(host);

    return rpc
      .getDeviceList()
      .then(devices => devices.map(device => this.parseRawDevice(device)));
  }

  parseRawDevice(device: DeviceDescription): Device {
    const deviceArchitecture = device.architecture.startsWith('arm64')
      ? 'arm64'
      : device.architecture.startsWith('arm') ? 'arm' : device.architecture;

    const displayName = (device.name.startsWith('emulator')
      ? device.name
      : device.model).concat(
      ` (${deviceArchitecture}, API ${device.apiVersion})`,
    );

    return {
      name: device.name,
      displayName,
      architecture: device.architecture,
    };
  }
}

const pollers: Map<DBType, DevicePoller> = new Map();

function observeDevices(
  type: DBType,
  host: NuclideUri,
): Observable<Expected<Device[]>> {
  let poller = pollers.get(type);
  if (poller == null) {
    poller = new DevicePoller(type);
    pollers.set(type, poller);
  }
  return poller.observe(host);
}

export function observeAndroidDevices(host: NuclideUri): Observable<Device[]> {
  return observeDevices('adb', host).map(
    devices => (devices.isError ? [] : devices.value),
  );
}

export function observeTizenDevices(host: NuclideUri): Observable<Device[]> {
  return observeDevices('sdb', host).map(
    devices => (devices.isError ? [] : devices.value),
  );
}

export function observeAndroidDevicesX(
  host: NuclideUri,
): Observable<Expected<Device[]>> {
  return observeDevices('adb', host);
}

export function observeTizenDevicesX(
  host: NuclideUri,
): Observable<Expected<Device[]>> {
  return observeDevices('sdb', host);
}
