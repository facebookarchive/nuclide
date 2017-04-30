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
  NuclideDebuggerProvider,
} from '../../nuclide-debugger-interfaces/service';

import nuclideUri from '../../commons-node/nuclideUri';
import {IwdpLaunchAttachProvider} from './IwdpLaunchAttachProvider';

export function createDebuggerProvider(): NuclideDebuggerProvider {
  return {
    name: 'Mobile JS',
    getLaunchAttachProvider: connection => {
      if (nuclideUri.isLocal(connection)) {
        return new IwdpLaunchAttachProvider('Mobile JS', connection);
      } else {
        return null;
      }
    },
  };
}
