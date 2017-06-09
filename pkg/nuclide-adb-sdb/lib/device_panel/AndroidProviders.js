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

import {getAdbServiceByNuclideUri} from '../../../nuclide-remote-connection';
import {ATDeviceListProvider} from './ATDeviceListProvider';
import {ATDeviceInfoProvider} from './ATDeviceInfoProvider';
import {ATDeviceProcessesProvider} from './ATDeviceProcessesProvider';
import {ATDeviceStopPackageProvider} from './ATDeviceStopPackageProvider';
import {ATConfigurePathTaskProvider} from './ATConfigurePathTaskProvider';

const PLATFORM = 'android';

const sdkFactory = (host: NuclideUri) => getAdbServiceByNuclideUri(host);

export class AndroidProviders {
  static createAndroidDeviceListProvider(): ATDeviceListProvider {
    return new ATDeviceListProvider(PLATFORM, sdkFactory);
  }

  static createAndroidInfoProvider(): ATDeviceInfoProvider {
    return new ATDeviceInfoProvider(PLATFORM, sdkFactory);
  }

  static createAndroidProcessesProvider(): ATDeviceProcessesProvider {
    return new ATDeviceProcessesProvider(PLATFORM, sdkFactory);
  }

  static createAndroidStopPackageProvider(): ATDeviceStopPackageProvider {
    return new ATDeviceStopPackageProvider(PLATFORM, sdkFactory);
  }

  static createAndroidConfigurePathTaskProvider(): ATConfigurePathTaskProvider {
    return new ATConfigurePathTaskProvider(PLATFORM, sdkFactory);
  }
}
