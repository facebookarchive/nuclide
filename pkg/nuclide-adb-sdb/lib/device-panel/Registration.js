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

import type {DevicePanelServiceApi} from '../../../nuclide-device-panel/lib/types';

import {AndroidBridge} from '../bridges/AndroidBridge';
import {TizenBridge} from '../bridges/TizenBridge';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {ATDeviceListProvider} from './ATDeviceListProvider';
import {ATDeviceInfoProvider} from './ATDeviceInfoProvider';
import {ATDeviceProcessesProvider} from './ATDeviceProcessesProvider';
import {ATDeviceStopProcessProvider} from './ATDeviceStopProcessProvider';
import {ATConfigurePathTaskProvider} from './ATConfigurePathTaskProvider';
import {AvdComponentProvider} from './AvdComponentProvider';

export function registerDevicePanelProviders(
  api: DevicePanelServiceApi,
  android: AndroidBridge,
  tizen: TizenBridge,
): IDisposable {
  const disposable = new UniversalDisposable(
    api.registerListProvider(new ATDeviceListProvider(android)),
    api.registerInfoProvider(new ATDeviceInfoProvider(android)),
    api.registerProcessesProvider(new ATDeviceProcessesProvider(android)),
    api.registerProcessTaskProvider(new ATDeviceStopProcessProvider(android)),
    api.registerDeviceTypeTaskProvider(
      new ATConfigurePathTaskProvider(android),
    ),
    api.registerDeviceTypeComponentProvider(new AvdComponentProvider()),
  );

  if (atom.config.get('nuclide.nuclide-adb-sdb.tizen')) {
    disposable.add(
      api.registerListProvider(new ATDeviceListProvider(tizen)),
      api.registerInfoProvider(new ATDeviceInfoProvider(tizen)),
      api.registerProcessesProvider(new ATDeviceProcessesProvider(tizen)),
      api.registerProcessTaskProvider(new ATDeviceStopProcessProvider(tizen)),
      api.registerDeviceTypeTaskProvider(
        new ATConfigurePathTaskProvider(tizen),
      ),
    );
  }
  return disposable;
}
