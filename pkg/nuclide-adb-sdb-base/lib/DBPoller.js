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
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {Device} from '../../nuclide-devices/lib/types';

export type DBType = 'sdb' | 'adb';

class DBPoller {
  _type: DBType;
  _dbAvailable: Map<NuclideUri, Promise<boolean>> = new Map();
  _observables: Map<NuclideUri, Observable<Device[]>> = new Map();

  constructor(type: DBType) {
    this._type = type;
  }

  observe(host: NuclideUri): Observable<Device[]> {
    let observable = this._observables.get(host);
    if (observable != null) {
      return observable;
    }
    observable = Observable.interval(3000)
      .startWith(0)
      .switchMap(() => Observable.fromPromise(this.fetch(host)))
      .publish()
      .refCount();
    this._observables.set(host, observable);
    return observable;
  }

  async fetch(host: NuclideUri): Promise<Device[]> {
    const rpc = this._type === 'adb'
      ? getAdbServiceByNuclideUri(host)
      : getSdbServiceByNuclideUri(host);

    let dbAvailable = this._dbAvailable.get(host);
    if (dbAvailable == null) {
      dbAvailable = rpc.startServer();
      this._dbAvailable.set(host, dbAvailable);
      if (!await dbAvailable) {
        atom.notifications.addError(
          `Couldn't start the ${this._type} server. Check if ${this._type} is in your $PATH and that it works properly.`,
          {dismissable: true},
        );
      }
    }
    if (await dbAvailable) {
      return rpc
        .getDeviceList()
        .then(devices => devices.map(device => this.parseRawDevice(device)));
    }
    return [];
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

const pollers: Map<DBType, DBPoller> = new Map();

export function observeDevices(
  type: DBType,
  host: NuclideUri,
): Observable<Device[]> {
  let poller = pollers.get(type);
  if (poller == null) {
    poller = new DBPoller(type);
    pollers.set(type, poller);
  }
  return poller.observe(host);
}
