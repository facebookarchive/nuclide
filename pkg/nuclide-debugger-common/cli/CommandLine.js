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

/* eslint-disable no-console */

import readline from 'readline';
import CommandDispatcher from './CommandDispatcher';

export default class CommandLine {
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

  run() {
    this.cli.prompt();
    this.cli
      .on('line', this._executeCommand.bind(this))
      .on('close', () => process.exit(0));
  }

  close() {
    this.cli.close();
  }

  async _executeCommand(line: string) {
    try {
      await this.dispatcher.execute(line);
    } catch (x) {
      console.log(x.message);
    } finally {
      this.cli.prompt();
    }
  }
}
