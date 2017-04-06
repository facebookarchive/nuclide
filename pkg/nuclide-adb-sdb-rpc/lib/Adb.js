/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import invariant from 'assert';
import nuclideUri from '../../commons-node/nuclideUri';
import {
  safeSpawn,
  runCommand,
  observeProcessRaw,
} from '../../commons-node/process';
import {DebugBridge} from './DebugBridge';

import type {Observable} from 'rxjs';
import type {AndroidJavaProcess} from './DebugBridgeService';
import type {ProcessMessage} from '../../commons-node/process-rpc-types';
import type {NuclideUri} from '../../commons-node/nuclideUri';

export class Adb extends DebugBridge {
  getAndroidProp(device: string, key: string): Observable<string> {
    return this.runShortAdbCommand(device, ['shell', 'getprop', key]).map(s => s.trim());
  }

  getDeviceArchitecture(device: string): Promise<string> {
    return this.getAndroidProp(device, 'ro.product.cpu.abi').toPromise();
  }

  getDeviceModel(device: string): Promise<string> {
    return this.getAndroidProp(device, 'ro.product.model')
      .map(s => (s === 'sdk' ? 'emulator' : s))
      .toPromise();
  }

  getAPIVersion(device: string): Promise<string> {
    return this.getAndroidProp(device, 'ro.build.version.sdk').toPromise();
  }

  installPackage(device: string, packagePath: NuclideUri): Observable<ProcessMessage> {
    invariant(!nuclideUri.isRemote(packagePath));
    return this.runLongAdbCommand(device, ['install', '-r', packagePath]);
  }

  forwardJdwpPortToPid(device: string, tcpPort: number, pid: number): Promise<string> {
    return this.runShortAdbCommand(
      device,
      ['forward', `tcp:${tcpPort}`, `jdwp:${pid}`],
    ).toPromise();
  }

  launchActivity(
    device: string,
    packageName: string,
    activity: string,
    action: string,
  ): Promise<string> {
    return this.runShortAdbCommand(
      device,
      ['shell', 'am', 'start', '-D', '-N', '-W', '-a', action, '-n', `${packageName}/${activity}`],
    ).toPromise();
  }

  activityExists(
    device: string,
    packageName: string,
    activity: string,
  ): Promise<boolean> {
    const packageActivityString = `${packageName}/${activity}`;
    const deviceArg = (device !== '') ? ['-s', device] : [];
    const command = deviceArg.concat(['shell', 'dumpsys', 'package']);
    return runCommand(this._adbPath, command)
      .map(stdout => stdout.includes(packageActivityString))
      .toPromise();
  }

  async getJavaProcesses(device: string): Promise<Array<AndroidJavaProcess>> {
    const allProcesses = await this.runShortAdbCommand(device, ['shell', 'ps'])
      .map(stdout => {
        const psOutput = stdout.trim();
        return parsePsTableOutput(psOutput, ['user', 'pid', 'name']);
      })
      .toPromise();

    const args = ((device !== '') ? ['-s', device] : []).concat('jdwp');
    return observeProcessRaw(() => safeSpawn(this._adbPath, args), true)
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
}

export function parsePsTableOutput(output: string, desiredFields: Array<string>): Array<Object> {
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
  data
    .filter(row => row.trim() !== '')
    .forEach(row => {
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
