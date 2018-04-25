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

import type {DevicePanelServiceApi} from '../../nuclide-device-panel/lib/types';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {observeTizenDevicesX} from '../../nuclide-adb-sdb-base/lib/SdbDevicePoller';
import {TizenDeviceInfoProvider} from './providers/TizenDeviceInfoProvider';
import {TizenDeviceProcessesProvider} from './providers/TizenDeviceProcessesProvider';
import {TizenDeviceStopProcessProvider} from './providers/TizenDeviceStopProcessProvider';

export function registerDevicePanelProviders(
  api: DevicePanelServiceApi,
): IDisposable {
  let lastRegistration;
  return new UniversalDisposable(
    () => {
      if (lastRegistration != null) {
        lastRegistration.dispose();
      }
    },
    atom.config.observe(
      'nuclide.nuclide-device-panel-tizen.register',
      (value: boolean) => {
        if (lastRegistration != null) {
          lastRegistration.dispose();
        }
        if (value) {
          lastRegistration = new UniversalDisposable(
            api.registerListProvider({
              getType: () => 'Tizen',
              observe: host => observeTizenDevicesX(host),
            }),
            api.registerInfoProvider(new TizenDeviceInfoProvider()),
            api.registerProcessesProvider(new TizenDeviceProcessesProvider()),
            api.registerProcessTaskProvider(
              new TizenDeviceStopProcessProvider(),
            ),
          );
        }
      },
    ),
  );
}
