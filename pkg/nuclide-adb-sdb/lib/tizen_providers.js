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

import {getSdbServiceByNuclideUri} from '../../nuclide-remote-connection';
import {ATDeviceListProvider} from './ATDeviceListProvider';
import {ATDeviceInfoProvider} from './ATDeviceInfoProvider';
import {ATConfigurePathTaskProvider} from './ATConfigurePathTaskProvider';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

export function createTizenDeviceListProvider(): ATDeviceListProvider {
  return new ATDeviceListProvider('tizen', (host: NuclideUri) =>
    getSdbServiceByNuclideUri(host),
  );
}

export function createTizenInfoProvider(): ATDeviceInfoProvider {
  return new ATDeviceInfoProvider('tizen', (host: NuclideUri) =>
    getSdbServiceByNuclideUri(host),
  );
}

export function createTizenConfigurePathTaskProvider(): ATConfigurePathTaskProvider {
  return new ATConfigurePathTaskProvider('tizen', (host: NuclideUri) =>
    getSdbServiceByNuclideUri(host),
  );
}
