"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.callHHClient = callHHClient;
exports.hackRangeToAtomRange = hackRangeToAtomRange;
exports.hackSpanToAtomRange = hackSpanToAtomRange;
exports.atomPointOfHackRangeStart = atomPointOfHackRangeStart;
exports.atomPointFromHack = atomPointFromHack;

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _promiseExecutors() {
  const data = require("../../commons-node/promise-executors");

  _promiseExecutors = function () {
    return data;
  };

  return data;
}

function _hackConfig() {
  const data = require("./hack-config");

  _hackConfig = function () {
    return data;
  };

  return data;
}

function _simpleTextBuffer() {
  const data = require("simple-text-buffer");

  _simpleTextBuffer = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

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
const HH_SERVER_INIT_MESSAGE = 'hh_server still initializing';
const HH_SERVER_BUSY_MESSAGE = 'hh_server is busy';
let hhPromiseQueue = null;
/**
 * Executes hh_client with proper arguments returning the result string or json object.
 */

async function callHHClient(args, errorStream, processInput, filePath) {
  if (!hhPromiseQueue) {
    hhPromiseQueue = new (_promiseExecutors().PromiseQueue)();
  }

  const hackExecOptions = await (0, _hackConfig().getHackExecOptions)(filePath);

  if (!hackExecOptions) {
    return null;
  }

  const {
    hackRoot,
    hackCommand
  } = hackExecOptions;
  return (0, _nuclideAnalytics().trackTiming)(trackingIdOfHackArgs(args) + ':plus-queue', () => {
    if (!hhPromiseQueue) {
      throw new Error("Invariant violation: \"hhPromiseQueue\"");
    }

    return hhPromiseQueue.submit(async () => {
      // Append args on the end of our commands.
      const defaults = ['--json', '--retries', '0', '--retry-if-init', 'false', '--from', 'nuclide'];
      const allArgs = defaults.concat(args);
      allArgs.push(hackRoot);
      let execResult = null;

      _hackConfig().logger.debug(`Calling Hack: ${hackCommand} with ${allArgs.toString()}`);

      execResult = await (0, _nuclideAnalytics().trackTiming)(trackingIdOfHackArgs(args), () => {
        // TODO: Can't we do a better job with error handling here?
        try {
          return (0, _process().runCommandDetailed)(hackCommand, allArgs, {
            input: processInput,
            isExitError: () => false
          }).toPromise();
        } catch (err) {
          return {
            stdout: '',
            stderr: ''
          };
        }
      });
      const {
        stdout,
        stderr
      } = execResult;

      if (stderr.indexOf(HH_SERVER_INIT_MESSAGE) !== -1) {
        throw new Error(`${HH_SERVER_INIT_MESSAGE}: try: \`arc build\` or try again later!`);
      } else if (stderr.startsWith(HH_SERVER_BUSY_MESSAGE)) {
        throw new Error(`${HH_SERVER_BUSY_MESSAGE}: try: \`arc build\` or try again later!`);
      }

      const output = errorStream ? stderr : stdout; // keeping this at "Trace" log level, since output for --color contains
      // entire file contents, which fills the logs too quickly

      _hackConfig().logger.trace(`Hack output for ${allArgs.toString()}: ${output}`);

      try {
        const result = JSON.parse(output);

        if (!(result.hackRoot === undefined)) {
          throw new Error("Invariant violation: \"result.hackRoot === undefined\"");
        } // result may be an array, so don't return a new object.


        result.hackRoot = hackRoot;
        return result;
      } catch (err) {
        const errorMessage = `hh_client error, args: [${args.join(',')}]
stdout: ${stdout}, stderr: ${stderr}`;

        _hackConfig().logger.error(errorMessage);

        throw new Error(errorMessage);
      }
    });
  });
}

function hackRangeToAtomRange(position) {
  return new (_simpleTextBuffer().Range)(atomPointOfHackRangeStart(position), // Atom ranges exclude the endpoint.
  atomPointFromHack(position.line, position.char_end + 1));
}

function hackSpanToAtomRange(span) {
  return new (_simpleTextBuffer().Range)(atomPointFromHack(span.line_start, span.char_start), // Atom ranges exclude the endpoint.
  atomPointFromHack(span.line_end, span.char_end + 1));
}

function atomPointOfHackRangeStart(position) {
  return atomPointFromHack(position.line, position.char_start);
}

function atomPointFromHack(hackLine, hackColumn) {
  return new (_simpleTextBuffer().Point)(hackLine - 1, hackColumn - 1);
}

function trackingIdOfHackArgs(args) {
  const command = args.length === 0 ? '--diagnostics' : args[0];

  if (!command.startsWith('--')) {
    throw new Error("Invariant violation: \"command.startsWith('--')\"");
  }

  return 'hh_client:' + command.substr(2);
}