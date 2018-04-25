/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {DeviceDescription} from '../types';
import type {getDevicesOptions} from './DebugBridge';

import {Observable} from 'rxjs';
import {DebugBridge} from './DebugBridge';

type Db = Class<DebugBridge>;

export class Devices {
  _db: Db;

  constructor(db: Db) {
    this._db = db;
  }

  getDeviceList(
    options?: getDevicesOptions,
  ): Observable<Array<DeviceDescription>> {
    return this._db.getDevices(options).switchMap(devices => {
      return Observable.concat(
        ...devices.map(deviceId => {
          const db = new this._db(deviceId);
          return Observable.forkJoin(
            db.getDeviceArchitecture().catch(() => Observable.of('')),
            db.getAPIVersion().catch(() => Observable.of('')),
            db.getDeviceModel().catch(() => Observable.of('')),
          ).map(([architecture, apiVersion, model]) => ({
            name: deviceId.name,
            port: deviceId.port,
            architecture,
            apiVersion,
            model,
          }));
        }),
      ).toArray();
    });
  }
}
