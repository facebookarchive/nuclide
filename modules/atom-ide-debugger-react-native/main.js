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

import type {
  AutoGenConfig,
  NuclideDebuggerProvider,
  DebuggerConfigurationProvider,
  AutoGenProperty,
  IProcessConfig,
} from 'nuclide-debugger-common/types';

import createPackage from 'nuclide-commons-atom/createPackage';
import nuclideUri from 'nuclide-commons/nuclideUri';
import AutoGenLaunchAttachProvider from 'nuclide-debugger-common/AutoGenLaunchAttachProvider';
import {VsAdapterTypes} from 'nuclide-debugger-common/constants';

class Activation {
  constructor() {}
  dispose() {}

  createDebuggerProvider(): NuclideDebuggerProvider {
    return {
      name: 'React Native',
      getLaunchAttachProvider: connection => {
        return new AutoGenLaunchAttachProvider(
          'React Native',
          connection,
          getReactNativeConfig(),
        );
      },
    };
  }

  createDebuggerConfigurator(): DebuggerConfigurationProvider {
    return {
      resolveConfiguration,
    };
  }
}

function _deriveProgramFromWorkspace(workspacePath: string): string {
  return nuclideUri.getPath(
    nuclideUri.join(workspacePath, '.vscode', 'launchReactNative.js'),
  );
}

function _deriveOutDirFromWorkspace(workspacePath: string): string {
  return nuclideUri.getPath(
    nuclideUri.join(workspacePath, '.vscode', '.react'),
  );
}

function getReactNativeConfig(): AutoGenConfig {
  const workspace = {
    name: 'workspace',
    type: 'string',
    description: 'Absolute path containing package.json',
    required: true,
    visible: true,
  };
  const sourceMaps = {
    name: 'sourceMaps',
    type: 'boolean',
    description:
      'Whether to use JavaScript source maps to map the generated bundled code back to its original sources',
    defaultValue: false,
    required: false,
    visible: true,
  };
  const outDir = {
    name: 'outDir',
    type: 'string',
    description:
      'The location of the generated JavaScript code (the bundle file). Normally this should be "${workspaceRoot}/.vscode/.react"',
    required: false,
    visible: true,
  };
  const sourceMapPathOverrides = {
    name: 'sourceMapPathOverrides',
    type: 'json',
    description:
      'A set of mappings for rewriting the locations of source files from what the sourcemap says, to their locations on disk. See README for details.',
    defaultValue: '{}',
    required: false,
    visible: true,
  };
  const port = {
    name: 'port',
    type: 'number',
    description: 'Debug port to attach to. Default is 8081.',
    defaultValue: '8081',
    required: false,
    visible: true,
  };

  const attachProperties: AutoGenProperty[] = [
    workspace,
    sourceMaps,
    outDir,
    sourceMapPathOverrides,
    port,
  ];

  const platform = {
    name: 'platform',
    type: 'enum',
    enums: ['ios', 'android'],
    description: '',
    defaultValue: 'ios',
    required: true,
    visible: true,
  };
  const target = {
    name: 'target',
    type: 'enum',
    enums: ['simulator', 'device'],
    description: '',
    defaultValue: 'simulator',
    required: true,
    visible: true,
  };

  const launchProperties = [platform, target].concat(attachProperties);

  return {
    launch: {
      launch: true,
      vsAdapterType: VsAdapterTypes.REACT_NATIVE,
      threads: false,
      properties: launchProperties,
      scriptPropertyName: null,
      cwdPropertyName: 'workspace',
      scriptExtension: '.js',
      header: null,
    },
    attach: {
      launch: false,
      vsAdapterType: VsAdapterTypes.REACT_NATIVE,
      threads: false,
      properties: attachProperties,
      cwdPropertyName: 'workspace',
      scriptExtension: '.js',
      header: null,
    },
  };
}

export async function resolveConfiguration(
  configuration: IProcessConfig,
): Promise<IProcessConfig> {
  const {adapterType, config} = configuration;
  if (adapterType === VsAdapterTypes.REACT_NATIVE) {
    if (config.outDir == null) {
      config.outDir = _deriveOutDirFromWorkspace(config.workspace);
    }
    config.program = _deriveProgramFromWorkspace(config.workspace);
    delete config.workspace;
  }
  return configuration;
}

createPackage(module.exports, Activation);
