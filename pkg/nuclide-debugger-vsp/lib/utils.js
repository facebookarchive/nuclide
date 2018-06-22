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
  DebuggerSourcePathsService,
  IProcessConfig,
  VsAdapterType,
} from 'nuclide-debugger-common';
import type {
  AutoGenConfig,
  AutoGenLaunchConfig,
  NativeVsAdapterType,
  AutoGenAttachConfig,
} from 'nuclide-debugger-common/types';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {
  VsAdapterTypes,
  getVSCodeDebuggerAdapterServiceByNuclideUri,
} from 'nuclide-debugger-common';
import * as React from 'react';

let _sourcePathsService: ?DebuggerSourcePathsService;

export type VspNativeDebuggerLaunchBuilderParms = {
  args: Array<string>,
  cwd: string,
  env: Array<string>,
  sourcePath: string,
};

export type VspNativeDebuggerAttachBuilderParms = {
  pid?: number,
  sourcePath: string,
  stopCommands?: Array<string>,
};

export function getPrepackAutoGenConfig(): AutoGenConfig {
  const fileToPrepack = {
    name: 'sourceFile',
    type: 'string',
    description: 'Input the file you want to Prepack. Use absolute paths.',
    required: true,
    visible: true,
  };
  const prepackRuntimePath = {
    name: 'prepackRuntime',
    type: 'string',
    description:
      'Prepack executable path (e.g. lib/prepack-cli.js). Use absolute paths.',
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
    getProcessName(values) {
      return values.fileToPrepack + ' (Prepack)';
    },
  };
  return {
    launch: autoGenLaunchConfig,
    attach: null,
  };
}

async function lldbVspAdapterWrapperPath(program: NuclideUri): Promise<string> {
  try {
    // $FlowFB
    return require('./fb-LldbVspAdapterPath').getLldbVspAdapterPath(program);
  } catch (ex) {
    return 'lldb-vscode';
  }
}

export async function resolveConfiguration(
  configuration: IProcessConfig,
): Promise<IProcessConfig> {
  const {adapterExecutable, targetUri} = configuration;
  if (adapterExecutable == null) {
    throw new Error('Cannot resolve configuration for unset adapterExecutable');
  }

  const debuggerService = getVSCodeDebuggerAdapterServiceByNuclideUri(
    configuration.targetUri,
  );
  let sourcePath = configuration.config.sourcePath;

  if (sourcePath == null || sourcePath.trim() === '') {
    if (configuration.debugMode === 'launch') {
      sourcePath = await debuggerService.getBuckRootFromUri(
        configuration.config.program,
      );
    } else if (configuration.config.pid != null) {
      sourcePath = await debuggerService.getBuckRootFromPid(
        configuration.config.pid,
      );
    }
  }

  const config = configuration.config;
  if (sourcePath != null && sourcePath.trim() !== '') {
    const canonicalSourcePath = await debuggerService.realpath(sourcePath);
    const sourcePaths: Array<string> = [];

    if (_sourcePathsService != null) {
      _sourcePathsService.addKnownNativeSubdirectoryPaths(
        canonicalSourcePath,
        sourcePaths,
      );
    } else {
      sourcePaths.push(sourcePath);
    }

    config.sourceMap = sourcePaths.map(path => ['.', path]);
  }

  adapterExecutable.command = await lldbVspAdapterWrapperPath(targetUri);

  const newConfig = {
    ...configuration,
    config,
    adapterExecutable,
  };

  return newConfig;
}

export function getNativeAutoGenConfig(
  vsAdapterType: NativeVsAdapterType,
): AutoGenConfig {
  const program = {
    name: 'program',
    type: 'path',
    description: 'Input the program/executable you want to launch',
    required: true,
    visible: true,
  };
  const cwd = {
    name: 'cwd',
    type: 'path',
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
    type: 'path',
    description: 'Optional base path for sources',
    required: false,
    defaultValue: '',
    visible: true,
  };

  const debugTypeMessage = `using ${
    vsAdapterType === VsAdapterTypes.NATIVE_GDB ? 'gdb' : 'lldb'
  }`;

  const autoGenLaunchConfig: AutoGenLaunchConfig = {
    launch: true,
    vsAdapterType,
    threads: true,
    properties: [program, cwd, args, env, sourcePath],
    scriptPropertyName: 'program',
    cwdPropertyName: 'working directory',
    header: <p>Debug native programs {debugTypeMessage}.</p>,
    getProcessName(values) {
      let processName = values.program;
      const lastSlash = processName.lastIndexOf('/');
      if (lastSlash >= 0) {
        processName = processName.substring(lastSlash + 1, processName.length);
      }
      processName += ' (' + debugTypeMessage + ')';
      return processName;
    },
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
    header: <p>Attach to a running native process {debugTypeMessage}</p>,
    getProcessName(values) {
      return 'Pid: ' + values.pid + ' (' + debugTypeMessage + ')';
    },
  };
  return {
    launch: autoGenLaunchConfig,
    attach: autoGenAttachConfig,
  };
}

export function getNativeVSPLaunchProcessConfig(
  adapterType: VsAdapterType,
  program: NuclideUri,
  config: VspNativeDebuggerLaunchBuilderParms,
): IProcessConfig {
  return {
    targetUri: program,
    debugMode: 'launch',
    adapterType,
    config: {
      program: nuclideUri.getPath(program),
      ...config,
    },
  };
}

export function getNativeVSPAttachProcessConfig(
  adapterType: VsAdapterType,
  targetUri: NuclideUri,
  config: VspNativeDebuggerAttachBuilderParms,
): IProcessConfig {
  return {
    targetUri,
    debugMode: 'attach',
    adapterType,
    config,
  };
}

export function setSourcePathsService(
  sourcePathsService: DebuggerSourcePathsService,
): void {
  _sourcePathsService = sourcePathsService;
}
