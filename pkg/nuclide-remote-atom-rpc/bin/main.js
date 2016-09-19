'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {openFile, addProject} from './CommandClient';
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

const EXIT_CODE_SUCCESS = 0;
const EXIT_CODE_UNKNOWN_ERROR = 1;
const EXIT_CODE_CANNOT_RESOLVE_REALPATH = 2;
const EXIT_CODE_CONNECTION_ERROR = 3;

function setupErrorHandling() {
  process.on('uncaughtException', event => {
    logger.error(
      `Caught unhandled exception: ${event.message}`,
      event.originalError,
    );
    process.stderr.write(`Unhandled exception: ${event.message}\n`);
    process.exit(EXIT_CODE_UNKNOWN_ERROR);
  });

  process.on('unhandledRejection', (error, promise) => {
    logger.error('Caught unhandled rejection', error);
    process.stderr.write(`Unhandled rejection: ${error.message}\n`);
    process.exit(EXIT_CODE_UNKNOWN_ERROR);
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
    let isDirectory;
    try {
      // eslint-disable-next-line babel/no-await-in-loop
      realpath = await fsPromise.realpath(filePath);
      // eslint-disable-next-line babel/no-await-in-loop
      const stats = await fsPromise.stat(filePath);
      isDirectory = stats.isDirectory();
    } catch (e) {
      process.stderr.write(`Error: Cannot find file: ${filePath}\n`);
      process.stderr.write(e.stack);
      process.stderr.write('\n');
      return EXIT_CODE_CANNOT_RESOLVE_REALPATH;
    }

    try {
      if (isDirectory) {
        // file/line/wait are ignored on directories
        // eslint-disable-next-line babel/no-await-in-loop
        await addProject(realpath);
      } else {
        const result = openFile(realpath, line, column);
        if (argv.wait) {
          // eslint-disable-next-line babel/no-await-in-loop
          await result.toPromise();
        } else {
          // eslint-disable-next-line babel/no-await-in-loop
          await result.take(1).toPromise();
        }
      }
    } catch (e) {
      process.stderr.write('Error: Unable to connect to Nuclide server process.\n');
      process.stderr.write('Do you have Atom with Nuclide open?\n');
      process.stderr.write(e.stack);
      process.stderr.write('\n');
      return EXIT_CODE_CONNECTION_ERROR;
    }
  }

  return EXIT_CODE_SUCCESS;
}

async function run() {
  const {argv} = yargs
    .usage('Usage: atom <file>')
    .help('h')
    .alias('h', 'help')
    .demand(1, 'At least one file name is required.')
    .option('a', {
      alias: 'add',
      describe: 'Ignored, as --add as always implied. ' +
        'Included for compatibility with atom CLI.',
      type: 'boolean',
    })
    .option('w', {
      alias: 'wait',
      describe: 'Wait for the opened file to be closed in Atom before exiting',
      type: 'boolean',
    });
  const exitCode = await main(argv);
  process.exit(exitCode);
}

run();
