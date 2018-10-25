"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEmptyAppState = createEmptyAppState;

function _expected() {
  const data = require("../../../../modules/nuclide-commons/expected");

  _expected = function () {
    return data;
  };

  return data;
}

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function createEmptyAppState() {
  return {
    hosts: [''],
    host: '',
    devices: _expected().Expect.pending(),
    deviceType: null,
    deviceTypes: [],
    device: null,
    deviceTasks: new Map(),
    infoTables: _expected().Expect.pending(),
    appInfoTables: _expected().Expect.pending(),
    processes: _expected().Expect.pending(),
    processTasks: [],
    isDeviceConnected: false,
    deviceTypeTasks: [],
    isPollingDevices: false,
    deviceTypeComponents: Immutable().Map()
  };
}