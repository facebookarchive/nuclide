Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Executes hh_client with proper arguments returning the result string or json object.
 */

var callHHClient = _asyncToGenerator(function* (args, errorStream, processInput, filePath) {

  if (!hhPromiseQueue) {
    hhPromiseQueue = new (_commonsNodePromiseExecutors || _load_commonsNodePromiseExecutors()).PromiseQueue();
  }

  var hackExecOptions = yield (0, (_hackConfig || _load_hackConfig()).getHackExecOptions)(filePath);
  if (!hackExecOptions) {
    return null;
  }
  var hackRoot = hackExecOptions.hackRoot;
  var hackCommand = hackExecOptions.hackCommand;

  return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(trackingIdOfHackArgs(args) + ':plus-queue', function () {
    (0, (_assert || _load_assert()).default)(hhPromiseQueue);
    return hhPromiseQueue.submit(_asyncToGenerator(function* (resolve, reject) {
      // Append args on the end of our commands.
      var defaults = ['--json', '--retries', '0', '--retry-if-init', 'false', '--from', 'nuclide'];

      var allArgs = defaults.concat(args);
      allArgs.push(hackRoot);

      var execResult = null;
      try {
        (_hackConfig2 || _load_hackConfig2()).logger.logTrace('Calling Hack: ' + hackCommand + ' with ' + allArgs.toString());
        execResult = yield (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(trackingIdOfHackArgs(args), function () {
          return (0, (_commonsNodeProcess || _load_commonsNodeProcess()).asyncExecute)(hackCommand, allArgs, { stdin: processInput });
        });
      } catch (err) {
        reject(err);
        return;
      }
      var _execResult = execResult;
      var stdout = _execResult.stdout;
      var stderr = _execResult.stderr;

      if (stderr.indexOf(HH_SERVER_INIT_MESSAGE) !== -1) {
        reject(new Error(HH_SERVER_INIT_MESSAGE + ': try: `arc build` or try again later!'));
        return;
      } else if (stderr.startsWith(HH_SERVER_BUSY_MESSAGE)) {
        reject(new Error(HH_SERVER_BUSY_MESSAGE + ': try: `arc build` or try again later!'));
        return;
      }

      var output = errorStream ? stderr : stdout;
      (_hackConfig2 || _load_hackConfig2()).logger.logTrace('Hack output for ' + allArgs.toString() + ': ' + output);
      try {
        var result = JSON.parse(output);
        (0, (_assert || _load_assert()).default)(result.hackRoot === undefined);
        // result may be an array, so don't return a new object.
        result.hackRoot = hackRoot;
        resolve(result);
      } catch (err) {
        var errorMessage = 'hh_client error, args: [' + args.join(',') + ']\nstdout: ' + stdout + ', stderr: ' + stderr;
        (_hackConfig2 || _load_hackConfig2()).logger.logError(errorMessage);
        reject(new Error(errorMessage));
      }
    }));
  });
});

exports.callHHClient = callHHClient;
exports.hackRangeToAtomRange = hackRangeToAtomRange;
exports.atomPointOfHackRangeStart = atomPointOfHackRangeStart;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodeProcess;

function _load_commonsNodeProcess() {
  return _commonsNodeProcess = require('../../commons-node/process');
}

var _commonsNodePromiseExecutors;

function _load_commonsNodePromiseExecutors() {
  return _commonsNodePromiseExecutors = require('../../commons-node/promise-executors');
}

var _hackConfig;

function _load_hackConfig() {
  return _hackConfig = require('./hack-config');
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var HH_SERVER_INIT_MESSAGE = 'hh_server still initializing';
var HH_SERVER_BUSY_MESSAGE = 'hh_server is busy';

var _hackConfig2;

function _load_hackConfig2() {
  return _hackConfig2 = require('./hack-config');
}

var hhPromiseQueue = null;
function hackRangeToAtomRange(position) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(atomPointOfHackRangeStart(position), new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(position.line - 1, position.char_end));
}

function atomPointOfHackRangeStart(position) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(position.line - 1, position.char_start - 1);
}

var HACK_WORD_REGEX = /[a-zA-Z0-9_$]+/g;

exports.HACK_WORD_REGEX = HACK_WORD_REGEX;
function trackingIdOfHackArgs(args) {
  var command = args.length === 0 ? '--diagnostics' : args[0];
  (0, (_assert || _load_assert()).default)(command.startsWith('--'));
  return 'hh_client:' + command.substr(2);
}