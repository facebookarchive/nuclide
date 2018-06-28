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
import {Observable} from 'rxjs';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Expect} from 'nuclide-commons/expected';
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
        if (nuclideUri.isRemote(host)) {
          return Observable.of(
            Expect.error(
              new Error(
                'iOS devices on remote hosts are not currently supported.',
              ),
            ),
          );
        } else {
          return observeIosDevices().map(expected =>
            expected.map(devices =>
              devices.map(device => ({
                name: device.udid,
                displayName: device.name,
                ignoresSelection: true,
              })),
            ),
          );
        }
      },
      getType: () => this._type,
    });
  }
}

createPackage(module.exports, Activation);
