'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import xfetch from '../../commons-node/xfetch';
import {Observable} from 'rxjs';

import type {PackagerDeviceInfo, DeviceInfo} from './types';

const POLLING_INTERVAL = 2000;
const PACKAGER_PORT = 8081;

export function connectToPackager(): Observable<DeviceInfo> {
  return Observable.interval(POLLING_INTERVAL)
    .mergeMap(() => fetchDeviceData(PACKAGER_PORT))
    .mergeMap(deviceInfos => deviceInfos)
    .distinct(deviceInfo => deviceInfo.webSocketDebuggerUrl);
}

async function fetchDeviceData(port: number): Promise<Array<PackagerDeviceInfo>> {
  const response = await xfetch(`http://localhost:${port}/inspector/json`, {});
  if (response.ok) {
    const responseText = await response.text();
    return JSON.parse(responseText);
  }
  return [];
}
