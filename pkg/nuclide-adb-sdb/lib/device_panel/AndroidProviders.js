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

import {getAdbServiceByNuclideUri} from '../../../nuclide-remote-connection';
import {ATDeviceListProvider} from './ATDeviceListProvider';
import {ATDeviceInfoProvider} from './ATDeviceInfoProvider';
import {ATDeviceProcessesProvider} from './ATDeviceProcessesProvider';
import {ATDeviceStopPackageProvider} from './ATDeviceStopPackageProvider';
import {ATConfigurePathTaskProvider} from './ATConfigurePathTaskProvider';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

export class AndroidProviders {
  static createAndroidDeviceListProvider(): ATDeviceListProvider {
    return new ATDeviceListProvider('android', (host: NuclideUri) =>
      getAdbServiceByNuclideUri(host),
    );
  }

  static createAndroidInfoProvider(): ATDeviceInfoProvider {
    return new ATDeviceInfoProvider('android', (host: NuclideUri) =>
      getAdbServiceByNuclideUri(host),
    );
  }

  static createAndroidProcessesProvider(): ATDeviceProcessesProvider {
    return new ATDeviceProcessesProvider('android', (host: NuclideUri) =>
      getAdbServiceByNuclideUri(host),
    );
  }

  static createAndroidStopPackageProvider(): ATDeviceStopPackageProvider {
    return new ATDeviceStopPackageProvider('android', (host: NuclideUri) =>
      getAdbServiceByNuclideUri(host),
    );
  }

  static createAndroidConfigurePathTaskProvider(): ATConfigurePathTaskProvider {
    return new ATConfigurePathTaskProvider('android', (host: NuclideUri) =>
      getAdbServiceByNuclideUri(host),
    );
  }
}
