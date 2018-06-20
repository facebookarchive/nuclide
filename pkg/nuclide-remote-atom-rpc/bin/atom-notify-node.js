'use strict';

var _yargs;

function _load_yargs() {
  return _yargs = _interopRequireDefault(require('yargs'));
}

var _CommandClient;

function _load_CommandClient() {
  return _CommandClient = require('./CommandClient');
}

var _errors;

function _load_errors() {
  return _errors = require('./errors');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Command-line tool that allows you to send a message that gets displayed as
 * an Atom notification in all Atom windows connected to this server.
 *
 * This was inspired by `zwrite` from the Zephyr notification service:
 * https://en.wikipedia.org/wiki/Zephyr_(protocol).
 * See the `man` page:
 * https://www.gsp.com/cgi-bin/man.cgi?section=1&topic=zwrite.
 */

async function main(argv) {
  (0, (_errors || _load_errors()).setupLogging)();
  (0, (_errors || _load_errors()).setupErrorHandling)();

  // Connect to the Nuclide server running on this host, if it exists.
  let commands = null;
  try {
    commands = await (0, (_CommandClient || _load_CommandClient()).getCommands)(argv, /* rejectIfZeroConnections */true);
  } catch (error) {
    if (error instanceof (_errors || _load_errors()).FailedConnectionError) {
      // Note this does not throw: reportConnectionErrorAndExit()
      // does not return. However, we use throw to convince Flow
      // that any code after this is unreachable.
      throw (0, (_errors || _load_errors()).reportConnectionErrorAndExit)(error);
    } else {
      throw error;
    }
  }

  const message = argv._.join(' ');
  if (message === '') {
    // eslint-disable-next-line no-console
    console.error('Cowardly refusing to send an empty message.'); // HT tar
    return (_errors || _load_errors()).EXIT_CODE_INVALID_ARGUMENTS;
  }

  let type = 'info';
  if (argv.error) {
    type = 'error';
  } else if (argv.warning) {
    type = 'warning';
  } else if (argv.success) {
    type = 'success';
  }

  const notification = {
    message,
    type,
    // Counterintuitively, by setting dismissable to true, it makes it sticky
    // because in Atom, "dismissable" means "has a close box", which means
    // it does not go away until the user clicks on the X.
    dismissable: argv.sticky
  };
  await commands.addNotification(notification);

  return (_errors || _load_errors()).EXIT_CODE_SUCCESS;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

async function run() {
  const { argv } = (_yargs || _load_yargs()).default.usage('Usage: atom-notify').help('h').alias('h', 'help').option('p', {
    alias: 'port',
    describe: 'Port for connecting to nuclide',
    type: 'number'
  }).option('f', {
    alias: 'family',
    describe: 'Address family for connecting to nuclide. Either "IPv4" or "IPv6".',
    type: 'string'
  }).option('s', {
    alias: 'sticky',
    describe: 'Requires user to explicitly dismiss the notification.',
    type: 'boolean'
  })

  // Note that we do not support 'fatal' from the CLI because that tells
  // the user that "This is likely a bug in Atom", which is misleading.
  .option('success', {
    describe: 'Display as success.',
    type: 'boolean'
  }).option('info', {
    describe: 'Display as info.',
    type: 'boolean'
  }).option('warning', {
    describe: 'Display as warning.',
    type: 'boolean'
  }).option('error', {
    describe: 'Display as error.',
    type: 'boolean'
  });

  const exitCode = await main(argv);
  process.exit(exitCode);
}

run();