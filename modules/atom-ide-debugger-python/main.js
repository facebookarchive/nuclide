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
} from 'nuclide-debugger-common/types';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as React from 'react';

import createPackage from 'nuclide-commons-atom/createPackage';
import {VsAdapterTypes} from 'nuclide-debugger-common/constants';
import {generatePropertyArray} from 'nuclide-debugger-common/autogen-utils';
import AutoGenLaunchAttachProvider from 'nuclide-debugger-common/AutoGenLaunchAttachProvider';
import {listenToRemoteDebugCommands, setRpcService} from './utils';

export const NUCLIDE_PYTHON_DEBUGGER_DEX_URI =
  'https://our.intern.facebook.com/intern/dex/python-and-fbcode/debugging/#nuclide';

class Activation {
  _subscriptions: UniversalDisposable;

  constructor() {
    this._subscriptions = new UniversalDisposable(
      listenToRemoteDebugCommands(),
    );
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeRpcService(rpcService: nuclide$RpcService): IDisposable {
    return setRpcService(rpcService);
  }

  createDebuggerProvider(): NuclideDebuggerProvider {
    return {
      name: 'Python',
      getLaunchAttachProvider: connection => {
        return new AutoGenLaunchAttachProvider(
          'Python',
          connection,
          getPythonAutoGenConfig(),
        );
      },
    };
  }
}

export function getPythonAutoGenConfig(): AutoGenConfig {
  const pkgJson = require('./VendorLib/vs-py-debugger/package.json');
  const configurationAttributes =
    pkgJson.contributes.debuggers[0].configurationAttributes;
  configurationAttributes.launch.properties.pythonPath.description =
    'Path (fully qualified) to python executable.';
  const launchProperties = {};
  const launchRequired = ['pythonPath', 'program', 'cwd'];
  const launchVisible = launchRequired.concat(['args', 'env', 'stopOnEntry']);
  const launchWhitelisted = new Set(
    launchVisible.concat(['console', 'debugOptions']),
  );

  Object.entries(configurationAttributes.launch.properties)
    .filter(property => launchWhitelisted.has(property[0]))
    .forEach(property => {
      const name = property[0];
      const propertyDetails: any = property[1];
      // TODO(goom): replace the indexOf '$' stuff with logic that accesses settings
      if (
        propertyDetails.default != null &&
        typeof propertyDetails.default === 'string' &&
        propertyDetails.default.indexOf('$') === 0
      ) {
        delete propertyDetails.default;
      }
      launchProperties[name] = propertyDetails;
    });

  return {
    launch: {
      launch: true,
      vsAdapterType: VsAdapterTypes.PYTHON,
      threads: true,
      properties: generatePropertyArray(
        launchProperties,
        launchRequired,
        launchVisible,
      ),
      scriptPropertyName: 'program',
      scriptExtension: '.py',
      cwdPropertyName: 'cwd',
      header: (
        <p>
          This is intended to debug python script files.
          <br />
          To debug buck targets, you should{' '}
          <a href={NUCLIDE_PYTHON_DEBUGGER_DEX_URI}>
            use the buck toolbar instead
          </a>.
        </p>
      ),
    },
    attach: null,
  };
}

createPackage(module.exports, Activation);
