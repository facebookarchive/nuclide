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
import Debugger from './Debugger';
import DebuggerAdapterFactory from './DebuggerAdapterFactory';
import HelpCommand from './HelpCommand';
import log4js from 'log4js';
import QuitCommand from './QuitCommand';
import yargs from 'yargs';

function buildLogger(): log4js$Logger {
  const args = yargs.argv;
  const level = (args.loglevel || 'ERROR').toUpperCase();
  const validLevels = new Set([
    'TRACE',
    'DEBUG',
    'INFO',
    'WARN',
    'ERROR',
    'FATAL',
  ]);

  if (!validLevels.has(level)) {
    throw new Error(`${level} is not a valid loglevel.`);
  }

  log4js.getLogger('nuclide-commons/process').setLevel(level);

  const logger = log4js.getLogger('default');
  logger.setLevel(level);
  return logger;
}

async function main(): Promise<void> {
  const dispatcher = new CommandDispatcher();
  const cli = new CommandLine(dispatcher);

  dispatcher.registerCommand(new HelpCommand(cli, dispatcher));
  dispatcher.registerCommand(new QuitCommand(() => cli.close()));

  try {
    // see if there's session information on the command line
    const args = yargs.boolean('attach').argv;

    const debuggerAdapterFactory = new DebuggerAdapterFactory();
    const adapter = debuggerAdapterFactory.adapterFromArguments(args);

    const logger = buildLogger();
    const debuggerInstance = new Debugger(logger, cli);

    if (adapter != null) {
      await debuggerInstance.launch(adapter);
    }

    debuggerInstance.registerCommands(dispatcher);

    await cli.run();
    await debuggerInstance.closeSession();
    cli.outputLine();

    process.exit(0);
  } catch (x) {
    cli.outputLine(x.message);
    process.exit(1);
  }
}

main();
