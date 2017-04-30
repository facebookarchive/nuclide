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
import type {OutputService} from '../../nuclide-console/lib/types';
import type {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import logger from './utils';
import {getConfig} from './utils';
import {setOutputService} from '../../nuclide-debugger-base';
import {LLDBLaunchAttachProvider} from './LLDBLaunchAttachProvider';

export function activate(state: mixed): void {
  logger.setLogLevel(getConfig().clientLogLevel);
}

export function consumeOutputService(api: OutputService): void {
  setOutputService(api);
}

export function createDebuggerProvider(): NuclideDebuggerProvider {
  return {
    name: 'lldb',
    getLaunchAttachProvider(
      connection: NuclideUri,
    ): ?DebuggerLaunchAttachProvider {
      return new LLDBLaunchAttachProvider('Native', connection);
    },
  };
}
