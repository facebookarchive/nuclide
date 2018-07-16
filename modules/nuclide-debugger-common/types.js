/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {SuggestedProjectPath} from 'atom-ide-debugger-java/types';
import type {ISession} from 'atom-ide-ui/pkg/atom-ide-debugger/lib/types';
import type UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import type {TaskEvent, ProcessMessage} from 'nuclide-commons/process';
import type {Expected} from 'nuclide-commons/expected';
import type DebuggerLaunchAttachProvider from './DebuggerLaunchAttachProvider';
import type {Observable, ConnectableObservable} from 'rxjs';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {IconName} from 'nuclide-commons-ui/Icon';
import * as DebugProtocol from 'vscode-debugprotocol';
import * as React from 'react';

export interface IVspInstance {
  customRequest(
    request: string,
    args: any,
  ): Promise<DebugProtocol.CustomResponse>;
  observeCustomEvents(): Observable<DebugProtocol.DebugEvent>;
  addCustomDisposable(disposable: IDisposable): void;
}

export type AtomNotificationType = 'info' | 'warning' | 'error' | 'fatalError';

export type DebuggerConfigAction = 'launch' | 'attach';

export type VSAdapterExecutableInfo = {
  command: string,
  args: Array<string>,
};

export type NativeVsAdapterType = 'native_lldb' | 'native_gdb';

export type VsAdapterType =
  | 'hhvm'
  | 'python'
  | 'node'
  | 'java'
  | 'java_android'
  | 'react-native'
  | 'prepack'
  | 'ocaml'
  | 'mobilejs'
  | 'native_lldb'
  | 'native_gdb';

export type NuclideDebuggerProvider = {
  type: VsAdapterType,
  getLaunchAttachProvider(
    connection: NuclideUri,
  ): ?DebuggerLaunchAttachProvider,
};

export type ControlButtonSpecification = {
  icon: IconName,
  title?: string,
  onClick: () => mixed,
};

export type IProcessConfig = {|
  +targetUri: NuclideUri,
  +debugMode: DebuggerConfigAction,
  +adapterType: VsAdapterType,
  +adapterExecutable?: ?VSAdapterExecutableInfo,
  +config: Object,
  +clientPreprocessor?: ?MessageProcessor,
  +adapterPreprocessor?: ?MessageProcessor,
  +customDisposable?: UniversalDisposable,
  +onInitializeCallback?: (session: ISession) => Promise<void>,
  +processName?: string,
  +customControlButtons?: Array<ControlButtonSpecification>,
  +threadsComponentTitle?: string,
  +showThreads?: boolean,
|};

export interface IVsAdapterSpawner {
  spawnAdapter(
    adapter: VSAdapterExecutableInfo,
  ): ConnectableObservable<ProcessMessage>;
  write(input: string): Promise<void>;
}

export type MessageProcessor = (message: Object) => void;

export type AutoGenPropertyPrimitiveType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'path';

export type AutoGenPropertyType =
  | AutoGenPropertyPrimitiveType
  | 'array'
  | 'enum'
  | 'object'
  | 'json'
  | 'deviceAndPackage'
  | 'deviceAndProcess'
  | 'selectSources'
  | 'process';

export type AutoGenProperty = {
  name: string,
  type: AutoGenPropertyType,
  itemType?: AutoGenPropertyPrimitiveType,
  description: string,
  defaultValue?: any,
  required: boolean,
  visible: boolean,
  enums?: string[],
  enumsDefaultValue?: string,
};

export type ResolveConfig = (config: Object) => Promise<void>;

type AutoGenLaunchOrAttachConfigBase = {
  // General Properties
  properties: AutoGenProperty[],
  threads: boolean,
  vsAdapterType: VsAdapterType,
  cwdPropertyName?: ?string,
  scriptExtension?: string,
  scriptPropertyName?: ?string,
  header?: React.Node,
  // If you want to overwrite the previously saved parameters,
  // set this flag to true and pass in the new values as the defaultValue in the config.
  ignorePreviousParams?: ?boolean,
  getProcessName: (values: Object) => string,
};

export type AutoGenLaunchConfig = AutoGenLaunchOrAttachConfigBase & {
  // Disjoint Union Flag
  launch: true,
  // Launch Specific Properties
};

export type AutoGenAttachConfig = AutoGenLaunchOrAttachConfigBase & {
  // Disjoint Union Flag
  launch: false,
  // General Properties
  // Attach Specific Properties
};

export type AutoGenLaunchOrAttachConfig =
  | AutoGenLaunchConfig
  | AutoGenAttachConfig;

export type AutoGenConfig = {|
  launch: ?AutoGenLaunchConfig,
  attach: ?AutoGenAttachConfig,
|};

export type LaunchAttachProviderIsEnabled = (
  action: DebuggerConfigAction,
  config: AutoGenConfig,
) => Promise<boolean>;

export interface DebuggerConfigurationProvider {
  resolveConfiguration(configuration: IProcessConfig): Promise<IProcessConfig>;
  adapterType: VsAdapterType;
}

export interface DebuggerPathResolverProvider {
  resolvePath(project: string, filePath: string): Promise<string>;
}

//
// Device Panel Types
//

//
// Task interface
//

export interface Task {
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
  registerDeviceTaskProvider: (provider: DeviceTaskProvider) => IDisposable,
  registerProcessTaskProvider: (
    provider: DeviceProcessTaskProvider,
  ) => IDisposable,
  registerDeviceTypeTaskProvider: (
    provider: DeviceTypeTaskProvider,
  ) => IDisposable,
  registerAppInfoProvider: (provider: DeviceAppInfoProvider) => IDisposable,
  registerDeviceTypeComponentProvider: (
    provider: DeviceTypeComponentProvider,
  ) => IDisposable,
};

export interface DeviceListProvider {
  observe(host: NuclideUri): Observable<Expected<Array<Device>>>;
  getType(): string;
}

export interface DeviceInfoProvider {
  fetch(host: NuclideUri, device: Device): Observable<Map<string, string>>;
  getType(): string;
  getTitle(): string;
  getPriority(): number;
  isSupported(host: NuclideUri): Observable<boolean>;
}

export interface DeviceProcessesProvider {
  observe(host: NuclideUri, device: Device): Observable<Process[]>;
  getType(): string;
}

export type DeviceTask = {
  getEvents: () => Observable<TaskEvent>,
  getName: () => string,
};

export interface DeviceTaskProvider {
  getDeviceTasks(
    host: NuclideUri,
    device: Device,
  ): Observable<Array<DeviceTask>>;
  getType(): string;
}

export interface DeviceTypeTaskProvider {
  getDeviceTypeTask(host: NuclideUri): Observable<TaskEvent>;
  getName(): string;
  getType(): string;
}

export interface DeviceProcessTaskProvider {
  run(host: NuclideUri, device: Device, proc: Process): Promise<void>;
  getTaskType(): ProcessTaskType;
  getType(): string;
  getSupportedPIDs(
    host: NuclideUri,
    device: Device,
    procs: Process[],
  ): Observable<Set<number>>;
  getName(): string;
}

export interface DeviceAppInfoProvider {
  observe(host: NuclideUri, device: Device): Observable<string>;
  getName(): string;
  getType(): string;
  getProcessName(): string;
  getAppName(): string;
  canUpdate(): boolean;
  update(value: string): Promise<void>;
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
// Basic objects
//

export type Device = {|
  // Must be unique within platform, not shown to user
  identifier: string,
  // Used to display in all UI
  displayName: string,
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

export interface DebuggerSourcePathsService {
  addKnownJavaSubdirectoryPaths(
    remote: boolean,
    translatedPath: string,
    searchPaths: Array<string>,
  ): void;

  observeSuggestedAndroidProjectPaths(
    callback: (Array<SuggestedProjectPath>) => void,
  ): IDisposable;
}
