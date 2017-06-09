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

import {getSdbServiceByNuclideUri} from '../../../nuclide-remote-connection';
import {ATDeviceListProvider} from './ATDeviceListProvider';
import {ATDeviceInfoProvider} from './ATDeviceInfoProvider';
import {ATConfigurePathTaskProvider} from './ATConfigurePathTaskProvider';

const PLATFORM = 'tizen';

const sdkFactory = (host: NuclideUri) => getSdbServiceByNuclideUri(host);

export class TizenProviders {
  static createTizenDeviceListProvider(): ATDeviceListProvider {
    return new ATDeviceListProvider(PLATFORM, sdkFactory);
  }

  static createTizenInfoProvider(): ATDeviceInfoProvider {
    return new ATDeviceInfoProvider(PLATFORM, sdkFactory);
  }

  static createTizenConfigurePathTaskProvider(): ATConfigurePathTaskProvider {
    return new ATConfigurePathTaskProvider(PLATFORM, sdkFactory);
  }
}
