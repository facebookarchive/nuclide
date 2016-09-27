var setupLogging = _asyncToGenerator(function* () {
  // Initialize logging
  yield (0, (_nuclideLogging2 || _nuclideLogging()).initialUpdateConfig)();

  var config = {
    appenders: [(_nuclideLogging2 || _nuclideLogging()).CurrentDateFileAppender]
  };

  var serverLogAppenderConfig = yield (0, (_nuclideLogging2 || _nuclideLogging()).getServerLogAppenderConfig)();
  if (serverLogAppenderConfig) {
    config.appenders.push(serverLogAppenderConfig);
  }

  (0, (_nuclideLogging2 || _nuclideLogging()).updateConfig)(config);
});

var getRealPath = _asyncToGenerator(function* (filePath) {
  if ((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isRemote(filePath)) {
    return filePath;
  }
  return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.resolve(filePath);
});

var getIsDirectory = _asyncToGenerator(function* (filePath) {
  try {
    if ((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isRemote(filePath)) {
      return false;
    } else {
      var stats = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.stat(filePath);
      return stats.isDirectory();
    }
  } catch (e) {
    return false;
  }
});

var main = _asyncToGenerator(function* (argv) {
  yield setupLogging();
  setupErrorHandling();

  logger.debug('nuclide-remote-atom with arguments: ' + argv._);

  // TODO(t10180337): Consider a batch API for openFile().
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
      if (isDirectory) {
        // file/line/wait are ignored on directories
        // eslint-disable-next-line babel/no-await-in-loop
        yield (0, (_CommandClient2 || _CommandClient()).addProject)(realpath);
      } else {
        var result = (0, (_CommandClient2 || _CommandClient()).openFile)(realpath, _line, _column);
        if (argv.wait) {
          // eslint-disable-next-line babel/no-await-in-loop
          yield result.toPromise();
        } else {
          // eslint-disable-next-line babel/no-await-in-loop
          yield result.take(1).toPromise();
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
});

var run = _asyncToGenerator(function* () {
  var _default$usage$help$alias$demand$option$option = (_yargs2 || _yargs()).default.usage('Usage: atom <file>').help('h').alias('h', 'help').demand(1, 'At least one file name is required.').option('a', {
    alias: 'add',
    describe: 'Ignored, as --add as always implied. ' + 'Included for compatibility with atom CLI.',
    type: 'boolean'
  }).option('w', {
    alias: 'wait',
    describe: 'Wait for the opened file to be closed in Atom before exiting',
    type: 'boolean'
  });

  var argv = _default$usage$help$alias$demand$option$option.argv;

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

var _CommandClient2;

function _CommandClient() {
  return _CommandClient2 = require('./CommandClient');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _yargs2;

function _yargs() {
  return _yargs2 = _interopRequireDefault(require('yargs'));
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var EXIT_CODE_SUCCESS = 0;
var EXIT_CODE_UNKNOWN_ERROR = 1;
var EXIT_CODE_CONNECTION_ERROR = 3;

function setupErrorHandling() {
  process.on('uncaughtException', function (event) {
    logger.error('Caught unhandled exception: ' + event.message, event.originalError);
    process.stderr.write('Unhandled exception: ' + event.message + '\n');
    process.exit(EXIT_CODE_UNKNOWN_ERROR);
  });

  process.on('unhandledRejection', function (error, promise) {
    logger.error('Caught unhandled rejection', error);
    process.stderr.write('Unhandled rejection: ' + error.message + '\n');
    process.exit(EXIT_CODE_UNKNOWN_ERROR);
  });
}

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