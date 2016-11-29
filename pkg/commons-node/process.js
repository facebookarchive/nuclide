'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.psTree = exports.getChildrenOfProcess = exports.checkOutput = exports.ProcessExitError = exports.ProcessSystemError = exports.loggedCalls = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let _killProcess = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (childProcess, killTree) {
    childProcess.wasKilled = true;
    if (!killTree) {
      childProcess.kill();
      return;
    }
    if (/^win/.test(process.platform)) {
      yield killWindowsProcessTree(childProcess.pid);
    } else {
      yield killUnixProcessTree(childProcess);
    }
  });

  return function _killProcess(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let killUnixProcessTree = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (childProcess) {
    const children = yield getChildrenOfProcess(childProcess.pid);
    for (const child of children) {
      process.kill(child.pid, 'SIGTERM');
    }
    childProcess.kill();
  });

  return function killUnixProcessTree(_x3) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Simple wrapper around asyncExecute that throws if the exitCode is non-zero.
 */
let checkOutput = exports.checkOutput = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (command, args, options = {}) {
    const result = yield asyncExecute(command, args, options);
    if (result.exitCode !== 0) {
      const reason = result.exitCode != null ? `exitCode: ${ result.exitCode }` : `error: ${ (0, (_string || _load_string()).maybeToString)(result.errorMessage) }`;
      throw new Error(`asyncExecute "${ command }" failed with ${ reason }, ` + `stderr: ${ result.stderr }, stdout: ${ result.stdout }.`);
    }
    return result;
  });

  return function checkOutput(_x4, _x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * Run a command, accumulate the output. Errors are surfaced as stream errors and unsubscribing will
 * kill the process.
 */


let getChildrenOfProcess = exports.getChildrenOfProcess = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (processId) {
    const processes = yield psTree();

    return processes.filter(function (processInfo) {
      return processInfo.parentPid === processId;
    });
  });

  return function getChildrenOfProcess(_x7) {
    return _ref4.apply(this, arguments);
  };
})();

let psTree = exports.psTree = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* () {
    let psPromise;
    const isWindows = isWindowsPlatform();
    if (isWindows) {
      // See also: https://github.com/nodejs/node-v0.x-archive/issues/2318
      psPromise = checkOutput('wmic.exe', ['PROCESS', 'GET', 'ParentProcessId,ProcessId,Name']);
    } else {
      psPromise = checkOutput('ps', ['-A', '-o', 'ppid,pid,comm']);
    }
    const { stdout } = yield psPromise;
    return parsePsOutput(stdout);
  });

  return function psTree() {
    return _ref5.apply(this, arguments);
  };
})();

exports.safeSpawn = safeSpawn;
exports.createArgsForScriptCommand = createArgsForScriptCommand;
exports.scriptSafeSpawn = scriptSafeSpawn;
exports.scriptSafeSpawnAndObserveOutput = scriptSafeSpawnAndObserveOutput;
exports.killProcess = killProcess;
exports.createProcessStream = createProcessStream;
exports.observeProcessExit = observeProcessExit;
exports.getOutputStream = getOutputStream;
exports.observeProcess = observeProcess;
exports.asyncExecute = asyncExecute;
exports.runCommand = runCommand;
exports.getOriginalEnvironment = getOriginalEnvironment;
exports.exitEventToMessage = exitEventToMessage;
exports.parsePsOutput = parsePsOutput;

var _child_process = _interopRequireDefault(require('child_process'));

var _observable;

function _load_observable() {
  return _observable = require('./observable');
}

var _stream;

function _load_stream() {
  return _stream = require('./stream');
}

var _string;

function _load_string() {
  return _string = require('./string');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _shellQuote;

function _load_shellQuote() {
  return _shellQuote = require('shell-quote');
}

var _performanceNow;

function _load_performanceNow() {
  return _performanceNow = _interopRequireDefault(require('./performanceNow'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Node crashes if we allow buffers that are too large.
const DEFAULT_MAX_BUFFER = 100 * 1024 * 1024;

const MAX_LOGGED_CALLS = 100;
const PREVERVED_HISTORY_CALLS = 50;

const loggedCalls = exports.loggedCalls = [];
function logCall(duration, command, args) {
  // Trim the history once in a while, to avoid doing expensive array
  // manipulation all the time after we reached the end of the history
  if (loggedCalls.length > MAX_LOGGED_CALLS) {
    loggedCalls.splice(0, loggedCalls.length - PREVERVED_HISTORY_CALLS, { time: new Date(), duration: 0, command: '... history stripped ...' });
  }
  loggedCalls.push({
    duration,
    command: [command, ...args].join(' '),
    time: new Date()
  });
}

class ProcessSystemError extends Error {

  constructor(opts) {
    super(`"${ opts.command }" failed with code ${ opts.code }`);
    this.name = 'ProcessSystemError';
    this.command = opts.command;
    this.args = opts.args;
    this.options = opts.options;
    this.code = opts.code;
    this.originalError = opts.originalError;
  }
}

exports.ProcessSystemError = ProcessSystemError;
class ProcessExitError extends Error {

  constructor(opts) {
    super(`"${ opts.command }" failed with ${ exitEventToMessage(opts.exitMessage) }\n\n${ opts.stderr }`);
    this.name = 'ProcessExitError';
    this.command = opts.command;
    this.args = opts.args;
    this.options = opts.options;
    this.exitMessage = opts.exitMessage;
    this.code = opts.exitMessage.exitCode;
    this.stdout = opts.stdout;
    this.stderr = opts.stderr;
  }
}

exports.ProcessExitError = ProcessExitError;


const STREAM_NAMES = ['stdin', 'stdout', 'stderr'];

function logError(...args) {
  // Can't use nuclide-logging here to not cause cycle dependency.
  // eslint-disable-next-line no-console
  console.error(...args);
}

function log(...args) {
  // Can't use nuclide-logging here to not cause cycle dependency.
  // eslint-disable-next-line no-console
  console.log(...args);
}

function monitorStreamErrors(process, command, args, options) {
  STREAM_NAMES.forEach(streamName => {
    // $FlowIssue
    const stream = process[streamName];
    if (stream == null) {
      return;
    }
    stream.on('error', error => {
      // This can happen without the full execution of the command to fail,
      // but we want to learn about it.
      logError(`stream error on stream ${ streamName } with command:`, command, args, options, 'error:', error);
    });
  });
}

/**
 * Basically like spawn, except it handles and logs errors instead of crashing
 * the process. This is much lower-level than asyncExecute. Unless you have a
 * specific reason you should use asyncExecute instead.
 */
function safeSpawn(command, args = [], options = {}) {
  const now = (0, (_performanceNow || _load_performanceNow()).default)();
  const child = _child_process.default.spawn(command, args, prepareProcessOptions(options));
  monitorStreamErrors(child, command, args, options);
  child.on('error', error => {
    logError('error with command:', command, args, options, 'error:', error);
  });
  if (!options || !options.dontLogInNuclide) {
    child.on('close', () => {
      logCall(Math.round((0, (_performanceNow || _load_performanceNow()).default)() - now), command, args);
    });
  }
  writeToStdin(child, options);
  return child;
}

/**
 * Takes the command and args that you would normally pass to `spawn()` and returns `newArgs` such
 * that you should call it with `spawn('script', newArgs)` to run the original command/args pair
 * under `script`.
 */
function createArgsForScriptCommand(command, args = []) {
  if (process.platform === 'darwin') {
    // On OS X, script takes the program to run and its arguments as varargs at the end.
    return ['-q', '/dev/null', command].concat(args);
  } else {
    // On Linux, script takes the command to run as the -c parameter.
    const allArgs = [command].concat(args);
    return ['-q', '/dev/null', '-c', (0, (_shellQuote || _load_shellQuote()).quote)(allArgs)];
  }
}

/**
 * Basically like safeSpawn, but runs the command with the `script` command.
 * `script` ensures terminal-like environment and commands we run give colored output.
 */
function scriptSafeSpawn(command, args = [], options = {}) {
  const newArgs = createArgsForScriptCommand(command, args);
  return safeSpawn('script', newArgs, options);
}

/**
 * Wraps scriptSafeSpawn with an Observable that lets you listen to the stdout and
 * stderr of the spawned process.
 */
function scriptSafeSpawnAndObserveOutput(command, args = [], options = {}, killTreeOnComplete = false) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    let childProcess = scriptSafeSpawn(command, args, options);

    childProcess.stdout.on('data', data => {
      observer.next({ stdout: data.toString() });
    });

    let stderr = '';
    childProcess.stderr.on('data', data => {
      stderr += data;
      observer.next({ stderr: data.toString() });
    });

    childProcess.on('exit', exitCode => {
      if (exitCode !== 0) {
        observer.error(stderr);
      } else {
        observer.complete();
      }
      childProcess = null;
    });

    return () => {
      if (childProcess) {
        killProcess(childProcess, killTreeOnComplete);
      }
    };
  });
}

/**
 * Creates an observable with the following properties:
 *
 * 1. It contains a process that's created using the provided factory when you subscribe.
 * 2. It doesn't complete until the process exits (or errors).
 * 3. The process is killed when you unsubscribe.
 *
 * This means that a single observable instance can be used to spawn multiple processes. Indeed, if
 * you subscribe multiple times, multiple processes *will* be spawned.
 *
 * IMPORTANT: The exit event does NOT mean that all stdout and stderr events have been received.
 */
function _createProcessStream(createProcess, throwOnError, killTreeOnComplete) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    const process = createProcess();
    let finished = false;

    // If the process returned by `createProcess()` was not created by it (or at least in the same
    // tick), it's possible that its error event has already been dispatched. This is a bug that
    // needs to be fixed in the caller. Generally, that would just mean refactoring your code to
    // create the process in the function you pass. If for some reason, this is absolutely not
    // possible, you need to make sure that the process is passed here immediately after it's
    // created (i.e. before an ENOENT error event would be dispatched). Don't refactor your code to
    // avoid this function; you'll have the same bug, you just won't be notified! XD

    if (!(process.exitCode == null && !process.killed)) {
      throw new Error('Process already exited. (This indicates a race condition in Nuclide.)');
    }

    const errors = _rxjsBundlesRxMinJs.Observable.fromEvent(process, 'error');
    const exit = observeProcessExitMessage(process);

    return _rxjsBundlesRxMinJs.Observable.of(process)
    // Don't complete until we say so!
    .merge(_rxjsBundlesRxMinJs.Observable.never())
    // Get the errors.
    .takeUntil(throwOnError ? errors.flatMap(_rxjsBundlesRxMinJs.Observable.throw) : errors).takeUntil(exit).do({
      error: () => {
        finished = true;
      },
      complete: () => {
        finished = true;
      }
    }).finally(() => {
      if (!process.wasKilled && !finished) {
        killProcess(process, killTreeOnComplete);
      }
    });
  });
}

function killProcess(childProcess, killTree) {
  log(`Ending process stream. Killing process ${ childProcess.pid }`);
  _killProcess(childProcess, killTree).then(() => {}, error => {
    logError(`Killing process ${ childProcess.pid } failed`, error);
  });
}

function killWindowsProcessTree(pid) {
  return new Promise((resolve, reject) => {
    _child_process.default.exec(`taskkill /pid ${ pid } /T /F`, error => {
      if (error == null) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function createProcessStream(createProcess, killTreeOnComplete = false) {
  return _createProcessStream(createProcess, true, killTreeOnComplete);
}

function observeProcessExitMessage(process) {
  return _rxjsBundlesRxMinJs.Observable.fromEvent(process, 'exit', (exitCode, signal) => ({ kind: 'exit', exitCode, signal }))
  // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
  .filter(message => message.signal !== 'SIGUSR1').take(1);
}

/**
 * Observe the stdout, stderr and exit code of a process.
 * stdout and stderr are split by newlines.
 */
function observeProcessExit(createProcess, killTreeOnComplete = false) {
  return _createProcessStream(createProcess, false, killTreeOnComplete).flatMap(observeProcessExitMessage);
}

function getOutputStream(process, killTreeOnComplete = false) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    // We need to start listening for the exit event immediately, but defer emitting it until the
    // (buffered) output streams end.
    const exit = observeProcessExit(() => process, killTreeOnComplete).publishReplay();
    const exitSub = exit.connect();

    const error = _rxjsBundlesRxMinJs.Observable.fromEvent(process, 'error').map(errorObj => ({ kind: 'error', error: errorObj }));
    // It's possible for stdout and stderr to remain open (even indefinitely) after the exit event.
    // This utility, however, treats the exit event as stream-ending, which helps us to avoid easy
    // bugs. We give a short (100ms) timeout for the stdout and stderr streams to close.
    const close = exit.delay(100);
    const stdout = (0, (_observable || _load_observable()).splitStream)((0, (_stream || _load_stream()).observeStream)(process.stdout).takeUntil(close)).map(data => ({ kind: 'stdout', data }));
    const stderr = (0, (_observable || _load_observable()).splitStream)((0, (_stream || _load_stream()).observeStream)(process.stderr).takeUntil(close)).map(data => ({ kind: 'stderr', data }));

    return (0, (_observable || _load_observable()).takeWhileInclusive)(_rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.merge(stdout, stderr).concat(exit), error), event => event.kind !== 'error' && event.kind !== 'exit').finally(() => {
      exitSub.unsubscribe();
    });
  });
}

/**
 * Observe the stdout, stderr and exit code of a process.
 */
function observeProcess(createProcess, killTreeOnComplete = false) {
  return _createProcessStream(createProcess, false, killTreeOnComplete).flatMap(getOutputStream);
}

let FB_INCLUDE_PATHS;
try {
  FB_INCLUDE_PATHS = require('./fb-config').FB_INCLUDE_PATHS;
} catch (error) {
  FB_INCLUDE_PATHS = [];
}

let DEFAULT_PATH_INCLUDE = [...FB_INCLUDE_PATHS, '/usr/local/bin'];

function prepareProcessOptions(options) {
  return Object.assign({}, options, {
    env: preparePathEnvironment(options.env)
  });
}

function preparePathEnvironment(env) {
  const originalEnv = Object.assign({}, process.env, env);
  if (isWindowsPlatform()) {
    return originalEnv;
  }
  const seperator = ':';
  const existingPath = originalEnv.PATH || '';
  return Object.assign({}, originalEnv, {
    PATH: [existingPath, ...DEFAULT_PATH_INCLUDE].join(seperator)
  });
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
function asyncExecute(command, args, options = {}) {
  const now = (0, (_performanceNow || _load_performanceNow()).default)();
  return new Promise((resolve, reject) => {
    const process = _child_process.default.execFile(command, args, prepareProcessOptions(Object.assign({
      maxBuffer: DEFAULT_MAX_BUFFER
    }, options)),
    // Node embeds various properties like code/errno in the Error object.
    (err, /* Error */stdoutBuf, stderrBuf) => {
      if (!options || !options.dontLogInNuclide) {
        logCall(Math.round((0, (_performanceNow || _load_performanceNow()).default)() - now), command, args);
      }
      const stdout = stdoutBuf.toString('utf8');
      const stderr = stderrBuf.toString('utf8');
      if (err == null) {
        resolve({
          stdout,
          stderr,
          exitCode: 0
        });
      } else if (Number.isInteger(err.code)) {
        resolve({
          stdout,
          stderr,
          exitCode: err.code
        });
      } else {
        resolve({
          stdout,
          stderr,
          errorCode: err.errno || 'EUNKNOWN',
          errorMessage: err.message
        });
      }
    });
    writeToStdin(process, options);
  });
}

function writeToStdin(childProcess, options) {
  if (typeof options.stdin === 'string' && childProcess.stdin != null) {
    // Note that the Node docs have this scary warning about stdin.end() on
    // http://nodejs.org/api/child_process.html#child_process_child_stdin:
    //
    // "A Writable Stream that represents the child process's stdin. Closing
    // this stream via end() often causes the child process to terminate."
    //
    // In practice, this has not appeared to cause any issues thus far.
    childProcess.stdin.write(options.stdin);
    childProcess.stdin.end();
  }
}function runCommand(command, args = [], options = {}, killTreeOnComplete = false) {
  return observeProcess(() => safeSpawn(command, args, options), killTreeOnComplete).reduce((acc, event) => {
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
        acc.exitMessage = event;
        break;
    }
    return acc;
  }, {
    error: null,
    stdout: '',
    stderr: '',
    exitMessage: null
  }).map(acc => {
    if (acc.error != null) {
      throw new ProcessSystemError({
        command,
        args,
        options,
        code: acc.error.code, // Alias of errno
        originalError: acc.error });
    }
    if (acc.exitMessage != null && acc.exitMessage.exitCode !== 0) {
      throw new ProcessExitError({
        command,
        args,
        options,
        exitMessage: acc.exitMessage,
        stdout: acc.stdout,
        stderr: acc.stderr
      });
    }
    return acc.stdout;
  });
}

// If provided, read the original environment from NUCLIDE_ORIGINAL_ENV.
// This should contain the base64-encoded output of `env -0`.
let cachedOriginalEnvironment = null;
const LOADED_SHELL_EVENT = 'core:loaded-shell-environment';

if (typeof atom !== 'undefined') {
  const disposable = atom.packages.onDidTriggerActivationHook(LOADED_SHELL_EVENT, () => {
    cachedOriginalEnvironment = null;
    // No need to include default paths now that the environment is loaded.
    DEFAULT_PATH_INCLUDE = [];
    disposable.dispose();
  });
}

function getOriginalEnvironment() {
  if (cachedOriginalEnvironment != null) {
    return cachedOriginalEnvironment;
  }

  const { NUCLIDE_ORIGINAL_ENV } = process.env;
  if (NUCLIDE_ORIGINAL_ENV != null && NUCLIDE_ORIGINAL_ENV.trim() !== '') {
    const envString = new Buffer(NUCLIDE_ORIGINAL_ENV, 'base64').toString();
    cachedOriginalEnvironment = {};
    for (const envVar of envString.split('\0')) {
      // envVar should look like A=value_of_A
      const equalIndex = envVar.indexOf('=');
      if (equalIndex !== -1) {
        cachedOriginalEnvironment[envVar.substring(0, equalIndex)] = envVar.substring(equalIndex + 1);
      }
    }
  } else {
    cachedOriginalEnvironment = process.env;
  }
  return cachedOriginalEnvironment;
}

// Returns a string suitable for including in displayed error messages.
function exitEventToMessage(event) {
  if (event.exitCode != null) {
    return `exit code ${ event.exitCode }`;
  } else {
    if (!(event.signal != null)) {
      throw new Error('Invariant violation: "event.signal != null"');
    }

    return `signal ${ event.signal }`;
  }
}

function isWindowsPlatform() {
  return (/^win/.test(process.platform)
  );
}

function parsePsOutput(psOutput) {
  // Remove the first header line.
  const lines = psOutput.split(/\n|\r\n/).slice(1);

  return lines.map(line => {
    const columns = line.trim().split(/\s+/);
    const [parentPid, pid] = columns;
    const command = columns.slice(2).join(' ');

    return {
      command,
      parentPid: parseInt(parentPid, 10),
      pid: parseInt(pid, 10)
    };
  });
}