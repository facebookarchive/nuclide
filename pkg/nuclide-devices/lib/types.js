/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';

export type Device = {
  name: string,
  displayName: string,
};

export interface DeviceFetcher {
  fetch(host: NuclideUri): Promise<Device[]>,
  getType(): string,
}

export type AppState = {
  hosts: NuclideUri[],
  host: NuclideUri,
  devices: Map<string, Device[]>,
  deviceType: ?string,
  device: ?Device,
  deviceFetchers: Set<DeviceFetcher>,
};

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
};

//
// Action types
//

export type SetDevicesAction = {
  type: 'SET_DEVICES',
  payload: {
    devices: Map<string, Device[]>,
  },
};

export type RefreshDevicesAction = {
  type: 'REFRESH_DEVICES',
  payload: {},
};

export type SetHostAction = {
  type: 'SET_HOST',
  payload: {
    host: NuclideUri,
  },
};

export type SetDeviceTypeAction = {
  type: 'SET_DEVICE_TYPE',
  payload: {
    deviceType: ?string,
  },
};

export type SetDeviceAction = {
  type: 'SET_DEVICE',
  payload: {
    device: ?Device,
  },
};

export type Action =
  SetHostAction
  | SetDevicesAction
  | RefreshDevicesAction
  | SetDeviceTypeAction
  | SetDeviceAction;
