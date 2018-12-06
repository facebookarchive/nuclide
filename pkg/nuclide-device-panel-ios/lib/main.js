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

import type {DevicePanelServiceApi} from 'nuclide-debugger-common/types';

import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {observeIosDevices} from '../../nuclide-fbsimctl';

class Activation {
  _disposables = new UniversalDisposable();
  _type = 'iOS';

  consumeDevicePanelServiceApi(api: DevicePanelServiceApi): void {
    this._disposables.add(this.registerDeviceList(api));
  }

  registerDeviceList(api: DevicePanelServiceApi): IDisposable {
    return api.registerListProvider({
      observe: host => {
        return observeIosDevices('').map(expected =>
          expected.map(devices =>
            devices.map(device => ({
              identifier: device.udid,
              displayName: device.name,
              ignoresSelection: true,
            })),
          ),
        );
      },
      getType: () => this._type,
    });
  }
}

createPackage(module.exports, Activation);
