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

const _help: string[] = [
  'fbdb [options] [program [program-arguments]]',
  '  The debugger may be launched in either "launch" or "attach" mode. "launch"',
  '  starts a local program; "attach" attaches to an already running program',
  '  which may be remote. There are options which are specific to the mode and',
  '  type of program being debugged; to see them, specify the --type and mode',
  '  options along with --help.',
  '',
  '--help:',
  '  Show this help.',
  '--attach:',
  '  Attach the debugger to a running process.',
  '--type python|node:',
  '  Specify the type of program to debug. Required with --attach',
  '',
  '[program]: If not attaching, the program to launch. Normally the type of',
  '           program can be inferred from the file extension.',
  '',
];

function showHelp(): void {
  _help.forEach(_ => process.stdout.write(_ + '\n'));
}

async function main(): Promise<void> {
  const dispatcher = new CommandDispatcher();
  const cli = new CommandLine(dispatcher);

  dispatcher.registerCommand(new HelpCommand(cli, dispatcher));
  dispatcher.registerCommand(new QuitCommand(() => cli.close()));

  try {
    // see if there's session information on the command line
    const args = yargs.boolean('attach').boolean('help').argv;
    const debuggerAdapterFactory = new DebuggerAdapterFactory();

    if (args.help) {
      showHelp();
      await debuggerAdapterFactory.showContextSensitiveHelp(args);
      process.exit(0);
    }

    let adapter;

    try {
      adapter = debuggerAdapterFactory.adapterFromArguments(args);
    } catch (error) {
      cli.outputLine(error.message);
      cli.outputLine();
      showHelp();
      process.exit(0);
    }

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
