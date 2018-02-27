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

import type {LogLevel} from '../../nuclide-logging/lib/rpc-types';

export type DebuggerMode = 'attach' | 'launch';

export type MessageSender = (message: string, level: string) => mixed;

export type PhpDebuggerSessionConfig = {
  xdebugAttachPort: number,
  xdebugLaunchingPort: number,
  launchScriptPath?: string,
  pid?: number,
  attachScriptRegex?: string,
  idekeyRegex?: string,
  endDebugWhenNoRequests?: boolean,
  logLevel: LogLevel,
  targetUri: string,
  phpRuntimePath: string,
  phpRuntimeArgs: string,
  scriptArguments: Array<string>,
  dummyRequestFilePath: string,
  stopOneStopAll: boolean,
  launchWrapperCommand?: string,
  deferLaunch: boolean,
};
