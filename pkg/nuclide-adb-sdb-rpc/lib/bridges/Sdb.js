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

import type {SimpleProcess} from 'nuclide-adb/lib/types';
import type {LegacyProcessMessage} from 'nuclide-commons/process';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import invariant from 'assert';
import {DebugBridge} from 'nuclide-adb/lib/common/DebugBridge';
import {createConfigObs} from 'nuclide-adb/lib/common/Store';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Observable} from 'rxjs';

export class Sdb extends DebugBridge {
  static configObs = createConfigObs('sdb');

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
        ['name', this._device.name],
        ['sdb_port', String(this._device.port)],
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

  async stopProcess(packageName: string, pid: number): Promise<void> {
    await this.runShortCommand('shell', 'kill', '-9', `${pid}`).toPromise();
  }

  getDeviceArchitecture(): Observable<string> {
    return this.runShortCommand('shell', 'uname', '-m').map(s => s.trim());
  }

  getDeviceModel(): Observable<string> {
    return this.getTizenModelConfigKey('tizen.org/system/model_name');
  }

  getDebuggableProcesses(): Observable<Array<SimpleProcess>> {
    return Observable.of([]);
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

  getDeviceArgs(): Array<string> {
    return this._device.name !== '' ? ['-s', this._device.name] : [];
  }

  getProcesses(): Observable<Array<SimpleProcess>> {
    return this.runShortCommand(
      'shell',
      'for file in /proc/[0-9]*/stat; do cat "$file" 2>/dev/null || true; done',
    ).map(stdout =>
      stdout.split(/\n/).map(line => {
        const info = line.trim().split(/\s+/);
        return {user: 'n/a', pid: info[0], name: info[1]};
      }),
    );
  }
}
