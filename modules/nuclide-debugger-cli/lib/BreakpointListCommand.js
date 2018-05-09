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

import leftPad from './Format';

export default class BreakpointListCommand implements Command {
  name = 'list';
  helpText = 'Lists all breakpoints.';

  _console: ConsoleIO;
  _debugger: DebuggerInterface;

  constructor(con: ConsoleIO, debug: DebuggerInterface) {
    this._console = con;
    this._debugger = debug;
  }

  async execute(args: string[]): Promise<void> {
    const breakpoints = this._debugger
      .getAllBreakpoints()
      .sort((left, right) => left.index - right.index);

    if (breakpoints.length === 0) {
      return;
    }

    const lastBreakpoint = breakpoints[breakpoints.length - 1];
    const indexSize = String(lastBreakpoint.index).length;

    breakpoints.forEach(bpt => {
      const attributes = [];
      if (!bpt.verified) {
        attributes.push('unverified');
      }
      if (!bpt.enabled) {
        attributes.push('disabled');
      }

      const index = leftPad(`#${bpt.index}`, indexSize);
      const attrs = attributes.length === 0 ? '' : `(${attributes.join(',')})`;
      this._console.outputLine(`${index} ${bpt.toString()} ${attrs}`);
    });
  }
}
