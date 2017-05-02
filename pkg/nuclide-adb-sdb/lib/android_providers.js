'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAndroidDeviceListProvider = createAndroidDeviceListProvider;
exports.createAndroidInfoProvider = createAndroidInfoProvider;

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _ATDeviceListProvider;

function _load_ATDeviceListProvider() {
  return _ATDeviceListProvider = require('./ATDeviceListProvider');
}

var _ATDeviceInfoProvider;

function _load_ATDeviceInfoProvider() {
  return _ATDeviceInfoProvider = require('./ATDeviceInfoProvider');
}

function createAndroidDeviceListProvider() {
  return new (_ATDeviceListProvider || _load_ATDeviceListProvider()).ATDeviceListProvider('android', host => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(host));
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function createAndroidInfoProvider() {
  return new (_ATDeviceInfoProvider || _load_ATDeviceInfoProvider()).ATDeviceInfoProvider('android', host => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(host));
}