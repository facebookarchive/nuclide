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

const bridge = new DebugBridge(createConfigObs('sdb'));

export class Sdb {
  _device: string;

  constructor(device: string) {
    this._device = device;
  }

  runShortCommand(...command: string[]): Observable<string> {
    return bridge.runShortCommand(this._device, command);
  }

  runLongCommand(...command: string[]): Observable<LegacyProcessMessage> {
    return bridge.runLongCommand(this._device, command);
  }

  static getDeviceList(): Observable<Array<DeviceDescription>> {
    return bridge.getDevices().switchMap(devices => {
      return Observable.concat(
        ...devices.map(name => {
          const sdb = new Sdb(name);
          return Observable.forkJoin(
            sdb.getDeviceArchitecture().catch(() => Observable.of('')),
            sdb.getAPIVersion().catch(() => Observable.of('')),
            sdb.getDeviceModel().catch(() => Observable.of('')),
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

  async getFileContentsAtPath(path: string): Promise<string> {
    return this.runShortCommand('shell', 'cat', path).toPromise();
  }

  getDeviceInfo(): Observable<Map<string, string>> {
    const unknownCB = () => Observable.of('');
    return Observable.forkJoin(
      this.getDeviceArchitecture().catch(unknownCB),
      this.getAPIVersion().catch(unknownCB),
      this.getDeviceModel().catch(unknownCB),
    ).map(([architecture, apiVersion, model]) => {
      return new Map([
        ['name', this._device],
        ['architecture', architecture],
        ['api_version', apiVersion],
        ['model', model],
      ]);
    });
  }

  getTizenModelConfigKey(key: string): Observable<string> {
    const modelConfigPath = '/etc/config/model-config.xml';

    return this.runShortCommand('shell', 'cat', modelConfigPath)
      .map(stdout => stdout.split(/\n+/g).filter(s => s.indexOf(key) !== -1)[0])
      .map(s => {
        const regex = /.*<.*>(.*)<.*>/g;
        return regex.exec(s)[1];
      });
  }

  getDeviceArchitecture(): Observable<string> {
    return this.runShortCommand('shell', 'uname', '-m').map(s => s.trim());
  }

  getDeviceModel(): Observable<string> {
    return this.getTizenModelConfigKey('tizen.org/system/model_name');
  }

  getAPIVersion(): Observable<string> {
    return this.getTizenModelConfigKey(
      'tizen.org/feature/platform.core.api.version',
    ).catch(() =>
      this.getTizenModelConfigKey(
        'tizen.org/feature/platform.native.api.version',
      ),
    );
  }

  installPackage(packagePath: NuclideUri): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    invariant(!nuclideUri.isRemote(packagePath));
    return this.runLongCommand('install', packagePath);
  }

  launchApp(identifier: string): Promise<string> {
    return this.runShortCommand('shell', 'launch_app', identifier).toPromise();
  }

  uninstallPackage(packageName: string): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this.runLongCommand('uninstall', packageName);
  }

  async getPidFromPackageName(packageName: string): Promise<number> {
    const pidLine = (await this.runShortCommand(
      'shell',
      'ps',
      '|',
      'grep',
      '-i',
      packageName,
    ).toPromise()).split(os.EOL)[0];
    if (pidLine == null) {
      throw new Error(
        `Can not find a running process with package name: ${packageName}`,
      );
    }
    // First column is 'USER', second is 'PID'.
    return parseInt(pidLine.trim().split(/\s+/)[1], /* radix */ 10);
  }
}
