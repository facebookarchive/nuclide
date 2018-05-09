/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
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

  getCommandsMatching(prefix: string): Command[] {
    const re = new RegExp(`^${prefix}`);
    return this.commands.filter(x => x.name.match(re));
  }

  commandListToString(commands: Command[]): string {
    const names = commands.map(_ => _.name);
    return `"${names.join('", "')}"`;
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
    const matches = this.getCommandsMatching(cmd);

    if (matches.length === 0) {
      throw new Error(`No command matches "${cmd}".`);
    }

    if (matches.length > 1) {
      const list = this.commandListToString(matches);
      throw new Error(`Multiple commands match "${cmd}": ${list}`);
    }

    return matches[0].execute(tokens.slice(1));
  }
}
