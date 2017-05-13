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

import createPackage from '../../commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {
  createAndroidDeviceListProvider,
  createAndroidInfoProvider,
  createAndroidProcessesProvider,
} from './android_providers';
import {
  createTizenDeviceListProvider,
  createTizenInfoProvider,
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
      api.registerListProvider(createAndroidDeviceListProvider()),
    );
    this._disposables.add(
      api.registerListProvider(createTizenDeviceListProvider()),
    );
    this._disposables.add(
      api.registerInfoProvider(createAndroidInfoProvider()),
    );
    this._disposables.add(
      api.registerProcessesProvider(createAndroidProcessesProvider()),
    );
    this._disposables.add(api.registerInfoProvider(createTizenInfoProvider()));
  }
}

createPackage(module.exports, Activation);
