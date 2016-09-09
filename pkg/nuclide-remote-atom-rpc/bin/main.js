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

var main = _asyncToGenerator(function* (argv) {
  yield setupLogging();
  setupErrorHandling();

  logger.debug('nuclide-remote-atom with arguments: ' + argv._);

  // TODO(t10180322): Support the --wait argument.
  // TODO(t10180337): Consider a batch API for openFile().
  for (var arg of argv._) {
    var _parseLocationParameter = parseLocationParameter(arg);

    var _filePath = _parseLocationParameter.filePath;
    var _line = _parseLocationParameter.line;
    var _column = _parseLocationParameter.column;

    var realpath = undefined;
    var isDirectory = undefined;
    try {
      // eslint-disable-next-line babel/no-await-in-loop
      realpath = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.realpath(_filePath);
      // eslint-disable-next-line babel/no-await-in-loop
      var stats = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.stat(_filePath);
      isDirectory = stats.isDirectory();
    } catch (e) {
      process.stderr.write('Error: Cannot find file: ' + _filePath + '\n');
      process.stderr.write(e.stack);
      process.stderr.write('\n');
      return 1;
    }

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
      return 1;
    }
  }

  return 0;
});

var run = _asyncToGenerator(function* () {
  var _default$usage$demand$boolean$alias$describe$help$alias = (_yargs2 || _yargs()).default.usage('Usage: atom <file>').demand(1, 'At least one file name is required.').boolean('w').alias('wait', 'w').describe('w', 'Wait for the opened file to be closed in Atom before exiting').help('h').alias('h', 'help');

  var argv = _default$usage$demand$boolean$alias$describe$help$alias.argv;

  var exitCode = yield main(argv);
  process.exit(exitCode);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _CommandClient2;

function _CommandClient() {
  return _CommandClient2 = require('./CommandClient');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
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

function setupErrorHandling() {
  process.on('uncaughtException', function (event) {
    logger.error('Caught unhandled exception: ' + event.message, event.originalError);
    process.stderr.write('Unhandled exception: ' + event.message + '\n');
    process.exit(1);
  });

  process.on('unhandledRejection', function (error, promise) {
    logger.error('Caught unhandled rejection', error);
    process.stderr.write('Unhandled rejection: ' + error.message + '\n');
    process.exit(1);
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