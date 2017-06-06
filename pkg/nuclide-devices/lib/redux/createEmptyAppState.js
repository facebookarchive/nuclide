'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEmptyAppState = createEmptyAppState;

var _nuclideExpected;

function _load_nuclideExpected() {
  return _nuclideExpected = require('../../../nuclide-expected');
}

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

function createEmptyAppState() {
  return {
    hosts: ['local'],
    host: 'local',
    devices: (_nuclideExpected || _load_nuclideExpected()).Expect.value([]),
    deviceType: null,
    deviceTypes: [],
    device: null,
    deviceTasks: [],
    infoTables: new Map(),
    processes: [],
    processTasks: [],
    isDeviceConnected: false,
    supportedPidsPerTask: new Map()
  };
}