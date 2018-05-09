/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {Expected} from 'nuclide-commons/expected';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Observable} from 'rxjs';
import type {Device} from '../../nuclide-device-panel/lib/types';

import {getAdbServiceByNuclideUri} from 'nuclide-adb/lib/utils';
import {observeDevices} from './DevicePoller';

export function observeAndroidDevices(host: NuclideUri): Observable<Device[]> {
  return observeAndroidDevicesX(host).map(devices => devices.getOrDefault([]));
}

export function observeAndroidDevicesX(
  host: NuclideUri,
): Observable<Expected<Device[]>> {
  return observeDevices('adb', getAdbServiceByNuclideUri(host), host);
}
