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

import type {DevicePanelServiceApi} from '../../nuclide-devices/lib/types';
import type {Store} from './types';

import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {AndroidProviders} from './device_panel/AndroidProviders';
import {TizenProviders} from './device_panel/TizenProviders';
import {createEmptyAppState, deserialize} from './redux/AppState';
import * as Reducers from './redux/Reducers';
import {applyMiddleware, createStore} from 'redux';
import {
  combineEpics,
  createEpicMiddleware,
} from '../../commons-node/redux-observable';

class Activation {
  _disposables: UniversalDisposable;
  _store: Store;

  constructor(rawState: ?Object) {
    this._disposables = new UniversalDisposable();
    const initialState = {
      ...createEmptyAppState(),
      ...deserialize(rawState),
    };

    this._store = createStore(
      Reducers.app,
      initialState,
      applyMiddleware(createEpicMiddleware(combineEpics())),
    );
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
