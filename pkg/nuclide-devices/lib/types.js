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

import type {TaskEvent} from '../../commons-node/tasks';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import {DeviceTask} from './DeviceTask';
import {Observable} from 'rxjs';

export type DevicePanelServiceApi = {
  registerListProvider: (provider: DeviceListProvider) => IDisposable,
  registerInfoProvider: (provider: DeviceInfoProvider) => IDisposable,
  registerProcessesProvider: (provider: DeviceProcessesProvider) => IDisposable,
  registerTaskProvider: (provider: DeviceTaskProvider) => IDisposable,
};

export type Device = {
  name: string,
  displayName: string,
  architecture: string,
};

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
  observe(host: NuclideUri, device: string): Observable<Process[]>,
  getType(): string,
  killProcess(host: NuclideUri, device: string, id: string): Promise<void>,
}

export interface DeviceTaskProvider {
  getTask(host: NuclideUri, device: string): Observable<TaskEvent>,
  getName(): string,
  getType(): string,
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
  processes: Process[],
  processKiller: ?ProcessKiller,
  deviceTasks: DeviceTask[],
};

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
};

export type Process = {
  user: string,
  pid: number,
  name: string,
  cpuUsage: ?number,
  memUsage: ?number,
};

export type ProcessKiller = (id: string) => Promise<void>;

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
  },
};

export type SetProcessKillerAction = {
  type: 'SET_PROCESS_KILLER',
  payload: {
    processKiller: ?ProcessKiller,
  },
};

export type SetDeviceTasksAction = {
  type: 'SET_DEVICE_TASKS',
  payload: {
    deviceTasks: DeviceTask[],
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
  | SetProcessKillerAction
  | SetDeviceTasksAction
  | SetDeviceAction;
