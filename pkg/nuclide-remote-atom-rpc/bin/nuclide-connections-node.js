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

import os from 'os';
import yargs from 'yargs';
import {getCommands, startCommands} from './CommandClient';
import {
  setupErrorHandling,
  setupLogging,
  EXIT_CODE_CONNECTION_ERROR,
  EXIT_CODE_SUCCESS,
  FailedConnectionError,
} from './errors';

/*
 * CLI for printing information about the Atom clients connected to the Nuclide
 * server running on this machine. By default, it lists the remote root folders
 * in the Atom clients that correspond to this host. The list is written to
 * stdout as JSON.
 */

async function main(argv): Promise<number> {
  setupLogging();
  setupErrorHandling();

  // Connect to the Nuclide server running on this host, if it exists.
  let commands = null;
  try {
    commands =
      argv.port != null
        ? await startCommands(argv.port, argv.family)
        : await getCommands();
  } catch (e) {
    // Only a FailedConnectionError is expected.
    if (!(e instanceof FailedConnectionError)) {
      return EXIT_CODE_CONNECTION_ERROR;
    }
  }

  let foldersArray;
  if (commands == null) {
    // If commands is null, then there is no Nuclide server running.
    // We should print an empty array without any ceremony in this case.
    foldersArray = [];
  } else {
    const hostname = os.hostname();
    // Note that each ClientConnection represents an Atom window, so
    // the rootFolders across windows may overlap. Add all of them to
    // a Set to de-dupe.
    const connections = await commands.getClientConnections(hostname);
    const rootFolders = new Set();
    for (const connection of connections) {
      for (const rootFolder of connection.rootFolders) {
        rootFolders.add(rootFolder);
      }
    }
    foldersArray = Array.from(rootFolders);
  }

  foldersArray.sort();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(foldersArray, null, 2));
  return EXIT_CODE_SUCCESS;
}

async function run(): Promise<void> {
  const {argv} = yargs
    .usage('Usage: nuclide-connections')
    .help('h')
    .alias('h', 'help')
    .option('p', {
      alias: 'port',
      describe: 'Port for connecting to nuclide',
      type: 'number',
    })
    .option('f', {
      alias: 'family',
      describe:
        'Address family for connecting to nuclide. Either "IPv4" or "IPv6".',
      type: 'string',
    });

  const exitCode = await main(argv);
  process.exit(exitCode);
}

run();
