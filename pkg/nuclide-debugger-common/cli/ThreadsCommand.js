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
import type {DebuggerInterface} from './DebuggerInterface';
import type {ConsoleOutput} from './ConsoleOutput';

export default class ThreadsCommand implements Command {
  name = 'threads';
  helpText = "List all of the target's threads.";

  _debugger: DebuggerInterface;
  _console: ConsoleOutput;

  constructor(con: ConsoleOutput, debug: DebuggerInterface) {
    this._console = con;
    this._debugger = debug;
  }

  async execute(): Promise<void> {
    try {
      const threads = this._debugger.getThreads();
      const activeThread = this._debugger.getActiveThread();

      Array.from(threads.keys())
        .map(tid => parseInt(tid, 10))
        .sort((left, right) => left - right)
        .forEach(tid => {
          const activeMarker = tid === activeThread ? '*' : ' ';
          this._console.outputLine(
            `${activeMarker} ${tid} ${threads.get(tid) || '(thread)'}`,
          );
        });
    } catch (x) {
      this._console.outputLine(x.message);
    }
  }
}
