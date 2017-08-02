'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.killUnixProcessTree = exports.loggedCalls = exports.ProcessTimeoutError = exports.MaxBufferExceededError = exports.ProcessSystemError = exports.ProcessExitError = exports.psTree = exports.getChildrenOfProcess = exports.getOriginalEnvironment = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getOriginalEnvironment = exports.getOriginalEnvironment = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* () {
    yield new Promise(function (resolve) {
      whenShellEnvironmentLoaded(resolve);
    });
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
  });

  return function getOriginalEnvironment() {
    return _ref6.apply(this, arguments);
  };
})();

/**
 * Returns a string suitable for including in displayed error messages.
 */


let getChildrenOfProcess = exports.getChildrenOfProcess = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (processId) {
    const processes = yield psTree();

    return processes.filter(function (processInfo) {
      return processInfo.parentPid === processId;
    });
  });

  return function getChildrenOfProcess(_x) {
    return _ref7.apply(this, arguments);
  };
})();

/**
 * Get a list of descendants, sorted by increasing depth (including the one with the provided pid).
 */


let getDescendantsOfProcess = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (pid) {
    const processes = yield psTree();
    let rootProcessInfo;
    const pidToChildren = new (_collection || _load_collection()).MultiMap();
    processes.forEach(function (info) {
      if (info.pid === pid) {
        rootProcessInfo = info;
      }
      pidToChildren.add(info.parentPid, info);
    });
    const descendants = rootProcessInfo == null ? [] : [rootProcessInfo];
    // Walk through the array, adding the children of the current element to the end. This
    // breadth-first traversal means that the elements will be sorted by depth.
    for (let i = 0; i < descendants.length; i++) {
      const info = descendants[i];
      const children = pidToChildren.get(info.pid);
      descendants.push(...Array.from(children));
    }
    return descendants;
  });

  return function getDescendantsOfProcess(_x2) {
    return _ref8.apply(this, arguments);
  };
})();

let psTree = exports.psTree = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* () {
    const stdout = isWindowsPlatform() ? // See also: https://github.com/nodejs/node-v0.x-archive/issues/2318
    yield runCommand('wmic.exe', ['PROCESS', 'GET', 'ParentProcessId,ProcessId,Name']).toPromise() : yield runCommand('ps', ['-A', '-o', 'ppid,pid,comm']).toPromise();
    return parsePsOutput(stdout);
  });

  return function psTree() {
    return _ref9.apply(this, arguments);
  };
})();

let _killProcess = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (proc, killTree) {
    proc.wasKilled = true;
    if (!killTree) {
      proc.kill();
      return;
    }
    if (/^win/.test(process.platform)) {
      yield killWindowsProcessTree(proc.pid);
    } else {
      yield killUnixProcessTree(proc);
    }
  });

  return function _killProcess(_x3, _x4) {
    return _ref10.apply(this, arguments);
  };
})();

let killUnixProcessTree = exports.killUnixProcessTree = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* (proc) {
    const descendants = yield getDescendantsOfProcess(proc.pid);
    // Kill the processes, starting with those of greatest depth.
    for (const info of descendants.reverse()) {
      killPid(info.pid);
    }
  });

  return function killUnixProcessTree(_x5) {
    return _ref11.apply(this, arguments);
  };
})();

exports.runCommand = runCommand;
exports.observeProcess = observeProcess;
exports.runCommandDetailed = runCommandDetailed;
exports.observeProcessRaw = observeProcessRaw;
exports.spawn = spawn;
exports.fork = fork;
exports.getOutputStream = getOutputStream;
exports.scriptifyCommand = scriptifyCommand;
exports.killProcess = killProcess;
exports.killPid = killPid;
exports.exitEventToMessage = exitEventToMessage;
exports.parsePsOutput = parsePsOutput;
exports.preventStreamsFromThrowing = preventStreamsFromThrowing;
exports.logStreamErrors = logStreamErrors;

var _child_process = _interopRequireDefault(require('child_process'));

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('./UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('./nuclideUri'));
}

var _performanceNow;

function _load_performanceNow() {
  return _performanceNow = _interopRequireDefault(require('./performanceNow'));
}

var _collection;

function _load_collection() {
  return _collection = require('./collection');
}

var _event;

function _load_event() {
  return _event = require('./event');
}

var _stream;

function _load_stream() {
  return _stream = require('./stream');
}

var _observable;

function _load_observable() {
  return _observable = require('./observable');
}

var _string;

function _load_string() {
  return _string = require('./string');
}

var _whenShellEnvironmentLoaded;

function _load_whenShellEnvironmentLoaded() {
  return _whenShellEnvironmentLoaded = _interopRequireDefault(require('./whenShellEnvironmentLoaded'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Run a command, accumulate the output. Errors are surfaced as stream errors and unsubscribing will
 * kill the process. In addition to the options accepted by Node's [`child_process.spawn()`][1]
 * function, `runCommand()` also accepts the following:
 *
 * - `input` {string | Observable<string>} Text to write to the new process's stdin.
 * - `killTreeWhenDone` {boolean} `false` by default. If you pass `true`, unsubscribing from the
 *   observable will kill not only this process but also its descendants.
 * - `isExitError` {function} Determines whether a ProcessExitError should be raised based on the
 *   exit message. By default, this is a function that returns `true` if the exit code is non-zero.
 * - `maxBuffer` {number} The maximum amount of stdout and stderror to accumulate. If the process
 *   produces more of either, a MaxBufferExceededError will be emitted.
 * - `timeout` {number} The number of milliseconds to wait before killing the process and emitting
 *   an error. This is mostly provided for backwards compatibility, as you can get the same result
 *   by using the `.timeout()` operator on the returned observable.
 *
 * The observable returned by this function can error with any of the following:
 *
 * - [Node System Errors][2] Represented as augmented `Error` objects, these errors include things
 *   like `ENOENT`.
 * - `ProcessExitError` Indicate that the process has ended cleanly, but with an unsuccessful exit
 *    code. Whether a `ProcessExitError` is thrown is determined by the `isExitError` option. This
 *    error includes the exit code as well as accumulated stdout and stderr. See its definition for
 *    more information.
 * - `MaxBufferExceededError` Thrown if either the stdout or stderr exceeds the value specified by
 *    the `maxBuffer` option.
 * - `ProcessTimeoutError` Thrown if the process doesn't complete within the time specified by the
 *   `timeout` option.
 *
 * Example:
 *
 * ```js
 * const subscription = runCommand('ps', ['-e', '-o', 'pid,comm'])
 *   .map(stdout => {
 *     return stdout.split('\n')
 *       .slice(1)
 *       .map(line => {
 *         const words = line.trim().split(' ');
 *         return {
 *           pid: words[0],
 *           command: words.slice(1).join(' '),
 *         };
 *       })
 *       .sort((p1, p2) => p2.pid - p1.pid);
 *   })
 *   .subscribe(processes => {
 *     console.log(`The process with the highest pid is ${processes[0].command}`);
 *   });
 * ```
 *
 * [1]: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
 * [2]: https://nodejs.org/api/errors.html#errors_class_system_error
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

//
//                 __   __   __   __   ___  __   __         __
//                |__) |__) /  \ /  ` |__  /__` /__`     | /__`
//                |    |  \ \__/ \__, |___ .__/ .__/ .\__/ .__/
//
// This module contains utilities for spawning processes in Nuclide. In general:
//
// - They accept similar arguments.
// - They return an observable.
// - The process is spawned if/when you subscribe to the observable.
// - If you unsubscribe before the observable completes, the process is killed.
// - The observable errors if the process completes with a non-zero exit code (by default; this can
//   be changed) or if the process can't be spawned.
//
// The most important functions in this module are `runCommand()`--for running a quick command and
// getting its output--and `observeProcess()`--for streaming output from a process. They'll handle
// the majority of use cases.
//
// ## Why observables?
//
// Unlike Promises, observables have a standardized, composable cancelation mechanism _today_.
// Moreover, observables integrate nicely with Atom's callback + IDisposable formula for cancelable,
// async APIs. Along with React, [RxJS] is one of the core libaries utilized by Nuclide.
//
// ## Why errors?
//
// In the past, we had some process APIs that used errors and some that used return values.
// Consistency has obvious benefits; standardizing on errors makes sense because:
//
// - The error-throwing APIs were the most used, by a large margin.
// - Unhandled errors can be caught and logged at the top level.
// - Observables have a separate channel for errors which allows for cool, error-aware operators
//   like `retry()` and caching.
// - Errors in observables are stream-ending. This means you won't continue to do work in a chain of
//   operators accidentally.
//
// [RxJS]: http://reactivex.io/rxjs/

function runCommand(command, args = [], options = {}, rest) {
  return runCommandDetailed(command, args, options).map(event => event.stdout);
}

/**
 * Returns an observable that spawns a process and emits events on stdout, stderr and exit. Output
 * is buffered by line. Unsubscribing before the observable completes will kill the process. This
 * function accepts the same options as `runCommand()`, and throws the same errors.
 *
 * Besides emitting multiple events, another difference with `runCommand()` is the ProcessExitErrors
 * thrown by `observeProcess()`. Whereas ProcessExitErrors thrown by `runCommand()` contain the
 * entirety of stdout and stderr, those thrown by `observeProcess()` contain a truncated amount of
 * stderr and no stdout. This is because `observeProcess()` is usually used with long-running
 * processes that may continue to produce output for a long while. The abbreviated stderr is
 * included to help with debugging.
 *
 * Example:
 *
 * ```js
 * const filesToTail: Observable<NuclideUri> = f();
 * const subscription = filesToTail
 *   // `switchMap()` means only one file will be tailed at a time.
 *   .switchMap(path => observeProcess('tail', ['-f', path]))
 *   .filter(event => event.kind === 'stdout')
 *   .map(event => event.data)
 *   .subscribe(line => {
 *     console.log(line);
 *   });
 * ```
 */


// TODO(T17266325): Replace this in favor of `atom.whenShellEnvironmentLoaded()` when it lands
function observeProcess(command, args, options) {
  return spawn(command, args, options).flatMap(proc => getOutputStream(proc, options));
}

/**
 * Identical to `runCommand()`, but instead of only emitting the accumulated stdout, the returned
 * observable emits an object containing the accumulated stdout, the accumulated stderr, and the
 * exit code.
 *
 * In general, you should prefer `runCommand()`, however, this function is useful for when stderr is
 * needed even if the process exits successfully.
 */
function runCommandDetailed(command, args = [], options = {}, rest) {
  var _ref;

  const maxBuffer = ((_ref = options) != null ? _ref.maxBuffer : _ref) || DEFAULT_MAX_BUFFER;
  return observeProcess(command, args, Object.assign({}, options, { maxBuffer })).catch(error => {
    // Catch ProcessExitErrors so that we can add stdout to them.
    if (error instanceof ProcessExitError) {
      return _rxjsBundlesRxMinJs.Observable.of({ kind: 'process-exit-error', error });
    }
    throw error;
  }).reduce((acc, event) => {
    switch (event.kind) {
      case 'stdout':
        return Object.assign({}, acc, { stdout: acc.stdout + event.data });
      case 'stderr':
        return Object.assign({}, acc, { stderr: acc.stderr + event.data });
      case 'exit':
        return Object.assign({}, acc, { exitCode: event.exitCode });
      case 'process-exit-error':
        const { error } = event;
        throw new ProcessExitError(error.exitCode, error.signal, error.process, acc.stderr, acc.stdout);
      default:
        throw new Error(`Invalid event kind: ${event.kind}`);
    }
  }, { stdout: '', stderr: '', exitCode: null });
}

/**
 * Identical to `observeProcess()`, but doesn't buffer by line.
 */
function observeProcessRaw(command, args, options) {
  return spawn(command, args, options).flatMap(proc => getOutputStream(proc, Object.assign({}, options, { splitByLines: false })));
}

//
// # Lower-level APIs
//
// The following functions are used to create the higher-level APIs above. It's rare that you'll
// need to use them by themselves.
//

/**
 * Creates an observable that spawns a process and emits it. Like with `runCommand()` and
 * `observeProcess()`, if you unsubscribe from the returned observable, the process will be killed
 * (or, if it hasn't yet been spawned, it won't be created).
 *
 * Unlike `observeProcess()`, the returned observable won't throw ProcessExitErrors--only system
 * errors raised when trying to spawn the process. This is because it's meant to be composed with
 * `getOutputStream` which terminates based on the "close" event whereas this terminates on the
 * "exit" event to ensure that you don't try to interact with a dead process.
 *
 * This function is useful when, for example, you need access to the process in order to send IPC
 * messages to it. It can be composed with `getOutputStream()` to give the same functionality of
 * `observeProcess()`:
 *
 * ```js
 * const subscription = spawn(...)
 *   .map(proc => {
 *     // With access to the process, you can send IPC messages.
 *
 *     return getOutputStream(proc);
 *   })
 *   .subscribe(event => {
 *     // These events are the same as those emitted by `observeProcess()`.
 *   });
 * ```
 */
function spawn(command, args, options) {
  return createProcessStream('spawn', command, args, options);
}

/**
 * Identical to `spawn()` (above), but uses `child_process.fork()` to create the process.
 */
function fork(modulePath, args, options) {
  return createProcessStream('fork', modulePath, args, options);
}

/**
 * Creates a stream of sensibly-ordered stdout, stdin, and exit messages from a process. Generally,
 * you shouldn't use this function and should instead use `observeProcess()` (which makes use of
 * this for you).
 *
 * IMPORTANT: If you must use this function, it's very important that the process you give it was
 * just synchronously created. Otherwise, you can end up missing messages.
 *
 * This function intentionally does not close the process when you unsubscribe. It's usually used in
 * conjunction with `spawn()` which does that already.
 */
function getOutputStream(proc, options, rest) {
  var _ref2, _ref3, _ref4, _ref5;

  const chunk = ((_ref2 = options) != null ? _ref2.splitByLines : _ref2) === false ? x => x : (_observable || _load_observable()).splitStream;
  const maxBuffer = (_ref3 = options) != null ? _ref3.maxBuffer : _ref3;
  const isExitError = ((_ref4 = options) != null ? _ref4.isExitError : _ref4) || isExitErrorDefault;
  const exitErrorBufferSize = ((_ref5 = options) != null ? _ref5.exitErrorBufferSize : _ref5) || 2000;
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    const stdoutEvents = chunk(limitBufferSize((0, (_stream || _load_stream()).observeStream)(proc.stdout), maxBuffer, 'stdout')).map(data => ({ kind: 'stdout', data }));
    const stderrEvents = chunk(limitBufferSize((0, (_stream || _load_stream()).observeStream)(proc.stderr), maxBuffer, 'stderr')).map(data => ({ kind: 'stderr', data })).share();

    // Accumulate the first `exitErrorBufferSize` bytes of stderr so that we can give feedback about
    // about exit errors (then stop so we don't fill up memory with it).
    const accumulatedStderr = (0, (_observable || _load_observable()).takeWhileInclusive)(stderrEvents.scan((acc, event) => (acc + event.data).slice(0, exitErrorBufferSize), '').startWith(''), acc => acc.length < exitErrorBufferSize);

    // We need to start listening for the exit event immediately, but defer emitting it until the
    // (buffered) output streams end.
    const closeEvents = _rxjsBundlesRxMinJs.Observable.fromEvent(proc,
    // We listen to the "close" event instead of "exit" because we want to get all of the stdout
    // and stderr.
    'close', (exitCode, signal) => ({
      kind: 'exit',
      exitCode,
      signal
    })).filter(isRealExit).take(1).withLatestFrom(accumulatedStderr).map(([event, stderr]) => {
      if (isExitError(event)) {
        throw new ProcessExitError(event.exitCode, event.signal, proc, stderr);
      }
      return event;
    }).publishReplay();
    const exitSub = closeEvents.connect();

    return (0, (_observable || _load_observable()).takeWhileInclusive)(_rxjsBundlesRxMinJs.Observable.merge(stdoutEvents, stderrEvents).concat(closeEvents), event => event.kind !== 'error' && event.kind !== 'exit').finally(() => {
      exitSub.unsubscribe();
    });
  });
}

//
// # Miscellaneous Utilities
//
// The following utilites don't spawn processes or necessarily use observables. Instead, they're
// used to format arguments to the above functions or for acting on already-spawned processes.
//

/**
 * Takes the arguments that you would normally pass to `spawn()` and returns an array of new
 * arguments to use to run the command under `script`.
 *
 * Example:
 *
 * ```js
 * observeProcess(...scriptifyCommand('hg', ['diff'])).subscribe(...);
 * ```
 *
 * See also `nicifyCommand()` which does a similar thing but for `nice`.
 */
function scriptifyCommand(command, args = [], options) {
  if (process.platform === 'darwin') {
    // On OS X, script takes the program to run and its arguments as varargs at the end.
    return ['script', ['-q', '/dev/null', command].concat(args), options];
  } else {
    // On Linux, script takes the command to run as the -c parameter so we have to combine all of
    // the arguments into a single string. Apparently, because of how `script` works, however, we
    // wind up with double escapes. So we just strip one level of them.
    const joined = (0, (_string || _load_string()).shellQuote)([command, ...args]).replace(/\\\\/g, '\\');
    const opts = options || {};
    const env = opts.env || {};
    return ['script', ['-q', '/dev/null', '-c', joined],
    // `script` will use `SHELL`, but shells have different behaviors with regard to escaping. To
    // make sure that out escaping is correct, we need to force a particular shell.
    // $FlowIssue: Adding SHELL here makes it no longer really T
    Object.assign({}, opts, { env: Object.assign({}, env, { SHELL: '/bin/bash' }) })];
  }
}

/**
 * Kills a process and, optionally, its descendants.
 */
function killProcess(proc, killTree) {
  _killProcess(proc, killTree).then(() => {}, error => {
    logError(`Killing process ${proc.pid} failed`, error);
  });
}

/**
 * Kill the process with the provided pid.
 */
function killPid(pid) {
  try {
    process.kill(pid);
  } catch (err) {
    if (err.code !== 'ESRCH') {
      throw err;
    }
  }
}

// If provided, read the original environment from NUCLIDE_ORIGINAL_ENV.
// This should contain the base64-encoded output of `env -0`.
let cachedOriginalEnvironment = null;
function exitEventToMessage(event) {
  if (event.exitCode != null) {
    return `exit code ${event.exitCode}`;
  } else {
    if (!(event.signal != null)) {
      throw new Error('Invariant violation: "event.signal != null"');
    }

    return `signal ${event.signal}`;
  }
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

/**
 * Add no-op error handlers to the process's streams so that Node doesn't throw them.
 */
function preventStreamsFromThrowing(proc) {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(getStreamErrorEvents(proc).subscribe());
}

/**
 * Log errors from a process's streams. This function returns an `rxjs$ISubscription` so that it
 * can easily be used with `Observable.using()`.
 */
function logStreamErrors(proc, command, args, options) {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(getStreamErrorEvents(proc).do(([err, streamName]) => {
    logError(`stream error on stream ${streamName} with command:`, command, args, options, 'error:', err);
  }).subscribe());
}

//
// Types
//

// Exactly one of exitCode and signal will be non-null.
// Killing a process will result in a null exitCode but a non-null signal.


// In older versions of process.js, errors were emitted as messages instead of errors. This type
// exists to support the transition, but no new usages should be added.


//
// Errors
//

/**
 * An error thrown by process utils when the process exits with an error code. This type has all the
 * properties of ProcessExitMessage (except "kind").
 *
 * Note that the `stderr` property will only contain the complete stderr when thrown by the
 * output-accumulating functions (`runCommand()`, `runCommandDetailed()`). For others, like
 * `observeProcess()`, it will be truncated. Similarly, `stdout` will only be populated when the
 * error is thrown by output-accumulating functions. For others, it will always be `null`.
 */
class ProcessExitError extends Error {

  constructor(exitCode, signal, proc, stderr, stdout) {
    // $FlowIssue: This isn't typed in the Flow node type defs
    const { spawnargs } = proc;
    const commandName = spawnargs[0] === process.execPath ? spawnargs[1] : spawnargs[0];
    super(`"${commandName}" failed with ${exitEventToMessage({
      exitCode,
      signal
    })}\n\n${stderr}`);
    this.name = 'ProcessExitError';
    this.exitCode = exitCode;
    this.signal = signal;
    this.stderr = stderr;
    this.stdout = stdout;
    this.process = proc;
  }
}

exports.ProcessExitError = ProcessExitError; /**
                                              * Process system errors are just augmented Error objects. We wrap the errors and expose the process
                                              * since our utilities throw the errors before returning the process.
                                              */

class ProcessSystemError extends Error {

  constructor(err, proc) {
    super(err.message);
    this.name = 'ProcessSystemError';
    this.errno = err.errno;
    this.code = err.code;
    this.path = err.path;
    this.syscall = err.syscall;
    this.process = proc;
  }
}

exports.ProcessSystemError = ProcessSystemError;
class MaxBufferExceededError extends Error {
  constructor(streamName) {
    super(`${streamName} maxBuffer exceeded`);
    this.name = 'MaxBufferExceededError';
  }
}

exports.MaxBufferExceededError = MaxBufferExceededError;
class ProcessTimeoutError extends Error {
  constructor(timeout, proc) {
    // $FlowIssue: This isn't typed in the Flow node type defs
    const { spawnargs } = proc;
    const commandName = spawnargs[0] === process.execPath ? spawnargs[1] : spawnargs[0];
    super(`"${commandName}" timed out after ${timeout}ms`);
    this.name = 'ProcessTimeoutError';
  }
}

exports.ProcessTimeoutError = ProcessTimeoutError; //
// Internal Stuff
//
// Pay no attention! This is just stuff that's used internally to implement the good stuff.
//

// Node crashes if we allow buffers that are too large.

const DEFAULT_MAX_BUFFER = 100 * 1024 * 1024;

const MAX_LOGGED_CALLS = 100;
const PREVERVED_HISTORY_CALLS = 50;

const noopDisposable = { dispose: () => {} };
const whenShellEnvironmentLoaded = typeof atom !== 'undefined' && (_whenShellEnvironmentLoaded || _load_whenShellEnvironmentLoaded()).default && !atom.inSpecMode() ? (_whenShellEnvironmentLoaded || _load_whenShellEnvironmentLoaded()).default : cb => {
  cb();
  return noopDisposable;
};

const loggedCalls = exports.loggedCalls = [];
function logCall(duration, command, args) {
  // Trim the history once in a while, to avoid doing expensive array
  // manipulation all the time after we reached the end of the history
  if (loggedCalls.length > MAX_LOGGED_CALLS) {
    loggedCalls.splice(0, loggedCalls.length - PREVERVED_HISTORY_CALLS, {
      time: new Date(),
      duration: 0,
      command: '... history stripped ...'
    });
  }
  loggedCalls.push({
    duration,
    command: [command, ...args].join(' '),
    time: new Date()
  });
}

function logError(...args) {
  // Can't use nuclide-logging here to not cause cycle dependency.
  // eslint-disable-next-line no-console
  console.error(...args);
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
function createProcessStream(type = 'spawn', commandOrModulePath, args = [], options = {}) {
  const inputOption = options.input;
  let input;
  if (inputOption != null) {
    input = typeof inputOption === 'string' ? _rxjsBundlesRxMinJs.Observable.of(inputOption) : inputOption;
  }

  return (0, (_event || _load_event()).observableFromSubscribeFunction)(whenShellEnvironmentLoaded).take(1).switchMap(() => {
    const { dontLogInNuclide, killTreeWhenDone, timeout } = options;
    const enforceTimeout = timeout ? x =>
    // TODO: Use `timeoutWith()` when we upgrade to an RxJS that has it.
    timeoutWith(x, timeout, _rxjsBundlesRxMinJs.Observable.throw(new ProcessTimeoutError(timeout, proc))) : x => x;
    const proc = _child_process.default[type]((_nuclideUri || _load_nuclideUri()).default.expandHomeDir(commandOrModulePath), args,
    // $FlowFixMe: child_process$spawnOpts and child_process$forkOpts have incompatable stdio types.
    Object.assign({}, options));

    // Don't let Node throw stream errors and crash the process. Note that we never dispose of
    // this because stream errors can still occur after the user unsubscribes from our process
    // observable. That's okay; when the streams close, the listeners will be removed.
    preventStreamsFromThrowing(proc);

    // If we were to connect the error handler as part of the returned observable, unsubscribing
    // would cause it to be removed. That would leave no attached error handler, so node would
    // throw, triggering Atom's uncaught exception handler.
    const errors = _rxjsBundlesRxMinJs.Observable.fromEvent(proc, 'error').flatMap(_rxjsBundlesRxMinJs.Observable.throw).publish();
    errors.connect();

    const exitEvents = _rxjsBundlesRxMinJs.Observable.fromEvent(proc, 'exit', (exitCode, signal) => ({
      kind: 'exit',
      exitCode,
      signal
    })).filter(isRealExit).take(1);

    if (dontLogInNuclide !== true) {
      // Log the completion of the process. Note that we intentionally don't merge this with the
      // returned observable because we don't want to cancel the side-effect when the user
      // unsubscribes or when the process exits ("close" events come after "exit" events).
      const now = (0, (_performanceNow || _load_performanceNow()).default)();
      _rxjsBundlesRxMinJs.Observable.fromEvent(proc, 'close').do(() => {
        logCall(Math.round((0, (_performanceNow || _load_performanceNow()).default)() - now), commandOrModulePath, args);
      }).subscribe();
    }

    let finished = false;
    return enforceTimeout(_rxjsBundlesRxMinJs.Observable.using(
    // Log stream errors, but only for as long as you're subscribed to the process observable.
    () => logStreamErrors(proc, commandOrModulePath, args, options), () => _rxjsBundlesRxMinJs.Observable.merge(
    // Node [delays the emission of process errors][1] by a tick in order to give
    // consumers a chance to subscribe to the error event. This means that our observable
    // would normally emit the process and then, a tick later, error. However, it's more
    // convenient to never emit the process if there was an error. Although observables
    // don't require the error to be delayed at all, the underlying event emitter
    // abstraction does, so we'll just roll with that and use `pid == null` as a signal
    // that an error is forthcoming.
    //
    // [1]: https://github.com/nodejs/node/blob/v7.10.0/lib/internal/child_process.js#L301
    proc.pid == null ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.of(proc), _rxjsBundlesRxMinJs.Observable.never())).takeUntil(errors).takeUntil(exitEvents).merge(
    // Write any input to stdin. This is just for the side-effect. We merge it here to
    // ensure that writing to the stdin stream happens after our event listeners are added.
    input == null ? _rxjsBundlesRxMinJs.Observable.empty() : input.do({
      next: str => {
        proc.stdin.write(str);
      },
      complete: () => {
        proc.stdin.end();
      }
    }).ignoreElements()).do({
      error: () => {
        finished = true;
      },
      complete: () => {
        finished = true;
      }
    })).catch(err => {
      // Since this utility errors *before* emitting the process, add the process to the error
      // so that users can get whatever info they need off of it.
      if (err instanceof Error && err.name === 'Error' && 'errno' in err) {
        throw new ProcessSystemError(err, proc);
      }
      throw err;
    }).finally(() => {
      if (!proc.wasKilled && !finished) {
        killProcess(proc, Boolean(killTreeWhenDone));
      }
    });
  });
}

function isRealExit(event) {
  // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
  return event.signal !== 'SIGUSR1';
}

function killWindowsProcessTree(pid) {
  return new Promise((resolve, reject) => {
    _child_process.default.exec(`taskkill /pid ${pid} /T /F`, error => {
      if (error == null) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function isExitErrorDefault(exit) {
  return exit.exitCode !== 0;
}

function isWindowsPlatform() {
  return (/^win/.test(process.platform)
  );
}

function limitBufferSize(stream, maxBuffer, streamName) {
  if (maxBuffer == null) {
    return stream;
  }
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    let totalSize = 0;
    return stream.do(data => {
      totalSize += data.length;
      if (totalSize > maxBuffer) {
        throw new MaxBufferExceededError(streamName);
      }
    });
  });
}

// TODO: Use `Observable::timeoutWith()` when we upgrade RxJS
function timeoutWith(source, time, other) {
  return source.timeout(time)
  // Technically we could catch other TimeoutErrors here. `Observable::timeoutWith()` won't have
  // this problem.
  .catch(err => err instanceof _rxjsBundlesRxMinJs.TimeoutError ? other : _rxjsBundlesRxMinJs.Observable.throw(err));
}

/**
 * Get an observable of error events for a process's streams. Note that these are represented as
 * normal elements, not observable errors.
 */
function getStreamErrorEvents(proc) {
  const streams = [['stdin', proc.stdin], ['stdout', proc.stdout], ['stderr', proc.stderr]];
  return _rxjsBundlesRxMinJs.Observable.merge(...streams.map(([name, stream]) => stream == null ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.fromEvent(stream, 'error').map(err => [err, name])));
}