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

import readline from 'readline';
import CommandDispatcher from './CommandDispatcher';
import type {ConsoleOutput} from './ConsoleOutput';

export default class CommandLine implements ConsoleOutput {
  dispatcher: CommandDispatcher;
  cli: readline$Interface;

  constructor(dispatcher: CommandDispatcher) {
    this.dispatcher = dispatcher;
    this.cli = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.cli.setPrompt('fbdb> ');
  }

  // $TODO handle
  // (1) async output that happens while the user is typing at the prompt
  // (2) paging long output (more) if termcap allows us to know the screen height
  output(text: string): void {
    process.stdout.write(text);
  }

  outputLine(line?: string = ''): void {
    process.stdout.write(`${line}\n`);
  }

  async run(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cli.prompt();
      this.cli.on('line', this._executeCommand.bind(this)).on('close', resolve);
    });
  }

  close() {
    this.cli.close();
  }

  async _executeCommand(line: string) {
    try {
      await this.dispatcher.execute(line);
    } catch (x) {
      this.outputLine(x.message);
    } finally {
      this.cli.prompt();
    }
  }
}
