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
import * as React from 'react';

import createPackage from 'nuclide-commons-atom/createPackage';
import {VsAdapterTypes} from 'nuclide-debugger-common/constants';
import {generatePropertyArray} from 'nuclide-debugger-common/autogen-utils';
import AutoGenLaunchAttachProvider from 'nuclide-debugger-common/AutoGenLaunchAttachProvider';

class Activation {
  constructor() {}
  dispose() {}

  createDebuggerProvider(): NuclideDebuggerProvider {
    return {
      name: 'Node',
      getLaunchAttachProvider: connection => {
        return new AutoGenLaunchAttachProvider(
          'Node',
          connection,
          getNodeAutoGenConfig(),
        );
      },
    };
  }
}

function getNodeAutoGenConfig(): AutoGenConfig {
  const pkgJson = require('./VendorLib/vscode-node-debug2/package.json');
  const pkgJsonDescriptions = require('./VendorLib/vscode-node-debug2/package.nls.json');
  const configurationAttributes =
    pkgJson.contributes.debuggers[1].configurationAttributes;
  Object.entries(configurationAttributes.launch.properties).forEach(
    property => {
      const name = property[0];
      const descriptionSubstitution =
        configurationAttributes.launch.properties[name].description;
      if (
        descriptionSubstitution != null &&
        typeof descriptionSubstitution === 'string'
      ) {
        configurationAttributes.launch.properties[name].description =
          pkgJsonDescriptions[descriptionSubstitution.slice(1, -1)];
      }
    },
  );
  configurationAttributes.launch.properties.runtimeExecutable = {
    type: 'string',
    description:
      "Runtime to use. Either an absolute path or the name of a runtime available on the PATH. If ommitted 'node' is assumed.",
    default: '',
  };
  configurationAttributes.launch.properties.protocol = {
    type: 'string',
    description: '',
    default: 'inspector',
  };

  const launchProperties = {};
  const launchRequired = ['program', 'cwd'];
  const launchVisible = launchRequired.concat([
    'runtimeExecutable',
    'args',
    'outFiles',
    'env',
    'stopOnEntry',
  ]);
  const launchWhitelisted = new Set(
    launchVisible.concat(['protocol', 'outFiles']),
  );

  Object.entries(configurationAttributes.launch.properties)
    .filter(property => launchWhitelisted.has(property[0]))
    .forEach(property => {
      const name = property[0];
      const propertyDetails: any = property[1];
      launchProperties[name] = propertyDetails;
    });

  return {
    launch: {
      launch: true,
      vsAdapterType: VsAdapterTypes.NODE,
      threads: false,
      properties: generatePropertyArray(
        launchProperties,
        launchRequired,
        launchVisible,
      ),
      scriptPropertyName: 'program',
      cwdPropertyName: 'cwd',
      scriptExtension: '.js',
      header: (
        <p>This is intended to debug node.js files (for node version 6.3+).</p>
      ),
    },
    attach: {
      launch: false,
      vsAdapterType: VsAdapterTypes.NODE,
      threads: false,
      properties: [
        {
          name: 'port',
          type: 'number',
          description: 'Port',
          required: true,
          visible: true,
        },
      ],
      header: <p>Attach to a running node.js process</p>,
    },
  };
}

createPackage(module.exports, Activation);
