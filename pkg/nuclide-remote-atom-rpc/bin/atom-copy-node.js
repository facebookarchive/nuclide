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

function _getStdin() {
  const data = _interopRequireDefault(require("get-stdin"));

  _getStdin = function () {
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
 * Command-line tool that sets contents of clipboard on a connected
 * machine running Atom to what it reads from stdin.
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
    await (0, _errors().trackError)('copy', argv, error);

    if (error instanceof _errors().FailedConnectionError) {
      // Note this does not throw: explainNuclideIsNeededAndExit()
      // does not return. However, we use throw to convince Flow
      // that any code after this is unreachable.
      throw (0, _errors().explainNuclideIsNeededAndExit)();
    } else {
      throw error;
    }
  }

  const input = await new Promise(resolve => {
    (0, _getStdin().default)(text => resolve(text));
  });

  if (input.length !== 0) {
    await commands.setClipboardContents(input.substring(0, 1024 * 100));
  } else {
    // On macOS, pbcopy blocks on stdin until an EOF. Printing help seems more useful.
    process.stderr.write(_yargs().default.help());
  }

  await (0, _errors().trackSuccess)('copy', argv._);
  return _errors().EXIT_CODE_SUCCESS;
}

async function run() {
  const {
    argv
  } = _yargs().default.usage('\nRead standard input, send to clipboard on a connected laptop. ' + 'Requires an active Nuclide connection. Limited to 100,000 characters.').help('h').alias('h', 'help').option('p', {
    alias: 'port',
    describe: 'Port for connecting to Nuclide',
    type: 'number'
  }).option('f', {
    alias: 'family',
    describe: 'Address family for connecting to Nuclide. Either "IPv4" or "IPv6".',
    type: 'string'
  });

  const exitCode = await main(argv);
  process.exit(exitCode);
}

run();