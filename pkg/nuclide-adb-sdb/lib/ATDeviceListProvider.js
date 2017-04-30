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

import typeof * as AdbService from '../../nuclide-adb-sdb-rpc/lib/AdbService';
import typeof * as SdbService from '../../nuclide-adb-sdb-rpc/lib/SdbService';

import type {DeviceDescription} from '../../nuclide-adb-sdb-rpc/lib/types';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {Device, DeviceListProvider} from '../../nuclide-devices/lib/types';

export class ATDeviceListProvider implements DeviceListProvider {
  _type: string;
  _rpcFactory: (host: NuclideUri) => AdbService | SdbService;
  _dbAvailable: Map<NuclideUri, Promise<boolean>>;

  constructor(
    type: string,
    rpcFactory: (host: NuclideUri) => AdbService | SdbService,
  ) {
    this._type = type;
    this._rpcFactory = rpcFactory;
    this._dbAvailable = new Map();
  }

  getType(): string {
    return this._type;
  }

  async fetch(host: NuclideUri): Promise<Device[]> {
    const rpc = this._rpcFactory(host);

    let dbAvailable = this._dbAvailable.get(host);
    if (dbAvailable == null) {
      dbAvailable = rpc.startServer();
      this._dbAvailable.set(host, dbAvailable);
      if (!await dbAvailable) {
        const db = this._type === 'android' ? 'adb' : 'sdb';
        atom.notifications.addError(
          `Couldn't start the ${db} server. Check if ${db} is in your $PATH and that it works ` +
            'properly.',
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
    };
  }
}
