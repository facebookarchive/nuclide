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

import CommandLine from './CommandLine';
import CommandDispatcher from './CommandDispatcher';
import HelpCommand from './HelpCommand';
import QuitCommand from './QuitCommand';

const dispatcher = new CommandDispatcher();
const cli = new CommandLine(dispatcher);

dispatcher.registerCommand(new HelpCommand(() => dispatcher.getCommands()));
dispatcher.registerCommand(new QuitCommand(() => cli.close()));

cli.run();
