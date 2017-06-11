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

import {getStore} from './AdbSdbPathStore';
import {ConnectableObservable} from 'rxjs';
import {Sdb} from './Sdb';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {LegacyProcessMessage} from 'nuclide-commons/process';
import type {DeviceDescription, DBPathsInfo} from './types';

const sdb = new Sdb();

export async function registerSdbPath(
  id: string,
  path: NuclideUri,
  priority: number = -1,
): Promise<void> {
  getStore('sdb').registerPath(id, {path, priority});
}

export async function getCurrentPathsInfo(): Promise<DBPathsInfo> {
  return getStore('sdb').getCurrentPathsInfo();
}

export async function registerCustomPath(path: ?string): Promise<void> {
  getStore('adb').registerCustomPath(path);
}

export function getDeviceInfo(
  name: string,
): ConnectableObservable<Map<string, string>> {
  return sdb.getDeviceInfo(name).publish();
}

export function getDeviceList(): ConnectableObservable<
  Array<DeviceDescription>,
> {
  return sdb.getDeviceList().publish();
}

export async function getPidFromPackageName(
  device: string,
  packageName: string,
): Promise<number> {
  return sdb.getPidFromPackageName(device, packageName);
}

export async function getFileContentsAtPath(
  device: string,
  path: string,
): Promise<string> {
  return sdb.getFileContentsAtPath(device, path);
}

export function installPackage(
  device: string,
  packagePath: NuclideUri,
): ConnectableObservable<LegacyProcessMessage> {
  // TODO(T17463635)
  return sdb.installPackage(device, packagePath).publish();
}

export async function launchApp(
  device: string,
  identifier: string,
): Promise<string> {
  return sdb.launchApp(device, identifier);
}

export function uninstallPackage(
  device: string,
  packageName: string,
): ConnectableObservable<LegacyProcessMessage> {
  // TODO(T17463635)
  return sdb.uninstallPackage(device, packageName).publish();
}
