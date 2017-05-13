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
import type {Task} from '../../commons-node/tasks';

import {Observable} from 'rxjs';

export type DevicePanelServiceApi = {
  registerListProvider: (provider: DeviceListProvider) => IDisposable,
  registerInfoProvider: (provider: DeviceInfoProvider) => IDisposable,
  registerProcessesProvider: (provider: DeviceProcessesProvider) => IDisposable,
  registerActionsProvider: (provider: DeviceActionsProvider) => IDisposable,
};

export type Device = {
  name: string,
  displayName: string,
  architecture: string,
};

export type DeviceAction = {
  name: string,
  task: Task,
};

export interface DeviceActionsProvider {
  getActions(host: NuclideUri, device: string): DeviceAction[],
  getType(): string,
  isSupported(host: NuclideUri): Promise<boolean>,
}

export interface DeviceListProvider {
  observe(host: NuclideUri): Observable<Device[]>,
  getType(): string,
}

export interface DeviceInfoProvider {
  fetch(host: NuclideUri, device: string): Promise<Map<string, string>>,
  getType(): string,
  getTitle(): string,
  getPriority(): number,
  isSupported(host: NuclideUri): Promise<boolean>,
}

export interface DeviceProcessesProvider {
  fetch(host: NuclideUri, device: string): Promise<Array<Process>>,
  getType(): string,
  isSupported(host: NuclideUri): Promise<boolean>,
  killRunningPackage(
    host: NuclideUri,
    device: string,
    packageName: string,
  ): Promise<void>,
}

export type AppState = {
  hosts: NuclideUri[],
  host: NuclideUri,
  devices: Device[],
  deviceType: ?string,
  deviceTypes: string[],
  device: ?Device,
  infoTables: Map<string, Map<string, string>>,
  processes: Process[],
  deviceActions: DeviceAction[],
  killProcess: ?KillProcessCallback,
};

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
};

export type Process = {
  user: string,
  pid: string,
  name: string,
  cpuUsage: ?string,
  memUsage: ?string,
};

export type KillProcessCallback = (packageName: string) => Promise<void>;
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

export type SetProcessesAction = {
  type: 'SET_PROCESSES',
  payload: {
    processes: Process[],
    killProcess: ?KillProcessCallback,
  },
};

export type SetDeviceActionsAction = {
  type: 'SET_DEVICE_ACTIONS',
  payload: {
    deviceActions: DeviceAction[],
  },
};

export type Action =
  | SetHostAction
  | SetHostsAction
  | SetDevicesAction
  | SetDeviceTypeAction
  | SetDeviceTypesAction
  | SetInfoTablesAction
  | SetProcessesAction
  | SetDeviceActionsAction
  | SetDeviceAction;
