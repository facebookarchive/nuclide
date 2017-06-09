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
import {AndroidProviders} from './device_panel/AndroidProviders';
import {TizenProviders} from './device_panel/TizenProviders';

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
      api.registerListProvider(
        AndroidProviders.createAndroidDeviceListProvider(),
      ),
      api.registerListProvider(TizenProviders.createTizenDeviceListProvider()),
      // info
      api.registerInfoProvider(AndroidProviders.createAndroidInfoProvider()),
      api.registerInfoProvider(TizenProviders.createTizenInfoProvider()),
      // processes
      api.registerProcessesProvider(
        AndroidProviders.createAndroidProcessesProvider(),
      ),
      // process tasks
      api.registerProcessTaskProvider(
        AndroidProviders.createAndroidStopPackageProvider(),
      ),
      // device type tasks
      api.registerDeviceTypeTaskProvider(
        AndroidProviders.createAndroidConfigurePathTaskProvider(),
      ),
      api.registerDeviceTypeTaskProvider(
        TizenProviders.createTizenConfigurePathTaskProvider(),
      ),
    );
  }
}

createPackage(module.exports, Activation);
