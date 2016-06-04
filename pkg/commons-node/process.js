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

import child_process from 'child_process';
import invariant from 'assert';
import path from 'path';
import {CompositeSubscription, observeStream, splitStream} from './stream';
import {Observable} from 'rxjs';
import {PromiseQueue} from './promise-executors';
import {quote} from 'shell-quote';

export type process$asyncExecuteRet = {
  // If the process fails to even start up, exitCode will not be set
  // and errorCode / errorMessage will contain the actual error message.
  // Otherwise, exitCode will always be defined.
  command?: string;
  errorMessage?: string;
  errorCode?: string;
  exitCode?: number;
  stderr: string;
  stdout: string;
};

export type AsyncExecuteOptions = child_process$spawnOpts & {
  // The queue on which to block dependent calls.
  queueName?: string;
  // The contents to write to stdin.
  stdin?: ?string;
  // A command to pipe output through.
  pipedCommand?: string;
  // Arguments to the piped command.
  pipedArgs?: Array<string>;
  // Timeout (in milliseconds).
  timeout?: number;
};

export type ProcessMessage = StdoutMessage | StderrMessage | ExitMessage | ErrorMessage;
export type StdoutMessage = {
  kind: 'stdout';
  data: string;
};
export type StderrMessage = {
  kind: 'stderr';
  data: string;
};
export type ExitMessage = {
  kind: 'exit';
  exitCode: number;
};
export type ErrorMessage = {
  kind: 'error';
  error: Object;
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
    const paths = execEnv.PATH.split(path.delimiter);
    commonBinaryPaths.forEach(commonBinaryPath => {
      if (paths.indexOf(commonBinaryPath) === -1) {
        paths.push(commonBinaryPath);
      }
    });
    execEnv.PATH = paths.join(path.delimiter);
  }

  return execEnv;
}

function logError(...args) {
  // Can't use nuclide-logging here to not cause cycle dependency.
  /*eslint-disable no-console*/
  console.error(...args);
  /*eslint-enable no-console*/
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
): Observable<{stderr?: string; stdout?: string;}> {
  return Observable.create((observer: Observer) => {
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

    const processStream = Observable.fromPromise(promise);

    const errors = throwOnError
      ? processStream.switchMap(p => (
        Observable.fromEvent(p, 'error').flatMap(err => Observable.throw(err))
      ))
      : Observable.empty();

    const exit = processStream
      .flatMap(p => Observable.fromEvent(p, 'exit', (code, signal) => signal))
      // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
      .filter(signal => signal !== 'SIGUSR1')
      .do(() => { exited = true; });

    return new CompositeSubscription(
      processStream
        // A version of processStream that never completes...
        .merge(Observable.never())
        .merge(errors)
        // ...which we take until the process exits.
        .takeUntil(exit)
        .subscribe(observer),
      () => { disposed = true; maybeKill(); },
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
      invariant(process != null, 'process has not yet been disposed');
      // Use replay/connect on exit for the final concat.
      // By default concat defers subscription until after the LHS completes.
      const exit = Observable
        .fromEvent(process, 'exit')
        .take(1)
        .map(exitCode => ({kind: 'exit', exitCode})).publishReplay();
      exit.connect();
      const error = Observable
        .fromEvent(process, 'error')
        .takeUntil(exit)
        .map(errorObj => ({kind: 'error', error: errorObj}));
      const stdout = splitStream(observeStream(process.stdout))
        .map(data => ({kind: 'stdout', data}));
      const stderr = splitStream(observeStream(process.stderr))
        .map(data => ({kind: 'stderr', data}));
      return stdout.merge(stderr).merge(error).concat(exit);
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
export function asyncExecute(
  command: string,
  args: Array<string>,
  options: ?AsyncExecuteOptions = {},
): Promise<process$asyncExecuteRet> {
  // Clone passed in options so this function doesn't modify an object it doesn't own.
  const localOptions = {...options};

  const executor = (resolve, reject) => {
    let firstChild;
    let lastChild;

    let firstChildStderr;
    if (localOptions.pipedCommand) {
      // If a second command is given, pipe stdout of first to stdin of second. String output
      // returned in this function's Promise will be stderr/stdout of the second command.
      firstChild = child_process.spawn(command, args, localOptions);
      monitorStreamErrors(firstChild, command, args, localOptions);
      firstChildStderr = '';

      firstChild.on('error', error => {
        // Resolve early with the result when encountering an error.
        resolve({
          command: [command].concat(args).join(' '),
          errorMessage: error.message,
          errorCode: error.code,
          stderr: firstChildStderr,
          stdout: '',
        });
      });

      firstChild.stderr.on('data', data => {
        firstChildStderr += data;
      });

      lastChild = child_process.spawn(
        localOptions.pipedCommand,
        localOptions.pipedArgs,
        localOptions
      );
      monitorStreamErrors(lastChild, command, args, localOptions);
      // pipe() normally pauses the writer when the reader errors (closes).
      // This is not how UNIX pipes work: if the reader closes, the writer needs
      // to also close (otherwise the writer process may hang.)
      // We have to manually close the writer in this case.
      lastChild.stdin.on('error', () => {
        firstChild.stdout.emit('end');
      });
      firstChild.stdout.pipe(lastChild.stdin);
    } else {
      lastChild = child_process.spawn(command, args, localOptions);
      monitorStreamErrors(lastChild, command, args, localOptions);
      firstChild = lastChild;
    }

    let stderr = '';
    let stdout = '';
    let timeout = null;
    if (localOptions.timeout != null) {
      timeout = setTimeout(() => {
        // Prevent the other handlers from firing.
        lastChild.removeAllListeners();
        lastChild.kill();
        resolve({
          command: [command].concat(args).join(' '),
          errorMessage: `Exceeded timeout of ${localOptions.timeout}ms`,
          errorCode: 'ETIMEDOUT',
          stderr,
          stdout,
        });
      }, localOptions.timeout);
    }

    lastChild.on('close', exitCode => {
      resolve({
        exitCode,
        stderr,
        stdout,
      });
      if (timeout != null) {
        clearTimeout(timeout);
      }
    });

    lastChild.on('error', error => {
      // Return early with the result when encountering an error.
      resolve({
        command: [command].concat(args).join(' '),
        errorMessage: error.message,
        errorCode: error.code,
        stderr,
        stdout,
      });
      if (timeout != null) {
        clearTimeout(timeout);
      }
    });

    lastChild.stderr.on('data', data => {
      stderr += data;
    });
    lastChild.stdout.on('data', data => {
      stdout += data;
    });

    if (typeof localOptions.stdin === 'string') {
      // Note that the Node docs have this scary warning about stdin.end() on
      // http://nodejs.org/api/child_process.html#child_process_child_stdin:
      //
      // "A Writable Stream that represents the child process's stdin. Closing
      // this stream via end() often causes the child process to terminate."
      //
      // In practice, this has not appeared to cause any issues thus far.
      firstChild.stdin.write(localOptions.stdin);
      firstChild.stdin.end();
    }
  };

  function makePromise(): Promise<process$asyncExecuteRet> {
    if (localOptions.queueName === undefined) {
      return new Promise(executor);
    } else {
      if (!blockingQueues[localOptions.queueName]) {
        blockingQueues[localOptions.queueName] = new PromiseQueue();
      }
      return blockingQueues[localOptions.queueName].submit(executor);
    }
  }

  return createExecEnvironment(localOptions.env || process.env, COMMON_BINARY_PATHS).then(
    val => {
      localOptions.env = val;
      return makePromise();
    },
    error => {
      localOptions.env = localOptions.env || process.env;
      return makePromise();
    }
  );
}

/**
 * Simple wrapper around asyncExecute that throws if the exitCode is non-zero.
 */
export async function checkOutput(
  command: string,
  args: Array<string>,
  options: ?AsyncExecuteOptions = {},
): Promise<process$asyncExecuteRet> {
  const result = await asyncExecute(command, args, options);
  if (result.exitCode !== 0) {
    const reason = result.exitCode != null ? `exitCode: ${result.exitCode}` :
      `error: ${result.errorMessage}`;
    throw new Error(
      `asyncExecute "${command}" failed with ${reason}, ` +
      `stderr: ${result.stderr}, stdout: ${result.stdout}.`
    );
  }
  return result;
}

export const __test__ = {
  DARWIN_PATH_HELPER_REGEXP,
};
