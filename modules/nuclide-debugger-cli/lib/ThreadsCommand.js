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
    const focusThread = threads.focusThreadId;

    threads.allThreads
      .sort((left, right) => left.id() - right.id())
      .forEach(thread => {
        const activeMarker = thread.id() === focusThread ? '*' : ' ';
        this._console.outputLine(
          `${activeMarker} ${thread.id()} ${thread.name() || ''}`,
        );
      });
  }
}
