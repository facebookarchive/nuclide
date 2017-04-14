/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {arrayCompact} from '../../commons-node/collection';
import {
  observeProcess,
  runCommand,
} from '../../commons-node/process';
import os from 'os';

import type {Observable} from 'rxjs';
import type {DeviceDescription, DebugBridgeType} from './types';
import type {ProcessMessage} from '../../commons-node/process-rpc-types';
import type {NuclideUri} from '../../commons-node/nuclideUri';

export async function pathForDebugBridge(db: DebugBridgeType): Promise<string> {
  return db;
}

export class DebugBridge {
  _adbPath: string;

  constructor(adbPath: string) {
    this._adbPath = adbPath;
  }

  runShortAdbCommand(device: string, command: Array<string>): Observable<string> {
    const deviceArg = (device !== '') ? ['-s', device] : [];
    return runCommand(this._adbPath, deviceArg.concat(command));
  }

  runLongAdbCommand(device: string, command: string[]): Observable<ProcessMessage> {
    const deviceArg = (device !== '') ? ['-s', device] : [];
    return observeProcess(
      this._adbPath,
      deviceArg.concat(command),
      {killTreeOnComplete: true, /* TODO(T17353599) */ isExitError: () => false},
    );
  }

  async getDeviceList(): Promise<Array<DeviceDescription>> {
    const devices = await runCommand(this._adbPath, ['devices'])
      .map(stdout => stdout.split(/\n+/g)
      .slice(1)
      .filter(s => (s.length > 0 && !s.trim().startsWith('*')))
      .map(s => s.split(/\s+/g))
      .filter(a => a[0] !== '')
      .map(a => a[0]))
      .toPromise();

    const deviceTable = await Promise.all(devices.map(async name => {
      try {
        const architecture = await this.getDeviceArchitecture(name);
        const apiVersion = await this.getAPIVersion(name);
        const model = await this.getDeviceModel(name);
        return {name, architecture, apiVersion, model};
      } catch (error) {
        return null;
      }
    }));

    return arrayCompact(deviceTable);
  }

  getDeviceArchitecture(device: string): Promise<string> {
    throw new Error('not implemented');
  }

  getDeviceModel(device: string): Promise<string> {
    throw new Error('not implemented');
  }

  getAPIVersion(device: string): Promise<string> {
    throw new Error('not implemented');
  }

  installPackage(device: string, packagePath: NuclideUri): Observable<ProcessMessage> {
    throw new Error('not implemented');
  }

  uninstallPackage(device: string, packageName: string): Observable<ProcessMessage> {
    throw new Error('not implemented');
  }

  async getPidFromPackageName(device: string, packageName: string): Promise<number> {
    const pidLine = (await this.runShortAdbCommand(
      device,
      ['shell', 'ps', '|', 'grep', '-i', packageName],
    ).toPromise()).split(os.EOL)[0];
    if (pidLine == null) {
      throw new Error(`Can not find a running process with package name: ${packageName}`);
    }
    // First column is 'USER', second is 'PID'.
    return parseInt(pidLine.trim().split(/\s+/)[1], /* radix */10);
  }
}
