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

import type {DebugMode} from './types';

import {getDebuggerService} from '../../commons-atom/debugger';
// eslint-disable-next-line rulesdir/no-cross-atom-imports
import invariant from 'assert';
// eslint-disable-next-line rulesdir/no-cross-atom-imports
import {
  getLaunchProcessInfo,
  getAttachProcessInfo,
} from '../../nuclide-debugger-vsp/lib/HhvmLaunchAttachProvider';

export async function debug(
  debugMode: DebugMode,
  activeProjectRoot: ?string,
  target: string,
  useTerminal: boolean,
  scriptArguments: string,
): Promise<void> {
  let processInfo = null;
  invariant(activeProjectRoot != null, 'Active project is null');

  // See if this is a custom debug mode type.
  try {
    // $FlowFB
    const helper = require('./fb-hhvm');
    processInfo = await helper.getCustomLaunchInfo(
      debugMode,
      activeProjectRoot,
      target,
      scriptArguments,
    );
  } catch (e) {}

  if (processInfo == null) {
    if (debugMode === 'script') {
      processInfo = await getLaunchProcessInfo(
        activeProjectRoot,
        target,
        scriptArguments,
        null /* script wrapper */,
        useTerminal,
        '' /* cwdPath */,
      );
    } else {
      processInfo = await getAttachProcessInfo(activeProjectRoot, null);
    }
  }

  const debuggerService = await getDebuggerService();
  await debuggerService.startDebugging(processInfo);
}
