'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTizenInfoProvider = createTizenInfoProvider;

var _ATDeviceInfoProvider;

function _load_ATDeviceInfoProvider() {
  return _ATDeviceInfoProvider = require('./ATDeviceInfoProvider');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function createTizenInfoProvider() {
  return new (_ATDeviceInfoProvider || _load_ATDeviceInfoProvider()).ATDeviceInfoProvider('tizen', host => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri)(host));
}