/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {pathForDebugBridge} from './DebugBridge';
import {ConnectableObservable, Observable} from 'rxjs';
import {Adb} from './Adb';

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {ProcessMessage} from '../../commons-node/process-rpc-types';
import type {DeviceDescription, AndroidJavaProcess} from './types';

async function getAdb(): Promise<Adb> {
  return new Adb((await pathForDebugBridge('adb')));
}

export async function getDeviceList(): Promise<Array<DeviceDescription>> {
  return (await getAdb()).getDeviceList();
}

export async function getPidFromPackageName(
  device: string,
  packageName: string,
): Promise<number> {
  return (await getAdb()).getPidFromPackageName(device, packageName);
}

export function installPackage(
  device: string,
  packagePath: NuclideUri,
): ConnectableObservable<ProcessMessage> {
  return Observable.defer(() => getAdb())
    .switchMap(d => d.installPackage(device, packagePath))
    .publish();
}

export function uninstallPackage(
  device: string,
  packageName: string,
): ConnectableObservable<ProcessMessage> {
  return Observable.defer(() => getAdb())
    .switchMap(d => d.uninstallPackage(device, packageName))
    .publish();
}

export async function forwardJdwpPortToPid(
  device: string,
  tcpPort: number,
  pid: number,
): Promise<string> {
  return (await getAdb()).forwardJdwpPortToPid(device, tcpPort, pid);
}

export async function launchActivity(
  device: string,
  packageName: string,
  activity: string,
  debug: boolean,
  action: ?string,
): Promise<string> {
  return (await getAdb()).launchActivity(
    device,
    packageName,
    activity,
    debug,
    action,
  );
}

export async function activityExists(
  device: string,
  packageName: string,
  activity: string,
): Promise<boolean> {
  return (await getAdb()).activityExists(device, packageName, activity);
}

export async function getJavaProcesses(
  device: string,
): Promise<Array<AndroidJavaProcess>> {
  return (await getAdb()).getJavaProcesses(device);
}

export async function dumpsysPackage(
  device: string,
  identifier: string,
): Promise<string> {
  return (await getAdb()).dumpsysPackage(device, identifier);
}
