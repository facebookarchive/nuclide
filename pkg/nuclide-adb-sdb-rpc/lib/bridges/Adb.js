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

import type {AndroidJavaProcess, SimpleProcess} from '../types';
import type {LegacyProcessMessage} from 'nuclide-commons/process';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import invariant from 'assert';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Observable} from 'rxjs';
import {DebugBridge} from '../common/DebugBridge';
import {createConfigObs} from '../common/Store';
import {parsePsTableOutput} from '../common/ps';

export class Adb {
  static bridge = new DebugBridge(createConfigObs('adb'));

  _device: string;

  constructor(device: string) {
    this._device = device;
  }

  runShortCommand(...command: string[]): Observable<string> {
    return Adb.bridge.runShortCommand(this._device, command);
  }

  runLongCommand(...command: string[]): Observable<LegacyProcessMessage> {
    return Adb.bridge.runLongCommand(this._device, command);
  }

  getAndroidProp(key: string): Observable<string> {
    return this.runShortCommand('shell', 'getprop', key).map(s => s.trim());
  }

  getDeviceArchitecture(): Observable<string> {
    return this.getAndroidProp('ro.product.cpu.abi');
  }

  async getInstalledPackages(): Promise<Array<string>> {
    const prefix = 'package:';
    const stdout = await this.runShortCommand(
      'shell',
      'pm',
      'list',
      'packages',
    ).toPromise();
    return stdout.trim().split(/\s+/).map(s => s.substring(prefix.length));
  }

  async isPackageInstalled(pkg: string): Promise<boolean> {
    const packages = await this.getInstalledPackages();
    return packages.includes(pkg);
  }

  getDeviceModel(): Observable<string> {
    return this.getAndroidProp('ro.product.model').map(
      s => (s === 'sdk' ? 'emulator' : s),
    );
  }

  getAPIVersion(): Observable<string> {
    return this.getAndroidProp('ro.build.version.sdk');
  }

  getBrand(): Observable<string> {
    return this.getAndroidProp('ro.product.brand');
  }

  getManufacturer(): Observable<string> {
    return this.getAndroidProp('ro.product.manufacturer');
  }

  getDeviceInfo(): Observable<Map<string, string>> {
    const unknownCB = () => Observable.of('');
    return Observable.forkJoin(
      this.getDeviceArchitecture().catch(unknownCB),
      this.getAPIVersion().catch(unknownCB),
      this.getDeviceModel().catch(unknownCB),
      this.getOSVersion().catch(unknownCB),
      this.getManufacturer().catch(unknownCB),
      this.getBrand().catch(unknownCB),
      this.getWifiIp().catch(unknownCB),
    ).map(
      (
        [
          architecture,
          apiVersion,
          model,
          android_version,
          manufacturer,
          brand,
          wifi_ip,
        ],
      ) => {
        return new Map([
          ['name', this._device],
          ['architecture', architecture],
          ['api_version', apiVersion],
          ['model', model],
          ['android_version', android_version],
          ['manufacturer', manufacturer],
          ['brand', brand],
          ['wifi_ip', wifi_ip],
        ]);
      },
    );
  }

  getWifiIp(): Observable<string> {
    return this.runShortCommand(
      'shell',
      'ip',
      'addr',
      'show',
      'wlan0',
    ).map(lines => {
      const line = lines.split(/\n/).filter(l => l.includes('inet'))[0];
      if (line == null) {
        return '';
      }
      const rawIp = line.trim().split(/\s+/)[1];
      return rawIp.substring(0, rawIp.indexOf('/'));
    });
  }

  // Can't use kill, the only option is to use the package name
  // http://stackoverflow.com/questions/17154961/adb-shell-operation-not-permitted
  async stopPackage(packageName: string): Promise<void> {
    await this.runShortCommand(
      'shell',
      'am',
      'force-stop',
      packageName,
    ).toPromise();
  }

  getOSVersion(): Observable<string> {
    return this.getAndroidProp('ro.build.version.release');
  }

  installPackage(packagePath: NuclideUri): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    invariant(!nuclideUri.isRemote(packagePath));
    return this.runLongCommand('install', '-r', packagePath);
  }

  uninstallPackage(packageName: string): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this.runLongCommand('uninstall', packageName);
  }

  forwardJdwpPortToPid(tcpPort: number, pid: number): Promise<string> {
    return this.runShortCommand(
      'forward',
      `tcp:${tcpPort}`,
      `jdwp:${pid}`,
    ).toPromise();
  }

  launchActivity(
    packageName: string,
    activity: string,
    debug: boolean,
    action: ?string,
  ): Promise<string> {
    const args = ['shell', 'am', 'start', '-W', '-n'];
    if (action != null) {
      args.push('-a', action);
    }
    if (debug) {
      args.push('-N', '-D');
    }
    args.push(`${packageName}/${activity}`);
    return this.runShortCommand(...args).toPromise();
  }

  activityExists(packageName: string, activity: string): Promise<boolean> {
    const packageActivityString = `${packageName}/${activity}`;
    return this.runShortCommand('shell', 'dumpsys', 'package')
      .map(stdout => stdout.includes(packageActivityString))
      .toPromise();
  }

  touchFile(path: string): Promise<string> {
    return this.runShortCommand('shell', 'touch', path).toPromise();
  }

  removeFile(path: string): Promise<string> {
    return this.runShortCommand('shell', 'rm', path).toPromise();
  }

  getDebuggableProcesses(): Observable<Array<SimpleProcess>> {
    return this.getJavaProcesses();
  }

  getJavaProcesses(): Observable<Array<AndroidJavaProcess>> {
    return this.runShortCommand('shell', 'ps')
      .map(stdout => {
        const psOutput = stdout.trim();
        return parsePsTableOutput(psOutput, ['user', 'pid', 'name']);
      })
      .switchMap(allProcesses => {
        return this.runLongCommand('jdwp')
          .catch(error => Observable.of({kind: 'error', error})) // TODO(T17463635)
          .take(1)
          .timeout(1000)
          .map(output => {
            const jdwpPids = new Set();
            if (output.kind === 'stdout') {
              const block: string = output.data;
              block.split(/\s+/).forEach(pid => {
                jdwpPids.add(pid.trim());
              });
            }
            return allProcesses.filter(row => jdwpPids.has(row.pid));
          });
      });
  }

  async dumpsysPackage(pkg: string): Promise<?string> {
    if (!await this.isPackageInstalled(pkg)) {
      return null;
    }
    return this.runShortCommand('shell', 'dumpsys', 'package', pkg).toPromise();
  }
}
