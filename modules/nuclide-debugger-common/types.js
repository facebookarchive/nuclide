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

import type DebuggerLaunchAttachProvider from './DebuggerLaunchAttachProvider';
import type {Observable, ConnectableObservable} from 'rxjs';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {IconName} from 'nuclide-commons-ui/Icon';
import type {ProcessMessage} from 'nuclide-commons/process';
import * as DebugProtocol from 'vscode-debugprotocol';
import * as React from 'react';

export interface IVspInstance {
  customRequest(
    request: string,
    args: any,
  ): Promise<DebugProtocol.CustomResponse>;
  observeCustomEvents(): Observable<DebugProtocol.DebugEvent>;
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
  | 'react-native'
  | 'prepack'
  | 'ocaml'
  | 'mobilejs'
  | 'native_lldb'
  | 'native_gdb';

export type NuclideDebuggerProvider = {
  name: string,
  getLaunchAttachProvider(
    connection: NuclideUri,
  ): ?DebuggerLaunchAttachProvider,
};

export type ControlButtonSpecification = {
  icon: IconName,
  title?: string,
  onClick: () => mixed,
};

// Indicates which of various optional features that this debugger supports.
export type DebuggerCapabilities = {
  +threads: boolean,
};

// Describes how to configure various properties that individual debuggers
// are allowed to override.
export type DebuggerProperties = {
  +customControlButtons: Array<ControlButtonSpecification>,
  +threadsComponentTitle: string,
};

export type IProcessConfig = {|
  +targetUri: NuclideUri,
  +debugMode: DebuggerConfigAction,
  +adapterType: VsAdapterType,
  +adapterExecutable: ?VSAdapterExecutableInfo,
  // TODO(most): deprecate
  +capabilities: DebuggerCapabilities,
  // TODO(most): deprecate
  +properties: DebuggerProperties,
  +config: Object,
  +clientPreprocessor?: ?MessageProcessor,
  +adapterPreprocessor?: ?MessageProcessor,
|};

export interface IVsAdapterSpawner {
  spawnAdapter(
    adapter: VSAdapterExecutableInfo,
  ): ConnectableObservable<ProcessMessage>;
  write(input: string): Promise<void>;
}

export type MessageProcessor = (message: Object) => void;

export type AutoGenPropertyPrimitiveType = 'string' | 'number' | 'boolean';

export type AutoGenPropertyType =
  | AutoGenPropertyPrimitiveType
  | 'array'
  | 'enum'
  | 'object'
  | 'process';

export type AutoGenProperty = {
  name: string,
  type: AutoGenPropertyType,
  itemType?: AutoGenPropertyPrimitiveType,
  description: string,
  defaultValue?: string | number | boolean,
  required: boolean,
  visible: boolean,
  enums?: string[],
  enumsDefaultValue?: string,
};

export type AutoGenLaunchConfig = {|
  // Disjoint Union Flag
  launch: true,
  // General Properties
  properties: AutoGenProperty[],
  header?: React.Node,
  threads: boolean,
  vsAdapterType: VsAdapterType,
  // Launch Specific Properties
  scriptPropertyName: string,
  cwdPropertyName: ?string,
  scriptExtension: string,
|};

export type AutoGenAttachConfig = {|
  // Disjoint Union Flag
  launch: false,
  // General Properties
  properties: AutoGenProperty[],
  header?: React.Node,
  threads: boolean,
  vsAdapterType: VsAdapterType,
  // Attach Specific Properties
|};

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
}
