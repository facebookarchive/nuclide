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
import invariant from 'invariant';
import {Adb} from './Adb';
import {Sdb} from './Sdb';
import {pathForDebugBridge, DebugBridge} from './DebugBridge';

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {ProcessMessage} from '../../commons-node/process-rpc-types';

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

async function getAdb(): Promise<Adb> {
  return new Adb(await pathForDebugBridge('adb'));
}

async function getSdb(): Promise<Sdb> {
  return new Sdb(await pathForDebugBridge('sdb'));
}

function getDb(db: DebugBridgeType): Promise<DebugBridge> {
  switch (db) {
    case 'adb':
      return getAdb();
    case 'sdb':
      return getSdb();
  }
  throw new Error('unreacable');
}

export async function getDeviceList(db: DebugBridgeType): Promise<Array<DeviceDescription>> {
  return (await getDb(db)).getDeviceList();
}

export function installPackage(
  db: DebugBridgeType,
  device: string,
  packagePath: NuclideUri,
): ConnectableObservable<ProcessMessage> {
  return Observable.defer(() => getDb(db))
    .switchMap(d => d.installPackage(device, packagePath))
    .publish();
}

export function uninstallPackage(
  db: DebugBridgeType,
  device: string,
  packageName: string,
): ConnectableObservable<ProcessMessage> {
  return Observable.defer(() => getDb(db))
    .switchMap(d => d.uninstallPackage(device, packageName))
    .publish();
}

export async function getPidFromPackageName(
  db: DebugBridgeType,
  device: string,
  packageName: string,
): Promise<number> {
  return (await getDb(db)).getPidFromPackageName(device, packageName);
}

export async function forwardJdwpPortToPid(
  db: DebugBridgeType,
  device: string,
  tcpPort: number,
  pid: number,
): Promise<string> {
  invariant(db === 'adb', 'only supported on android');
  return (await getAdb()).forwardJdwpPortToPid(device, tcpPort, pid);
}

export async function launchActivity(
  db: DebugBridgeType,
  device: string,
  packageName: string,
  activity: string,
  debug: boolean,
  action: ?string,
): Promise<string> {
  invariant(db === 'adb', 'only supported on android');
  return (await getAdb()).launchActivity(device, packageName, activity, debug, action);
}

export async function activityExists(
  db: DebugBridgeType,
  device: string,
  packageName: string,
  activity: string,
): Promise<boolean> {
  invariant(db === 'adb', 'only supported on android');
  return (await getAdb()).activityExists(device, packageName, activity);
}

export async function getJavaProcesses(
  db: DebugBridgeType,
  device: string,
): Promise<Array<AndroidJavaProcess>> {
  invariant(db === 'adb', 'only supported on android');
  return (await getAdb()).getJavaProcesses(device);
}
