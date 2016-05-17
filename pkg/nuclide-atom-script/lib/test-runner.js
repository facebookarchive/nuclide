Object.defineProperty(exports, '__esModule', {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _console2;

function _console() {
  return _console2 = require('./console');
}

/* eslint-disable no-console */
exports.default = _asyncToGenerator(function* (params) {
  // Verify that a --log-file argument has been specified.
  var logFile = params.logFile;

  if (logFile == null) {
    console.error('Must specify arguments via --log-file.');
    return 1;
  }

  // Parse the args passed as JSON.
  var args = undefined;
  try {
    args = JSON.parse(logFile);
  } catch (e) {
    console.error('Failed to parse --log-file argument: ' + logFile);
    return 1;
  }

  // Set global.atom before running any more code.
  var applicationDelegate = params.buildDefaultApplicationDelegate();
  var atomEnvParams = {
    applicationDelegate: applicationDelegate,
    window: window,
    document: document
  };
  global.atom = params.buildAtomEnvironment(atomEnvParams);
  global.atom.atomScriptMode = true;

  // Set up the console before running any user code.

  var _ref = yield (0, (_console2 || _console()).instrumentConsole)(args['stdout']);

  var queue = _ref.queue;
  var shutdown = _ref.shutdown;

  var pathArg = args['path'];
  if (typeof pathArg !== 'string') {
    console.error('Must specify a path in the --log-file JSON');
    return 1;
  }

  var entryPoint = args['path'];
  // $FlowFixMe: entryPoint is determined dynamically rather than a string literal.
  var handler = require(entryPoint);

  var exitCode = undefined;
  try {
    exitCode = yield handler(args['args']);
  } catch (e) {
    console.error(e);
    exitCode = 1;
  }

  // Insert a sentinel executor that will not be called until all of the other promises in the
  // queue have been flushed.
  yield queue.submit(function (resolve) {
    return resolve();
  });
  shutdown();

  return exitCode;
});

/* eslint-enable no-console */
module.exports = exports.default;

/** Absolute paths to tests to run. Could be paths to files or directories. */

/** A boolean indicating whether or not the tests are running headless. */

/** Creates the `atom` global object. */

/** Currently undocumnted, but seemingly necessary to use buildAtomEnvironment(). */

/** An optional path to a log file to which test output should be logged. */

/** Unclear what the contract of this is, but we will not be using it. */