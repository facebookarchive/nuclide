/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {IProcessConfig} from 'nuclide-debugger-common/types';

import {getVSCodeDebuggerAdapterServiceByNuclideUri} from 'nuclide-debugger-common';
import invariant from 'assert';

export async function resolveConfiguration(
  configuration: IProcessConfig,
): Promise<IProcessConfig> {
  let sourcePath: ?string = configuration.config.sourcePath;

  const debuggerService = getVSCodeDebuggerAdapterServiceByNuclideUri(
    configuration.targetUri,
  );

  if (sourcePath == null || sourcePath.trim() === '') {
    if (configuration.debugMode === 'launch') {
      sourcePath = await debuggerService.getBuckRootFromUri(
        configuration.config.program,
      );
    } else {
      sourcePath = await debuggerService.getBuckRootFromPid(
        configuration.config.pid,
      );
    }
  }

  invariant(sourcePath != null);
  sourcePath = await debuggerService.realpath(sourcePath);

  return {
    ...configuration,
    config: {
      ...configuration.config,
      sourcePath,
    },
  };
}
