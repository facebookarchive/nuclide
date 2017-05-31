'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATDeviceListProvider = undefined;

var _DevicePoller;

function _load_DevicePoller() {
  return _DevicePoller = require('../../nuclide-adb-sdb-base/lib/DevicePoller');
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

class ATDeviceListProvider {

  constructor(type, rpcFactory) {
    this._type = type;
    this._rpcFactory = rpcFactory;
    this._dbAvailable = new Map();
  }

  getType() {
    return this._type;
  }

  observe(host) {
    if (this._type === 'android') {
      return (0, (_DevicePoller || _load_DevicePoller()).observeAndroidDevicesX)(host);
    } else {
      return (0, (_DevicePoller || _load_DevicePoller()).observeTizenDevicesX)(host);
    }
  }
}
exports.ATDeviceListProvider = ATDeviceListProvider;