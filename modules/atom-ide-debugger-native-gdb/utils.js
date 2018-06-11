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

export async function resolveConfiguration(
  configuration: IProcessConfig,
): Promise<IProcessConfig> {
  let sourcePath: ?string = configuration.config.sourcePath;

  if (sourcePath != null && sourcePath.trim() !== '') {
    return configuration;
  }

  if (configuration.debugMode === 'launch') {
    sourcePath = await getVSCodeDebuggerAdapterServiceByNuclideUri(
      configuration.targetUri,
    ).getBuckRootFromUri(configuration.config.program);
  } else {
    sourcePath = await getVSCodeDebuggerAdapterServiceByNuclideUri(
      configuration.targetUri,
    ).getBuckRootFromPid(configuration.config.pid);
  }

  return {
    ...configuration,
    config: {
      ...configuration.config,
      sourcePath,
    },
  };
}
