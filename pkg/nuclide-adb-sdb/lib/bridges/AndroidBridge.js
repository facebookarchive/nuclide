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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import typeof * as AdbService
  from '../../../nuclide-adb-sdb-rpc/lib/AdbService';
import type {Store} from '../types';
import type {
  DebugBridgePathsInfo,
} from '../../../nuclide-adb-sdb-rpc/lib/types';
import type {Expected} from '../../../nuclide-expected';
import type {Device} from '../../../nuclide-devices/lib/types';

import * as Actions from '../redux/Actions';
import {getAdbServiceByNuclideUri} from '../../../nuclide-remote-connection';
import {
  observeAndroidDevicesX,
} from '../../../nuclide-adb-sdb-base/lib/DevicePoller';
import {Observable} from 'rxjs';

export class AndroidBridge {
  debugBridge: 'adb' = 'adb';
  name: 'android' = 'android';

  _store: Store;

  constructor(store: Store) {
    this._store = store;
  }

  getService(host: NuclideUri): AdbService {
    return getAdbServiceByNuclideUri(host);
  }

  getCustomDebugBridgePath(host: NuclideUri): ?string {
    return this._store.getState().customAdbPaths.get(host);
  }

  setCustomDebugBridgePath(host: NuclideUri, path: ?string): void {
    this._store.dispatch(Actions.setCustomAdbPath(host, path));
  }

  getDebugBridgePaths(host: NuclideUri): Promise<DebugBridgePathsInfo> {
    return this.getService(host).getCurrentPathsInfo();
  }

  observeDevicesX(host: NuclideUri): Observable<Expected<Device[]>> {
    return observeAndroidDevicesX(host);
  }
}
