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

import invariant from 'assert';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {runCommand, observeProcessRaw} from '../../commons-node/process';
import {AdbSdbBase} from './AdbSdbBase';
import {Observable} from 'rxjs';
import {arrayCompact} from 'nuclide-commons/collection';

import type {AndroidJavaProcess, Process} from './types';
import type {LegacyProcessMessage} from '../../commons-node/process-rpc-types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

export class Adb extends AdbSdbBase {
  getAndroidProp(device: string, key: string): Observable<string> {
    return this.runShortCommand(device, ['shell', 'getprop', key]).map(s =>
      s.trim(),
    );
  }

  getDeviceArchitecture(device: string): Promise<string> {
    return this.getAndroidProp(device, 'ro.product.cpu.abi').toPromise();
  }

  async getInstalledPackages(device: string): Promise<Array<string>> {
    const prefix = 'package:';
    const stdout = await this.runShortCommand(device, [
      'shell',
      'pm',
      'list',
      'packages',
    ]).toPromise();
    return stdout.trim().split(/\s+/).map(s => s.substring(prefix.length));
  }

  async isPackageInstalled(device: string, pkg: string): Promise<boolean> {
    const packages = await this.getInstalledPackages(device);
    return packages.includes(pkg);
  }

  getDeviceModel(device: string): Promise<string> {
    return this.getAndroidProp(device, 'ro.product.model')
      .map(s => (s === 'sdk' ? 'emulator' : s))
      .toPromise();
  }

  getAPIVersion(device: string): Promise<string> {
    return this.getAndroidProp(device, 'ro.build.version.sdk').toPromise();
  }

  getBrand(device: string): Promise<string> {
    return this.getAndroidProp(device, 'ro.product.brand').toPromise();
  }

  getManufacturer(device: string): Promise<string> {
    return this.getAndroidProp(device, 'ro.product.manufacturer').toPromise();
  }

  async getDeviceInfo(device: string): Promise<Map<string, string>> {
    const infoTable = await this.getCommonDeviceInfo(device);
    const unknownCB = () => null;
    infoTable.set(
      'android_version',
      // $FlowFixMe will resolve to null if an error is caught
      await this.getOSVersion(device).catch(unknownCB),
    );
    infoTable.set(
      'manufacturer',
      // $FlowFixMe will resolve to null if an error is caught
      await this.getManufacturer(device).catch(unknownCB),
    );
    // $FlowFixMe will resolve to null if an error is caught
    infoTable.set('brand', await this.getBrand(device).catch(unknownCB));
    return infoTable;
  }

  async getProcesses(device: string): Promise<Array<Process>> {
    const processes = (await this.runShortCommand(device, [
      'shell',
      'ps',
    ]).toPromise()).split(/\n/);
    if (processes.length === 0) {
      return [];
    }

    const procTimePrev = await this.getProcessTime(device);
    const cpuTimePrev = await this.getCPUTime(device);
    await new Promise(resolve => setTimeout(resolve, 500));
    const procTime = await this.getProcessTime(device);
    const cpuTime = await this.getCPUTime(device);

    // pid => cpuUsage, memory usage
    // Reference for calculations: https://github.com/scaidermern/top-processes
    const cpuAndMemUsage = new Map();
    const deltaCpu = cpuTime - cpuTimePrev;
    procTime.forEach((p1, pid) => {
      if (!procTimePrev.has(pid)) {
        return;
      }
      const p0 = procTimePrev.get(pid);
      let deltaProc;
      if (p0 !== null && p0 !== undefined) {
        deltaProc = (p1[0] - p0[0]) * 1.0;
      } else {
        return;
      }
      const memUsage = p1[1];
      cpuAndMemUsage.set(pid, [deltaProc / deltaCpu * 100, memUsage]);
    });
    return arrayCompact(
      processes.map(x => {
        const info = x.trim().split(/\s+/);
        if (!Number.isInteger(parseInt(info[1], 10))) {
          return null;
        }
        const cpuAndMem = cpuAndMemUsage.get(info[1]);
        let cpu = '';
        let mem = '';
        if (cpuAndMem !== null && cpuAndMem !== undefined) {
          cpu = cpuAndMem[0].toFixed(2) + '%';
          mem = (cpuAndMem[1] / 1024).toFixed(2) + 'M';
        }
        return {
          user: info[0],
          pid: info[1],
          name: info[info.length - 1],
          cpuUsage: cpu,
          memUsage: mem,
        };
      }),
    );
  }

  async getProcessTime(device: string): Promise<Map<string, [number, number]>> {
    const validProcess = new RegExp(/\d+\s()/);
    const procTime = (await this.runShortCommand(device, [
      'shell',
      'cat',
      '/proc/[0-9]*/stat',
    ]).toPromise())
      .split(/\n/)
      .filter(x => validProcess.test(x));
    // pid => utime + stime
    const procTimeMap = new Map(
      procTime.map(x => {
        const info = x.trim().split(/\s/);
        return [
          info[0],
          [
            Number.parseInt(info[12], 10) + Number.parseInt(info[13], 10), // stime + utime
            Number.parseInt(info[23], 10), // RSS
          ],
        ];
      }),
    );
    return procTimeMap;
  }

  async getCPUTime(device: string): Promise<number> {
    let cpuTime = (await this.runShortCommand(device, [
      'shell',
      'cat',
      '/proc/stat',
    ]).toPromise()).split(/\n/);
    cpuTime = cpuTime[0]
      .trim()
      .split(/\s+/)
      .slice(1, -2)
      .reduce((acc, current) => {
        const val = Number.parseInt(current, 10);
        return acc + val;
      }, 0);
    return cpuTime;
  }

  async forceStopPackage(device: string, packageName: string): Promise<void> {
    await this.runShortCommand(device, [
      'shell',
      'am',
      'force-stop',
      packageName,
    ]).toPromise();
  }

  getOSVersion(device: string): Promise<string> {
    return this.getAndroidProp(device, 'ro.build.version.release').toPromise();
  }

  installPackage(
    device: string,
    packagePath: NuclideUri,
  ): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    invariant(!nuclideUri.isRemote(packagePath));
    return this.runLongCommand(device, ['install', '-r', packagePath]);
  }

  uninstallPackage(
    device: string,
    packageName: string,
  ): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this.runLongCommand(device, ['uninstall', packageName]);
  }

  forwardJdwpPortToPid(
    device: string,
    tcpPort: number,
    pid: number,
  ): Promise<string> {
    return this.runShortCommand(device, [
      'forward',
      `tcp:${tcpPort}`,
      `jdwp:${pid}`,
    ]).toPromise();
  }

  launchActivity(
    device: string,
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
    return this.runShortCommand(device, args).toPromise();
  }

  activityExists(
    device: string,
    packageName: string,
    activity: string,
  ): Promise<boolean> {
    const packageActivityString = `${packageName}/${activity}`;
    const deviceArg = device !== '' ? ['-s', device] : [];
    const command = deviceArg.concat(['shell', 'dumpsys', 'package']);
    return runCommand(this._dbPath, command)
      .map(stdout => stdout.includes(packageActivityString))
      .toPromise();
  }

  async getJavaProcesses(device: string): Promise<Array<AndroidJavaProcess>> {
    const allProcesses = await this.runShortCommand(device, ['shell', 'ps'])
      .map(stdout => {
        const psOutput = stdout.trim();
        return parsePsTableOutput(psOutput, ['user', 'pid', 'name']);
      })
      .toPromise();

    const args = (device !== '' ? ['-s', device] : []).concat('jdwp');
    return observeProcessRaw(this._dbPath, args, {
      killTreeWhenDone: true,
      /* TDOO(17353599) */ isExitError: () => false,
    })
      .catch(error => Observable.of({kind: 'error', error})) // TODO(T17463635)
      .take(1)
      .map(output => {
        const jdwpPids = new Set();
        if (output.kind === 'stdout') {
          const block: string = output.data;
          block.split(/\s+/).forEach(pid => {
            jdwpPids.add(pid.trim());
          });
        }

        return allProcesses.filter(row => jdwpPids.has(row.pid));
      })
      .toPromise();
  }

  async dumpsysPackage(device: string, pkg: string): Promise<?string> {
    if (!await this.isPackageInstalled(device, pkg)) {
      return null;
    }
    return this.runShortCommand(device, [
      'shell',
      'dumpsys',
      'package',
      pkg,
    ]).toPromise();
  }
}

export function parsePsTableOutput(
  output: string,
  desiredFields: Array<string>,
): Array<Object> {
  const lines = output.split(/\n/);
  const header = lines[0];
  const cols = header.split(/\s+/);
  const colMapping = {};

  for (let i = 0; i < cols.length; i++) {
    const columnName = cols[i].toLowerCase();
    if (desiredFields.includes(columnName)) {
      colMapping[i] = columnName;
    }
  }

  const formattedData = [];
  const data = lines.slice(1);
  data.filter(row => row.trim() !== '').forEach(row => {
    const rowData = row.split(/\s+/);
    const rowObj = {};
    for (let i = 0; i < rowData.length; i++) {
      // Android's ps output has an extra column "S" in the data that doesn't appear
      // in the header. Skip that column's value.
      const effectiveColumn = i;
      if (rowData[i] === 'S' && i < rowData.length - 1) {
        i++;
      }

      if (colMapping[effectiveColumn] !== undefined) {
        rowObj[colMapping[effectiveColumn]] = rowData[i];
      }
    }

    formattedData.push(rowObj);
  });

  return formattedData;
}
