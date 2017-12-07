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
import type {DispatcherInterface} from './DispatcherInterface';

export default class CommandDispatcher implements DispatcherInterface {
  commands: Command[] = [];

  registerCommand(command: Command): void {
    this.commands.push(command);
  }

  getCommands(): Command[] {
    return this.commands;
  }

  async execute(line: string): Promise<void> {
    let tail = line;
    const tokens: string[] = [];

    // Here we're looking for quoted arguments.
    // \1 is the contents of a single-quoted arg that may contain spaces
    // \2 is a space-delimited arg if there are no quotes
    // \3 is the rest of the command line
    const tokenizer: RegExp = /^\s*(?:('([^']*)')|(\S+))\s*(.*)$/;

    while (tail.length > 0) {
      const match = tail.match(tokenizer);
      if (match == null) {
        break;
      }

      const [, , quoted, unquoted, rest] = match;
      tokens.push(quoted != null ? quoted : unquoted);
      tail = rest;
    }

    return this.executeTokenizedLine(tokens);
  }

  async executeTokenizedLine(tokens: string[]): Promise<void> {
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

    return matches[0].execute(tokens.slice(1));
  }
}
