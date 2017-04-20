/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {pathForDebugBridge, getStore} from './DebugBridgePathStore';
import {ConnectableObservable, Observable} from 'rxjs';
import {Sdb} from './Sdb';

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {LegacyProcessMessage} from '../../commons-node/process-rpc-types';
import type {DeviceDescription} from './types';

export async function registerAdbPath(
  id: string,
  path: NuclideUri,
  priority: number = -1,
): Promise<void> {
  getStore('sdb').registerPath(id, {path, priority});
}

async function getSdb(): Promise<Sdb> {
  return new Sdb((await pathForDebugBridge('sdb')));
}

export async function getDeviceInfo(name: string): Promise<Map<string, string>> {
  return (await getSdb()).getCommonDeviceInfo(name);
}

export async function startServer(): Promise<boolean> {
  return (await getSdb()).startServer();
}

export async function getDeviceList(): Promise<Array<DeviceDescription>> {
  return (await getSdb()).getDeviceList();
}

export async function getPidFromPackageName(
  device: string,
  packageName: string,
): Promise<number> {
  return (await getSdb()).getPidFromPackageName(device, packageName);
}

export async function getFileContentsAtPath(
  device: string,
  path: string,
): Promise<string> {
  return (await getSdb()).getFileContentsAtPath(device, path);
}

export function installPackage(
  device: string,
  packagePath: NuclideUri,
): ConnectableObservable<LegacyProcessMessage> { // TODO(T17463635)
  return Observable.defer(() => getSdb())
    .switchMap(d => d.installPackage(device, packagePath))
    .publish();
}

export async function launchApp(
  device: string,
  identifier: string,
): Promise<string> {
  return (await getSdb()).launchApp(device, identifier);
}

export function uninstallPackage(
  device: string,
  packageName: string,
): ConnectableObservable<LegacyProcessMessage> { // TODO(T17463635)
  return Observable.defer(() => getSdb())
    .switchMap(d => d.uninstallPackage(device, packageName))
    .publish();
}
