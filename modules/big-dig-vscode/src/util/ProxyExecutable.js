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

import * as vscode from 'vscode';
import {Observable} from 'rxjs';

import {TerminalWrapper} from './TerminalWrapper';

export type ExecutableWrapper = {
  /**
   * Observe each time that this wrapped executable is invoked. Each invocation
   * provides:
   *  - `proc` - gives access to the stdio of the process so the caller may
   *   e.g. pipe the stdio of a remote process.
   *  - `args` - a list of *additional* arguments (ignoring the arguments
   *   provided by `ExecutableWrapper.args`).
   */
  +spawned: Observable<{proxy: TerminalWrapper, args: Array<string>}>,

  +terminal: vscode.Terminal,
};

/**
 * Returns a local executable path and arguments, which together will spawn a
 * process that is wrapped by a `ProcessWrapper`. Field `spawned` of the result
 * emits a new `ProcessWrapper` each time the executable is spawned.
 *
 * Rationale: we use this because some vscode APIs expect to be given executable
 * commands and arguments rather allowing us to attach a process directly (e.g.
 * remote processes).
 *
 * NOTE: This is a hopefully-temporary hack until vscode does not require local
 * executables to be specified. Please avoid using this approach if at all
 * possible.
 */
export async function createProxyExecutable(): Promise<ExecutableWrapper> {
  const proxy = new TerminalWrapper('big-dig terminal');
  await proxy.ready;
  return {
    spawned: Observable.of({proxy, args: []}),
    terminal: proxy.terminal,
  };
}
