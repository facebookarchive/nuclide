'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEmptyAppState = createEmptyAppState;

var _expected;

function _load_expected() {
  return _expected = require('../../../commons-node/expected');
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
    hosts: [''],
    host: '',
    devices: (_expected || _load_expected()).Expect.pendingValue([]),
    deviceType: null,
    deviceTypes: [],
    device: null,
    deviceTasks: [],
    infoTables: (_expected || _load_expected()).Expect.pendingValue(new Map()),
    processes: (_expected || _load_expected()).Expect.pendingValue([]),
    processTasks: [],
    isDeviceConnected: false,
    supportedPidsPerTask: new Map(),
    deviceTypeTasks: [],
    isPollingDevices: false
  };
}