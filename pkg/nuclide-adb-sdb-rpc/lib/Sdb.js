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

import type {LegacyProcessMessage} from 'nuclide-commons/process';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {DeviceDescription} from './types';

import os from 'os';
import invariant from 'assert';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Observable} from 'rxjs';
import {DebugBridge} from './DebugBridge';
import {createConfigObs} from './AdbSdbPathStore';

export class Sdb {
  _bridge: DebugBridge = new DebugBridge(createConfigObs('sdb'));

  getDeviceList(): Observable<Array<DeviceDescription>> {
    return this._bridge.getDevices().switchMap(devices => {
      return Observable.concat(
        ...devices.map(name => {
          return Observable.forkJoin(
            this.getDeviceArchitecture(name).catch(() => Observable.of('')),
            this.getAPIVersion(name).catch(() => Observable.of('')),
            this.getDeviceModel(name).catch(() => Observable.of('')),
          ).map(([architecture, apiVersion, model]) => ({
            name,
            architecture,
            apiVersion,
            model,
          }));
        }),
      ).toArray();
    });
  }

  async getFileContentsAtPath(device: string, path: string): Promise<string> {
    return this._bridge
      .runShortCommand(device, ['shell', 'cat', path])
      .toPromise();
  }

  getDeviceInfo(device: string): Observable<Map<string, string>> {
    const unknownCB = () => Observable.of('');
    return Observable.forkJoin(
      this.getDeviceArchitecture(device).catch(unknownCB),
      this.getAPIVersion(device).catch(unknownCB),
      this.getDeviceModel(device).catch(unknownCB),
    ).map(([architecture, apiVersion, model]) => {
      return new Map([
        ['name', device],
        ['architecture', architecture],
        ['api_version', apiVersion],
        ['model', model],
      ]);
    });
  }

  getTizenModelConfigKey(device: string, key: string): Observable<string> {
    const modelConfigPath = '/etc/config/model-config.xml';

    return this._bridge
      .runShortCommand(device, ['shell', 'cat', modelConfigPath])
      .map(stdout => stdout.split(/\n+/g).filter(s => s.indexOf(key) !== -1)[0])
      .map(s => {
        const regex = /.*<.*>(.*)<.*>/g;
        return regex.exec(s)[1];
      });
  }

  getDeviceArchitecture(device: string): Observable<string> {
    return this._bridge
      .runShortCommand(device, ['shell', 'uname', '-m'])
      .map(s => s.trim());
  }

  getDeviceModel(device: string): Observable<string> {
    return this.getTizenModelConfigKey(device, 'tizen.org/system/model_name');
  }

  getAPIVersion(device: string): Observable<string> {
    return this.getTizenModelConfigKey(
      device,
      'tizen.org/feature/platform.core.api.version',
    ).catch(() =>
      this.getTizenModelConfigKey(
        device,
        'tizen.org/feature/platform.native.api.version',
      ),
    );
  }

  installPackage(
    device: string,
    packagePath: NuclideUri,
  ): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    invariant(!nuclideUri.isRemote(packagePath));
    return this._bridge.runLongCommand(device, ['install', packagePath]);
  }

  launchApp(device: string, identifier: string): Promise<string> {
    return this._bridge
      .runShortCommand(device, ['shell', 'launch_app', identifier])
      .toPromise();
  }

  uninstallPackage(
    device: string,
    packageName: string,
  ): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this._bridge.runLongCommand(device, ['uninstall', packageName]);
  }

  async getPidFromPackageName(
    device: string,
    packageName: string,
  ): Promise<number> {
    const pidLine = (await this._bridge
      .runShortCommand(device, ['shell', 'ps', '|', 'grep', '-i', packageName])
      .toPromise()).split(os.EOL)[0];
    if (pidLine == null) {
      throw new Error(
        `Can not find a running process with package name: ${packageName}`,
      );
    }
    // First column is 'USER', second is 'PID'.
    return parseInt(pidLine.trim().split(/\s+/)[1], /* radix */ 10);
  }
}
