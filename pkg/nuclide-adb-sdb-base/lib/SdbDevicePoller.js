'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeTizenDevices = observeTizenDevices;
exports.observeTizenDevicesX = observeTizenDevicesX;

var _nuclideAdb;

function _load_nuclideAdb() {
  return _nuclideAdb = require('../../../modules/nuclide-adb');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

const SDB_PLATFORM = {
  name: 'Tizen',
  type: 'sdb',
  command: 'sdb',
  getService: (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    *  strict-local
    * @format
    */

function observeTizenDevices(host) {
  return observeTizenDevicesX(host).map(devices => devices.getOrDefault([]));
}

function observeTizenDevicesX(host) {
  return (_nuclideAdb || _load_nuclideAdb()).DevicePoller.observeDevices(SDB_PLATFORM, host);
}