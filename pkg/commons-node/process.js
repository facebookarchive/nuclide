'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.psTree = exports.getChildrenOfProcess = exports.getOriginalEnvironment = exports.checkOutput = exports.asyncExecute = exports.killUnixProcessTree = exports.ProcessExitError = exports.loggedCalls = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let _killProcess = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (childProcess, killTree) {
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
    return _ref7.apply(this, arguments);
  };
})();

let killUnixProcessTree = exports.killUnixProcessTree = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (childProcess) {
    const descendants = yield getDescendantsOfProcess(childProcess.pid);
    // Kill the processes, starting with those of greatest depth.
    for (const info of descendants.reverse()) {
      killPid(info.pid);
    }
  });

  return function killUnixProcessTree(_x3) {
    return _ref8.apply(this, arguments);
  };
})();

/**
 * Returns a promise that resolves to the result of executing a process.
 *
 * @param command The command to execute.
 * @param args The arguments to pass to the command.
 * @param options Options for changing how to run the command.
 *     Supports the options listed here: http://nodejs.org/api/child_process.html
 *     in addition to the custom options listed in AsyncExecuteOptions.
 */
let asyncExecute = exports.asyncExecute = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (command, args, options = {}) {
    const now = (0, (_performanceNow || _load_performanceNow()).default)();
    yield new Promise(function (resolve) {
      return whenShellEnvironmentLoaded(resolve);
    });
    return new Promise(function (resolve, reject) {
      const process = _child_process.default.execFile((_nuclideUri || _load_nuclideUri()).default.expandHomeDir(command), args, Object.assign({ maxBuffer: DEFAULT_MAX_BUFFER }, options),
      // Node embeds various properties like code/errno in the Error object.
      function (err, /* Error */stdoutBuf, stderrBuf) {
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
  });

  return function asyncExecute(_x4, _x5) {
    return _ref9.apply(this, arguments);
  };
})();

/**
 * Simple wrapper around asyncExecute that throws if the exitCode is non-zero.
 */
let checkOutput = exports.checkOutput = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (command, args, options = {}) {
    const result = yield asyncExecute((_nuclideUri || _load_nuclideUri()).default.expandHomeDir(command), args, options);
    if (result.exitCode !== 0) {
      const reason = result.exitCode != null ? `exitCode: ${result.exitCode}` : `error: ${(0, (_string || _load_string()).maybeToString)(result.errorMessage)}`;
      throw new Error(`asyncExecute "${command}" failed with ${reason}, ` + `stderr: ${result.stderr}, stdout: ${result.stdout}.`);
    }
    return result;
  });

  return function checkOutput(_x6, _x7) {
    return _ref10.apply(this, arguments);
  };
})();

/**
 * Run a command, accumulate the output. Errors are surfaced as stream errors and unsubscribing will
 * kill the process.
 */


let getOriginalEnvironment = exports.getOriginalEnvironment = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* () {
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
    return _ref11.apply(this, arguments);
  };
})();

// Returns a string suitable for including in displayed error messages.


let getChildrenOfProcess = exports.getChildrenOfProcess = (() => {
  var _ref12 = (0, _asyncToGenerator.default)(function* (processId) {
    const processes = yield psTree();

    return processes.filter(function (processInfo) {
      return processInfo.parentPid === processId;
    });
  });

  return function getChildrenOfProcess(_x8) {
    return _ref12.apply(this, arguments);
  };
})();

/**
 * Get a list of descendants, sorted by increasing depth (including the one with the provided pid).
 */


let getDescendantsOfProcess = (() => {
  var _ref13 = (0, _asyncToGenerator.default)(function* (pid) {
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

  return function getDescendantsOfProcess(_x9) {
    return _ref13.apply(this, arguments);
  };
})();

let psTree = exports.psTree = (() => {
  var _ref14 = (0, _asyncToGenerator.default)(function* () {
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
    return _ref14.apply(this, arguments);
  };
})();

exports.createArgsForScriptCommand = createArgsForScriptCommand;
exports.killProcess = killProcess;
exports.killPid = killPid;
exports.spawn = spawn;
exports.fork = fork;
exports.getOutputStream = getOutputStream;
exports.observeProcess = observeProcess;
exports.observeProcessRaw = observeProcessRaw;
exports.runCommand = runCommand;
exports.exitEventToMessage = exitEventToMessage;
exports.parsePsOutput = parsePsOutput;

var _event;

function _load_event() {
  return _event = require('../commons-node/event');
}

var _child_process = _interopRequireDefault(require('child_process'));

var _collection;

function _load_collection() {
  return _collection = require('./collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('./nuclideUri'));
}

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

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _whenShellEnvironmentLoaded;

function _load_whenShellEnvironmentLoaded() {
  return _whenShellEnvironmentLoaded = _interopRequireDefault(require('./whenShellEnvironmentLoaded'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Node crashes if we allow buffers that are too large.
const DEFAULT_MAX_BUFFER = 100 * 1024 * 1024;

// TODO(T17266325): Replace this in favor of `atom.whenShellEnvironmentLoaded()` when it lands
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const MAX_LOGGED_CALLS = 100;
const PREVERVED_HISTORY_CALLS = 50;

const noopDisposable = { dispose: () => {} };
const whenShellEnvironmentLoaded = typeof atom !== 'undefined' && (_whenShellEnvironmentLoaded || _load_whenShellEnvironmentLoaded()).default && !atom.inSpecMode() ? (_whenShellEnvironmentLoaded || _load_whenShellEnvironmentLoaded()).default : cb => {
  cb();return noopDisposable;
};

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

/**
 * An error thrown by process utils when the process exits with an error code. This type should have
 * all the properties of ProcessExitMessage (except "kind").
 */
class ProcessExitError extends Error {

  constructor(exitMessage, proc) {
    // $FlowIssue: This isn't typed in the Flow node type defs
    const { spawnargs } = proc;
    const commandName = spawnargs[0] === process.execPath ? spawnargs[1] : spawnargs[0];
    super(`"${commandName}" failed with ${exitEventToMessage(exitMessage)}\n\n${exitMessage.stderr}`);
    this.name = 'ProcessExitError';
    this.exitCode = exitMessage.exitCode;
    this.signal = exitMessage.signal;
    this.stderr = exitMessage.stderr;
    this.process = proc;
  }
}

exports.ProcessExitError = ProcessExitError; // Copied from https://github.com/facebook/flow/blob/v0.43.1/lib/node.js#L11-L16

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
      logError(`stream error on stream ${streamName} with command:`, command, args, options, 'error:', error);
    });
  });
}

/**
 * Helper type/function to create child_process by spawning/forking the process.
 */


function _makeChildProcess(type = 'spawn', command, args = [], options = {}) {
  const now = (0, (_performanceNow || _load_performanceNow()).default)();
  // $FlowFixMe: child_process$spawnOpts and child_process$forkOpts have incompatable stdio types.
  const child = _child_process.default[type]((_nuclideUri || _load_nuclideUri()).default.expandHomeDir(command), args, Object.assign({}, options));
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
function _createProcessStream(createProcess, options = {}) {
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(whenShellEnvironmentLoaded).take(1).switchMap(() => {
    var _ref;

    const process = createProcess();
    const throwOnError = ((_ref = options) != null ? _ref._throwOnError : _ref) !== false;
    const { killTreeOnComplete } = options;
    let finished = false;

    // If the process returned by `createProcess()` was not created by it (or at least in the same
    // tick), it's possible that its error event has already been dispatched. This is a bug that
    // needs to be fixed in the caller. Generally, that would just mean refactoring your code to
    // create the process in the function you pass. If for some reason, this is absolutely not
    // possible, you need to make sure that the process is passed here immediately after it's
    // created (i.e. before an ENOENT error event would be dispatched). Don't refactor your code
    // to avoid this function; you'll have the same bug, you just won't be notified! XD

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
        killProcess(process, Boolean(killTreeOnComplete));
      }
    });
  });
}

function killProcess(childProcess, killTree) {
  log(`Ending process stream. Killing process ${childProcess.pid}`);
  _killProcess(childProcess, killTree).then(() => {}, error => {
    logError(`Killing process ${childProcess.pid} failed`, error);
  });
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

function killPid(pid) {
  try {
    process.kill(pid);
  } catch (err) {
    if (err.code !== 'ESRCH') {
      throw err;
    }
  }
}

function spawn(command, args, options) {
  return _createProcessStream(() => _makeChildProcess('spawn', command, args, options), options);
}

function fork(modulePath, args, options) {
  return _createProcessStream(() => _makeChildProcess('fork', modulePath, args, options), Object.assign({}, options));
}

function observeProcessExitMessage(process) {
  return _rxjsBundlesRxMinJs.Observable.fromEvent(process, 'exit', (exitCode, signal) => ({ kind: 'exit', exitCode, signal, stderr: '' }))
  // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
  .filter(message => message.signal !== 'SIGUSR1').take(1);
}

function isExitErrorDefault(exit) {
  return exit.exitCode !== 0;
}

/**
 * Creates a stream of sensibly-ordered stdout, stdin, and exit messages from a process. Generally,
 * you shouldn't use this function and should instead use `observeProcess()` (which makes use of
 * this for you).
 *
 * IMPORTANT: If you must use this message, it's very important that the process you give it was
 * just synchronously created. Otherwise, you can end up missing messages.
 *
 * This function intentionally does not close the process when you unsubscribe. It's usually used in
 * conjunction with `spawn()` which does that already.
 */
function getOutputStream(process, options, rest) {
  var _ref2, _ref3, _ref4;

  const chunk = ((_ref2 = options) != null ? _ref2.splitByLines : _ref2) === false ? x => x : (_observable || _load_observable()).splitStream;
  const isExitError = ((_ref3 = options) != null ? _ref3.isExitError : _ref3) || isExitErrorDefault;
  const exitErrorBufferSize = ((_ref4 = options) != null ? _ref4.exitErrorBufferSize : _ref4) || 2000;
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    const errorEvents = _rxjsBundlesRxMinJs.Observable.fromEvent(process, 'error').map(errorObj => ({ kind: 'error', error: errorObj }));
    const stdoutEvents = chunk((0, (_stream || _load_stream()).observeStream)(process.stdout)).map(data => ({ kind: 'stdout', data }));
    const stderrEvents = chunk((0, (_stream || _load_stream()).observeStream)(process.stderr)).map(data => ({ kind: 'stderr', data })).share();

    // Accumulate the first `exitErrorBufferSize` bytes of stderr so that we can give feedback about
    // exit errors. Once we have this much, we don't even listen to the event anymore.
    const accumulatedStderr = (0, (_observable || _load_observable()).takeWhileInclusive)(stderrEvents.scan((acc, event) => (acc + event.data).slice(0, exitErrorBufferSize), '').startWith(''), acc => acc.length < exitErrorBufferSize);

    // We need to start listening for the exit event immediately, but defer emitting it until the
    // (buffered) output streams end.
    const exitEvents = observeProcessExitMessage(process).withLatestFrom(accumulatedStderr).map(([rawEvent, stderr]) => {
      const event = Object.assign({}, rawEvent, { stderr });
      if (isExitError(event)) {
        throw new ProcessExitError(event, process);
      }
      return event;
    }).publishReplay();
    const exitSub = exitEvents.connect();

    // It's possible for stdout and stderr to remain open (even indefinitely) after the exit event.
    // This utility, however, treats the exit event as stream-ending, which helps us to avoid easy
    // bugs. We give a short (100ms) timeout for the stdout and stderr streams to close.
    const close = exitEvents.delay(100);

    return (0, (_observable || _load_observable()).takeWhileInclusive)(_rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.merge(stdoutEvents, stderrEvents).takeUntil(close).concat(exitEvents), errorEvents), event => event.kind !== 'error' && event.kind !== 'exit').finally(() => {
      exitSub.unsubscribe();
    });
  });
}

/**
 * Observe the stdout, stderr and exit code of a process.
 */
function observeProcess(command, args, options) {
  var _ref5;

  return _createProcessStream(() => _makeChildProcess('spawn', command, args, options), Object.assign({}, options, {
    // For now, default to `false` to preserve old behavior.
    _throwOnError: ((_ref5 = options) != null ? _ref5._throwOnError : _ref5) === true
  })).flatMap(process => getOutputStream(process, options));
}

/**
 * Observe the stdout, stderr and exit code of a process.
 */
function observeProcessRaw(command, args, options) {
  var _ref6;

  return _createProcessStream(() => _makeChildProcess('spawn', command, args, options), Object.assign({}, options, {
    // For now, default to `false` to preserve old behavior.
    _throwOnError: ((_ref6 = options) != null ? _ref6._throwOnError : _ref6) === true
  })).flatMap(process => getOutputStream(process, Object.assign({}, options, { splitByLines: false })));
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
}function runCommand(command, args = [], options_ = {}, rest) {
  const options = Object.assign({}, options_, {
    // TODO: _throwOnError should always be true. Once we've switched that over, remove this.
    _throwOnError: true
  });
  return observeProcess(command, args, options).filter(event => event.kind === 'stdout').reduce((acc, event) => {
    if (!(event.kind === 'stdout')) {
      throw new Error('Invariant violation: "event.kind === \'stdout\'"');
    }

    return acc + event.data;
  }, '');
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