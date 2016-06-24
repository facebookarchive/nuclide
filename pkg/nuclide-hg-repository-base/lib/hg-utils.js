Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Calls out to checkOutput using the 'hg' command.
 * @param options as specified by http://nodejs.org/api/child_process.html. Additional options:
 *   - NO_HGPLAIN set if the $HGPLAIN environment variable should not be used.
 *   - TTY_OUTPUT set if the command should be run as if it were attached to a tty.
 */

var hgAsyncExecute = _asyncToGenerator(function* (args, options) {
  if (!options.NO_HGPLAIN) {
    // Setting HGPLAIN=1 overrides any custom aliases a user has defined.
    if (options.env) {
      options.env.HGPLAIN = 1;
    } else {
      options.env = _extends({}, process.env || {}, { HGPLAIN: 1 });
    }
  }

  var cmd = undefined;
  if (options.TTY_OUTPUT) {
    cmd = 'script';
    args = (0, (_commonsNodeProcess2 || _commonsNodeProcess()).createArgsForScriptCommand)('hg', args);
  } else {
    cmd = 'hg';
  }
  var result = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).asyncExecute)(cmd, args, options);
  if (result.exitCode === 0) {
    return result;
  } else {
    (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('Error executing hg command: ' + JSON.stringify(args) + ' ' + ('options: ' + JSON.stringify(options) + ' ' + JSON.stringify(result)));
    if (result.stderr.length > 0 && result.stdout.length > 0) {
      throw new Error('hg error\nstderr: ' + result.stderr + '\nstdout: ' + result.stdout);
    } else {
      // One of `stderr` or `stdout` is empty - not both.
      throw new Error(result.stderr || result.stdout);
    }
  }
});

exports.hgAsyncExecute = hgAsyncExecute;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}