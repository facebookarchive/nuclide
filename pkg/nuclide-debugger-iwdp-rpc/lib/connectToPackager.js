/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import xfetch from '../../commons-node/xfetch';
import {Observable} from 'rxjs';

import type {PackagerDeviceInfo, DeviceInfo} from './types';

const POLLING_INTERVAL = 2000;
const PACKAGER_PORT = 8081;

const ERROR_NO_DEVICES = 'Please run a debuggable app before attaching';
const ERROR_LAST_DETACH = 'All app instances have been detached';


export function connectToPackager(): Observable<DeviceInfo> {
  const origin = Observable.interval(POLLING_INTERVAL)
    .mergeMap(() => fetchDeviceData(PACKAGER_PORT))
    .share();
  const sizes = origin.map(devices => devices.length)
        .distinctUntilChanged()
        .startWith(0);
  return Observable.merge(
    origin.mergeMap(deviceInfos => deviceInfos)
      .distinct(deviceInfo => deviceInfo.webSocketDebuggerUrl),
    // $FlowFixMe
    Observable.zip(sizes.skip(1), sizes, (last, old) => [last, old])
      .mergeMap(([last, old]) => {
        if (last === 0 && old === 0) {
          return Promise.reject(packagerError(ERROR_NO_DEVICES));
        } else if (last === 0) {
          return Promise.reject(packagerError(ERROR_LAST_DETACH));
        } else {
          return Observable.empty();
        }
      }));
}

function packagerError(type: string): Error & {type?: string} {
  const error: Error & {type?: string} = new Error('Packager error');
  error.type = type;
  return error;
}

async function fetchDeviceData(port: number): Promise<Array<PackagerDeviceInfo>> {
  const response = await xfetch(`http://localhost:${port}/inspector/json`, {});
  if (response.ok) {
    const responseText = await response.text();
    return JSON.parse(responseText);
  }
  return [];
}
