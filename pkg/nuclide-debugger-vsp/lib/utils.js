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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  VSAdapterExecutableInfo,
  VsAdapterType,
} from 'nuclide-debugger-common';
import type {
  AutoGenConfig,
  AutoGenAttachConfig,
  AutoGenLaunchConfig,
  NativeVsAdapterType,
  ResolveAdapterExecutable,
} from 'nuclide-debugger-common/types';
import type {ReactNativeAttachArgs, ReactNativeLaunchArgs} from './types';

import * as React from 'react';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {VsAdapterTypes, VspProcessInfo} from 'nuclide-debugger-common';

export const REACT_NATIVE_PACKAGER_DEFAULT_PORT = 8081;

export type VspNativeDebuggerLaunchBuilderParms = {
  args: Array<string>,
  cwd: string,
  env: Array<string>,
  sourcePath: string,
};

export type VspNativeDebuggerAttachBuilderParms = {
  pid?: number,
  sourcePath: string,
};

export function getPrepackAutoGenConfig(): AutoGenConfig {
  const fileToPrepack = {
    name: 'sourceFile',
    type: 'string',
    description: 'Input the file you want to Prepack',
    required: true,
    visible: true,
  };
  const prepackRuntimePath = {
    name: 'prepackRuntime',
    type: 'string',
    description:
      'Prepack executable path (e.g. lib/prepack-cli.js). Will use default prepack command if not provided',
    required: false,
    visible: true,
  };
  const argumentsProperty = {
    name: 'prepackArguments',
    type: 'array',
    itemType: 'string',
    description: 'Arguments to start Prepack',
    required: false,
    defaultValue: '',
    visible: true,
  };

  const autoGenLaunchConfig: AutoGenLaunchConfig = {
    launch: true,
    vsAdapterType: VsAdapterTypes.PREPACK,
    threads: false,
    properties: [fileToPrepack, prepackRuntimePath, argumentsProperty],
    scriptPropertyName: 'fileToPrepack',
    scriptExtension: '.js',
    cwdPropertyName: null,
    header: null,
  };
  return {
    launch: autoGenLaunchConfig,
    attach: null,
  };
}

async function lldbVspAdapterWrapperPath(program: string): Promise<string> {
  try {
    // $FlowFB
    return require('./fb-LldbVspAdapterPath').getLldbVspAdapterPath(program);
  } catch (ex) {
    return 'lldb-vscode';
  }
}

export function getNativeAutoGenConfig(
  vsAdapterType: NativeVsAdapterType,
): AutoGenConfig {
  const program = {
    name: 'program',
    type: 'string',
    description: 'Input the program/executable you want to launch',
    required: true,
    visible: true,
  };
  const cwd = {
    name: 'cwd',
    type: 'string',
    description: 'Working directory for the launched executable',
    required: true,
    visible: true,
  };
  const args = {
    name: 'args',
    type: 'array',
    itemType: 'string',
    description: 'Arguments to the executable',
    required: false,
    defaultValue: '',
    visible: true,
  };
  const env = {
    name: 'env',
    type: 'array',
    itemType: 'string',
    description: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)',
    required: false,
    defaultValue: '',
    visible: true,
  };
  const sourcePath = {
    name: 'sourcePath',
    type: 'string',
    description: 'Optional base path for sources',
    required: false,
    defaultValue: '',
    visible: true,
  };

  const resolveAdapterExecutable: ResolveAdapterExecutable = (
    adapter: VsAdapterType,
    targetUri: NuclideUri,
  ) => {
    return getNativeVSPAdapterExecutable(vsAdapterType, targetUri);
  };

  const autoGenLaunchConfig: AutoGenLaunchConfig = {
    launch: true,
    vsAdapterType,
    threads: true,
    properties: [program, cwd, args, env, sourcePath],
    scriptPropertyName: 'program',
    scriptExtension: '.c',
    cwdPropertyName: 'working directory',
    header: (
      <p>This is intended to debug native programs with either gdb or lldb.</p>
    ),
    resolveAdapterExecutable,
  };

  const pid = {
    name: 'pid',
    type: 'process',
    description: '',
    required: true,
    visible: true,
  };
  const autoGenAttachConfig: AutoGenAttachConfig = {
    launch: false,
    vsAdapterType,
    threads: true,
    properties: [pid, sourcePath],
    header: <p>Attach to a running native process</p>,
    resolveAdapterExecutable,
  };
  return {
    launch: autoGenLaunchConfig,
    attach: autoGenAttachConfig,
  };
}

async function getNativeVSPAdapterExecutable(
  adapter: VsAdapterType,
  program: string,
): Promise<?VSAdapterExecutableInfo> {
  if (adapter === 'native_gdb') {
    return null;
  }

  const adapterInfo = {
    command: await lldbVspAdapterWrapperPath(program),
    args: [],
  };

  return adapterInfo;
}

export async function getNativeVSPLaunchProcessInfo(
  adapter: VsAdapterType,
  program: NuclideUri,
  args: VspNativeDebuggerLaunchBuilderParms,
): Promise<VspProcessInfo> {
  const adapterInfo = await getNativeVSPAdapterExecutable(adapter, program);
  return new VspProcessInfo(
    program,
    'launch',
    adapter,
    adapterInfo,
    {
      program: nuclideUri.getPath(program),
      ...args,
    },
    {threads: true},
  );
}

export async function getNativeVSPAttachProcessInfo(
  adapter: VsAdapterType,
  targetUri: NuclideUri,
  args: VspNativeDebuggerAttachBuilderParms,
): Promise<VspProcessInfo> {
  const adapterInfo = await getNativeVSPAdapterExecutable(adapter, targetUri);
  return new VspProcessInfo(targetUri, 'attach', adapter, adapterInfo, args, {
    threads: true,
  });
}

export async function getReactNativeAttachProcessInfo(
  args: ReactNativeAttachArgs,
): Promise<VspProcessInfo> {
  return new VspProcessInfo(
    args.program,
    'attach',
    VsAdapterTypes.REACT_NATIVE,
    null,
    args,
    {threads: false},
  );
}

export async function getReactNativeLaunchProcessInfo(
  args: ReactNativeLaunchArgs,
): Promise<VspProcessInfo> {
  return new VspProcessInfo(
    args.program,
    'launch',
    VsAdapterTypes.REACT_NATIVE,
    null,
    args,
    {threads: false},
  );
}
