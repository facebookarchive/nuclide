'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = app;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function app(state, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_HOST:
      const { host } = action.payload;
      return Object.assign({}, state, {
        deviceType: null,
        device: null,
        devices: [],
        infoTables: new Map(),
        processes: [],
        actions: [],
        host
      });

    case (_Actions || _load_Actions()).SET_DEVICE_TYPE:
      const { deviceType } = action.payload;
      return Object.assign({}, state, {
        deviceType,
        device: null,
        devices: [],
        infoTables: new Map(),
        processes: [],
        actions: []
      });

    case (_Actions || _load_Actions()).SET_DEVICE_TYPES:
      const { deviceTypes } = action.payload;
      return Object.assign({}, state, {
        deviceTypes
      });

    case (_Actions || _load_Actions()).SET_DEVICE:
      const { device } = action.payload;
      return Object.assign({}, state, {
        device
      });

    case (_Actions || _load_Actions()).SET_DEVICES:
      const { devices } = action.payload;
      return Object.assign({}, state, {
        devices
      });

    case (_Actions || _load_Actions()).SET_INFO_TABLES:
      const { infoTables } = action.payload;
      return Object.assign({}, state, {
        infoTables
      });

    case (_Actions || _load_Actions()).SET_PROCESSES:
      const { processes } = action.payload;
      return Object.assign({}, state, {
        processes
      });

    case (_Actions || _load_Actions()).SET_PROCESS_KILLER:
      const { processKiller } = action.payload;
      return Object.assign({}, state, {
        processKiller
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

    default:
      return state;
  }
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