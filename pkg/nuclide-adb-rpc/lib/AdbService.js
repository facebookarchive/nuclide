/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {ConnectableObservable} from 'rxjs';

import * as ADB from './ADB';

export type DeviceDescription = {
  name: string,
  architecture: string,
  apiVersion: string,
  model: string,
};

export function startServer(
  adbPath: NuclideUri,
): ConnectableObservable<string> {
  return ADB.startServer(adbPath);
}

export function getDeviceList(
  adbPath: NuclideUri,
): Promise<Array<DeviceDescription>> {
  return ADB.getDeviceList(adbPath);
}

export function getDeviceArchitecture(
  adbPath: NuclideUri,
  device: string,
): Promise<string> {
  return ADB.getDeviceArchitecture(adbPath, device);
}

export function getDeviceModel(
  adbPath: NuclideUri,
  device: string,
): Promise<string> {
  return ADB.getDeviceModel(adbPath, device);
}

export function getAPIVersion(
  adbPath: NuclideUri,
  device: string,
): Promise<string> {
  return ADB.getAPIVersion(adbPath, device);
}

export function getPidFromPackageName(
  adbPath: NuclideUri,
  packageName: string,
): Promise<number> {
  return ADB.getPidFromPackageName(adbPath, packageName);
}

export function forwardJdwpPortToPid(
  adbPath: NuclideUri,
  tcpPort: number,
  pid: number,
): Promise<string> {
  return ADB.forwardJdwpPortToPid(adbPath, tcpPort, pid);
}
