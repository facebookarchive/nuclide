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

export default class CommandDispatcher {
  commands: Command[] = [];

  registerCommand(command: Command): void {
    this.commands.push(command);
  }

  getCommands() {
    return this.commands;
  }

  async execute(line: string): Promise<void> {
    const tokens = line.split(/\s+/);
    if (tokens.length === 0 || !tokens[0]) {
      return;
    }

    // Get all commands of which the given command is a prefix
    const cmd = tokens[0];
    const re = new RegExp(`^${cmd}`);
    const matches = this.commands.filter(x => x.name.match(re));

    if (matches.length === 0) {
      throw new Error(`No command matches "${cmd}".`);
    }

    if (matches.length > 1) {
      throw new Error(
        `Multiple commands match "${cmd}": "${matches
          .map(x => x.name)
          .join('", "')}".`,
      );
    }

    return matches[0].execute(tokens);
  }
}
