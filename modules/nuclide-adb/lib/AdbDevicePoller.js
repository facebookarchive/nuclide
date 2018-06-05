'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeAndroidDevices = observeAndroidDevices;
exports.observeAndroidDevicesX = observeAndroidDevicesX;

var _DevicePoller;

function _load_DevicePoller() {
  return _DevicePoller = require('./DevicePoller');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

const ADB_PLATFORM = {
  name: 'Android',
  type: 'adb',
  command: 'adb',
  getService: (_utils || _load_utils()).getAdbServiceByNuclideUri
}; /**
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

function observeAndroidDevices(host) {
  return observeAndroidDevicesX(host).map(devices => devices.getOrDefault([]));
}

function observeAndroidDevicesX(host) {
  return (_DevicePoller || _load_DevicePoller()).DevicePoller.observeDevices(ADB_PLATFORM, host);
}