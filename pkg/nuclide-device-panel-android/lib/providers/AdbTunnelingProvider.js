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
import type {
  DeviceTypeComponentProvider,
  DeviceTypeComponent,
} from '../../../nuclide-device-panel/lib/types';

import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {
  isAdbTunneled,
  startTunnelingAdb,
  stopTunnelingAdb,
} from '../../../nuclide-adb-sdb-base/lib/Tunneling';
import {AdbTunnelButton} from '../ui/AdbTunnelButton';
import * as React from 'react';

export class AdbTunnelingProvider implements DeviceTypeComponentProvider {
  getType = (): string => {
    return 'Android';
  };

  observe = (
    host: NuclideUri,
    callback: (?DeviceTypeComponent) => void,
  ): IDisposable => {
    const disposable = new UniversalDisposable();
    if (!nuclideUri.isRemote(host)) {
      callback(null);
      return disposable;
    }
    callback({
      position: 'host_selector',
      type: () => {
        const BoundButton = bindObservableAsProps(
          isAdbTunneled(host).map(value => ({
            host,
            status: value ? 'active' : 'inactive',
            enable: () => {
              let noMoreNotifications = false;
              startTunnelingAdb(host)
                .do(() => (noMoreNotifications = true))
                .subscribe({
                  error: e => {
                    if (!noMoreNotifications) {
                      atom.notifications.addError(e);
                    }
                  },
                });
            },
            disable: () => stopTunnelingAdb(host),
          })),
          AdbTunnelButton,
        );
        return <BoundButton />;
      },
      key: 'adb tunneling',
    });
    return disposable;
  };
}
