"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
exports.getOriginalEnvironment = getOriginalEnvironment;
exports.exitEventToMessage = exitEventToMessage;
exports.getChildrenOfProcess = getChildrenOfProcess;
exports.psTree = psTree;
exports.parsePsOutput = parsePsOutput;
exports.memoryUsagePerPid = memoryUsagePerPid;
exports.preventStreamsFromThrowing = preventStreamsFromThrowing;
exports.logStreamErrors = logStreamErrors;
exports.getAbsoluteBinaryPathForPid = getAbsoluteBinaryPathForPid;
exports.killUnixProcessTree = killUnixProcessTree;
exports.loggedCalls = exports.ProcessLoggingEvent = exports.ProcessTimeoutError = exports.MaxBufferExceededError = exports.ProcessSystemError = exports.ProcessExitError = exports.LOG_CATEGORY = void 0;

var _child_process = _interopRequireDefault(require("child_process"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

var _util = _interopRequireDefault(require("util"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("./UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("./nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _performanceNow() {
  const data = _interopRequireDefault(require("./performanceNow"));

  _performanceNow = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("./collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("./event");

  _event = function () {
    return data;
  };

  return data;
}

function _stream() {
  const data = require("./stream");

  _stream = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("./observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("./string");

  _string = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// Unlike Promises, observables have a standardized, composable cancellation mechanism _today_.
// Moreover, observables integrate nicely with Atom's callback + IDisposable formula for cancelable,
// async APIs. Along with React, [RxJS] is one of the core libraries utilized by Nuclide.
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
const LOG_CATEGORY = 'nuclide-commons/process';
exports.LOG_CATEGORY = LOG_CATEGORY;
const NUCLIDE_DO_NOT_LOG = global.NUCLIDE_DO_NOT_LOG;
const logger = (0, _log4js().getLogger)(LOG_CATEGORY);
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
  return observeProcess(command, args, Object.assign({}, options, {
    maxBuffer
  })).catch(error => {
    // Catch ProcessExitErrors so that we can add stdout to them.
    if (error instanceof ProcessExitError) {
      return _RxMin.Observable.of({
        kind: 'process-exit-error',
        error
      });
    }

    throw error;
  }).reduce((acc, event) => {
    switch (event.kind) {
      case 'stdout':
        return Object.assign({}, acc, {
          stdout: acc.stdout + event.data
        });

      case 'stderr':
        return Object.assign({}, acc, {
          stderr: acc.stderr + event.data
        });

      case 'exit':
        return Object.assign({}, acc, {
          exitCode: event.exitCode
        });

      case 'process-exit-error':
        const {
          error
        } = event;
        throw new ProcessExitError(error.exitCode, error.signal, error.process, acc.stderr, acc.stdout);

      default:
        event.kind;
        throw new Error(`Invalid event kind: ${event.kind}`);
    }
  }, {
    stdout: '',
    stderr: '',
    exitCode: null
  });
}
/**
 * Identical to `observeProcess()`, but doesn't buffer by line.
 */


function observeProcessRaw(command, args, options) {
  return spawn(command, args, options).flatMap(proc => getOutputStream(proc, Object.assign({}, options, {
    splitByLines: false
  })));
} //
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

  const chunk = ((_ref2 = options) != null ? _ref2.splitByLines : _ref2) === false ? x => x : _observable().splitStream;
  const maxBuffer = (_ref3 = options) != null ? _ref3.maxBuffer : _ref3;
  const isExitError = ((_ref4 = options) != null ? _ref4.isExitError : _ref4) || isExitErrorDefault;
  const exitErrorBufferSize = ((_ref5 = options) != null ? _ref5.exitErrorBufferSize : _ref5) || 2000;
  return _RxMin.Observable.defer(() => {
    const stdoutEvents = chunk(limitBufferSize((0, _stream().observeStream)(proc.stdout), maxBuffer, 'stdout')).map(data => ({
      kind: 'stdout',
      data
    }));
    const stderrEvents = chunk(limitBufferSize((0, _stream().observeStream)(proc.stderr), maxBuffer, 'stderr')).map(data => ({
      kind: 'stderr',
      data
    })).share(); // Accumulate the first `exitErrorBufferSize` bytes of stderr so that we can give feedback about
    // about exit errors (then stop so we don't fill up memory with it).

    const accumulatedStderr = stderrEvents.scan((acc, event) => (acc + event.data).slice(0, exitErrorBufferSize), '').startWith('').let((0, _observable().takeWhileInclusive)(acc => acc.length < exitErrorBufferSize)); // We need to start listening for the exit event immediately, but defer emitting it until the
    // (buffered) output streams end.

    const closeEvents = _RxMin.Observable.fromEvent(proc, // We listen to the "close" event instead of "exit" because we want to get all of the stdout
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
    return _RxMin.Observable.merge(stdoutEvents, stderrEvents).concat(closeEvents).let((0, _observable().takeWhileInclusive)(event => event.kind !== 'error' && event.kind !== 'exit')).finally(() => {
      exitSub.unsubscribe();
    });
  });
} //
// # Miscellaneous Utilities
//
// The following utilities don't spawn processes or necessarily use observables. Instead, they're
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
    // the arguments into a single string.
    const joined = (0, _string().shellQuote)([command, ...args]); // flowlint-next-line sketchy-null-mixed:off

    const opts = options || {}; // flowlint-next-line sketchy-null-mixed:off

    const env = opts.env || {};
    return ['script', ['-q', '/dev/null', '-c', joined], // `script` will use `SHELL`, but shells have different behaviors with regard to escaping. To
    // make sure that out escaping is correct, we need to force a particular shell.
    Object.assign({}, opts, {
      env: Object.assign({}, env, {
        SHELL: '/bin/bash'
      })
    })];
  }
}
/**
 * Kills a process and, optionally, its descendants.
 */


function killProcess(proc, killTree, killTreeSignal) {
  _killProcess(proc, killTree, killTreeSignal).then(() => {}, error => {
    logger.error(`Killing process ${proc.pid} failed`, error);
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
} // If provided, read the original environment from NUCLIDE_ORIGINAL_ENV.
// This should contain the base64-encoded output of `env -0`.


let cachedOriginalEnvironment = null;

async function getOriginalEnvironment() {
  await new Promise(resolve => {
    whenShellEnvironmentLoaded(resolve);
  });

  if (cachedOriginalEnvironment != null) {
    return cachedOriginalEnvironment;
  }

  const {
    NUCLIDE_ORIGINAL_ENV
  } = process.env;

  if (NUCLIDE_ORIGINAL_ENV != null && NUCLIDE_ORIGINAL_ENV.trim() !== '') {
    const envString = new Buffer(NUCLIDE_ORIGINAL_ENV, 'base64').toString();
    cachedOriginalEnvironment = {};

    for (const envVar of envString.split('\0')) {
      // envVar should look like A=value_of_A
      const equalIndex = envVar.indexOf('=');

      if (equalIndex !== -1) {
        cachedOriginalEnvironment[envVar.substring(0, equalIndex)] = envVar.substring(equalIndex + 1);
      }
    } // Guard against invalid original environments.


    if (!Object.keys(cachedOriginalEnvironment).length) {
      cachedOriginalEnvironment = process.env;
    }
  } else {
    cachedOriginalEnvironment = process.env;
  }

  return cachedOriginalEnvironment;
}
/**
 * Returns a string suitable for including in displayed error messages.
 */


function exitEventToMessage(event) {
  if (event.exitCode != null) {
    return `exit code ${event.exitCode}`;
  } else {
    if (!(event.signal != null)) {
      throw new Error("Invariant violation: \"event.signal != null\"");
    }

    return `signal ${event.signal}`;
  }
}

async function getChildrenOfProcess(processId) {
  const processes = await psTree();
  return processes.filter(processInfo => processInfo.parentPid === processId);
}
/**
 * Get a list of descendants, sorted by increasing depth (including the one with the provided pid).
 */


async function getDescendantsOfProcess(pid) {
  const processes = await psTree();
  let rootProcessInfo;
  const pidToChildren = new (_collection().MultiMap)();
  processes.forEach(info => {
    if (info.pid === pid) {
      rootProcessInfo = info;
    }

    pidToChildren.add(info.parentPid, info);
  });
  const descendants = rootProcessInfo == null ? [] : [rootProcessInfo]; // Walk through the array, adding the children of the current element to the end. This
  // breadth-first traversal means that the elements will be sorted by depth.

  for (let i = 0; i < descendants.length; i++) {
    const info = descendants[i];
    const children = pidToChildren.get(info.pid);
    descendants.push(...Array.from(children));
  }

  return descendants;
}

async function psTree() {
  if (isWindowsPlatform()) {
    return psTreeWindows();
  }

  const [commands, withArgs] = await Promise.all([runCommand('ps', ['-A', '-o', 'ppid,pid,comm']).toPromise(), runCommand('ps', ['-A', '-ww', '-o', 'pid,args']).toPromise()]);
  return parsePsOutput(commands, withArgs);
}

async function psTreeWindows() {
  const stdout = await runCommand('wmic.exe', ['PROCESS', 'GET', 'ParentProcessId,ProcessId,Name']).toPromise();
  return parsePsOutput(stdout);
}

function parsePsOutput(psOutput, argsOutput) {
  // Remove the first header line.
  const lines = psOutput.trim().split(/\n|\r\n/).slice(1);
  let withArgs = new Map();

  if (argsOutput != null) {
    withArgs = new Map(argsOutput.trim().split(/\n|\r\n/).slice(1).map(line => {
      const columns = line.trim().split(/\s+/);
      const pid = parseInt(columns[0], 10);
      const command = columns.slice(1).join(' ');
      return [pid, command];
    }));
  }

  return lines.map(line => {
    const columns = line.trim().split(/\s+/);
    const [parentPid, pidStr] = columns;
    const pid = parseInt(pidStr, 10);
    const command = columns.slice(2).join(' ');
    const commandWithArgs = withArgs.get(pid);
    return {
      command,
      parentPid: parseInt(parentPid, 10),
      pid,
      commandWithArgs: commandWithArgs == null ? command : commandWithArgs
    };
  });
} // Use `ps` to get memory usage in kb for an array of process id's as a map.


async function memoryUsagePerPid(pids) {
  const usage = new Map();

  if (pids.length >= 1) {
    try {
      const stdout = await runCommand('ps', ['-p', pids.join(','), '-o', 'pid=', '-o', 'rss=']).toPromise();
      stdout.split('\n').forEach(line => {
        const parts = line.trim().split(/\s+/);

        if (parts.length === 2) {
          const [pid, rss] = parts.map(x => parseInt(x, 10));
          usage.set(pid, rss);
        }
      });
    } catch (err) {// Ignore errors.
    }
  }

  return usage;
}
/**
 * Add no-op error handlers to the process's streams so that Node doesn't throw them.
 */


function preventStreamsFromThrowing(proc) {
  return new (_UniversalDisposable().default)(getStreamErrorEvents(proc).subscribe());
}
/**
 * Log errors from a process's streams. This function returns an `rxjs$ISubscription` so that it
 * can easily be used with `Observable.using()`.
 */


function logStreamErrors(proc, command, args, options) {
  return new (_UniversalDisposable().default)(getStreamErrorEvents(proc).do(([err, streamName]) => {
    logger.error(`stream error on stream ${streamName} with command:`, command, args, options, 'error:', err);
  }).subscribe());
} //
// Types
//
// Exactly one of exitCode and signal will be non-null.
// Killing a process will result in a null exitCode but a non-null signal.


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
    const {
      spawnargs
    } = proc;
    const argsAndCommand = spawnargs[0] === process.execPath ? spawnargs.slice(1) : spawnargs;
    const [command, ...args] = argsAndCommand;
    super(`"${command}" failed with ${exitEventToMessage({
      exitCode,
      signal
    })}\n\n${stderr}\n\n${argsAndCommand.join(' ')}`);
    this.name = 'ProcessExitError';
    this.exitCode = exitCode;
    this.signal = signal;
    this.stderr = stderr;
    this.stdout = stdout;
    this.command = command;
    this.args = args;
    this.process = proc;
  }

}
/**
 * Process system errors are just augmented Error objects. We wrap the errors and expose the process
 * since our utilities throw the errors before returning the process.
 */


exports.ProcessExitError = ProcessExitError;

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
    const {
      spawnargs
    } = proc;
    const commandName = spawnargs[0] === process.execPath ? spawnargs[1] : spawnargs[0];
    super(`"${commandName}" timed out after ${timeout}ms`);
    this.name = 'ProcessTimeoutError';
  }

} //
// Internal Stuff
//
// Pay no attention! This is just stuff that's used internally to implement the good stuff.
//
// Node crashes if we allow buffers that are too large.


exports.ProcessTimeoutError = ProcessTimeoutError;
const DEFAULT_MAX_BUFFER = 100 * 1024 * 1024;
const MAX_LOGGED_CALLS = 100;
const NUM_PRESERVED_HISTORY_CALLS = 50;
const noopDisposable = {
  dispose: () => {}
};
const whenShellEnvironmentLoaded = typeof atom !== 'undefined' && !atom.inSpecMode() ? atom.whenShellEnvironmentLoaded.bind(atom) : cb => {
  cb();
  return noopDisposable;
};
/**
 * Log custom events to log4js so that we can easily hook into process events
 * using a custom log4js appender (e.g. for analytics purposes).
 */

class ProcessLoggingEvent {
  constructor(command, duration) {
    this.command = command;
    this.duration = duration; // log4js uses util.inspect to convert log arguments to strings.
    // Note: computed property methods aren't supported by Flow yet.

    this[_util.default.inspect.custom] = () => {
      return `${this.duration}ms: ${this.command}`;
    };
  }

}

exports.ProcessLoggingEvent = ProcessLoggingEvent;
const loggedCalls = [];
exports.loggedCalls = loggedCalls;

function logCall(duration, command, args) {
  // Trim the history once in a while, to avoid doing expensive array
  // manipulation all the time after we reached the end of the history
  if (loggedCalls.length > MAX_LOGGED_CALLS) {
    loggedCalls.splice(0, loggedCalls.length - NUM_PRESERVED_HISTORY_CALLS, {
      command: '... history stripped ...',
      duration: 0,
      time: new Date()
    });
  }

  const fullCommand = (0, _string().shellQuote)([command, ...args]);
  loggedCalls.push({
    command: fullCommand,
    duration,
    time: new Date()
  });
  logger.info(new ProcessLoggingEvent(fullCommand, duration));
}
/**
 * Attempt to get the fully qualified binary name from a process id. This is
 * surprisingly tricky. 'ps' only reports the path as invoked, and in some cases
 * not even that.
 *
 * On Linux, the /proc filesystem can be used to find it.
 * macOS doesn't have /proc, so we rely on the fact that the process holds
 * an open FD to the executable. This can fail for various reasons (mostly
 * not having permissions to execute lsof on the pid.)
 */


async function getAbsoluteBinaryPathForPid(pid) {
  if (process.platform === 'linux') {
    return _getLinuxBinaryPathForPid(pid);
  }

  if (process.platform === 'darwin') {
    return _getDarwinBinaryPathForPid(pid);
  }

  return null;
}

async function _getLinuxBinaryPathForPid(pid) {
  const exeLink = `/proc/${pid}/exe`; // /proc/xxx/exe is a symlink to the real binary in the file system.

  return runCommand('/bin/realpath', ['-q', '-e', exeLink]).catch(_ => _RxMin.Observable.of(null)).toPromise();
}

async function _getDarwinBinaryPathForPid(pid) {
  return runCommand('/usr/sbin/lsof', ['-p', `${pid}`]).catch(_ => {
    return _RxMin.Observable.of(null);
  }).map(stdout => stdout == null ? null : stdout.split('\n').map(line => line.trim().split(/\s+/)).filter(line => line[3] === 'txt').map(line => line[8])[0]).take(1).toPromise();
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
    input = typeof inputOption === 'string' ? _RxMin.Observable.of(inputOption) : inputOption;
  }

  return (0, _event().observableFromSubscribeFunction)(whenShellEnvironmentLoaded).take(1).switchMap(() => {
    const {
      dontLogInNuclide,
      killTreeWhenDone,
      killTreeSignal,
      timeout
    } = options; // flowlint-next-line sketchy-null-number:off

    const enforceTimeout = timeout ? x => x.timeoutWith(timeout, _RxMin.Observable.throw(new ProcessTimeoutError(timeout, proc))) : x => x;

    const proc = _child_process.default[type](_nuclideUri().default.expandHomeDir(commandOrModulePath), args, // $FlowFixMe: child_process$spawnOpts and child_process$forkOpts have incompatible stdio types.
    Object.assign({}, options)); // Don't let Node throw stream errors and crash the process. Note that we never dispose of
    // this because stream errors can still occur after the user unsubscribes from our process
    // observable. That's okay; when the streams close, the listeners will be removed.


    preventStreamsFromThrowing(proc); // If we were to connect the error handler as part of the returned observable, unsubscribing
    // would cause it to be removed. That would leave no attached error handler, so node would
    // throw, triggering Atom's uncaught exception handler.

    const errors = _RxMin.Observable.fromEvent(proc, 'error').flatMap(_RxMin.Observable.throw).publish();

    errors.connect();

    const exitEvents = _RxMin.Observable.fromEvent(proc, 'exit', (exitCode, signal) => ({
      kind: 'exit',
      exitCode,
      signal
    })).filter(isRealExit).take(1);

    if (dontLogInNuclide !== true && NUCLIDE_DO_NOT_LOG !== true) {
      // Log the completion of the process. Note that we intentionally don't merge this with the
      // returned observable because we don't want to cancel the side-effect when the user
      // unsubscribes or when the process exits ("close" events come after "exit" events).
      const now = (0, _performanceNow().default)();

      _RxMin.Observable.fromEvent(proc, 'close').do(() => {
        logCall(Math.round((0, _performanceNow().default)() - now), commandOrModulePath, args);
      }).subscribe();
    }

    let finished = false;
    return enforceTimeout(_RxMin.Observable.using( // Log stream errors, but only for as long as you're subscribed to the process observable.
    () => logStreamErrors(proc, commandOrModulePath, args, options), () => _RxMin.Observable.merge( // Node [delays the emission of process errors][1] by a tick in order to give
    // consumers a chance to subscribe to the error event. This means that our observable
    // would normally emit the process and then, a tick later, error. However, it's more
    // convenient to never emit the process if there was an error. Although observables
    // don't require the error to be delayed at all, the underlying event emitter
    // abstraction does, so we'll just roll with that and use `pid == null` as a signal
    // that an error is forthcoming.
    //
    // [1]: https://github.com/nodejs/node/blob/v7.10.0/lib/internal/child_process.js#L301
    proc.pid == null ? _RxMin.Observable.empty() : _RxMin.Observable.of(proc), _RxMin.Observable.never() // Don't complete until we say so!
    )).merge( // Write any input to stdin. This is just for the side-effect. We merge it here to
    // ensure that writing to the stdin stream happens after our event listeners are added.
    input == null ? _RxMin.Observable.empty() : input.do({
      next: str => {
        proc.stdin.write(str);
      },
      complete: () => {
        proc.stdin.end();
      }
    }).ignoreElements()).takeUntil(errors).takeUntil(exitEvents).do({
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
      // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
      if (!proc.wasKilled && !finished) {
        killProcess(proc, Boolean(killTreeWhenDone), killTreeSignal);
      }
    });
  });
}

function isRealExit(event) {
  // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
  return event.signal !== 'SIGUSR1';
}

async function _killProcess(proc, killTree, killTreeSignal) {
  proc.wasKilled = true;

  if (!killTree) {
    if (killTreeSignal != null && killTreeSignal !== '') {
      proc.kill(killTreeSignal);
    } else {
      proc.kill();
    }

    return;
  }

  if (/^win/.test(process.platform)) {
    await killWindowsProcessTree(proc.pid);
  } else {
    await killUnixProcessTree(proc);
  }
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

async function killUnixProcessTree(proc) {
  const descendants = await getDescendantsOfProcess(proc.pid); // Kill the processes, starting with those of greatest depth.

  for (const info of descendants.reverse()) {
    killPid(info.pid);
  }
}

function isExitErrorDefault(exit) {
  return exit.exitCode !== 0;
}

function isWindowsPlatform() {
  return /^win/.test(process.platform);
}

function limitBufferSize(stream, maxBuffer, streamName) {
  if (maxBuffer == null) {
    return stream;
  }

  return _RxMin.Observable.defer(() => {
    let totalSize = 0;
    return stream.do(data => {
      totalSize += data.length;

      if (totalSize > maxBuffer) {
        throw new MaxBufferExceededError(streamName);
      }
    });
  });
}
/**
 * Get an observable of error events for a process's streams. Note that these are represented as
 * normal elements, not observable errors.
 */


function getStreamErrorEvents(proc) {
  const streams = [['stdin', proc.stdin], ['stdout', proc.stdout], ['stderr', proc.stderr]];
  return _RxMin.Observable.merge(...streams.map(([name, stream]) => stream == null ? _RxMin.Observable.empty() : _RxMin.Observable.fromEvent(stream, 'error').map(err => [err, name])));
}