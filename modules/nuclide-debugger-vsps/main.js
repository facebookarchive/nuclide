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

import type {
  VSAdapterExecutableInfo,
  VsAdapterType,
} from 'nuclide-debugger-common';

type AdapterInfo = {
  executable: VSAdapterExecutableInfo,
  root: string,
};

const _adapters: Map<VsAdapterType, AdapterInfo> = new Map([
  [
    'node',
    {
      executable: {
        command: 'node',
        args: [
          nuclideUri.join(
            __dirname,
            '../atom-ide-debugger-node/VendorLib/vscode-node-debug2/out/src/nodeDebug.js',
          ),
        ],
      },
      root: nuclideUri.join(
        __dirname,
        '../atom-ide-debugger-node/VendorLib/vscode-node-debug2',
      ),
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
            '../atom-ide-debugger-python/VendorLib/vs-py-debugger/out/client/debugger/Main.js',
          ),
        ],
      },
      root: nuclideUri.join(
        __dirname,
        '../atom-ide-debugger-python/VendorLib/vs-py-debugger',
      ),
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
          nuclideUri.join(
            __dirname,
            '../atom-ide-debugger-ocaml/lib/vscode-debugger-entry.js',
          ),
        ],
      },
      root: nuclideUri.join(__dirname, '../atom-ide-debugger-ocaml'),
    },
  ],
  [
    'native_gdb',
    {
      executable: {
        command: 'node',
        args: [
          nuclideUri.join(
            __dirname,
            'fb-native-debugger-gdb-vsp/src/RunTranspiledServer.js',
          ),
        ],
      },
      root: nuclideUri.join(__dirname, 'fb-native-debugger-gdb-vsp'),
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
]);

export function getAdapterExecutable(
  adapter: VsAdapterType,
): VSAdapterExecutableInfo {
  const adapterInfo = _adapters.get(adapter);
  if (adapterInfo == null) {
    throw new Error(`Cannot find VSP for given adapter type ${adapter}`);
  }
  return adapterInfo.executable;
}

export function getAdapterPackageRoot(adapter: VsAdapterType): string {
  const adapterInfo = _adapters.get(adapter);
  if (adapterInfo == null) {
    throw new Error(`Cannot find VSP for given adapter type ${adapter}`);
  }
  return adapterInfo.root;
}
