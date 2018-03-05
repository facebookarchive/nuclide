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

import type {DeviceInfoProvider} from '../../../nuclide-device-panel/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Device} from '../../../nuclide-device-panel/lib/types';

import {Observable} from 'rxjs';
import {getSdbServiceByNuclideUri} from '../../../nuclide-remote-connection';

export class TizenDeviceInfoProvider implements DeviceInfoProvider {
  getType(): string {
    return 'Tizen';
  }

  fetch(host: NuclideUri, device: Device): Observable<Map<string, string>> {
    return getSdbServiceByNuclideUri(host)
      .getDeviceInfo(device)
      .refCount()
      .map(props => {
        const infoMap = new Map();
        for (const [key, value] of props) {
          let beautifulKey = key.toLowerCase().replace('_', ' ');
          beautifulKey =
            beautifulKey.charAt(0).toUpperCase() + beautifulKey.slice(1);
          infoMap.set(beautifulKey, value);
        }
        return infoMap;
      });
  }

  getTitle(): string {
    return 'Device information';
  }

  getPriority(): number {
    return 100;
  }

  isSupported(): Observable<boolean> {
    return Observable.of(true);
  }
}
