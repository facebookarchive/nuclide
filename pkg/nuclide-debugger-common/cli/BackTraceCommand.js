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
import type {Command} from './Command';
import type {ConsoleIO} from './ConsoleIO';
import type {DebuggerInterface} from './DebuggerInterface';

import idx from 'idx';
import Thread from './Thread';

export default class BackTraceCommand implements Command {
  name = 'backtrace';
  helpText = '[frame] Displays the call stack of the active thread. With optional frame index, sets the current frame for variable display.';

  _console: ConsoleIO;
  _debugger: DebuggerInterface;

  static _defaultFrames: number = 100;

  constructor(con: ConsoleIO, debug: DebuggerInterface) {
    this._console = con;
    this._debugger = debug;
  }

  async execute(args: string[]): Promise<void> {
    const activeThread = this._debugger.getActiveThread();

    if (args.length > 1) {
      throw Error(
        "'backtrace' takes at most one argument -- the index of the frame to select",
      );
    }

    const frameArg = args[0];
    if (frameArg != null) {
      await this._setSelectedStackFrame(activeThread, frameArg);
      return;
    }

    const frames = await this._debugger.getStackTrace(
      activeThread.id(),
      BackTraceCommand._defaultFrames,
    );
    this._printFrames(frames, activeThread.selectedStackFrame());
  }

  async _setSelectedStackFrame(
    thread: Thread,
    frameArg: string,
  ): Promise<void> {
    if (frameArg.match(/^\d+$/) == null) {
      throw Error('Argument must be a numeric frame index.');
    }

    const newSelectedFrame = parseInt(frameArg, 10);
    await this._debugger.setSelectedStackFrame(thread, newSelectedFrame);
  }

  _printFrames(
    frames: DebugProtocol.StackFrame[],
    selectedFrame: number,
  ): void {
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
