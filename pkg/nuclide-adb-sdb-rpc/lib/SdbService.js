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
import {Sdb} from './Sdb';

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {ProcessMessage} from '../../commons-node/process-rpc-types';
import type {DeviceDescription} from './types';

async function getSdb(): Promise<Sdb> {
  return new Sdb((await pathForDebugBridge('sdb')));
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

export async function getManifestForPackageName(
  device: string,
  packageName: string,
): Promise<string> {
  return (await getSdb()).getManifestForPackageName(device, packageName);
}

export function installPackage(
  device: string,
  packagePath: NuclideUri,
): ConnectableObservable<ProcessMessage> {
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
): ConnectableObservable<ProcessMessage> {
  return Observable.defer(() => getSdb())
    .switchMap(d => d.uninstallPackage(device, packageName))
    .publish();
}
