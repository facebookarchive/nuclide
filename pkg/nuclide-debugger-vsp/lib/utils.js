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
import type {IProcessConfig, VsAdapterType} from 'nuclide-debugger-common';
import type {
  AutoGenConfig,
  AutoGenLaunchConfig,
} from 'nuclide-debugger-common/types';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {VsAdapterTypes, VspProcessInfo} from 'nuclide-debugger-common';
import {getNodeBinaryPath} from '../../commons-node/node-info';

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
  const {adapterExecutable} = configuration;
  if (adapterExecutable == null) {
    throw new Error('Cannot resolve configuration for unset adapterExecutable');
  } else if (adapterExecutable.command === 'node') {
    adapterExecutable.command = await getNodeBinaryPath(
      configuration.targetUri,
    );
  } else if (adapterExecutable.command === 'lldb-vscode') {
    adapterExecutable.command = await lldbVspAdapterWrapperPath(
      configuration.targetUri,
    );
  }
  return configuration;
}

export async function getNativeVSPLaunchProcessInfo(
  adapter: VsAdapterType,
  program: NuclideUri,
  args: VspNativeDebuggerLaunchBuilderParms,
): Promise<VspProcessInfo> {
  return new VspProcessInfo(
    program,
    'launch',
    adapter,
    null,
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
  return new VspProcessInfo(targetUri, 'attach', adapter, null, args, {
    threads: true,
  });
}
