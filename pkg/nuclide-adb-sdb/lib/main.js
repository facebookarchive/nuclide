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

import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {
  createAndroidDeviceListProvider,
  createAndroidInfoProvider,
  createAndroidProcessesProvider,
  createAndroidStopPackageProvider,
  createAndroidConfigurePathTaskProvider,
} from './android_providers';
import {
  createTizenDeviceListProvider,
  createTizenInfoProvider,
  createTizenConfigurePathTaskProvider,
} from './tizen_providers';

import type {DevicePanelServiceApi} from '../../nuclide-devices/lib/types';

class Activation {
  _disposables: UniversalDisposable;

  constructor(state: ?mixed) {
    this._disposables = new UniversalDisposable();
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeDevicePanelServiceApi(api: DevicePanelServiceApi): void {
    this._disposables.add(
      // list
      api.registerListProvider(createAndroidDeviceListProvider()),
      api.registerListProvider(createTizenDeviceListProvider()),
      // info
      api.registerInfoProvider(createAndroidInfoProvider()),
      api.registerInfoProvider(createTizenInfoProvider()),
      // processes
      api.registerProcessesProvider(createAndroidProcessesProvider()),
      // process tasks
      api.registerProcessTaskProvider(createAndroidStopPackageProvider()),
      // device type tasks
      api.registerDeviceTypeTaskProvider(
        createAndroidConfigurePathTaskProvider(),
      ),
      api.registerDeviceTypeTaskProvider(
        createTizenConfigurePathTaskProvider(),
      ),
    );
  }
}

createPackage(module.exports, Activation);
