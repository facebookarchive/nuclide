/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Action, AppState} from '../types';

import * as Actions from './Actions';

export function app(state: AppState, action: Action): AppState {
  switch (action.type) {
    case Actions.SET_HOST:
      const {host} = action.payload;
      return {
        ...state,
        host,
      };

    case Actions.SET_DEVICE_TYPE:
      const {deviceType} = action.payload;
      return {
        ...state,
        deviceType,
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

    default:
      return state;
  }
}
