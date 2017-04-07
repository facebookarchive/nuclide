/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {ProcessExitMessage, ProcessMessage, ProcessInfo} from './process-rpc-types';

import child_process from 'child_process';
import {MultiMap} from './collection';
import nuclideUri from './nuclideUri';
import {splitStream, takeWhileInclusive} from './observable';
import {observeStream} from './stream';
import {maybeToString} from './string';
import {Observable} from 'rxjs';
import invariant from 'assert';
import {quote} from 'shell-quote';
import performanceNow from './performanceNow';

// Node crashes if we allow buffers that are too large.
const DEFAULT_MAX_BUFFER = 100 * 1024 * 1024;

const MAX_LOGGED_CALLS = 100;
const PREVERVED_HISTORY_CALLS = 50;

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

export type AsyncExecuteReturn = {
  // If the process fails to even start up, exitCode will not be set
  // and errorCode / errorMessage will contain the actual error message.
  // Otherwise, exitCode will always be defined.
  errorMessage?: string,
  errorCode?: string,
  exitCode?: number,
  stderr: string,
  stdout: string,
};

type ProcessSystemErrorOptions = {
  command: string,
  args: Array<string>,
  options: Object,
  code: string,
  originalError: Error,
};

export class ProcessSystemError extends Error {
  command: string;
  args: Array<string>;
  options: Object;
  code: string;
  originalError: Error;

  constructor(opts: ProcessSystemErrorOptions) {
    super(`"${opts.command}" failed with code ${opts.code}`);
    this.name = 'ProcessSystemError';
    this.command = opts.command;
    this.args = opts.args;
    this.options = opts.options;
    this.code = opts.code;
    this.originalError = opts.originalError;
  }
}

type ProcessExitErrorOptions = {
  command: string,
  args: Array<string>,
  options: Object,
  exitMessage: ProcessExitMessage,
  stdout: string,
  stderr: string,
};

export type ObserveProcessOptions = child_process$spawnOpts & {
  killTreeOnComplete?: ?boolean,
};

export type ForkProcessOptions = child_process$forkOpts & {
  killTreeOnComplete?: ?boolean,
};

export class ProcessExitError extends Error {
  command: string;
  args: Array<string>;
  options: Object;
  code: ?number;
  exitMessage: ProcessExitMessage;
  stdout: string;
  stderr: string;

  constructor(opts: ProcessExitErrorOptions) {
    super(
      `"${opts.command}" failed with ${exitEventToMessage(opts.exitMessage)}\n\n${opts.stderr}`,
    );
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

export type ProcessError = ProcessSystemError | ProcessExitError;

export type AsyncExecuteOptions = child_process$execFileOpts & {
  // The contents to write to stdin.
  stdin?: ?string,
  dontLogInNuclide?: ?boolean,
};

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
 * Basically like spawn/fork, except it handles and logs errors instead of
 * crashing the process. This is much lower-level than asyncExecute. Unless
 * you have a specific reason you should use asyncExecute instead.
 */
export function safeSpawn(
  command: string,
  args?: Array<string> = [],
  options?: child_process$spawnOpts = {},
): child_process$ChildProcess {
  return _makeChildProcess('spawn', command, args, options);
}

export function safeFork(
  command: string,
  args?: Array<string> = [],
  options?: child_process$forkOpts = {},
): child_process$ChildProcess {
  return _makeChildProcess('fork', command, args, options);
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
  const child = child_process[type](
    nuclideUri.expandHomeDir(command),
    args,
    prepareProcessOptions(options),
  );
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
 * Basically like safeSpawn, but runs the command with the `script` command.
 * `script` ensures terminal-like environment and commands we run give colored output.
 */
export function scriptSafeSpawn(
  command: string,
  args?: Array<string> = [],
  options?: Object = {},
): child_process$ChildProcess {
  const newArgs = createArgsForScriptCommand(command, args);
  return safeSpawn('script', newArgs, options);
}

/**
 * Wraps scriptSafeSpawn with an Observable that lets you listen to the stdout and
 * stderr of the spawned process.
 */
export function scriptSafeSpawnAndObserveOutput(
  command: string,
  args?: Array<string> = [],
  options?: Object = {},
  killTreeOnComplete?: boolean = false,
): Observable<{stderr?: string, stdout?: string}> {
  return Observable.create((observer: rxjs$Observer<any>) => {
    let childProcess = scriptSafeSpawn(command, args, options);

    childProcess.stdout.on('data', data => {
      observer.next({stdout: data.toString()});
    });

    let stderr = '';
    childProcess.stderr.on('data', data => {
      stderr += data;
      observer.next({stderr: data.toString()});
    });

    childProcess.on('exit', (exitCode: number) => {
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
function _createProcessStream(
  createProcess: () => child_process$ChildProcess,
  throwOnError: boolean,
  killTreeOnComplete: boolean,
): Observable<child_process$ChildProcess> {
  return Observable.fromPromise(loadedShellPromise)
    .switchMap(() => {
      const process = createProcess();
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

      const errors = Observable.fromEvent(process, 'error');
      const exit = observeProcessExitMessage(process);

      return Observable.of(process)
        // Don't complete until we say so!
        .merge(Observable.never())
        // Get the errors.
        .takeUntil(throwOnError ? errors.flatMap(Observable.throw) : errors)
        .takeUntil(exit)
        .do({
          error: () => { finished = true; },
          complete: () => { finished = true; },
        })
        .finally(() => {
          if (!process.wasKilled && !finished) {
            killProcess(process, killTreeOnComplete);
          }
        });
    });
}

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

export function killPid(pid: number): void {
  try {
    process.kill(pid);
  } catch (err) {
    if (err.code !== 'ESRCH') {
      throw err;
    }
  }
}


export async function killUnixProcessTree(childProcess: child_process$ChildProcess): Promise<void> {
  const descendants = await getDescendantsOfProcess(childProcess.pid);
  // Kill the processes, starting with those of greatest depth.
  for (const info of descendants.reverse()) {
    killPid(info.pid);
  }
}

export function createProcessStream(
  command: string,
  args?: Array<string>,
  options?: ObserveProcessOptions,
): Observable<child_process$ChildProcess> {
  return _createProcessStream(
    () => safeSpawn(command, args, options),
    true,
    Boolean(options && options.killTreeOnComplete),
  );
}

export function forkProcessStream(
  modulePath: string,
  args?: Array<string>,
  options?: ForkProcessOptions,
): Observable<child_process$ChildProcess> {
  return _createProcessStream(
    () => safeFork(modulePath, args, options),
    true,
    Boolean(options && options.killTreeOnComplete),
  );
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

/**
 * Observe the stdout, stderr and exit code of a process.
 * stdout and stderr are split by newlines.
 */
export function observeProcessExit(
  createProcess: () => child_process$ChildProcess,
  killTreeOnComplete?: boolean = false,
): Observable<ProcessExitMessage> {
  return _createProcessStream(createProcess, false, killTreeOnComplete)
    .flatMap(observeProcessExitMessage);
}

export function getOutputStream(
  process: child_process$ChildProcess,
  killTreeOnComplete?: boolean = false,
  splitByLines?: boolean = true,
): Observable<ProcessMessage> {
  const chunk = splitByLines ? splitStream : x => x;
  return Observable.defer(() => {
    // We need to start listening for the exit event immediately, but defer emitting it until the
    // (buffered) output streams end.
    const exit = observeProcessExit(() => process, killTreeOnComplete).publishReplay();
    const exitSub = exit.connect();

    const error = Observable.fromEvent(process, 'error')
      .map(errorObj => ({kind: 'error', error: errorObj}));
    // It's possible for stdout and stderr to remain open (even indefinitely) after the exit event.
    // This utility, however, treats the exit event as stream-ending, which helps us to avoid easy
    // bugs. We give a short (100ms) timeout for the stdout and stderr streams to close.
    const close = exit.delay(100);
    const stdout = chunk(observeStream(process.stdout).takeUntil(close))
      .map(data => ({kind: 'stdout', data}));
    const stderr = chunk(observeStream(process.stderr).takeUntil(close))
      .map(data => ({kind: 'stderr', data}));

    return takeWhileInclusive(
      Observable.merge(
        Observable.merge(stdout, stderr).concat(exit),
        error,
      ),
      event => event.kind !== 'error' && event.kind !== 'exit',
    )
      .finally(() => { exitSub.unsubscribe(); });
  });
}

/**
 * Observe the stdout, stderr and exit code of a process.
 */
export function observeProcess(
  command: string,
  args?: Array<string>,
  options?: ObserveProcessOptions,
): Observable<ProcessMessage> {
  return _createProcessStream(
    () => safeSpawn(command, args, options),
    false,
    Boolean(options && options.killTreeOnComplete),
  )
    .flatMap(getOutputStream);
}

/**
 * Observe the stdout, stderr and exit code of a process.
 */
export function observeProcessRaw(
  command: string,
  args?: Array<string>,
  options?: ObserveProcessOptions,
): Observable<ProcessMessage> {
  return _createProcessStream(
    () => safeSpawn(command, args, options),
    false,
    Boolean(options && options.killTreeOnComplete),
  )
    .flatMap(process => getOutputStream(process, false, false));
}

let FB_INCLUDE_PATHS;
try {
  // $FlowFB
  FB_INCLUDE_PATHS = require('./fb-config').FB_INCLUDE_PATHS;
} catch (error) {
  FB_INCLUDE_PATHS = [];
}

let DEFAULT_PATH_INCLUDE = [
  ...FB_INCLUDE_PATHS,
  '/usr/local/bin',
];

function prepareProcessOptions(
  options: Object,
): Object {
  return {
    ...options,
    env: preparePathEnvironment(options.env),
  };
}

function preparePathEnvironment(env: ?Object): Object {
  const originalEnv = {
    ...process.env,
    ...env,
  };
  if (isWindowsPlatform()) {
    return originalEnv;
  }
  const existingPath: string = originalEnv.PATH || '';
  return {
    ...originalEnv,
    PATH: nuclideUri.joinPathList([existingPath, ...DEFAULT_PATH_INCLUDE]),
  };
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
export function asyncExecute(
  command: string,
  args: Array<string>,
  options?: AsyncExecuteOptions = {},
): Promise<AsyncExecuteReturn> {
  const now = performanceNow();
  return new Promise((resolve, reject) => {
    const process = child_process.execFile(
      nuclideUri.expandHomeDir(command),
      args,
      prepareProcessOptions({
        maxBuffer: DEFAULT_MAX_BUFFER,
        ...options,
      }),
      // Node embeds various properties like code/errno in the Error object.
      (err: any /* Error */, stdoutBuf, stderrBuf) => {
        if (!options || !options.dontLogInNuclide) {
          logCall(Math.round(performanceNow() - now), command, args);
        }
        const stdout = stdoutBuf.toString('utf8');
        const stderr = stderrBuf.toString('utf8');
        if (err == null) {
          resolve({
            stdout,
            stderr,
            exitCode: 0,
          });
        } else if (Number.isInteger(err.code)) {
          resolve({
            stdout,
            stderr,
            exitCode: err.code,
          });
        } else {
          resolve({
            stdout,
            stderr,
            errorCode: err.errno || 'EUNKNOWN',
            errorMessage: err.message,
          });
        }
      },
    );
    writeToStdin(process, options);
  });
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
 * Simple wrapper around asyncExecute that throws if the exitCode is non-zero.
 */
export async function checkOutput(
  command: string,
  args: Array<string>,
  options?: AsyncExecuteOptions = {},
): Promise<AsyncExecuteReturn> {
  const result = await asyncExecute(nuclideUri.expandHomeDir(command), args, options);
  if (result.exitCode !== 0) {
    const reason = result.exitCode != null ? `exitCode: ${result.exitCode}` :
      `error: ${maybeToString(result.errorMessage)}`;
    throw new Error(
      `asyncExecute "${command}" failed with ${reason}, ` +
      `stderr: ${result.stderr}, stdout: ${result.stdout}.`,
    );
  }
  return result;
}

/**
 * Run a command, accumulate the output. Errors are surfaced as stream errors and unsubscribing will
 * kill the process.
 */
export function runCommand(
  command: string,
  args?: Array<string> = [],
  options?: ObserveProcessOptions = {},
  _: void,
): Observable<string> {
  const seed = {
    error: null,
    stdout: [],
    stderr: [],
    exitMessage: null,
  };
  return observeProcess(command, args, options)
    .reduce(
      (acc, event) => {
        switch (event.kind) {
          case 'stdout':
            return {...acc, stdout: acc.stdout.concat(event.data)};
          case 'stderr':
            return {...acc, stderr: acc.stderr.concat(event.data)};
          case 'error':
            return {...acc, error: event.error};
          case 'exit':
            return {...acc, exitMessage: event};
        }
        return acc;
      },
      seed,
    )
    .map(acc => {
      if (acc.error != null) {
        throw new ProcessSystemError({
          command,
          args,
          options,
          code: acc.error.code, // Alias of errno
          originalError: acc.error, // Just in case.
        });
      }
      const stdout = acc.stdout.join('');
      if (acc.exitMessage != null && acc.exitMessage.exitCode !== 0) {
        throw new ProcessExitError({
          command,
          args,
          options,
          exitMessage: acc.exitMessage,
          stdout,
          stderr: acc.stderr.join(''),
        });
      }
      return stdout;
    });
}

// If provided, read the original environment from NUCLIDE_ORIGINAL_ENV.
// This should contain the base64-encoded output of `env -0`.
let cachedOriginalEnvironment = null;

let loadedShellResolve;
const loadedShellPromise = new Promise(resolve => {
  loadedShellResolve = resolve;
}).then(() => {
  // No need to include default paths now that the environment is loaded.
  DEFAULT_PATH_INCLUDE = [];
  cachedOriginalEnvironment = null;
});

invariant(loadedShellResolve);
if (typeof atom === 'undefined' || atom.inSpecMode()) {
  // This doesn't apply server-side or in tests, so just immediately resolve.
  loadedShellResolve();
}

export function loadedShellEnvironment(): void {
  loadedShellResolve();
}

export async function getOriginalEnvironment(): Promise<Object> {
  await loadedShellPromise;

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

// Returns a string suitable for including in displayed error messages.
export function exitEventToMessage(event: ProcessExitMessage): string {
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

function isWindowsPlatform(): boolean {
  return /^win/.test(process.platform);
}

export async function psTree(): Promise<Array<ProcessInfo>> {
  let psPromise;
  const isWindows = isWindowsPlatform();
  if (isWindows) {
    // See also: https://github.com/nodejs/node-v0.x-archive/issues/2318
    psPromise = checkOutput('wmic.exe',
      ['PROCESS', 'GET', 'ParentProcessId,ProcessId,Name']);
  } else {
    psPromise = checkOutput('ps',
      ['-A', '-o', 'ppid,pid,comm']);
  }
  const {stdout} = await psPromise;
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
