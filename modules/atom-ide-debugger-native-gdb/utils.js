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

import type {
  IProcessConfig,
  DebuggerSourcePathsService,
} from 'nuclide-debugger-common/types';

import {getVSCodeDebuggerAdapterServiceByNuclideUri} from 'nuclide-debugger-common';

let _sourcePathsService: ?DebuggerSourcePathsService;

export async function resolveConfiguration(
  configuration: IProcessConfig,
): Promise<IProcessConfig> {
  const debuggerService = getVSCodeDebuggerAdapterServiceByNuclideUri(
    configuration.targetUri,
  );

  let sourcePath: ?string = null;

  if (configuration.debugMode === 'launch') {
    sourcePath = await debuggerService.getBuckRootFromUri(
      configuration.config.program,
    );
  } else {
    sourcePath = await debuggerService.getBuckRootFromPid(
      configuration.config.pid,
    );
  }

  if (sourcePath == null) {
    return configuration;
  }

  const canonicalSourcePath = await debuggerService.realpath(sourcePath);
  const sourcePaths: Array<string> = [];

  if (_sourcePathsService != null) {
    _sourcePathsService.addKnownNativeSubdirectoryPaths(
      canonicalSourcePath,
      sourcePaths,
    );
  } else {
    sourcePaths.push(sourcePath);
  }

  return {
    ...configuration,
    config: {
      ...configuration.config,
      sourcePaths,
    },
  };
}

export function setSourcePathsService(
  service: DebuggerSourcePathsService,
): void {
  _sourcePathsService = service;
}
