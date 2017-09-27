'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getRealPath = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (filePath) {
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(filePath)) {
      return filePath;
    }
    return (_nuclideUri || _load_nuclideUri()).default.resolve(filePath);
  });

  return function getRealPath(_x) {
    return _ref.apply(this, arguments);
  };
})();

let getIsDirectory = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (filePath) {
    try {
      if ((_nuclideUri || _load_nuclideUri()).default.isRemote(filePath)) {
        return false;
      } else {
        const stats = yield (_fsPromise || _load_fsPromise()).default.stat(filePath);
        return stats.isDirectory();
      }
    } catch (e) {
      return false;
    }
  });

  return function getIsDirectory(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let main = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (argv) {
    (0, (_errors || _load_errors()).setupLogging)();
    (0, (_errors || _load_errors()).setupErrorHandling)();

    logger.debug(`nuclide-remote-atom with arguments: ${argv._}`);

    // TODO(t10180337): Consider a batch API for openFile().
    if (argv._ != null && argv._.length > 0) {
      const commands = argv.port != null ? yield (0, (_CommandClient || _load_CommandClient()).startCommands)(argv.port, argv.family) : yield (0, (_CommandClient || _load_CommandClient()).getCommands)();

      for (const arg of argv._) {
        const { filePath, line, column } = parseLocationParameter(arg);
        // eslint-disable-next-line no-await-in-loop
        const realpath = yield getRealPath(filePath);
        // eslint-disable-next-line no-await-in-loop
        const isDirectory = yield getIsDirectory(realpath);
        try {
          if ((_nuclideUri || _load_nuclideUri()).default.isRemote(realpath)) {
            const result = commands.openRemoteFile(realpath, line, column, Boolean(argv.wait)).refCount();
            if (argv.wait) {
              // eslint-disable-next-line no-await-in-loop
              yield result.toPromise();
            } else {
              // eslint-disable-next-line no-await-in-loop
              yield result.take(1).toPromise();
            }
          } else if (isDirectory) {
            // file/line/wait are ignored on directories
            // eslint-disable-next-line no-await-in-loop
            yield commands.addProject(realpath);
          } else {
            const result = commands.openFile(realpath, line, column, Boolean(argv.wait)).refCount();
            if (argv.wait) {
              // eslint-disable-next-line no-await-in-loop
              yield result.toPromise();
            } else {
              // eslint-disable-next-line no-await-in-loop
              yield result.take(1).toPromise();
            }
          }
        } catch (e) {
          (0, (_errors || _load_errors()).reportErrorAndExit)(e, (_errors || _load_errors()).EXIT_CODE_APPLICATION_ERROR);
        }
      }
    }
    return (_errors || _load_errors()).EXIT_CODE_SUCCESS;
  });

  return function main(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

let run = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* () {
    const { argv } = (_yargs || _load_yargs()).default.usage('Usage: atom <file>').help('h').alias('h', 'help').demand(1, 'At least one file name is required.').option('a', {
      alias: 'add',
      describe: 'Ignored, as --add as always implied. ' + 'Included for compatibility with atom CLI.',
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
    const exitCode = yield main(argv);
    process.exit(exitCode);
  });

  return function run() {
    return _ref4.apply(this, arguments);
  };
})();

var _CommandClient;

function _load_CommandClient() {
  return _CommandClient = require('./CommandClient');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
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

run();