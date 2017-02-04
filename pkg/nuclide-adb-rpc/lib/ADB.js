/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Observable, ConnectableObservable} from 'rxjs';
import type {DeviceDescription} from './AdbService';
import type {ProcessMessage} from '../../commons-node/process-rpc-types';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import invariant from 'assert';
import nuclideUri from '../../commons-node/nuclideUri';
import {arrayCompact} from '../../commons-node/collection';
import {safeSpawn, observeProcess, runCommand} from '../../commons-node/process';

import * as os from 'os';

function runShortAdbCommand(
  adbPath: NuclideUri,
  device: string,
  command: Array<string>,
): Observable<string> {
  const deviceArg = (device !== '') ? ['-s', device] : [];
  return runCommand(adbPath, deviceArg.concat(command));
}

function runLongAdbCommand(
  adbPath: NuclideUri,
  device: string,
  command: string[],
): Observable<ProcessMessage> {
  const deviceArg = (device !== '') ? ['-s', device] : [];
  return observeProcess(() => safeSpawn(adbPath, deviceArg.concat(command)), true);
}

function getAndroidProp(
  adbPath: NuclideUri,
  device: string,
  key: string,
): Observable<string> {
  return runShortAdbCommand(adbPath, device, ['shell', 'getprop', key])
    .map(s => s.trim());
}

function getTizenModelConfigKey(
  adbPath: NuclideUri,
  device: string,
  key: string,
): Promise<string> {
  const modelConfigPath = '/etc/config/model-config.xml';

  return runShortAdbCommand(adbPath, device, ['shell', 'cat', modelConfigPath])
    .map(stdout => stdout.split(/\n+/g)
                     .filter(s => s.indexOf(key) !== -1)[0])
    .map(s => {
      const regex = /.*<.*>(.*)<.*>/g;
      return regex.exec(s)[1];
    })
    .toPromise();
}

export function startServer(
  adbPath: NuclideUri,
): ConnectableObservable<string> {
  return runCommand(adbPath, ['start-server']).publish();
}

export async function getDeviceList(
  adbPath: NuclideUri,
): Promise<Array<DeviceDescription>> {
  const devices = await runCommand(adbPath, ['devices'])
    .map(stdout => stdout.split(/\n+/g)
                     .slice(1)
                     .filter(s => (s.length > 0 && !s.trim().startsWith('*')))
                     .map(s => s.split(/\s+/g))
                     .filter(a => a[0] !== '')
                     .map(a => a[0]))
    .toPromise();

  const deviceTable = await Promise.all(devices.map(async name => {
    try {
      const architecture = await getDeviceArchitecture(adbPath, name);
      const apiVersion = await getAPIVersion(adbPath, name);
      const model = await getDeviceModel(adbPath, name);
      return {name, architecture, apiVersion, model};
    } catch (error) {
      return null;
    }
  }));

  return arrayCompact(deviceTable);
}

export function getDeviceArchitecture(
  adbPath: NuclideUri,
  device: string,
): Promise<string> {
  // SDB is a tool similar to ADB used with Tizen devices. `getprop` doesn't
  // exist on Tizen, so we have to rely on uname instead.
  if (adbPath.endsWith('sdb')) {
    return runShortAdbCommand(adbPath, device, ['shell', 'uname', '-m']).toPromise();
  } else {
    return getAndroidProp(adbPath, device, 'ro.product.cpu.abi').toPromise();
  }
}

export function getDeviceModel(
  adbPath: NuclideUri,
  device: string,
): Promise<string> {
  if (adbPath.endsWith('sdb')) {
    return getTizenModelConfigKey(adbPath, device, 'tizen.org/system/model_name');
  } else {
    return getAndroidProp(adbPath, device, 'ro.product.model')
      .map(s => (s === 'sdk' ? 'emulator' : s))
      .toPromise();
  }
}

export function getAPIVersion(
  adbPath: NuclideUri,
  device: string,
): Promise<string> {
  if (adbPath.endsWith('sdb')) {
    return getTizenModelConfigKey(adbPath, device, 'tizen.org/feature/platform.core.api.version');
  } else {
    return getAndroidProp(adbPath, device, 'ro.build.version.sdk').toPromise();
  }
}

export function installPackage(
  adbPath: NuclideUri,
  device: string,
  packagePath: NuclideUri,
): Observable<ProcessMessage> {
  invariant(!nuclideUri.isRemote(packagePath));
  return runLongAdbCommand(adbPath, device, ['install', packagePath]);
}

export function uninstallPackage(
  adbPath: NuclideUri,
  device: string,
  packageName: string,
): Observable<ProcessMessage> {
  return runLongAdbCommand(adbPath, device, ['uninstall', packageName]);
}

export async function getPidFromPackageName(
  adbPath: NuclideUri,
  device: string,
  packageName: string,
): Promise<number> {
  const pidLine = (await runShortAdbCommand(
    adbPath,
    device,
    ['shell', 'ps', '|', 'grep', '-i', packageName],
  ).toPromise()).split(os.EOL)[0];
  if (pidLine == null) {
    throw new Error(`Can not find a running process with package name: ${packageName}`);
  }
  // First column is 'USER', second is 'PID'.
  return parseInt(pidLine.trim().split(/\s+/)[1], /* radix */10);
}

export function forwardJdwpPortToPid(
  adbPath: NuclideUri,
  device: string,
  tcpPort: number,
  pid: number,
): Promise<string> {
  return runShortAdbCommand(
    adbPath,
    device,
    ['forward', `tcp:${tcpPort}`, `jdwp:${pid}`],
  ).toPromise();
}

export function enableWaitForDebugger(
  adbPath: NuclideUri,
  device: string,
  packageName: string,
): Promise<string> {
  return runShortAdbCommand(
    adbPath,
    device,
    ['shell', 'am', 'set-debug-app', packageName],
  ).toPromise();
}

export function launchActivity(
  adbPath: NuclideUri,
  device: string,
  packageName: string,
  activity: string,
  action: string,
): Promise<string> {
  return runShortAdbCommand(
    adbPath,
    device,
    ['shell', 'am', 'start', '-a', action, '-n', `${packageName}/${activity}`],
  ).toPromise();
}
