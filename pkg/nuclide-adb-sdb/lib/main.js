/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import createPackage from '../../commons-atom/createPackage';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {AndroidFetcher} from './AndroidFetcher';
import {TizenFetcher} from './TizenFetcher';
import {createAndroidInfoProvider} from './AndroidInfoProvider';
import {createTizenInfoProvider} from './TizenInfoProvider';

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
    this._disposables.add(api.registerDeviceFetcher(new AndroidFetcher()));
    this._disposables.add(api.registerDeviceFetcher(new TizenFetcher()));
    this._disposables.add(api.registerInfoProvider(createAndroidInfoProvider()));
    this._disposables.add(api.registerInfoProvider(createTizenInfoProvider()));
  }
}

createPackage(module.exports, Activation);
