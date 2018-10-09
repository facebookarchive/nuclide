"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = app;

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
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

function _expected() {
  const data = require("../../../../modules/nuclide-commons/expected");

  _expected = function () {
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
function app(state, action) {
  switch (action.type) {
    case Actions().SET_HOST:
      const {
        host
      } = action.payload;
      return Object.assign({}, state, {
        device: null,
        devices: _expected().Expect.pending(),
        deviceTasks: new Map(),
        infoTables: _expected().Expect.pending(),
        processes: _expected().Expect.pending(),
        processTasks: [],
        deviceTypeComponents: Immutable().Map(),
        isDeviceConnected: false,
        host
      });

    case Actions().SET_DEVICE_TYPE:
      const {
        deviceType
      } = action.payload;

      if (deviceType === state.deviceType) {
        return state;
      }

      return Object.assign({}, state, {
        deviceType,
        device: null,
        devices: _expected().Expect.pending(),
        deviceTasks: new Map(),
        infoTables: _expected().Expect.pending(),
        processes: _expected().Expect.pending(),
        processTasks: [],
        deviceTypeComponents: Immutable().Map(),
        isDeviceConnected: false
      });

    case Actions().SET_DEVICE_TYPES:
      const {
        deviceTypes
      } = action.payload;
      return Object.assign({}, state, {
        deviceTypes
      });

    case Actions().SET_DEVICE:
      const {
        device
      } = action.payload;
      return Object.assign({}, state, {
        device,
        isDeviceConnected: isDeviceConnected(device, state.devices)
      });

    case Actions().SET_DEVICES:
      const {
        devices
      } = action.payload;
      return Object.assign({}, state, {
        devices,
        isDeviceConnected: isDeviceConnected(state.device, devices)
      });

    case Actions().SET_INFO_TABLES:
      const {
        infoTables
      } = action.payload;
      return Object.assign({}, state, {
        infoTables: _expected().Expect.value(infoTables)
      });

    case Actions().SET_APP_INFO_TABLES:
      const {
        appInfoTables
      } = action.payload;
      return Object.assign({}, state, {
        appInfoTables: _expected().Expect.value(appInfoTables)
      });

    case Actions().SET_PROCESSES:
      const {
        processes
      } = action.payload;
      return Object.assign({}, state, {
        processes: _expected().Expect.value(processes)
      });

    case Actions().SET_PROCESS_TASKS:
      const {
        processTasks
      } = action.payload;
      return Object.assign({}, state, {
        processTasks
      });

    case Actions().SET_HOSTS:
      const {
        hosts
      } = action.payload;
      return Object.assign({}, state, {
        hosts
      });

    case Actions().SET_DEVICE_TASKS:
      const {
        deviceTasks
      } = action.payload;
      return Object.assign({}, state, {
        deviceTasks
      });

    case Actions().SET_DEVICE_TYPE_TASKS:
      const {
        deviceTypeTasks
      } = action.payload;
      return Object.assign({}, state, {
        deviceTypeTasks
      });

    case Actions().SET_DEVICE_TYPE_COMPONENTS:
      const deviceTypeComponents = action.payload.components;
      return Object.assign({}, state, {
        deviceTypeComponents
      });

    case Actions().TOGGLE_DEVICE_POLLING:
      const {
        isActive
      } = action.payload;
      return Object.assign({}, state, {
        isPollingDevices: isActive
      });

    default:
      return state;
  }
}

function isDeviceConnected(device, deviceList) {
  if (device == null || !deviceList.isValue) {
    return false;
  }

  for (const _device of deviceList.value) {
    if (device.identifier === _device.identifier) {
      return true;
    }
  }

  return false;
}