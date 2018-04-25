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

import type {TaskEvent} from 'nuclide-commons/process';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Expected} from 'nuclide-commons/expected';
import type {Device as DeviceIdType} from '../../nuclide-device-panel/lib/types';

import * as Immutable from 'immutable';
import {Observable} from 'rxjs';

//
// DeviceTask interface
//

export interface IDeviceTask {
  getName(): string;
  getTaskEvents(): Observable<?TaskEvent>;
  start(): void;
  cancel(): void;
}

//
// Api
//

export type DevicePanelServiceApi = {
  registerListProvider: (provider: DeviceListProvider) => IDisposable,
  registerInfoProvider: (provider: DeviceInfoProvider) => IDisposable,
  registerProcessesProvider: (provider: DeviceProcessesProvider) => IDisposable,
  registerTaskProvider: (provider: DeviceTaskProvider) => IDisposable,
  registerProcessTaskProvider: (
    provider: DeviceProcessTaskProvider,
  ) => IDisposable,
  registerDeviceTypeTaskProvider: (
    provider: DeviceTypeTaskProvider,
  ) => IDisposable,
  registerDeviceActionProvider: (provider: DeviceActionProvider) => IDisposable,
  registerAppInfoProvider: (provider: DeviceAppInfoProvider) => IDisposable,
  registerDeviceTypeComponentProvider: (
    provider: DeviceTypeComponentProvider,
  ) => IDisposable,
};

export interface DeviceListProvider {
  observe(host: NuclideUri): Observable<Expected<Device[]>>;
  getType(): string;
}

export interface DeviceInfoProvider {
  fetch(
    host: NuclideUri,
    device: DeviceIdType,
  ): Observable<Map<string, string>>;
  getType(): string;
  getTitle(): string;
  getPriority(): number;
  isSupported(host: NuclideUri): Observable<boolean>;
}

export interface DeviceProcessesProvider {
  observe(host: NuclideUri, device: DeviceIdType): Observable<Process[]>;
  getType(): string;
}

export interface DeviceTaskProvider {
  getTask(host: NuclideUri, device: DeviceIdType): Observable<TaskEvent>;
  getName(): string;
  getType(): string;
  isSupported(host: NuclideUri): Observable<boolean>;
}

export interface DeviceTypeTaskProvider {
  getTask(host: NuclideUri): Observable<TaskEvent>;
  getName(): string;
  getType(): string;
}

export interface DeviceProcessTaskProvider {
  run(host: NuclideUri, device: DeviceIdType, proc: Process): Promise<void>;
  getTaskType(): ProcessTaskType;
  getType(): string;
  getSupportedPIDs(
    host: NuclideUri,
    device: DeviceIdType,
    procs: Process[],
  ): Observable<Set<number>>;
  getName(): string;
}

export interface DeviceAppInfoProvider {
  observe(host: NuclideUri, device: DeviceIdType): Observable<string>;
  getName(): string;
  getType(): string;
  getProcessName(): string;
  getAppName(): string;
  canUpdate(): boolean;
  update(value: string): Promise<void>;
}

export type DeviceAction = {
  name: string,
  callback: (device: Device) => void,
};

export interface DeviceActionProvider {
  getActionsForDevice(device: Device): Array<DeviceAction>;
}

export type ComponentPosition = 'host_selector' | 'above_table' | 'below_table';

export type DeviceTypeComponent = {
  position: ComponentPosition,
  type: React$ComponentType<any>,
  key: string,
};

export interface DeviceTypeComponentProvider {
  getType(): string;
  observe(
    host: NuclideUri,
    callback: (?DeviceTypeComponent) => void,
  ): IDisposable;
}

//
// Store
//

export type AppState = {
  hosts: NuclideUri[],
  host: NuclideUri,
  devices: Expected<Device[]>,
  deviceType: ?string,
  deviceTypes: string[],
  device: ?Device,
  infoTables: Expected<Map<string, Map<string, string>>>,
  appInfoTables: Expected<Map<string, Array<AppInfoRow>>>,
  processes: Expected<Process[]>,
  processTasks: ProcessTask[],
  deviceTasks: IDeviceTask[],
  isDeviceConnected: boolean,
  deviceTypeTasks: IDeviceTask[],
  isPollingDevices: boolean,
  deviceTypeComponents: Immutable.Map<
    ComponentPosition,
    Immutable.List<DeviceTypeComponent>,
  >,
};

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
};

//
// Basic objects
//

export type DeviceArchitecture = 'x86' | 'x86_64' | 'arm' | 'arm64' | '';

export type Device = {|
  name: string,
  port: number,
  displayName: string,
  architecture: DeviceArchitecture,
  rawArchitecture: string,
  ignoresSelection?: boolean,
|};

export type Process = {
  user: string,
  pid: number,
  name: string,
  cpuUsage: ?number,
  memUsage: ?number,
  isJava: boolean,
};

export type ProcessTaskType = 'KILL' | 'DEBUG';

export type ProcessTask = {
  type: ProcessTaskType,
  run: (proc: Process) => Promise<void>,
  isSupported: (proc: Process) => boolean,
  name: string,
};

export type AppInfoRow = {
  appName: string,
  name: string,
  value: string,
  isError?: boolean,
};

//
// Action types
//

export type SetDevicesAction = {
  type: 'SET_DEVICES',
  payload: {
    devices: Expected<Device[]>,
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

export type SetAppInfoTablesAction = {
  type: 'SET_APP_INFO_TABLES',
  payload: {
    appInfoTables: Map<string, Array<AppInfoRow>>,
  },
};

export type SetProcessesAction = {
  type: 'SET_PROCESSES',
  payload: {
    processes: Process[],
  },
};

export type SetProcessTasksAction = {
  type: 'SET_PROCESS_TASKS',
  payload: {
    processTasks: ProcessTask[],
  },
};

export type SetDeviceTasksAction = {
  type: 'SET_DEVICE_TASKS',
  payload: {
    deviceTasks: IDeviceTask[],
  },
};

export type ToggleDevicePollingAction = {
  type: 'TOGGLE_DEVICE_POLLING',
  payload: {
    isActive: boolean,
  },
};

export type ToggleProcessPollingAction = {
  type: 'TOGGLE_PROCESS_POLLING',
  payload: {
    isActive: boolean,
  },
};

export type SetDeviceTypeTasksAction = {
  type: 'SET_DEVICE_TYPE_TASKS',
  payload: {
    deviceTypeTasks: IDeviceTask[],
  },
};

export type SetDeviceTypeComponentsAction = {
  type: 'SET_DEVICE_TYPE_COMPONENTS',
  payload: {
    components: Immutable.Map<
      ComponentPosition,
      Immutable.List<DeviceTypeComponent>,
    >,
  },
};

export type Action =
  | ToggleDevicePollingAction
  | ToggleProcessPollingAction
  | SetHostAction
  | SetHostsAction
  | SetDevicesAction
  | SetDeviceTypeAction
  | SetDeviceTypesAction
  | SetInfoTablesAction
  | SetAppInfoTablesAction
  | SetProcessesAction
  | SetProcessTasksAction
  | SetDeviceTasksAction
  | SetDeviceTypeTasksAction
  | SetDeviceAction
  | SetDeviceTypeComponentsAction;
