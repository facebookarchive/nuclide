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

import type {VSAdapterExecutableInfo} from 'nuclide-debugger-common/main';

export type Adapter = 'node' | 'python' | 'react-native';

const _adapters: Map<Adapter, VSAdapterExecutableInfo> = new Map([
  [
    'node',
    {
      command: 'node',
      args: [
        nuclideUri.join(
          __dirname,
          'VendorLib/vscode-node-debug2/out/src/nodeDebug.js',
        ),
      ],
    },
  ],
  [
    'python',
    {
      command: 'node',
      args: [
        nuclideUri.join(
          __dirname,
          'VendorLib/vs-py-debugger/out/client/debugger/Main.js',
        ),
      ],
    },
  ],
  [
    'react-native',
    {
      command: 'node',
      args: [
        nuclideUri.join(
          __dirname,
          'VendorLib/vscode-react-native/out/debugger/reactNativeDebugEntryPoint.js',
        ),
      ],
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
  return adapterInfo;
}
