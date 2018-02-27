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

import nuclideUri from 'nuclide-commons/nuclideUri';

import type {VSAdapterExecutableInfo} from 'nuclide-debugger-common';

export type Adapter =
  | 'node'
  | 'python'
  | 'prepack'
  | 'react-native'
  | 'ocaml'
  | 'native'
  | 'hhvm'
  | 'php-xdebug';

type AdapterInfo = {
  executable: VSAdapterExecutableInfo,
  root: string,
};

const _adapters: Map<Adapter, AdapterInfo> = new Map([
  [
    'node',
    {
      executable: {
        command: 'node',
        args: [
          nuclideUri.join(
            __dirname,
            'VendorLib/vscode-node-debug2/out/src/nodeDebug.js',
          ),
        ],
      },
      root: nuclideUri.join(__dirname, 'VendorLib/vscode-node-debug2'),
    },
  ],
  [
    'python',
    {
      executable: {
        command: 'node',
        args: [
          nuclideUri.join(
            __dirname,
            'VendorLib/vs-py-debugger/out/client/debugger/Main.js',
          ),
        ],
      },
      root: nuclideUri.join(__dirname, 'VendorLib/vs-py-debugger'),
    },
  ],
  [
    'react-native',
    {
      executable: {
        command: 'node',
        args: [
          nuclideUri.join(
            __dirname,
            'VendorLib/vscode-react-native/out/debugger/reactNativeDebugEntryPoint.js',
          ),
        ],
      },
      root: nuclideUri.join(__dirname, 'VendorLib/vscode-react-native'),
    },
  ],
  [
    'prepack',
    {
      executable: {
        command: 'node',
        args: [
          nuclideUri.join(
            __dirname,
            'VendorLib/vscode-prepack/adapter/DebugAdapter.js',
          ),
        ],
      },
      root: nuclideUri.join(__dirname, 'VendorLib/vscode-prepack'),
    },
  ],
  [
    'ocaml',
    {
      executable: {
        command: 'node',
        args: [
          nuclideUri.join(__dirname, 'vscode-ocaml/vscode-debugger-entry.js'),
        ],
      },
      root: nuclideUri.join(__dirname, 'vscode-ocaml'),
    },
  ],
  [
    'native',
    {
      executable: {
        command: 'node',
        args: [
          nuclideUri.join(
            __dirname,
            'fb-native-debugger-vsp/src/RunTranspiledServer.js',
          ),
        ],
      },
      root: nuclideUri.join(__dirname, 'fb-native-debugger-vsp/src'),
    },
  ],
  [
    'hhvm',
    {
      executable: {
        command: 'node',
        args: [
          nuclideUri.join(
            __dirname,
            '../../pkg/nuclide-debugger-hhvm-rpc/lib/hhvmWrapper.js',
          ),
        ],
      },
      root: nuclideUri.join(__dirname, '../../pkg/nuclide-debugger-hhvm-rpc'),
    },
  ],
  [
    'php-xdebug',
    {
      executable: {
        command: 'node',
        args: [
          nuclideUri.join(
            __dirname,
            '../../pkg/nuclide-debugger-php-rpc/lib/vscode/hhvmDebugger.js',
          ),
        ],
      },
      root: nuclideUri.join(__dirname, '../../pkg/nuclide-debugger-php-rpc'),
    },
  ],
]);

export function getAdapterExecutable(
  adapter: Adapter,
): VSAdapterExecutableInfo {
  const adapterInfo = _adapters.get(adapter);
  if (adapterInfo == null) {
    throw new Error(`Cannot find VSP for given adapter type ${adapter}`);
  }
  return adapterInfo.executable;
}

export function getAdapterPackageRoot(adapter: Adapter): string {
  const adapterInfo = _adapters.get(adapter);
  if (adapterInfo == null) {
    throw new Error(`Cannot find VSP for given adapter type ${adapter}`);
  }
  return adapterInfo.root;
}
