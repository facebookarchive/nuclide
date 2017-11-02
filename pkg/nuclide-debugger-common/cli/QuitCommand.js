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

export default class QuitCommand implements Command {
  name = 'quit';
  helpText = 'Exit the debugger.';
  quit: () => void;

  constructor(quit: () => void) {
    this.quit = quit;
  }

  async execute(): Promise<void> {
    this.quit();
  }
}
