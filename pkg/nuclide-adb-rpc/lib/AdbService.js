/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {ConnectableObservable, Observable} from 'rxjs';

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {ProcessMessage} from '../../commons-node/process-rpc-types';
import * as ADB from './ADB';

export type DebugBridgeType = 'adb' | 'sdb';

export type DeviceDescription = {
  name: string,
  architecture: string,
  apiVersion: string,
  model: string,
};

export type AndroidJavaProcess = {
  user: string,
  pid: string,
  name: string,
};

export async function getDeviceList(db: DebugBridgeType): Promise<Array<DeviceDescription>> {
  return ADB.getDeviceList(await ADB.pathForDebugBridge(db));
}

export function installPackage(
  db: DebugBridgeType,
  device: string,
  packagePath: NuclideUri,
): ConnectableObservable<ProcessMessage> {
  return Observable.defer(() => ADB.pathForDebugBridge(db))
    .switchMap(adbPath => ADB.installPackage(adbPath, device, packagePath))
    .publish();
}

export function uninstallPackage(
  db: DebugBridgeType,
  device: string,
  packageName: string,
): ConnectableObservable<ProcessMessage> {
  return Observable.defer(() => ADB.pathForDebugBridge(db))
    .switchMap(adbPath => ADB.uninstallPackage(adbPath, device, packageName))
    .publish();
}

export async function getPidFromPackageName(
  db: DebugBridgeType,
  device: string,
  packageName: string,
): Promise<number> {
  return ADB.getPidFromPackageName(await ADB.pathForDebugBridge(db), device, packageName);
}

export async function forwardJdwpPortToPid(
  db: DebugBridgeType,
  device: string,
  tcpPort: number,
  pid: number,
): Promise<string> {
  return ADB.forwardJdwpPortToPid(await ADB.pathForDebugBridge(db), device, tcpPort, pid);
}

export async function launchActivity(
  db: DebugBridgeType,
  device: string,
  packageName: string,
  activity: string,
  action: string,
): Promise<string> {
  return ADB.launchActivity(
    await ADB.pathForDebugBridge(db),
    device,
    packageName,
    activity,
    action,
  );
}

export async function activityExists(
  db: DebugBridgeType,
  device: string,
  packageName: string,
  activity: string,
): Promise<boolean> {
  return ADB.activityExists(await ADB.pathForDebugBridge(db), device, packageName, activity);
}

export async function getJavaProcesses(
  db: DebugBridgeType,
  device: string,
): Promise<Array<AndroidJavaProcess>> {
  return ADB.getJavaProcesses(await ADB.pathForDebugBridge(db), device);
}
