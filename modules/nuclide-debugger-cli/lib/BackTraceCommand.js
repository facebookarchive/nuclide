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
import type {ConsoleIO} from './ConsoleIO';
import type {DebuggerInterface} from './DebuggerInterface';

import idx from 'idx';

export default class BackTraceCommand implements Command {
  name = 'where';
  helpText = 'Displays the call stack of the active thread.';
  detailedHelpText = `
where

Displays the call stack, showing the most recent stack frame first. For each
frame, the frame's index, the source code file (if available), and
line number are shown. An asterisk marks the currently selected frame.
`;

  _console: ConsoleIO;
  _debugger: DebuggerInterface;

  static _defaultFrames: number = 100;

  constructor(con: ConsoleIO, debug: DebuggerInterface) {
    this._console = con;
    this._debugger = debug;
  }

  async execute(args: string[]): Promise<void> {
    const activeThread = this._debugger.getActiveThread();

    const frames = await this._debugger.getStackTrace(
      activeThread.id(),
      BackTraceCommand._defaultFrames,
    );
    const selectedFrame = activeThread.selectedStackFrame();
    frames.forEach((frame, index) => {
      const selectedMarker = index === selectedFrame ? '*' : ' ';
      const path = idx(frame, _ => _.source.path) || null;
      const location = path != null ? `${path}:${frame.line}` : '[no source]';
      this._console.outputLine(
        `${selectedMarker} #${index} ${frame.name} ${location}`,
      );
    });
  }
}
