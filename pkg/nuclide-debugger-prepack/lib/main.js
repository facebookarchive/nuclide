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

import type {
  AutoGenConfig,
  AutoGenLaunchConfig,
  NuclideDebuggerProvider,
} from 'nuclide-debugger-common/types';

import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {VsAdapterTypes, VsAdapterNames} from 'nuclide-debugger-common';
import {AutoGenLaunchAttachProvider} from 'nuclide-debugger-common/AutoGenLaunchAttachProvider';

class Activation {
  _subscriptions: UniversalDisposable;

  constructor() {
    this._subscriptions = new UniversalDisposable();
  }

  createDebuggerProvider(): NuclideDebuggerProvider {
    return {
      type: VsAdapterTypes.PREPACK,
      getLaunchAttachProvider: connection => {
        return new AutoGenLaunchAttachProvider(
          VsAdapterNames.PREPACK,
          connection,
          getPrepackAutoGenConfig(),
        );
      },
    };
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}

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

createPackage(module.exports, Activation);
