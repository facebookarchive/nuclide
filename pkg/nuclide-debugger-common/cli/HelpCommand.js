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

import type {Command} from './Command';

export default class HelpCommand implements Command {
  name = 'help';
  helpText = 'Give help about the debugger command set.';
  getCommands: () => Command[];

  constructor(getCommands: () => Command[]) {
    this.getCommands = getCommands;
  }

  async execute(): Promise<void> {
    this._displayHelp();
  }

  _displayHelp() {
    const commands = this.getCommands();
    const commandDict = {};
    commands.forEach(x => (commandDict[x.name] = x));

    const commandNames = commands.map(x => x.name).sort();

    commandNames.forEach(name => {
      console.log(name + ': ' + commandDict[name].helpText);
    });
  }
}
