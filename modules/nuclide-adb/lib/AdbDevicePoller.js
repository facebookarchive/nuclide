/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {Expected} from 'nuclide-commons/expected';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Observable} from 'rxjs';
import type {Device} from 'nuclide-debugger-common/types';
import type {DBPlatform} from './types';

import {DevicePoller} from './DevicePoller';
import {getAdbServiceByNuclideUri} from './utils';

const ADB_PLATFORM: DBPlatform = {
  name: 'Android',
  type: 'adb',
  command: 'adb',
  getService: getAdbServiceByNuclideUri,
};

export function observeAndroidDevices(host: NuclideUri): Observable<Device[]> {
  return observeAndroidDevicesX(host).map(devices => devices.getOrDefault([]));
}

export function observeAndroidDevicesX(
  host: NuclideUri,
): Observable<Expected<Device[]>> {
  return DevicePoller.observeDevices(ADB_PLATFORM, host);
}
