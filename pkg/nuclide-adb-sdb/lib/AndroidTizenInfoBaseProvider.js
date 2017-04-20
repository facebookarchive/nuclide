/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import typeof * as AdbService from '../../nuclide-adb-sdb-rpc/lib/AdbService';
import typeof * as SdbService from '../../nuclide-adb-sdb-rpc/lib/SdbService';

import type {DeviceInfoProvider} from '../../nuclide-devices/lib/types';
import type {NuclideUri} from '../../commons-node/nuclideUri';

export class AndroidTizenInfoBaseProvider implements DeviceInfoProvider {
  _type: string;
  _rpcFactory: (host: NuclideUri) => AdbService | SdbService;

  constructor(type: string, rpcFactory: (host: NuclideUri) => AdbService | SdbService) {
    this._type = type;
    this._rpcFactory = rpcFactory;
  }

  async fetch(host: NuclideUri, device: string): Promise<Map<string, string>> {
    const infoMap = new Map();
    for (const [key, value] of await this._rpcFactory(host).getDeviceInfo(device)) {
      const beautifulKey = key.toLowerCase().replace('_', ' ');
      infoMap.set(beautifulKey.charAt(0).toUpperCase() + beautifulKey.slice(1), value);
    }
    return infoMap;
  }

  getTitle(): string {
    return 'Device information';
  }

  getType(): string {
    return this._type;
  }
}
