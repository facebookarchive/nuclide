/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
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

import type {ProcessExitMessage, ProcessMessage, ProcessInfo} from './process-rpc-types';

import {observableFromSubscribeFunction} from '../commons-node/event';
import child_process from 'child_process';
import {MultiMap} from './collection';
import nuclideUri from './nuclideUri';
import {splitStream, takeWhileInclusive} from './observable';
import {observeStream} from './stream';
import {Observable, TimeoutError} from 'rxjs';
import invariant from 'assert';
import {quote} from 'shell-quote';
import performanceNow from './performanceNow';
import idx from 'idx';

// TODO(T17266325): Replace this in favor of `atom.whenShellEnvironmentLoaded()` when it lands
import atomWhenShellEnvironmentLoaded from './whenShellEnvironmentLoaded';

/**
 * Run a command, accumulate the output. Errors are surfaced as stream errors and unsubscribing will
 * kill the process. In addition to the options accepted by Node's [`child_process.spawn()`][1]
 * function, `runCommand()` also accepts the following:
 *
 * - `stdin` {string} Text to write to the new process's stdin.
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
export function runCommand(
  command: string,
  args?: Array<string> = [],
  options?: ObserveProcessOptions = {},
  rest: void,
): Observable<string> {
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
 *   .map(event => event.kind === 'stdout')
 *   .subscribe(line => {
 *     console.log(line);
 *   });
 * ```
 */
export function observeProcess(
  command: string,
  args?: Array<string>,
  options?: ObserveProcessOptions,
): Observable<ProcessMessage> {
  return _createProcessStream(
    () => _makeChildProcess('spawn', command, args, options),
    options,
  )
    .flatMap(process => getOutputStream(process, options));
}

/**
 * Identical to `runCommand()`, but instead of only emitting the accumulated stdout, the returned
 * observable emits an object containing the accumulated stdout, the accumulated stderr, and the
 * exit code.
 *
 * In general, you should prefer `runCommand()`, however, this function is useful for when stderr is
 * needed even if the process exits successfully.
 */
export function runCommandDetailed(
  command: string,
  args?: Array<string> = [],
  options?: ObserveProcessOptions = {},
  rest: void,
): Observable<{stdout: string, stderr: string, exitCode: ?number}> {
  const maxBuffer = idx(options, _ => _.maxBuffer) || DEFAULT_MAX_BUFFER;
  return observeProcess(command, args, {...options, maxBuffer})
    .catch(error => {
      // Catch ProcessExitErrors so that we can add stdout to them.
      if (error instanceof ProcessExitError) {
        return Observable.of({kind: 'process-exit-error', error});
      }
      throw error;
    })
    .reduce(
      (acc, event) => {
        switch (event.kind) {
          case 'stdout': return {...acc, stdout: acc.stdout + event.data};
          case 'stderr': return {...acc, stderr: acc.stderr + event.data};
          case 'exit': return {...acc, exitCode: event.exitCode};
          case 'process-exit-error':
            const {error} = event;
            throw new ProcessExitError(
              error.exitCode,
              error.signal,
              error.process,
              acc.stderr,
              acc.stdout,
            );
          default:
            throw new Error(`Invalid event kind: ${event.kind}`);
        }
      },
      {stdout: '', stderr: '', exitCode: null},
    );
}

/**
 * Identical to `observeProcess()`, but doesn't buffer by line.
 */
export function observeProcessRaw(
  command: string,
  args?: Array<string>,
  options?: ObserveProcessOptions,
): Observable<ProcessMessage> {
  return _createProcessStream(
    () => _makeChildProcess('spawn', command, args, options),
    options,
  )
    .flatMap(process => getOutputStream(process, {...options, splitByLines: false}));
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
 * Also like `observeProcess()`, the returned observable can throw system errors or
 * ProcessExitErrors (with truncated stderr for debugging).
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
export function spawn(
  command: string,
  args?: Array<string>,
  options?: SpawnProcessOptions,
): Observable<child_process$ChildProcess> {
  return _createProcessStream(
    () => _makeChildProcess('spawn', command, args, options),
    options,
  );
}

/**
 * Identical to `spawn()` (above), but uses `child_process.fork()` to create the process.
 */
export function fork(
  modulePath: string,
  args?: Array<string>,
  options?: ForkProcessOptions,
): Observable<child_process$ChildProcess> {
  return _createProcessStream(
    () => _makeChildProcess('fork', modulePath, args, options),
    {...options},
  );
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
export function getOutputStream(
  process: child_process$ChildProcess,
  options?: GetOutputStreamOptions,
  rest: void,
): Observable<ProcessMessage> {
  const chunk = idx(options, _ => _.splitByLines) === false ? (x => x) : splitStream;
  const maxBuffer = idx(options, _ => _.maxBuffer);
  return Observable.defer(() => {
    const stdoutEvents = chunk(limitBufferSize(observeStream(process.stdout), maxBuffer, 'stdout'))
      .map(data => ({kind: 'stdout', data}));
    const stderrEvents = chunk(limitBufferSize(observeStream(process.stderr), maxBuffer, 'stderr'))
      .map(data => ({kind: 'stderr', data}));

    // We need to start listening for the exit event immediately, but defer emitting it until the
    // (buffered) output streams end.
    const exitEvents = observeProcessExitMessage(process).publishReplay();
    const exitSub = exitEvents.connect();

    // It's possible for stdout and stderr to remain open (even indefinitely) after the exit event.
    // This utility, however, treats the exit event as stream-ending, which helps us to avoid easy
    // bugs. We give a short (100ms) timeout for the stdout and stderr streams to close.
    const close = exitEvents.delay(100);

    return takeWhileInclusive(
      Observable.merge(stdoutEvents, stderrEvents).takeUntil(close).concat(exitEvents),
      event => event.kind !== 'error' && event.kind !== 'exit',
    )
      .finally(() => { exitSub.unsubscribe(); });
  });
}

//
// # Miscellaneous Utilities
//
// The following utilites don't spawn processes or necessarily use observables. Instead, they're
// used to format arguments to the above functions or for acting on already-spawned processes.
//

/**
 * Takes the command and args that you would normally pass to `spawn()` and returns `newArgs` such
 * that you should call it with `spawn('script', newArgs)` to run the original command/args pair
 * under `script`.
 */
export function createArgsForScriptCommand(
  command: string,
  args?: Array<string> = [],
): Array<string> {
  if (process.platform === 'darwin') {
    // On OS X, script takes the program to run and its arguments as varargs at the end.
    return ['-q', '/dev/null', command].concat(args);
  } else {
    // On Linux, script takes the command to run as the -c parameter.
    const allArgs = [command].concat(args);
    return ['-q', '/dev/null', '-c', quote(allArgs)];
  }
}

/**
 * Kills a process and, optionally, its descendants.
 */
export function killProcess(
  childProcess: child_process$ChildProcess,
  killTree: boolean,
): void {
  log(`Ending process stream. Killing process ${childProcess.pid}`);
  _killProcess(childProcess, killTree).then(
    () => {},
    error => {
      logError(`Killing process ${childProcess.pid} failed`, error);
    },
  );
}

/**
 * Kill the process with the provided pid.
 */
export function killPid(pid: number): void {
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
export async function getOriginalEnvironment(): Promise<Object> {
  await new Promise(resolve => { whenShellEnvironmentLoaded(resolve); });
  if (cachedOriginalEnvironment != null) {
    return cachedOriginalEnvironment;
  }

  const {NUCLIDE_ORIGINAL_ENV} = process.env;
  if (NUCLIDE_ORIGINAL_ENV != null && NUCLIDE_ORIGINAL_ENV.trim() !== '') {
    const envString = new Buffer(NUCLIDE_ORIGINAL_ENV, 'base64').toString();
    cachedOriginalEnvironment = {};
    for (const envVar of envString.split('\0')) {
      // envVar should look like A=value_of_A
      const equalIndex = envVar.indexOf('=');
      if (equalIndex !== -1) {
        cachedOriginalEnvironment[envVar.substring(0, equalIndex)] =
          envVar.substring(equalIndex + 1);
      }
    }
  } else {
    cachedOriginalEnvironment = process.env;
  }
  return cachedOriginalEnvironment;
}

/**
 * Returns a string suitable for including in displayed error messages.
 */
export function exitEventToMessage(event: {exitCode: ?number, signal: ?string}): string {
  if (event.exitCode != null) {
    return `exit code ${event.exitCode}`;
  } else {
    invariant(event.signal != null);
    return `signal ${event.signal}`;
  }
}

export async function getChildrenOfProcess(
  processId: number,
): Promise<Array<ProcessInfo>> {
  const processes = await psTree();

  return processes.filter(processInfo =>
    processInfo.parentPid === processId);
}

/**
 * Get a list of descendants, sorted by increasing depth (including the one with the provided pid).
 */
async function getDescendantsOfProcess(pid: number): Promise<Array<ProcessInfo>> {
  const processes = await psTree();
  let rootProcessInfo;
  const pidToChildren = new MultiMap();
  processes.forEach(info => {
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
}

export async function psTree(): Promise<Array<ProcessInfo>> {
  const stdout = isWindowsPlatform()
  // See also: https://github.com/nodejs/node-v0.x-archive/issues/2318
  ? await runCommand('wmic.exe', ['PROCESS', 'GET', 'ParentProcessId,ProcessId,Name']).toPromise()
  : await runCommand('ps', ['-A', '-o', 'ppid,pid,comm']).toPromise();
  return parsePsOutput(stdout);
}

export function parsePsOutput(
  psOutput: string,
): Array<ProcessInfo> {
  // Remove the first header line.
  const lines = psOutput.split(/\n|\r\n/).slice(1);

  return lines.map(line => {
    const columns = line.trim().split(/\s+/);
    const [parentPid, pid] = columns;
    const command = columns.slice(2).join(' ');

    return {
      command,
      parentPid: parseInt(parentPid, 10),
      pid: parseInt(pid, 10),
    };
  });
}

//
// Types
//

type CreateProcessStreamOptions = {
  killTreeWhenDone?: ?boolean,
  exitErrorBufferSize?: ?number,
  isExitError?: ?(event: ProcessExitMessage) => boolean,
  timeout?: ?number,
};

type GetOutputStreamOptions = {
  splitByLines?: ?boolean,
  maxBuffer?: ?number,
};

export type ObserveProcessOptions = SpawnProcessOptions
  & CreateProcessStreamOptions
  & GetOutputStreamOptions;

export type SpawnProcessOptions = child_process$spawnOpts & CreateProcessStreamOptions;
export type ForkProcessOptions = child_process$forkOpts & CreateProcessStreamOptions;

// Copied from https://github.com/facebook/flow/blob/v0.43.1/lib/node.js#L11-L16
type ErrnoError = {
  errno?: number,
  code?: string,
  path?: string,
  syscall?: string,
};

export type ProcessError = ErrnoError | ProcessExitError;

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
export class ProcessExitError extends Error {
  exitCode: ?number;
  signal: ?string;
  stderr: string;
  stdout: ?string;
  process: child_process$ChildProcess;

  constructor(
    exitCode: ?number,
    signal: ?string,
    proc: child_process$ChildProcess,
    stderr: string,
    stdout?: string,
  ) {
    // $FlowIssue: This isn't typed in the Flow node type defs
    const {spawnargs} = proc;
    const commandName = spawnargs[0] === process.execPath ? spawnargs[1] : spawnargs[0];
    super(
      `"${commandName}" failed with ${exitEventToMessage({exitCode, signal})}\n\n${stderr}`,
    );
    this.name = 'ProcessExitError';
    this.exitCode = exitCode;
    this.signal = signal;
    this.stderr = stderr;
    this.stdout = stdout;
    this.process = proc;
  }
}

export class MaxBufferExceededError extends Error {
  constructor(streamName: string) {
    super(`${streamName} maxBuffer exceeded`);
    this.name = 'MaxBufferExceededError';
  }
}

export class ProcessTimeoutError extends Error {
  constructor(timeout: number, proc: child_process$ChildProcess) {
    // $FlowIssue: This isn't typed in the Flow node type defs
    const {spawnargs} = proc;
    const commandName = spawnargs[0] === process.execPath ? spawnargs[1] : spawnargs[0];
    super(`"${commandName}" timed out after ${timeout}ms`);
    this.name = 'ProcessTimeoutError';
  }
}

//
// Internal Stuff
//
// Pay no attention! This is just stuff that's used internally to implement the good stuff.
//

// Node crashes if we allow buffers that are too large.
const DEFAULT_MAX_BUFFER = 100 * 1024 * 1024;

const MAX_LOGGED_CALLS = 100;
const PREVERVED_HISTORY_CALLS = 50;

const noopDisposable = {dispose: () => {}};
const whenShellEnvironmentLoaded =
  typeof atom !== 'undefined' && atomWhenShellEnvironmentLoaded && !atom.inSpecMode()
    ? atomWhenShellEnvironmentLoaded
    : cb => { cb(); return noopDisposable; };

export const loggedCalls = [];
function logCall(duration, command, args) {
  // Trim the history once in a while, to avoid doing expensive array
  // manipulation all the time after we reached the end of the history
  if (loggedCalls.length > MAX_LOGGED_CALLS) {
    loggedCalls.splice(
      0,
      loggedCalls.length - PREVERVED_HISTORY_CALLS,
      {time: new Date(), duration: 0, command: '... history stripped ...'},
    );
  }
  loggedCalls.push({
    duration,
    command: [command, ...args].join(' '),
    time: new Date(),
  });
}

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

function monitorStreamErrors(process: child_process$ChildProcess, command, args, options): void {
  STREAM_NAMES.forEach(streamName => {
    // $FlowIssue
    const stream = process[streamName];
    if (stream == null) {
      return;
    }
    stream.on('error', error => {
      // This can happen without the full execution of the command to fail,
      // but we want to learn about it.
      logError(
        `stream error on stream ${streamName} with command:`,
        command,
        args,
        options,
        'error:',
        error,
      );
    });
  });
}

/**
 * Helper type/function to create child_process by spawning/forking the process.
 */
type ChildProcessOpts = child_process$spawnOpts | child_process$forkOpts;

function _makeChildProcess(
  type: 'spawn' | 'fork' = 'spawn',
  command: string,
  args?: Array<string> = [],
  options?: ChildProcessOpts = {},
): child_process$ChildProcess {
  const now = performanceNow();
  // $FlowFixMe: child_process$spawnOpts and child_process$forkOpts have incompatable stdio types.
  const child = child_process[type](nuclideUri.expandHomeDir(command), args, {...options});
  monitorStreamErrors(child, command, args, options);
  child.on('error', error => {
    logError('error with command:', command, args, options, 'error:', error);
  });
  if (!options || !options.dontLogInNuclide) {
    child.on('close', () => {
      logCall(Math.round(performanceNow() - now), command, args);
    });
  }
  writeToStdin(child, options);
  return child;
}

function writeToStdin(
  childProcess: child_process$ChildProcess,
  options: Object,
): void {
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
function _createProcessStream(
  createProcess: () => child_process$ChildProcess,
  options: CreateProcessStreamOptions = {},
): Observable<child_process$ChildProcess> {
  return observableFromSubscribeFunction(whenShellEnvironmentLoaded)
    .take(1)
    .switchMap(() => {
      const process = createProcess();
      const isExitError = idx(options, _ => _.isExitError) || isExitErrorDefault;
      const exitErrorBufferSize = idx(options, _ => _.exitErrorBufferSize) || 2000;
      const {killTreeWhenDone, timeout} = options;
      const enforceTimeout = timeout
        // TODO: Use `timeoutWith()` when we upgrade to an RxJS that has it.
        ? x => timeoutWith(x, timeout, Observable.throw(new ProcessTimeoutError(timeout, process)))
        : x => x;
      let finished = false;

      // If the process returned by `createProcess()` was not created by it (or at least in the same
      // tick), it's possible that its error event has already been dispatched. This is a bug that
      // needs to be fixed in the caller. Generally, that would just mean refactoring your code to
      // create the process in the function you pass. If for some reason, this is absolutely not
      // possible, you need to make sure that the process is passed here immediately after it's
      // created (i.e. before an ENOENT error event would be dispatched). Don't refactor your code
      // to avoid this function; you'll have the same bug, you just won't be notified! XD
      invariant(
        process.exitCode == null && !process.killed,
        'Process already exited. (This indicates a race condition in Nuclide.)',
      );

      const errors = Observable.fromEvent(process, 'error').flatMap(Observable.throw);

      // Accumulate the first `exitErrorBufferSize` bytes of stderr so that we can give feedback
      // about exit errors. Once we have this much, we don't even listen to the event anymore.
      const accumulatedStderr = takeWhileInclusive(
        observeStream(process.stderr)
          .scan((acc, stderrData) => (acc + stderrData).slice(0, exitErrorBufferSize), '')
          .startWith(''),
        acc => acc.length < exitErrorBufferSize,
      );

      const exitEvents = observeProcessExitMessage(process)
        .withLatestFrom(accumulatedStderr)
        .map(([event, stderr]) => {
          if (isExitError(event)) {
            throw new ProcessExitError(event.exitCode, event.signal, process, stderr);
          }
          return event;
        });

      return enforceTimeout(
        Observable.of(process)
          // Don't complete until we say so!
          .merge(Observable.never())
          .takeUntil(errors)
          .takeUntil(exitEvents)
          .do({
            error: () => { finished = true; },
            complete: () => { finished = true; },
          }),
      )
      .finally(() => {
        if (!process.wasKilled && !finished) {
          killProcess(process, Boolean(killTreeWhenDone));
        }
      });
    });
}

async function _killProcess(
  childProcess: child_process$ChildProcess & {wasKilled?: boolean},
  killTree: boolean,
): Promise<void> {
  childProcess.wasKilled = true;
  if (!killTree) {
    childProcess.kill();
    return;
  }
  if (/^win/.test(process.platform)) {
    await killWindowsProcessTree(childProcess.pid);
  } else {
    await killUnixProcessTree(childProcess);
  }
}

function killWindowsProcessTree(pid: number): Promise<void> {
  return new Promise((resolve, reject) => {
    child_process.exec(`taskkill /pid ${pid} /T /F`, error => {
      if (error == null) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export async function killUnixProcessTree(childProcess: child_process$ChildProcess): Promise<void> {
  const descendants = await getDescendantsOfProcess(childProcess.pid);
  // Kill the processes, starting with those of greatest depth.
  for (const info of descendants.reverse()) {
    killPid(info.pid);
  }
}

function observeProcessExitMessage(
  process: child_process$ChildProcess,
): Observable<ProcessExitMessage> {
  return Observable.fromEvent(
      process,
      'exit',
      (exitCode: ?number, signal: ?string) => ({kind: 'exit', exitCode, signal}))
    // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
    .filter(message => message.signal !== 'SIGUSR1')
    .take(1);
}

function isExitErrorDefault(exit: ProcessExitMessage): boolean {
  return exit.exitCode !== 0;
}

function isWindowsPlatform(): boolean {
  return /^win/.test(process.platform);
}

function limitBufferSize(
  stream: Observable<string>,
  maxBuffer: ?number,
  streamName: string,
): Observable<string> {
  if (maxBuffer == null) {
    return stream;
  }
  return Observable.defer(() => {
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
function timeoutWith<T>(source: Observable<T>, time: number, other: Observable<T>): Observable<T> {
  return source
    .timeout(time)
    // Technically we could catch other TimeoutErrors here. `Observable::timeoutWith()` won't have
    // this problem.
    .catch(err => (err instanceof TimeoutError ? other : Observable.throw(err)));
}
