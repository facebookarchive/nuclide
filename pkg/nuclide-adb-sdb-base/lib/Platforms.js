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

import type {DeviceDescription} from 'nuclide-adb/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {ConnectableObservable} from 'rxjs';

import {getAdbServiceByNuclideUri} from 'nuclide-adb/lib/utils';
import {getSdbServiceByNuclideUri} from '../../nuclide-remote-connection';

export type DBType = 'sdb' | 'adb';

export type DBPlatform = {
  name: string,
  command: string,
  getService: NuclideUri => {
    getDeviceList: () => ConnectableObservable<Array<DeviceDescription>>,
  },
};

export function getPlatform(type: DBType): DBPlatform {
  switch (type) {
    case 'adb':
      return {
        name: 'Android',
        command: 'adb',
        getService: getAdbServiceByNuclideUri,
      };
    case 'sdb':
      return {
        name: 'Tizen',
        command: 'sdb',
        getService: getSdbServiceByNuclideUri,
      };
    default:
      (type: empty);
      throw Error(`Invalid DBType: ${type}`);
  }
}
