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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x12, _x13, _x14) { var _again = true; _function: while (_again) { var object = _x12, property = _x13, receiver = _x14; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x12 = parent; _x13 = property; _x14 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.safeSpawn = safeSpawn;
exports.createArgsForScriptCommand = createArgsForScriptCommand;
exports.scriptSafeSpawn = scriptSafeSpawn;
exports.scriptSafeSpawnAndObserveOutput = scriptSafeSpawnAndObserveOutput;
exports.createProcessStream = createProcessStream;
exports.observeProcessExit = observeProcessExit;
exports.getOutputStream = getOutputStream;
exports.observeProcess = observeProcess;
exports.asyncExecute = asyncExecute;

/**
 * Simple wrapper around asyncExecute that throws if the exitCode is non-zero.
 */

var checkOutput = _asyncToGenerator(function* (command, args) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var result = yield asyncExecute(command, args, options);
  if (result.exitCode !== 0) {
    var reason = result.exitCode != null ? 'exitCode: ' + result.exitCode : 'error: ' + (0, (_string2 || _string()).maybeToString)(result.errorMessage);
    throw new Error('asyncExecute "' + command + '" failed with ' + reason + ', ' + ('stderr: ' + result.stderr + ', stdout: ' + result.stdout + '.'));
  }
  return result;
}

/**
 * Run a command, accumulate the output. Errors are surfaced as stream errors and unsubscribing will
 * kill the process.
 */
);

exports.checkOutput = checkOutput;
exports.runCommand = runCommand;
exports.getOriginalEnvironment = getOriginalEnvironment;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _child_process2;

function _child_process() {
  return _child_process2 = _interopRequireDefault(require('child_process'));
}

var _observable2;

function _observable() {
  return _observable2 = require('./observable');
}

var _stream2;

function _stream() {
  return _stream2 = require('./stream');
}

var _string2;

function _string() {
  return _string2 = require('./string');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _shellQuote2;

function _shellQuote() {
  return _shellQuote2 = require('shell-quote');
}

// Node crashes if we allow buffers that are too large.
var DEFAULT_MAX_BUFFER = 100 * 1024 * 1024;

var ProcessSystemError = (function (_Error) {
  _inherits(ProcessSystemError, _Error);

  function ProcessSystemError(opts) {
    _classCallCheck(this, ProcessSystemError);

    // TODO: Remove `captureStackTrace()` call and `this.message` assignment when we remove our
    // class transform and switch to native classes.
    var message = '"' + opts.command + '" failed with code ' + opts.code;
    _get(Object.getPrototypeOf(ProcessSystemError.prototype), 'constructor', this).call(this, message);
    this.name = 'ProcessSystemError';
    this.message = message;
    this.command = opts.command;
    this.args = opts.args;
    this.options = opts.options;
    this.code = opts.code;
    this.originalError = opts.originalError;
    Error.captureStackTrace(this, this.constructor);
  }

  return ProcessSystemError;
})(Error);

exports.ProcessSystemError = ProcessSystemError;

var ProcessExitError = (function (_Error2) {
  _inherits(ProcessExitError, _Error2);

  function ProcessExitError(opts) {
    _classCallCheck(this, ProcessExitError);

    // TODO: Remove `captureStackTrace()` call and `this.message` assignment when we remove our
    // class transform and switch to native classes.
    var message = '"' + opts.command + '" failed with code ' + opts.code + '\n\n' + opts.stderr;
    _get(Object.getPrototypeOf(ProcessExitError.prototype), 'constructor', this).call(this, message);
    this.name = 'ProcessExitError';
    this.message = message;
    this.command = opts.command;
    this.args = opts.args;
    this.options = opts.options;
    this.code = opts.code;
    this.stdout = opts.stdout;
    this.stderr = opts.stderr;
    Error.captureStackTrace(this, this.constructor);
  }

  return ProcessExitError;
})(Error);

exports.ProcessExitError = ProcessExitError;

var STREAM_NAMES = ['stdin', 'stdout', 'stderr'];

function logError() {
  // Can't use nuclide-logging here to not cause cycle dependency.
  // eslint-disable-next-line no-console
  console.error.apply(console, arguments);
}

function monitorStreamErrors(process, command, args, options) {
  STREAM_NAMES.forEach(function (streamName) {
    // $FlowIssue
    var stream = process[streamName];
    if (stream == null) {
      return;
    }
    stream.on('error', function (error) {
      // This can happen without the full execution of the command to fail,
      // but we want to learn about it.
      logError('stream error on stream ' + streamName + ' with command:', command, args, options, 'error:', error);
    });
  });
}

/**
 * Basically like spawn, except it handles and logs errors instead of crashing
 * the process. This is much lower-level than asyncExecute. Unless you have a
 * specific reason you should use asyncExecute instead.
 */

function safeSpawn(command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var child = (_child_process2 || _child_process()).default.spawn(command, args, options);
  monitorStreamErrors(child, command, args, options);
  child.on('error', function (error) {
    logError('error with command:', command, args, options, 'error:', error);
  });
  return child;
}

/**
 * Takes the command and args that you would normally pass to `spawn()` and returns `newArgs` such
 * that you should call it with `spawn('script', newArgs)` to run the original command/args pair
 * under `script`.
 */

function createArgsForScriptCommand(command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  if (process.platform === 'darwin') {
    // On OS X, script takes the program to run and its arguments as varargs at the end.
    return ['-q', '/dev/null', command].concat(args);
  } else {
    // On Linux, script takes the command to run as the -c parameter.
    var allArgs = [command].concat(args);
    return ['-q', '/dev/null', '-c', (0, (_shellQuote2 || _shellQuote()).quote)(allArgs)];
  }
}

/**
 * Basically like safeSpawn, but runs the command with the `script` command.
 * `script` ensures terminal-like environment and commands we run give colored output.
 */

function scriptSafeSpawn(command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var newArgs = createArgsForScriptCommand(command, args);
  return safeSpawn('script', newArgs, options);
}

/**
 * Wraps scriptSafeSpawn with an Observable that lets you listen to the stdout and
 * stderr of the spawned process.
 */

function scriptSafeSpawnAndObserveOutput(command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.create(function (observer) {
    var childProcess = scriptSafeSpawn(command, args, options);

    childProcess.stdout.on('data', function (data) {
      observer.next({ stdout: data.toString() });
    });

    var stderr = '';
    childProcess.stderr.on('data', function (data) {
      stderr += data;
      observer.next({ stderr: data.toString() });
    });

    childProcess.on('exit', function (exitCode) {
      if (exitCode !== 0) {
        observer.error(stderr);
      } else {
        observer.complete();
      }
      childProcess = null;
    });

    return function () {
      if (childProcess) {
        childProcess.kill();
      }
    };
  });
}

/**
 * Creates an observable with the following properties:
 *
 * 1. It contains a process that's created using the provided factory upon subscription.
 * 2. It doesn't complete until the process exits (or errors).
 * 3. The process is killed when there are no more subscribers.
 *
 * IMPORTANT: The exit event does NOT mean that all stdout and stderr events have been received.
 */
function _createProcessStream(createProcess, throwOnError) {
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.defer(function () {
    var process = createProcess();
    var finished = false;

    // If the process returned by `createProcess()` was not created by it (or at least in the same
    // tick), it's possible that its error event has already been dispatched. This is a bug that
    // needs to be fixed in the caller. Generally, that would just mean refactoring your code to
    // create the process in the function you pass. If for some reason, this is absolutely not
    // possible, you need to make sure that the process is passed here immediately after it's
    // created (i.e. before an ENOENT error event would be dispatched). Don't refactor your code to
    // avoid this function; you'll have the same bug, you just won't be notified! XD
    (0, (_assert2 || _assert()).default)(process.exitCode == null && !process.killed, 'Process already exited. (This indicates a race condition in Nuclide.)');

    var errors = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromEvent(process, 'error');
    var exit = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromEvent(process, 'exit', function (code, signal) {
      return signal;
    })
    // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
    .filter(function (signal) {
      return signal !== 'SIGUSR1';
    });

    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(process)
    // Don't complete until we say so!
    .merge((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.never())
    // Get the errors.
    .takeUntil(throwOnError ? errors.flatMap((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.throw) : errors).takeUntil(exit).do({
      error: function error() {
        finished = true;
      },
      complete: function complete() {
        finished = true;
      }
    }).finally(function () {
      if (!finished) {
        process.kill();
      }
    });
  });
}

function createProcessStream(createProcess) {
  return _createProcessStream(createProcess, true);
}

/**
 * Observe the stdout, stderr and exit code of a process.
 * stdout and stderr are split by newlines.
 */

function observeProcessExit(createProcess) {
  return _createProcessStream(createProcess, false).flatMap(function (process) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromEvent(process, 'exit').take(1);
  });
}

function getOutputStream(process) {
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.defer(function () {
    // We need to start listening for the exit event immediately, but defer emitting it until the
    // output streams end.
    var exit = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromEvent(process, 'exit').take(1).map(function (exitCode) {
      return { kind: 'exit', exitCode: exitCode };
    }).publishReplay();
    var exitSub = exit.connect();

    var error = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromEvent(process, 'error').map(function (errorObj) {
      return { kind: 'error', error: errorObj };
    });
    var stdout = (0, (_observable2 || _observable()).splitStream)((0, (_stream2 || _stream()).observeStream)(process.stdout)).map(function (data) {
      return { kind: 'stdout', data: data };
    });
    var stderr = (0, (_observable2 || _observable()).splitStream)((0, (_stream2 || _stream()).observeStream)(process.stderr)).map(function (data) {
      return { kind: 'stderr', data: data };
    });

    return (0, (_observable2 || _observable()).takeWhileInclusive)((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge(stdout, stderr).concat(exit), error), function (event) {
      return event.kind !== 'error' && event.kind !== 'exit';
    }).finally(function () {
      exitSub.unsubscribe();
    });
  });
}

/**
 * Observe the stdout, stderr and exit code of a process.
 */

function observeProcess(createProcess) {
  return _createProcessStream(createProcess, false).flatMap(getOutputStream);
}

/**
 * Returns a promise that resolves to the result of executing a process.
 *
 * @param command The command to execute.
 * @param args The arguments to pass to the command.
 * @param options Options for changing how to run the command.
 *     Supports the options listed here: http://nodejs.org/api/child_process.html
 *     in addition to the custom options listed in AsyncExecuteOptions.
 */

function asyncExecute(command, args) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  return new Promise(function (resolve, reject) {
    var process = (_child_process2 || _child_process()).default.execFile(command, args, _extends({
      maxBuffer: DEFAULT_MAX_BUFFER
    }, options),
    // Node embeds various properties like code/errno in the Error object.
    function (err, /* Error */stdoutBuf, stderrBuf) {
      var stdout = stdoutBuf.toString('utf8');
      var stderr = stderrBuf.toString('utf8');
      if (err != null) {
        if (Number.isInteger(err.code)) {
          resolve({
            stdout: stdout,
            stderr: stderr,
            exitCode: err.code
          });
        } else {
          resolve({
            stdout: stdout,
            stderr: stderr,
            errorCode: err.errno || 'EUNKNOWN',
            errorMessage: err.message
          });
        }
      }
      resolve({
        stdout: stdout,
        stderr: stderr,
        exitCode: 0
      });
    });
    if (typeof options.stdin === 'string' && process.stdin != null) {
      // Note that the Node docs have this scary warning about stdin.end() on
      // http://nodejs.org/api/child_process.html#child_process_child_stdin:
      //
      // "A Writable Stream that represents the child process's stdin. Closing
      // this stream via end() often causes the child process to terminate."
      //
      // In practice, this has not appeared to cause any issues thus far.
      process.stdin.write(options.stdin);
      process.stdin.end();
    }
  });
}

function runCommand(command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  return observeProcess(function () {
    return safeSpawn(command, args, options);
  }).reduce(function (acc, event) {
    switch (event.kind) {
      case 'stdout':
        acc.stdout += event.data;
        break;
      case 'stderr':
        acc.stderr += event.data;
        break;
      case 'error':
        acc.error = event.error;
        break;
      case 'exit':
        acc.exitCode = event.exitCode;
        break;
    }
    return acc;
  }, { error: null, stdout: '', stderr: '', exitCode: null }).map(function (acc) {
    if (acc.error != null) {
      throw new ProcessSystemError({
        command: command,
        args: args,
        options: options,
        code: acc.error.code, // Alias of errno
        originalError: acc.error });
    }
    // Just in case.
    if (acc.exitCode != null && acc.exitCode !== 0) {
      throw new ProcessExitError({
        command: command,
        args: args,
        options: options,
        code: acc.exitCode,
        stdout: acc.stdout,
        stderr: acc.stderr
      });
    }
    return acc.stdout;
  });
}

// If provided, read the original environment from NUCLIDE_ORIGINAL_ENV.
// This should contain the base64-encoded output of `env -0`.
var cachedOriginalEnvironment = null;

function getOriginalEnvironment() {
  if (cachedOriginalEnvironment != null) {
    return cachedOriginalEnvironment;
  }

  var NUCLIDE_ORIGINAL_ENV = process.env.NUCLIDE_ORIGINAL_ENV;

  if (NUCLIDE_ORIGINAL_ENV != null) {
    var envString = new Buffer(NUCLIDE_ORIGINAL_ENV, 'base64').toString();
    cachedOriginalEnvironment = {};
    for (var envVar of envString.split('\0')) {
      // envVar should look like A=value_of_A
      var equalIndex = envVar.indexOf('=');
      if (equalIndex !== -1) {
        cachedOriginalEnvironment[envVar.substring(0, equalIndex)] = envVar.substring(equalIndex + 1);
      }
    }
  } else {
    cachedOriginalEnvironment = process.env;
  }
  return cachedOriginalEnvironment;
}

// If the process fails to even start up, exitCode will not be set
// and errorCode / errorMessage will contain the actual error message.
// Otherwise, exitCode will always be defined.

// The contents to write to stdin.