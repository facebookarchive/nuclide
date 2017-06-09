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

import {pathForDebugBridge, getStore} from './AdbSdbPathStore';
import {ConnectableObservable, Observable} from 'rxjs';
import {Sdb} from './Sdb';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {LegacyProcessMessage} from 'nuclide-commons/process';
import type {DeviceDescription} from './types';

export async function registerSdbPath(
  id: string,
  path: NuclideUri,
  priority: number = -1,
): Promise<void> {
  getStore('sdb').registerPath(id, {path, priority});
}

async function getSdb(): Promise<Sdb> {
  return new Sdb((await pathForDebugBridge('sdb')));
}

const sdbObs = Observable.defer(() =>
  pathForDebugBridge('sdb'),
).switchMap(sdbPath => Observable.of(new Sdb(sdbPath)));

export async function getDeviceInfo(
  name: string,
): Promise<Map<string, string>> {
  return (await getSdb()).getCommonDeviceInfo(name);
}

export async function startServer(): Promise<boolean> {
  try {
    return (await getSdb()).startServer();
  } catch (e) {
    return false;
  }
}

export function getDeviceList(): ConnectableObservable<
  Array<DeviceDescription>,
> {
  return sdbObs.switchMap(sdb => sdb.getDeviceList()).publish();
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
): ConnectableObservable<LegacyProcessMessage> {
  // TODO(T17463635)
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
): ConnectableObservable<LegacyProcessMessage> {
  // TODO(T17463635)
  return Observable.defer(() => getSdb())
    .switchMap(d => d.uninstallPackage(device, packageName))
    .publish();
}
