'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.callHHClient = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
  * Executes hh_client with proper arguments returning the result string or json object.
  */
let callHHClient = exports.callHHClient = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (args, errorStream, processInput, filePath) {
    if (!hhPromiseQueue) {
      hhPromiseQueue = new (_promiseExecutors || _load_promiseExecutors()).PromiseQueue();
    }

    const hackExecOptions = yield (0, (_hackConfig || _load_hackConfig()).getHackExecOptions)(filePath);
    if (!hackExecOptions) {
      return null;
    }
    const { hackRoot, hackCommand } = hackExecOptions;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(trackingIdOfHackArgs(args) + ':plus-queue', function () {
      if (!hhPromiseQueue) {
        throw new Error('Invariant violation: "hhPromiseQueue"');
      }

      return hhPromiseQueue.submit((0, _asyncToGenerator.default)(function* () {
        // Append args on the end of our commands.
        const defaults = ['--json', '--retries', '0', '--retry-if-init', 'false', '--from', 'nuclide'];

        const allArgs = defaults.concat(args);
        allArgs.push(hackRoot);

        let execResult = null;

        (_hackConfig || _load_hackConfig()).logger.debug(`Calling Hack: ${hackCommand} with ${allArgs.toString()}`);
        execResult = yield (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(trackingIdOfHackArgs(args), function () {
          // TODO: Can't we do a better job with error handling here?
          try {
            return (0, (_process || _load_process()).runCommandDetailed)(hackCommand, allArgs, {
              input: processInput,
              isExitError: function () {
                return false;
              }
            }).toPromise();
          } catch (err) {
            return { stdout: '', stderr: '' };
          }
        });

        const { stdout, stderr } = execResult;
        if (stderr.indexOf(HH_SERVER_INIT_MESSAGE) !== -1) {
          throw new Error(`${HH_SERVER_INIT_MESSAGE}: try: \`arc build\` or try again later!`);
        } else if (stderr.startsWith(HH_SERVER_BUSY_MESSAGE)) {
          throw new Error(`${HH_SERVER_BUSY_MESSAGE}: try: \`arc build\` or try again later!`);
        }

        const output = errorStream ? stderr : stdout;
        // keeping this at "Trace" log level, since output for --color contains
        // entire file contents, which fills the logs too quickly
        (_hackConfig || _load_hackConfig()).logger.trace(`Hack output for ${allArgs.toString()}: ${output}`);
        try {
          const result = JSON.parse(output);

          if (!(result.hackRoot === undefined)) {
            throw new Error('Invariant violation: "result.hackRoot === undefined"');
          }
          // result may be an array, so don't return a new object.


          result.hackRoot = hackRoot;
          return result;
        } catch (err) {
          const errorMessage = `hh_client error, args: [${args.join(',')}]
stdout: ${stdout}, stderr: ${stderr}`;
          (_hackConfig || _load_hackConfig()).logger.error(errorMessage);
          throw new Error(errorMessage);
        }
      }));
    });
  });

  return function callHHClient(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

exports.hackRangeToAtomRange = hackRangeToAtomRange;
exports.hackSpanToAtomRange = hackSpanToAtomRange;
exports.atomPointOfHackRangeStart = atomPointOfHackRangeStart;
exports.atomPointFromHack = atomPointFromHack;

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _promiseExecutors;

function _load_promiseExecutors() {
  return _promiseExecutors = require('../../commons-node/promise-executors');
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HH_SERVER_INIT_MESSAGE = 'hh_server still initializing'; /**
                                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                                * All rights reserved.
                                                                *
                                                                * This source code is licensed under the license found in the LICENSE file in
                                                                * the root directory of this source tree.
                                                                *
                                                                * 
                                                                * @format
                                                                */

const HH_SERVER_BUSY_MESSAGE = 'hh_server is busy';


let hhPromiseQueue = null;function hackRangeToAtomRange(position) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(atomPointOfHackRangeStart(position),
  // Atom ranges exclude the endpoint.
  atomPointFromHack(position.line, position.char_end + 1));
}

function hackSpanToAtomRange(span) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(atomPointFromHack(span.line_start, span.char_start),
  // Atom ranges exclude the endpoint.
  atomPointFromHack(span.line_end, span.char_end + 1));
}

function atomPointOfHackRangeStart(position) {
  return atomPointFromHack(position.line, position.char_start);
}

function atomPointFromHack(hackLine, hackColumn) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(hackLine - 1, hackColumn - 1);
}

function trackingIdOfHackArgs(args) {
  const command = args.length === 0 ? '--diagnostics' : args[0];

  if (!command.startsWith('--')) {
    throw new Error('Invariant violation: "command.startsWith(\'--\')"');
  }

  return 'hh_client:' + command.substr(2);
}