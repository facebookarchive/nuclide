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

import type {Command} from './Command';
import type {ConsoleIO} from './ConsoleIO';
import type {DebuggerInterface} from './DebuggerInterface';

import idx from 'idx';

export default class BackTraceCommand implements Command {
  name = 'backtrace';
  helpText = 'Displays the call stack of the active thread.';

  _console: ConsoleIO;
  _debugger: DebuggerInterface;

  constructor(con: ConsoleIO, debug: DebuggerInterface) {
    this._console = con;
    this._debugger = debug;
  }

  async execute(): Promise<void> {
    const activeThread = this._debugger.getActiveThread();
    if (activeThread == null) {
      throw Error('There is no active thread.');
    }

    const frames = await this._debugger.getStackTrace(activeThread);

    frames.forEach((frame, index) => {
      const path = idx(frame, _ => _.source.path) || null;
      const location =
        path != null ? `${path}:${frame.line + 1}` : '[no source]';
      this._console.outputLine(`#${index} ${frame.name} ${location}`);
    });
  }
}
