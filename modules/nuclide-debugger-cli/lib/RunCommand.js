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

import {DebuggerInterface} from './DebuggerInterface';

export default class RunCommand implements Command {
  name = 'run';
  helpText = 'Start execution of the target.';

  _debugger: DebuggerInterface;

  constructor(debug: DebuggerInterface) {
    this._debugger = debug;
  }

  async execute(): Promise<void> {
    return this._debugger.run();
  }
}
