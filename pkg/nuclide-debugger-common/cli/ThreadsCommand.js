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
import type {ConsoleIO} from './ConsoleIO';

export default class ThreadsCommand implements Command {
  name = 'threads';
  helpText = "List all of the target's threads.";

  _debugger: DebuggerInterface;
  _console: ConsoleIO;

  constructor(con: ConsoleIO, debug: DebuggerInterface) {
    this._console = con;
    this._debugger = debug;
  }

  async execute(): Promise<void> {
    const threads = this._debugger.getThreads();
    const activeThread = this._debugger.getActiveThread();

    Array.from(threads)
      .sort((left, right) => left[0] - right[0])
      .forEach(([tid, thread]) => {
        const activeMarker = tid === activeThread ? '*' : ' ';
        this._console.outputLine(
          `${activeMarker} ${tid} ${thread.name() || ''}`,
        );
      });
  }
}
