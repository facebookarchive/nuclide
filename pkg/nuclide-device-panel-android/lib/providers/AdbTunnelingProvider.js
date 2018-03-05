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
import type {
  SshTunnelService,
  Tunnel,
} from '../../../nuclide-ssh-tunnel/lib/types';

import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable, BehaviorSubject} from 'rxjs';
import consumeFirstProvider from '../../../commons-atom/consumeFirstProvider';
import {getAdbServiceByNuclideUri} from '../../../nuclide-remote-connection';
import {AdbTunnelButton} from '../ui/AdbTunnelButton';
import * as React from 'react';

export class AdbTunnelingProvider implements DeviceTypeComponentProvider {
  activeTunnels: BehaviorSubject<?{
    host: NuclideUri,
    disposable: UniversalDisposable,
  }> = new BehaviorSubject(null);

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
          this.activeTunnels.map(value => ({
            host,
            status:
              value == null || value.host !== host ? 'inactive' : 'active',
            enable: () => this.openTunnels(host),
            disable: () => this.closeTunnels(),
          })),
          AdbTunnelButton,
        );
        return <BoundButton />;
      },
      key: 'adb tunneling',
    });
    return disposable;
  };

  openTunnels = (host: NuclideUri) => {
    this.closeTunnels();
    const adbService = getAdbServiceByNuclideUri(host);
    Observable.fromPromise(adbService.killServer())
      .switchMap(async () => {
        const tunnelService: ?SshTunnelService = await consumeFirstProvider(
          'nuclide.ssh-tunnel',
        );
        if (tunnelService == null) {
          throw new Error(
            'No package to open a tunnel to the remote host available.',
          );
        }
        const tunnels = [
          {
            description: 'adb',
            from: {host: nuclideUri.getHostname(host), port: 5037, family: 4},
            to: {host: 'localhost', port: 5037, family: 4},
          },
          {
            description: 'emulator console',
            from: {host: nuclideUri.getHostname(host), port: 5554, family: 4},
            to: {host: 'localhost', port: 5554, family: 4},
          },
          {
            description: 'emulator adb',
            from: {host: nuclideUri.getHostname(host), port: 5555, family: 4},
            to: {host: 'localhost', port: 5555, family: 4},
          },
          {
            description: 'exopackage',
            from: {host: nuclideUri.getHostname(host), port: 2829, family: 4},
            to: {host: 'localhost', port: 2829, family: 4},
          },
        ];
        return Promise.all(
          tunnels.map(t => _requestTunnelFromService(t, tunnelService)),
        );
      })
      .subscribe(result => {
        const disposable = new UniversalDisposable();
        result.forEach(d => disposable.add(d));
        this.activeTunnels.next({host, disposable});
      });
  };

  closeTunnels = () => {
    const active = this.activeTunnels.getValue();
    if (active != null) {
      active.disposable.dispose();
      this.activeTunnels.next(null);
    }
  };
}

async function _requestTunnelFromService(
  tunnel: Tunnel,
  service: SshTunnelService,
): Promise<IDisposable> {
  return new Promise((resolve, reject) => {
    const disposable = service.openTunnel(
      tunnel,
      error => {
        if (error == null) {
          resolve(disposable);
        } else {
          reject(error);
        }
      },
      () => {},
    );
  });
}
