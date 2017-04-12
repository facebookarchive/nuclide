/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import typeof * as AdbService from '../../../nuclide-adb-sdb-rpc/lib/AdbService';
import typeof * as SdbService from '../../../nuclide-adb-sdb-rpc/lib/SdbService';

import type {DeviceDescription} from '../../../nuclide-adb-sdb-rpc/lib/types';
import type {NuclideUri} from '../../../commons-node/nuclideUri';
import type {Device, DeviceFetcher} from '../types';

export class AndroidTizenBaseFetcher implements DeviceFetcher {
  _type: string;
  _rpcFactory: (host: NuclideUri) => AdbService | SdbService;

  constructor(type: string, rpcFactory: (host: NuclideUri) => AdbService | SdbService) {
    this._type = type;
    this._rpcFactory = rpcFactory;
  }

  getType(): string {
    return this._type;
  }

  fetch(host: NuclideUri): Promise<Device[]> {
    return this._rpcFactory(host).getDeviceList().then(
      devices => devices.map(device => this.parseRawDevice(device)),
    );
  }

  parseRawDevice(device: DeviceDescription): Device {
    const deviceArchitecture =
      device.architecture.startsWith('arm64') ? 'arm64' :
      device.architecture.startsWith('arm') ? 'arm' :
      device.architecture;

    const displayName = (device.name.startsWith('emulator') ? device.name : device.model)
      .concat(` (${deviceArchitecture}, API ${device.apiVersion})`);

    return {
      name: device.name,
      displayName,
    };
  }
}
