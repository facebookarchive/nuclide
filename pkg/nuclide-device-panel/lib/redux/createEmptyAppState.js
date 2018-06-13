'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEmptyAppState = createEmptyAppState;

var _expected;

function _load_expected() {
  return _expected = require('../../../../modules/nuclide-commons/expected');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
    appInfoTables: (_expected || _load_expected()).Expect.pendingValue(new Map()),
    processes: (_expected || _load_expected()).Expect.pendingValue([]),
    processTasks: [],
    isDeviceConnected: false,
    supportedPidsPerTask: new Map(),
    deviceTypeTasks: [],
    isPollingDevices: false,
    deviceTypeComponents: (_immutable || _load_immutable()).Map()
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */