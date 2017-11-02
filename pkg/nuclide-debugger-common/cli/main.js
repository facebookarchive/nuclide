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

import CommandLine from './CommandLine';
import CommandDispatcher from './CommandDispatcher';
import Debugger from './Debugger';
import DebuggerAdapterFactory from './DebuggerAdapterFactory';
import HelpCommand from './HelpCommand';
import log4js from 'log4js';
import QuitCommand from './QuitCommand';
import yargs from 'yargs';

function buildLogger() {
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

  const logger = log4js.getLogger('default');
  logger.setLevel(level);
  return logger;
}

async function main() {
  const dispatcher = new CommandDispatcher();
  const cli = new CommandLine(dispatcher);

  dispatcher.registerCommand(new HelpCommand(() => dispatcher.getCommands()));
  dispatcher.registerCommand(new QuitCommand(() => cli.close()));

  // see if there's session information on the command line
  const debuggerAdapterFactory = new DebuggerAdapterFactory();
  const adapter = debuggerAdapterFactory.adapterFromArguments(yargs.argv);

  try {
    const logger = buildLogger();
    const debuggerInstance = new Debugger(logger);

    if (adapter != null) {
      await debuggerInstance.openSession(
        adapter.adapterInfo,
        adapter.launchArgs,
      );
    }

    await cli.run();
    await debuggerInstance.closeSession();
    console.log('\n');

    process.exit(0);
  } catch (x) {
    console.error(x.message);
    process.exit(1);
  }
}

main();
