'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = app;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _expected;

function _load_expected() {
  return _expected = require('../../../commons-node/expected');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function app(state, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_HOST:
      const { host } = action.payload;
      return Object.assign({}, state, {
        deviceType: null,
        device: null,
        devices: (_expected || _load_expected()).Expect.pendingValue([]),
        infoTables: (_expected || _load_expected()).Expect.pendingValue(new Map()),
        processes: (_expected || _load_expected()).Expect.pendingValue([]),
        actions: [],
        processTasks: [],
        isDeviceConnected: false,
        host
      });

    case (_Actions || _load_Actions()).SET_DEVICE_TYPE:
      const { deviceType } = action.payload;
      return Object.assign({}, state, {
        deviceType,
        device: null,
        devices: (_expected || _load_expected()).Expect.pendingValue([]),
        infoTables: (_expected || _load_expected()).Expect.pendingValue(new Map()),
        processes: (_expected || _load_expected()).Expect.pendingValue([]),
        actions: [],
        processTasks: [],
        isDeviceConnected: false
      });

    case (_Actions || _load_Actions()).SET_DEVICE_TYPES:
      const { deviceTypes } = action.payload;
      return Object.assign({}, state, {
        deviceTypes
      });

    case (_Actions || _load_Actions()).SET_DEVICE:
      const { device } = action.payload;
      return Object.assign({}, state, {
        device,
        isDeviceConnected: isDeviceConnected(device, state.devices)
      });

    case (_Actions || _load_Actions()).SET_DEVICES:
      const { devices } = action.payload;
      return Object.assign({}, state, {
        devices,
        isDeviceConnected: isDeviceConnected(state.device, devices)
      });

    case (_Actions || _load_Actions()).SET_INFO_TABLES:
      const { infoTables } = action.payload;
      return Object.assign({}, state, {
        infoTables: (_expected || _load_expected()).Expect.value(infoTables)
      });

    case (_Actions || _load_Actions()).SET_PROCESSES:
      const { processes } = action.payload;
      return Object.assign({}, state, {
        processes: (_expected || _load_expected()).Expect.value(processes)
      });

    case (_Actions || _load_Actions()).SET_PROCESS_TASKS:
      const { processTasks } = action.payload;
      return Object.assign({}, state, {
        processTasks
      });

    case (_Actions || _load_Actions()).SET_HOSTS:
      const { hosts } = action.payload;
      return Object.assign({}, state, {
        hosts
      });

    case (_Actions || _load_Actions()).SET_DEVICE_TASKS:
      const { deviceTasks } = action.payload;
      return Object.assign({}, state, {
        deviceTasks
      });

    case (_Actions || _load_Actions()).SET_DEVICE_TYPE_TASKS:
      const { deviceTypeTasks } = action.payload;
      return Object.assign({}, state, {
        deviceTypeTasks
      });

    case (_Actions || _load_Actions()).TOGGLE_DEVICE_POLLING:
      const { isActive } = action.payload;
      return Object.assign({}, state, {
        isPollingDevices: isActive
      });

    default:
      return state;
  }
}

function isDeviceConnected(device, deviceList) {
  if (device == null || deviceList.isError) {
    return false;
  }
  for (const _device of deviceList.value) {
    if (device.name === _device.name) {
      return true;
    }
  }
  return false;
}