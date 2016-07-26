'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observer} from 'rxjs';
import type {ProcessMessage} from './process-rpc-types';

import child_process from 'child_process';
import nuclideUri from './nuclideUri';
import {CompositeSubscription, observeStream, splitStream, takeWhileInclusive} from './stream';
import {maybeToString} from './string';
import {Observable} from 'rxjs';
import {PromiseQueue} from './promise-executors';
import {quote} from 'shell-quote';

// Node crashes if we allow buffers that are too large.
const DEFAULT_MAX_BUFFER = 100 * 1024 * 1024;

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
  code: number,
  stdout: string,
  stderr: string,
};

export class ProcessExitError extends Error {
  command: string;
  args: Array<string>;
  options: Object;
  code: number;
  stdout: string;
  stderr: string;

  constructor(opts: ProcessExitErrorOptions) {
    super(`"${opts.command}" failed with code ${opts.code}\n\n${opts.stderr}`);
    this.name = 'ProcessExitError';
    this.command = opts.command;
    this.args = opts.args;
    this.options = opts.options;
    this.code = opts.code;
    this.stdout = opts.stdout;
    this.stderr = opts.stderr;
  }
}

export type ProcessError = ProcessSystemError | ProcessExitError;

export type AsyncExecuteOptions = child_process$execFileOpts & {
  // The queue on which to block dependent calls.
  queueName?: string,
  // The contents to write to stdin.
  stdin?: ?string,
};

let platformPathPromise: ?Promise<string>;

const blockingQueues = {};
const COMMON_BINARY_PATHS = ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin'];

/**
 * Captures the value of the PATH env variable returned by Darwin's (OS X) `path_helper` utility.
 * `path_helper -s`'s return value looks like this:
 *
 *     PATH="/usr/bin"; export PATH;
 */
const DARWIN_PATH_HELPER_REGEXP = /PATH="([^"]+)"/;

const STREAM_NAMES = ['stdin', 'stdout', 'stderr'];

function getPlatformPath(): Promise<string> {
  // Do not return the cached value if we are executing under the test runner.
  if (platformPathPromise && process.env.NODE_ENV !== 'test') {
    // Path is being fetched, await the Promise that's in flight.
    return platformPathPromise;
  }

  // We do not cache the result of this check because we have unit tests that temporarily redefine
  // the value of process.platform.
  if (process.platform === 'darwin') {
    // OS X apps don't inherit PATH when not launched from the CLI, so reconstruct it. This is a
    // bug, filed against Atom Linter here: https://github.com/AtomLinter/Linter/issues/150
    // TODO(jjiaa): remove this hack when the Atom issue is closed
    platformPathPromise = new Promise((resolve, reject) => {
      child_process.execFile('/usr/libexec/path_helper', ['-s'], (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          // $FlowFixMe (stdout is a Buffer, which does not have match)
          const match = stdout.match(DARWIN_PATH_HELPER_REGEXP);
          resolve((match && match.length > 1) ? match[1] : '');
        }
      });
    });
  } else {
    platformPathPromise = Promise.resolve('');
  }

  return platformPathPromise;
}

/**
 * Since OS X apps don't inherit PATH when not launched from the CLI, this function creates a new
 * environment object given the original environment by modifying the env.PATH using following
 * logic:
 *  1) If originalEnv.PATH doesn't equal to process.env.PATH, which means the PATH has been
 *    modified, we shouldn't do anything.
 *  1) If we are running in OS X, use `/usr/libexec/path_helper -s` to get the correct PATH and
 *    REPLACE the PATH.
 *  2) If step 1 failed or we are not running in OS X, APPEND commonBinaryPaths to current PATH.
 */
export async function createExecEnvironment(
  originalEnv: Object,
  commonBinaryPaths: Array<string>,
): Promise<Object> {
  const execEnv = {...originalEnv};

  if (execEnv.PATH !== process.env.PATH) {
    return execEnv;
  }

  execEnv.PATH = execEnv.PATH || '';

  let platformPath = null;
  try {
    platformPath = await getPlatformPath();
  } catch (error) {
    logError('Failed to getPlatformPath', error);
  }

  // If the platform returns a non-empty PATH, use it. Otherwise use the default set of common
  // binary paths.
  if (platformPath) {
    execEnv.PATH = platformPath;
  } else if (commonBinaryPaths.length) {
    const paths = nuclideUri.splitPathList(execEnv.PATH);
    commonBinaryPaths.forEach(commonBinaryPath => {
      if (paths.indexOf(commonBinaryPath) === -1) {
        paths.push(commonBinaryPath);
      }
    });
    execEnv.PATH = nuclideUri.joinPathList(paths);
  }

  return execEnv;
}

function logError(...args) {
  // Can't use nuclide-logging here to not cause cycle dependency.
  // eslint-disable-next-line no-console
  console.error(...args);
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
 * Basically like spawn, except it handles and logs errors instead of crashing
 * the process. This is much lower-level than asyncExecute. Unless you have a
 * specific reason you should use asyncExecute instead.
 */
export async function safeSpawn(
  command: string,
  args?: Array<string> = [],
  options?: Object = {},
): Promise<child_process$ChildProcess> {
  options.env = await createExecEnvironment(options.env || process.env, COMMON_BINARY_PATHS);
  const child = child_process.spawn(command, args, options);
  monitorStreamErrors(child, command, args, options);
  child.on('error', error => {
    logError('error with command:', command, args, options, 'error:', error);
  });
  return child;
}

export async function forkWithExecEnvironment(
  modulePath: string,
  args?: Array<string> = [],
  options?: Object = {},
): Promise<child_process$ChildProcess> {
  const forkOptions = {
    ...options,
    env: await createExecEnvironment(options.env || process.env, COMMON_BINARY_PATHS),
  };
  const child = child_process.fork(modulePath, args, forkOptions);
  child.on('error', error => {
    logError('error from module:', modulePath, args, options, 'error:', error);
  });
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
): Promise<child_process$ChildProcess> {
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
): Observable<{stderr?: string, stdout?: string}> {
  return Observable.create((observer: Observer<any>) => {
    let childProcess;
    scriptSafeSpawn(command, args, options).then(proc => {
      childProcess = proc;

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
    });

    return () => {
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
function _createProcessStream(
  createProcess: () => child_process$ChildProcess | Promise<child_process$ChildProcess>,
  throwOnError: boolean,
): Observable<child_process$ChildProcess> {
  return Observable.create(observer => {
    const promise = Promise.resolve(createProcess());
    let process;
    let disposed = false;
    let exited = false;
    const maybeKill = () => {
      if (process != null && disposed && !exited) {
        process.kill();
        process = null;
      }
    };

    promise.then(p => {
      process = p;
      maybeKill();
    });

    // Create a stream that contains the process but never completes. We'll use this to build the
    // completion conditions.
    const processStream = Observable.fromPromise(promise).merge(Observable.never());

    const errors = processStream.switchMap(p => Observable.fromEvent(p, 'error'));
    const exit = processStream
      .flatMap(p => Observable.fromEvent(p, 'exit', (code, signal) => signal))
      // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
      .filter(signal => signal !== 'SIGUSR1')
      .do(() => { exited = true; });
    const completion = throwOnError ? exit : exit.race(errors);

    return new CompositeSubscription(
      processStream
        .merge(throwOnError ? errors.flatMap(Observable.throw) : Observable.empty())
        .takeUntil(completion)
        .subscribe(observer),
      (() => { disposed = true; maybeKill(); }: () => void),
    );
  });
  // TODO: We should really `.share()` this observable, but there seem to be issues with that and
  //   `.retry()` in Rx 3 and 4. Once we upgrade to Rx5, we should share this observable and verify
  //   that our retry logic (e.g. in adb-logcat) works.
}

export function createProcessStream(
  createProcess: () => child_process$ChildProcess | Promise<child_process$ChildProcess>,
): Observable<child_process$ChildProcess> {
  return _createProcessStream(createProcess, true);
}

/**
 * Observe the stdout, stderr and exit code of a process.
 * stdout and stderr are split by newlines.
 */
export function observeProcessExit(
  createProcess: () => child_process$ChildProcess | Promise<child_process$ChildProcess>,
): Observable<number> {
  return _createProcessStream(createProcess, false)
    .flatMap(process => Observable.fromEvent(process, 'exit').take(1));
}

export function getOutputStream(
  childProcess: child_process$ChildProcess | Promise<child_process$ChildProcess>,
): Observable<ProcessMessage> {
  return Observable.fromPromise(Promise.resolve(childProcess))
    .flatMap(process => {
      // We need to start listening for the exit event immediately, but defer emitting it until the
      // output streams end.
      const exit = Observable.fromEvent(process, 'exit')
        .take(1)
        .map(exitCode => ({kind: 'exit', exitCode}))
        .publishReplay();
      const exitSub = exit.connect();

      const error = Observable.fromEvent(process, 'error')
        .map(errorObj => ({kind: 'error', error: errorObj}));
      const stdout = splitStream(observeStream(process.stdout))
        .map(data => ({kind: 'stdout', data}));
      const stderr = splitStream(observeStream(process.stderr))
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
  createProcess: () => child_process$ChildProcess | Promise<child_process$ChildProcess>,
): Observable<ProcessMessage> {
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
export async function asyncExecute(
  command: string,
  args: Array<string>,
  options?: AsyncExecuteOptions = {},
): Promise<AsyncExecuteReturn> {
  const env = await createExecEnvironment(options.env || process.env, COMMON_BINARY_PATHS);
  const executor = (resolve, reject) => {
    const process = child_process.execFile(
      command,
      args,
      {
        maxBuffer: DEFAULT_MAX_BUFFER,
        ...options,
        env,
      },
      // Node embeds various properties like code/errno in the Error object.
      (err: /* Error */ any, stdoutBuf, stderrBuf) => {
        const stdout = stdoutBuf.toString('utf8');
        const stderr = stderrBuf.toString('utf8');
        if (err != null) {
          if (Number.isInteger(err.code)) {
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
        }
        resolve({
          stdout,
          stderr,
          exitCode: 0,
        });
      },
    );
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
  };

  const {queueName} = options;
  if (queueName === undefined) {
    return new Promise(executor);
  } else {
    if (!blockingQueues[queueName]) {
      blockingQueues[queueName] = new PromiseQueue();
    }
    return blockingQueues[queueName].submit(executor);
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
  const result = await asyncExecute(command, args, options);
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
  options?: Object = {},
): Observable<string> {
  return observeProcess(() => safeSpawn(command, args, options))
    .reduce(
      (acc, event) => {
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
      },
      {error: ((null: any): Object), stdout: '', stderr: '', exitCode: ((null: any): ?number)},
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
      if (acc.exitCode != null && acc.exitCode !== 0) {
        throw new ProcessExitError({
          command,
          args,
          options,
          code: acc.exitCode,
          stdout: acc.stdout,
          stderr: acc.stderr,
        });
      }
      return acc.stdout;
    });
}

export const __test__ = {
  DARWIN_PATH_HELPER_REGEXP,
};
