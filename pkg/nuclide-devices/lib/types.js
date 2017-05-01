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

import type {NuclideUri} from '../../commons-node/nuclideUri';

export type DevicePanelServiceApi = {
  registerListProvider: (provider: DeviceListProvider) => IDisposable,
  registerInfoProvider: (provider: DeviceInfoProvider) => IDisposable,
  registerActionsProvider: (provider: DeviceActionsProvider) => IDisposable,
};

export type Device = {
  name: string,
  displayName: string,
};

export type DeviceAction = {
  name: string,
  callback: () => Promise<void>,
};

export interface DeviceActionsProvider {
  getActions(host: NuclideUri, device: string): DeviceAction[],
  getType(): string,
  isSupported(host: NuclideUri): Promise<boolean>,
}

export interface DeviceListProvider {
  fetch(host: NuclideUri): Promise<Device[]>,
  getType(): string,
}

export interface DeviceInfoProvider {
  fetch(host: NuclideUri, device: string): Promise<Map<string, string>>,
  getType(): string,
  getTitle(): string,
  getPriority(): number,
  isSupported(host: NuclideUri): Promise<boolean>,
}

export type AppState = {
  hosts: NuclideUri[],
  host: NuclideUri,
  devices: Device[],
  deviceType: ?string,
  deviceTypes: string[],
  device: ?Device,
  infoTables: Map<string, Map<string, string>>,
  deviceActions: DeviceAction[],
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
    devices: Device[],
  },
};

export type SetHostsAction = {
  type: 'SET_HOSTS',
  payload: {
    hosts: NuclideUri[],
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

export type SetDeviceTypesAction = {
  type: 'SET_DEVICE_TYPES',
  payload: {
    deviceTypes: string[],
  },
};

export type SetDeviceAction = {
  type: 'SET_DEVICE',
  payload: {
    device: ?Device,
  },
};

export type SetInfoTablesAction = {
  type: 'SET_INFO_TABLES',
  payload: {
    infoTables: Map<string, Map<string, string>>,
  },
};

export type SetDeviceActionsAction = {
  type: 'SET_DEVICE_ACTIONS',
  payload: {
    deviceActions: DeviceAction[],
  },
};

export type Action =
  | RefreshDevicesAction
  | SetHostAction
  | SetHostsAction
  | SetDevicesAction
  | SetDeviceTypeAction
  | SetDeviceTypesAction
  | SetInfoTablesAction
  | SetDeviceActionsAction
  | SetDeviceAction;
