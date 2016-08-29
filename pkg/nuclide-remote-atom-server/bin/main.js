'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {openFile} from './CommandClient';
import fsPromise from '../../commons-node/fsPromise';
import {
  CurrentDateFileAppender,
  getServerLogAppenderConfig,
  updateConfig,
  initialUpdateConfig,
  getLogger,
} from '../../nuclide-logging';
import yargs from 'yargs';

const logger = getLogger();

function setupErrorHandling() {
  process.on('uncaughtException', event => {
    logger.error(
      `Caught unhandled exception: ${event.message}`,
      event.originalError,
    );
    process.stderr.write(`Unhandled exception: ${event.message}\n`);
    process.exit(1);
  });

  process.on('unhandledRejection', (error, promise) => {
    logger.error('Caught unhandled rejection', error);
    process.stderr.write(`Unhandled rejection: ${error.message}\n`);
    process.exit(1);
  });
}

async function setupLogging() {
  // Initialize logging
  await initialUpdateConfig();

  const config = {
    appenders: [
      CurrentDateFileAppender,
    ],
  };

  const serverLogAppenderConfig = await getServerLogAppenderConfig();
  if (serverLogAppenderConfig) {
    config.appenders.push(serverLogAppenderConfig);
  }

  updateConfig(config);
}

type FileLocation = {
  filePath: string,
  line: number,
  column: number,
};

const LocationSuffixRegExp = /(:\d+)(:\d+)?$/;

// This code is coped from Atom: src/main-process/atom-application.coffee
function parseLocationParameter(value: string): FileLocation {
  let filePath: string = value.replace(/[:\s]+$/, '');
  const match = filePath.match(LocationSuffixRegExp);

  let line: number = 0;
  let column: number = 0;
  if (match) {
    filePath = filePath.slice(0, -match[0].length);
    if (match[1]) {
      line = Math.max(0, parseInt(match[1].slice(1), 10) - 1);
    }
    if (match[2]) {
      column = Math.max(0, parseInt(match[2].slice(1), 10) - 1);
    }
  }
  return {
    filePath,
    line,
    column,
  };
}

async function main(argv): Promise<number> {
  await setupLogging();
  setupErrorHandling();

  logger.debug(`nuclide-remote-atom with arguments: ${argv._}`);

  // TODO(t10180322): Support the --wait argument.
  // TODO(t10180337): Consider a batch API for openFile().
  for (const arg of argv._) {
    const {filePath, line, column} = parseLocationParameter(arg);
    let realpath;
    try {
      // eslint-disable-next-line babel/no-await-in-loop
      realpath = await fsPromise.realpath(filePath);
    } catch (e) {
      process.stderr.write(`Error: Cannot find file: ${filePath}\n`);
      process.stderr.write(e.stack);
      process.stderr.write('\n');
      return 1;
    }

    try {
      const result = openFile(realpath, line, column);
      if (argv.wait) {
        // eslint-disable-next-line babel/no-await-in-loop
        await result.toPromise();
      } else {
        // eslint-disable-next-line babel/no-await-in-loop
        await result.take(1).toPromise();
      }
    } catch (e) {
      process.stderr.write('Error: Unable to connect to Nuclide server process.\n');
      process.stderr.write('Do you have Atom with Nuclide open?\n');
      process.stderr.write(e.stack);
      process.stderr.write('\n');
      return 1;
    }
  }

  return 0;
}

async function run() {
  const {argv} = yargs
    .usage('Usage: atom <file>')
    .demand(1, 'At least one file name is required.')
    .boolean('w')
    .alias('wait', 'w')
    .describe('w', 'Wait for the opened file to be closed in Atom before exiting')
    .help('h')
    .alias('h', 'help');
  const exitCode = await main(argv);
  process.exit(exitCode);
}

run();
