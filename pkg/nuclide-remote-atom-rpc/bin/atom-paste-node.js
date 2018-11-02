"use strict";

function _yargs() {
  const data = _interopRequireDefault(require("yargs"));

  _yargs = function () {
    return data;
  };

  return data;
}

function _CommandClient() {
  const data = require("./CommandClient");

  _CommandClient = function () {
    return data;
  };

  return data;
}

function _errors() {
  const data = require("./errors");

  _errors = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/**
 * Command-line tool that allows you to paste contents of clipboard from a connected
 * machine running Atom.
 */
async function main(argv) {
  (0, _errors().setupLogging)();
  (0, _errors().setupErrorHandling)(); // Connect to the Nuclide server running on this host, if it exists.

  let commands = null;

  try {
    commands = await (0, _CommandClient().getCommands)(argv,
    /* rejectIfZeroConnections */
    true);
  } catch (error) {
    await (0, _errors().trackError)('paste', argv, error);

    if (error instanceof _errors().FailedConnectionError) {
      // Note this does not throw: explainNuclideIsNeededAndExit()
      // does not return. However, we use throw to convince Flow
      // that any code after this is unreachable.
      throw (0, _errors().explainNuclideIsNeededAndExit)();
    } else {
      throw error;
    }
  }

  let contents = await commands.getClipboardContents();

  if (!contents.endsWith('\n')) {
    contents += '\n';
  }

  process.stdout.write(contents);
  await (0, _errors().trackSuccess)('paste', argv);
  return _errors().EXIT_CODE_SUCCESS;
}

async function run() {
  const {
    argv
  } = _yargs().default.usage('\nPrint clipboard contents from a connected laptop to standard output. ' + 'Requires an active Nuclide connection. Limited to 100,000 characters.').help('h').alias('h', 'help').option('p', {
    alias: 'port',
    describe: 'Port for connecting to Nuclide',
    type: 'number'
  }).option('f', {
    alias: 'family',
    describe: 'Address family for connecting to nuclide. Either "IPv4" or "IPv6".',
    type: 'string'
  });

  const exitCode = await main(argv);
  process.exit(exitCode);
}

run();