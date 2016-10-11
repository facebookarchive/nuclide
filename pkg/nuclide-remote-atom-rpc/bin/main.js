var getRealPath = _asyncToGenerator(function* (filePath) {
  if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(filePath)) {
    return filePath;
  }
  return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.resolve(filePath);
});

var getIsDirectory = _asyncToGenerator(function* (filePath) {
  try {
    if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(filePath)) {
      return false;
    } else {
      var stats = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.stat(filePath);
      return stats.isDirectory();
    }
  } catch (e) {
    return false;
  }
});

var main = _asyncToGenerator(function* (argv) {
  yield (0, (_errors || _load_errors()).setupLogging)();
  (0, (_errors || _load_errors()).setupErrorHandling)();

  logger.debug('nuclide-remote-atom with arguments: ' + argv._);

  // TODO(t10180337): Consider a batch API for openFile().
  if (argv._ != null && argv._.length > 0) {
    var commands = argv.port != null ? (yield (0, (_CommandClient || _load_CommandClient()).startCommands)(argv.port, argv.family)) : (yield (0, (_CommandClient || _load_CommandClient()).getCommands)());

    for (var arg of argv._) {
      var _parseLocationParameter = parseLocationParameter(arg);

      var _filePath = _parseLocationParameter.filePath;
      var _line = _parseLocationParameter.line;
      var _column = _parseLocationParameter.column;

      // eslint-disable-next-line babel/no-await-in-loop
      var realpath = yield getRealPath(_filePath);
      // eslint-disable-next-line babel/no-await-in-loop
      var isDirectory = yield getIsDirectory(realpath);
      try {
        if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(realpath)) {
          var result = commands.openRemoteFile(realpath, _line, _column, Boolean(argv.wait)).refCount();
          if (argv.wait) {
            // eslint-disable-next-line babel/no-await-in-loop
            yield result.toPromise();
          } else {
            // eslint-disable-next-line babel/no-await-in-loop
            yield result.take(1).toPromise();
          }
        } else if (isDirectory) {
          // file/line/wait are ignored on directories
          // eslint-disable-next-line babel/no-await-in-loop
          yield commands.addProject(realpath);
        } else {
          var result = commands.openFile(realpath, _line, _column, Boolean(argv.wait)).refCount();
          if (argv.wait) {
            // eslint-disable-next-line babel/no-await-in-loop
            yield result.toPromise();
          } else {
            // eslint-disable-next-line babel/no-await-in-loop
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

var run = _asyncToGenerator(function* () {
  var _default$usage$help$alias$demand$option$option$option$option = (_yargs || _load_yargs()).default.usage('Usage: atom <file>').help('h').alias('h', 'help').demand(1, 'At least one file name is required.').option('a', {
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

  var argv = _default$usage$help$alias$demand$option$option$option$option.argv;

  if (argv.port == null !== (argv.family == null)) {
    process.stderr.write('Invalid options. Both port and family must be specified.\n');
    process.exit((_errors || _load_errors()).EXIT_CODE_INVALID_ARGUMENTS);
  }
  var exitCode = yield main(argv);
  process.exit(exitCode);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _CommandClient;

function _load_CommandClient() {
  return _CommandClient = require('./CommandClient');
}

var _commonsNodeFsPromise;

function _load_commonsNodeFsPromise() {
  return _commonsNodeFsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _errors;

function _load_errors() {
  return _errors = require('./errors');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _yargs;

function _load_yargs() {
  return _yargs = _interopRequireDefault(require('yargs'));
}

var logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

var LocationSuffixRegExp = /(:\d+)(:\d+)?$/;

// This code is coped from Atom: src/main-process/atom-application.coffee
function parseLocationParameter(value) {
  var filePath = value.replace(/[:\s]+$/, '');
  var match = filePath.match(LocationSuffixRegExp);

  var line = 0;
  var column = 0;
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
    filePath: filePath,
    line: line,
    column: column
  };
}

run();