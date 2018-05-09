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

export default class BreakpointEnableCommand implements Command {
  name = 'enable';
  helpText = '[index]: enables a breakpoint.';

  _debugger: DebuggerInterface;

  constructor(debug: DebuggerInterface) {
    this._debugger = debug;
  }

  async execute(args: string[]): Promise<void> {
    let index = -1;

    if (args.length !== 1 || isNaN((index = parseInt(args[0], 10)))) {
      throw new Error("Format is 'breakpoint enable index'");
    }

    await this._debugger.setBreakpointEnabled(index, true);
  }
}
