'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Devices = undefined;

var _Adb;

function _load_Adb() {
  return _Adb = require('../bridges/Adb');
}

var _Sdb;

function _load_Sdb() {
  return _Sdb = require('../bridges/Sdb');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class Devices {

  constructor(db) {
    this._db = db;
  }

  getDeviceList() {
    return this._db.getDevices().switchMap(devices => {
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