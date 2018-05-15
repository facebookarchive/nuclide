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

import {observeDevices} from './DevicePoller';

export function observeTizenDevices(host: NuclideUri): Observable<Device[]> {
  return observeTizenDevicesX(host).map(devices => devices.getOrDefault([]));
}

export function observeTizenDevicesX(
  host: NuclideUri,
): Observable<Expected<Device[]>> {
  return observeDevices('sdb', host);
}
