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

import * as DebugProtocol from 'vscode-debugprotocol';

export interface DebuggerInterface {
  getThreads(): Map<number, string>,
  getActiveThread(): ?number,
  stepIn(): Promise<void>,
  stepOver(): Promise<void>,
  getStackTrace(
    thread: number,
    frameCount: ?number,
  ): Promise<DebugProtocol.StackFrame[]>,
}
