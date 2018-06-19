/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {DebugMode} from './types';

import {getDebuggerService} from 'nuclide-commons-atom/debugger';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import invariant from 'assert';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {
  getLaunchProcessConfig,
  startAttachProcessConfig,
} from '../../nuclide-debugger-vsp/lib/HhvmLaunchAttachProvider';

export async function debug(
  debugMode: DebugMode,
  activeProjectRoot: ?string,
  target: string,
  useTerminal: boolean,
  scriptArguments: string,
): Promise<void> {
  let processConfig = null;
  invariant(activeProjectRoot != null, 'Active project is null');

  // See if this is a custom debug mode type.
  try {
    // $FlowFB
    const helper = require('./fb-hhvm');
    processConfig = await helper.getCustomLaunchInfo(
      debugMode,
      activeProjectRoot,
      target,
      scriptArguments,
    );
  } catch (e) {}

  if (processConfig == null) {
    if (debugMode === 'script') {
      processConfig = getLaunchProcessConfig(
        activeProjectRoot,
        target,
        scriptArguments,
        null /* script wrapper */,
        useTerminal,
        '' /* cwdPath */,
      );
    } else {
      await startAttachProcessConfig(
        activeProjectRoot,
        null /* attachPort */,
        true /* serverAttach */,
      );
      return;
    }
  }

  invariant(processConfig != null);
  const debuggerService = await getDebuggerService();
  await debuggerService.startVspDebugging(processConfig);
}
