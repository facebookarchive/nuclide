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

import type {
  DeviceProcessesProvider,
  Process,
} from '../../nuclide-devices/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

export class ATDeviceProcessesProvider implements DeviceProcessesProvider {
  _type: string;
  _rpcFactory: (host: NuclideUri) => AdbService;

  constructor(type: string, rpcFactory: (host: NuclideUri) => AdbService) {
    this._type = type;
    this._rpcFactory = rpcFactory;
  }

  async fetch(host: NuclideUri, device: string): Promise<Array<Process>> {
    return this._rpcFactory(host).getProcesses(device);
  }

  getType(): string {
    return this._type;
  }

  isSupported(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async killRunningPackage(
    host: NuclideUri,
    device: string,
    packageName: string,
  ): Promise<void> {
    return this._rpcFactory(host).forceStopPackage(device, packageName);
  }
}
