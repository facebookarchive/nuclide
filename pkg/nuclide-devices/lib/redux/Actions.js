/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../../commons-node/nuclideUri';
import type {
  SetDevicesAction,
  SetHostAction,
  SetDeviceTypeAction,
  SetDeviceAction,
  RefreshDevicesAction,
  Device,
} from '../types';

export const SET_DEVICES = 'SET_DEVICES';
export const SET_HOST = 'SET_HOST';
export const SET_DEVICE_TYPE = 'SET_DEVICE_TYPE';
export const SET_DEVICE = 'SET_DEVICE';
export const REFRESH_DEVICES = 'REFRESH_DEVICES';

export function refreshDevices(): RefreshDevicesAction {
  return {
    type: REFRESH_DEVICES,
    payload: {},
  };
}

export function setDevices(devices: Map<string, Device[]>): SetDevicesAction {
  return {
    type: SET_DEVICES,
    payload: {devices},
  };
}

export function setHost(host: NuclideUri): SetHostAction {
  return {
    type: SET_HOST,
    payload: {host},
  };
}

export function setDeviceType(deviceType: ?string): SetDeviceTypeAction {
  return {
    type: SET_DEVICE_TYPE,
    payload: {deviceType},
  };
}

export function setDevice(device: ?Device): SetDeviceAction {
  return {
    type: SET_DEVICE,
    payload: {device},
  };
}
