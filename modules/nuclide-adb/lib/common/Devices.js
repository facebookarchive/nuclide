'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Devices = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _DebugBridge;

function _load_DebugBridge() {
  return _DebugBridge = require('./DebugBridge');
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

class Devices {

  constructor(db) {
    this._db = db;
  }

  getDeviceList(options) {
    return this._db.getDevices(options).switchMap(devices => {
      return _rxjsBundlesRxMinJs.Observable.concat(...devices.map(deviceId => {
        const db = new this._db(deviceId);
        return _rxjsBundlesRxMinJs.Observable.forkJoin(db.getDeviceArchitecture().catch(() => _rxjsBundlesRxMinJs.Observable.of('')), db.getAPIVersion().catch(() => _rxjsBundlesRxMinJs.Observable.of('')), db.getDeviceModel().catch(() => _rxjsBundlesRxMinJs.Observable.of(''))).map(([architecture, apiVersion, model]) => ({
          name: deviceId.name,
          port: deviceId.port,
          architecture,
          apiVersion,
          model
        }));
      })).toArray();
    });
  }
}
exports.Devices = Devices;