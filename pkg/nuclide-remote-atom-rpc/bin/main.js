'use strict';

var _CommandClient;

function _load_CommandClient() {
  return _CommandClient = require('./CommandClient');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _errors;

function _load_errors() {
  return _errors = require('./errors');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _yargs;

function _load_yargs() {
  return _yargs = _interopRequireDefault(require('yargs'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-atom-rpc'); /**
                                                                                       * Copyright (c) 2015-present, Facebook, Inc.
                                                                                       * All rights reserved.
                                                                                       *
                                                                                       * This source code is licensed under the license found in the LICENSE file in
                                                                                       * the root directory of this source tree.
                                                                                       *
                                                                                       * 
                                                                                       * @format
                                                                                       */

const LocationSuffixRegExp = /(:\d+)(:\d+)?$/;

// This code is coped from Atom: src/main-process/atom-application.coffee
function parseLocationParameter(value) {
  let filePath = value.replace(/[:\s]+$/, '');
  const match = filePath.match(LocationSuffixRegExp);

  let line = 0;
  let column = 0;
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
    column
  };
}

/**
 * Attempts to resolve the physical path of the filename (if it's local).
 * Sometimes filePath may not exist yet, in which case we need to look upwards
 * for the first prefix that actually does exist.
 */
async function getRealPath(filePath) {
  if ((_nuclideUri || _load_nuclideUri()).default.isRemote(filePath)) {
    return filePath;
  }
  const resolved = (_nuclideUri || _load_nuclideUri()).default.resolve(filePath);
  let prefix = resolved;
  let suffix = null;
  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const realpath = await (_fsPromise || _load_fsPromise()).default.realpath(prefix);
      return suffix == null ? realpath : (_nuclideUri || _load_nuclideUri()).default.join(realpath, suffix);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
      const basename = (_nuclideUri || _load_nuclideUri()).default.basename(prefix);
      if (basename === '') {
        // We've reached the filesystem root.
        break;
      }
      suffix = suffix == null ? basename : (_nuclideUri || _load_nuclideUri()).default.join(basename, suffix);
      prefix = (_nuclideUri || _load_nuclideUri()).default.dirname(prefix);
    }
  }
  return resolved;
}

async function getIsDirectory(filePath) {
  try {
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(filePath)) {
      return false;
    } else {
      const stats = await (_fsPromise || _load_fsPromise()).default.stat(filePath);
      return stats.isDirectory();
    }
  } catch (e) {
    return false;
  }
}

async function main(argv) {
  (0, (_errors || _load_errors()).setupLogging)();
  (0, (_errors || _load_errors()).setupErrorHandling)();

  logger.debug(`nuclide-remote-atom with arguments: ${argv._}`);

  // TODO(t10180337): Consider a batch API for openFile().
  if (argv._ != null && argv._.length > 0) {
    let commands;
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

    for (const arg of argv._) {
      const { filePath, line, column } = parseLocationParameter(arg);
      // eslint-disable-next-line no-await-in-loop
      const realpath = await getRealPath(filePath);
      // eslint-disable-next-line no-await-in-loop
      const isDirectory = await getIsDirectory(realpath);
      try {
        if ((_nuclideUri || _load_nuclideUri()).default.isRemote(realpath)) {
          if (argv.newWindow) {
            // TODO(mbolin): Support --new-window for nuclide:// arguments.
            process.stderr.write('--new-window is not currently supported for remote NuclideUris.\n');
            return (_errors || _load_errors()).EXIT_CODE_INVALID_ARGUMENTS;
          }

          const result = commands.openRemoteFile(realpath, line, column, Boolean(argv.wait)).refCount();
          if (argv.wait) {
            // eslint-disable-next-line no-await-in-loop
            await result.toPromise();
          } else {
            // eslint-disable-next-line no-await-in-loop
            await result.take(1).toPromise();
          }
        } else if (isDirectory) {
          // file/line/wait are ignored on directories
          // eslint-disable-next-line no-await-in-loop
          await commands.addProject(realpath, Boolean(argv.newWindow));
        } else {
          if (argv.newWindow) {
            // TODO(mbolin): Support --new-window for files. This is tricky to
            // implement because we create a new window by opening an
            // atom:// URI on the user's machine. It is challenging to add code
            // that can recognize when this successfully opens the URI, so that
            // makes it difficult to implement a faithful
            // ConnectableObservable<AtomFileEvent> (particularly if --wait is
            // specified).
            process.stderr.write('--new-window is not currently supported for files.\n');
            return (_errors || _load_errors()).EXIT_CODE_INVALID_ARGUMENTS;
          }

          const result = commands.openFile(realpath, line, column, Boolean(argv.wait)).refCount();
          if (argv.wait) {
            // eslint-disable-next-line no-await-in-loop
            await result.toPromise();
          } else {
            // eslint-disable-next-line no-await-in-loop
            await result.take(1).toPromise();
          }
        }
      } catch (e) {
        (0, (_errors || _load_errors()).reportErrorAndExit)(e, (_errors || _load_errors()).EXIT_CODE_APPLICATION_ERROR);
      }
    }
  }
  return (_errors || _load_errors()).EXIT_CODE_SUCCESS;
}

async function run() {
  const { argv } = (_yargs || _load_yargs()).default.usage('Usage: atom <file>').help('h').alias('h', 'help').demand(1, 'At least one file name is required.').option('a', {
    alias: 'add',
    describe: 'Ignored, as --add as always implied. ' + 'Included for compatibility with atom CLI.',
    type: 'boolean'
  }).option('n', {
    alias: 'new-window',
    describe: 'Open a new window.',
    type: 'boolean'
  }).option('w', {
    alias: 'wait',
    describe: 'Wait for the opened file to be closed in Atom before exiting',
    type: 'boolean'
  }).option('p', {
    alias: 'port',
    describe: 'Port for connecting to nuclide',
    type: 'number'
  }).option('f', {
    alias: 'family',
    describe: 'Address family for connecting to nuclide. Either "IPv4" or "IPv6".',
    type: 'string'
  });
  if (argv.port == null !== (argv.family == null)) {
    process.stderr.write('Invalid options. Both port and family must be specified.\n');
    process.exit((_errors || _load_errors()).EXIT_CODE_INVALID_ARGUMENTS);
  }
  const exitCode = await main(argv);
  process.exit(exitCode);
}

run();