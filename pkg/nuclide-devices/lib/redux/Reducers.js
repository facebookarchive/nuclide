/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import * as Actions from './Actions';

import type {Action, AppState} from '../types';

export function app(state: AppState, action: Action): AppState {
  switch (action.type) {
    case Actions.SET_HOST:
      const {host} = action.payload;
      return {
        ...state,
        deviceType: null,
        device: null,
        devices: [],
        infoTables: new Map(),
        processes: [],
        actions: [],
        host,
      };

    case Actions.SET_DEVICE_TYPE:
      const {deviceType} = action.payload;
      return {
        ...state,
        deviceType,
        device: null,
        devices: [],
        infoTables: new Map(),
        processes: [],
        actions: [],
      };

    case Actions.SET_DEVICE_TYPES:
      const {deviceTypes} = action.payload;
      return {
        ...state,
        deviceTypes,
      };

    case Actions.SET_DEVICE:
      const {device} = action.payload;
      return {
        ...state,
        device,
      };

    case Actions.SET_DEVICES:
      const {devices} = action.payload;
      return {
        ...state,
        devices,
      };

    case Actions.SET_INFO_TABLES:
      const {infoTables} = action.payload;
      return {
        ...state,
        infoTables,
      };

    case Actions.SET_PROCESSES:
      const {processes, killProcess} = action.payload;
      return {
        ...state,
        processes,
        killProcess,
      };

    case Actions.SET_HOSTS:
      const {hosts} = action.payload;
      return {
        ...state,
        hosts,
      };

    case Actions.SET_DEVICE_ACTIONS:
      const {deviceActions} = action.payload;
      return {
        ...state,
        deviceActions,
      };

    default:
      return state;
  }
}
