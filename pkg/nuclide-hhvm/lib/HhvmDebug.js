'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebugMode} from './types';

import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {LaunchProcessInfo} from '../../nuclide-debugger-php/lib/LaunchProcessInfo';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {AttachProcessInfo} from '../../nuclide-debugger-php/lib/AttachProcessInfo';

export async function debug(
  debugMode: DebugMode,
  currentFilePath: string,
  target: string,
): Promise<void> {
  let processInfo = null;
  if (debugMode === 'script') {
    processInfo = new LaunchProcessInfo(currentFilePath, target);
  } else {
    processInfo = new AttachProcessInfo(currentFilePath);
  }

  // Use commands here to trigger package activation.
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  const debuggerService = await consumeFirstProvider('nuclide-debugger.remote');
  await debuggerService.startDebugging(processInfo);
}
