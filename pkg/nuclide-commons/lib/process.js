'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import child_process from 'child_process';
import path from 'path';
import {PromiseQueue} from './PromiseExecutors';

import type {Observer} from 'rx';
import type {ProcessMessage, process$asyncExecuteRet} from '..';

import {observeStream, splitStream} from './stream';
import {CompositeDisposable, Disposable} from 'event-kit';
import {Observable} from 'rx';
import invariant from 'assert';
import {quote} from 'shell-quote';

let platformPathPromise: ?Promise<string>;

const blockingQueues = {};
const COMMON_BINARY_PATHS = ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin'];

/**
 * Captures the value of the PATH env variable returned by Darwin's (OS X) `path_helper` utility.
 * `path_helper -s`'s return value looks like this:
 *
 *     PATH="/usr/bin"; export PATH;
 */
const DARWIN_PATH_HELPER_REGEXP = /PATH=\"([^\"]+)\"/;

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
async function createExecEnvironment(
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
async function safeSpawn(
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

async function forkWithExecEnvironment(
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
function createArgsForScriptCommand(command: string, args?: Array<string> = []): Array<string> {
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
function scriptSafeSpawn(
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
function scriptSafeSpawnAndObserveOutput(
  command: string,
  args?: Array<string> = [],
  options?: Object = {},
): Observable<{stderr?: string; stdout?: string;}> {
  return Observable.create((observer: Observer) => {
    let childProcess;
    scriptSafeSpawn(command, args, options).then(proc => {
      childProcess = proc;

      childProcess.stdout.on('data', data => {
        observer.onNext({stdout: data.toString()});
      });

      let stderr = '';
      childProcess.stderr.on('data', data => {
        stderr += data;
        observer.onNext({stderr: data.toString()});
      });

      childProcess.on('exit', (exitCode: number) => {
        if (exitCode !== 0) {
          observer.onError(stderr);
        } else {
          observer.onCompleted();
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
      ? processStream.flatMapLatest(p => (
        Observable.fromEvent(p, 'error').flatMap(err => Observable.throw(err))
      ))
      : Observable.empty();

    const exit = processStream
      .flatMap(p => Observable.fromEvent(p, 'exit', (code, signal) => signal))
      // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
      .filter(signal => signal !== 'SIGUSR1')
      .tap(() => { exited = true; });

    return new CompositeDisposable(
      // A version of processStream that never completes...
      Observable.merge(processStream, Observable.create(() => {}))
        .merge(errors)
        // ...which we take until the process exits.
        .takeUntil(exit)
        .subscribe(observer),
      new Disposable(() => { disposed = true; maybeKill(); }),
    );
  });
  // TODO: We should really `.share()` this observable, but there seem to be issues with that and
  //   `.retry()` in Rx 3 and 4. Once we upgrade to Rx5, we should share this observable and verify
  //   that our retry logic (e.g. in adb-logcat) works.
}

function createProcessStream(
  createProcess: () => child_process$ChildProcess | Promise<child_process$ChildProcess>,
): Observable<child_process$ChildProcess> {
  return _createProcessStream(createProcess, true);
}

/**
 * Observe the stdout, stderr and exit code of a process.
 * stdout and stderr are split by newlines.
 */
function observeProcessExit(
  createProcess: () => child_process$ChildProcess | Promise<child_process$ChildProcess>,
): Observable<number> {
  return _createProcessStream(createProcess, false)
    .flatMap(process => Observable.fromEvent(process, 'exit').take(1));
}

function getOutputStream(
  childProcess: child_process$ChildProcess | Promise<child_process$ChildProcess>,
): Observable<ProcessMessage> {
  return Observable.fromPromise(Promise.resolve(childProcess))
    .flatMap(process => {
      invariant(process != null, 'process has not yet been disposed');
      // Use replay/connect on exit for the final concat.
      // By default concat defers subscription until after the LHS completes.
      const exit = Observable.fromEvent(process, 'exit').take(1).
        map(exitCode => ({kind: 'exit', exitCode})).replay();
      exit.connect();
      const error = Observable.fromEvent(process, 'error').
        takeUntil(exit).
        map(errorObj => ({kind: 'error', error: errorObj}));
      const stdout = splitStream(observeStream(process.stdout)).
        map(data => ({kind: 'stdout', data}));
      const stderr = splitStream(observeStream(process.stderr)).
        map(data => ({kind: 'stderr', data}));
      return stdout.merge(stderr).merge(error).concat(exit);
    });
}

/**
 * Observe the stdout, stderr and exit code of a process.
 */
function observeProcess(
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
 *     See here: http://nodejs.org/api/child_process.html
 *     The additional options we provide:
 *       queueName string The queue on which to block dependent calls.
 *       stdin string The contents to write to stdin.
 *       pipedCommand string a command to pipe the output of command through.
 *       pipedArgs array of strings as arguments.
 * @return Promise that resolves to an object with the properties:
 *     stdout string The contents of the process's output stream.
 *     stderr string The contents of the process's error stream.
 *     exitCode number The exit code returned by the process.
 */
function checkOutput(
    command: string,
    args: Array<string>,
    options: ?Object = {}): Promise<process$asyncExecuteRet> {
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
        // Reject early with the result when encountering an error.
        reject({
          command: [command].concat(args).join(' '),
          errorMessage: error.message,
          exitCode: error.code,
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
    lastChild.on('close', exitCode => {
      resolve({
        exitCode,
        stderr,
        stdout,
      });
    });

    lastChild.on('error', error => {
      // Reject early with the result when encountering an error.
      reject({
        command: [command].concat(args).join(' '),
        errorMessage: error.message,
        exitCode: error.code,
        stderr,
        stdout,
      });
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

async function asyncExecute(
    command: string,
    args: Array<string>,
    options: ?Object = {}): Promise<process$asyncExecuteRet> {
  /* $FlowIssue (t8216189) */
  const result = await checkOutput(command, args, options);
  if (result.exitCode !== 0) {
    // Duck typing Error.
    result['name'] = 'Async Execution Error';
    result['message'] =
        `exitCode: ${result.exitCode}, stderr: ${result.stderr}, stdout: ${result.stdout}.`;
    throw result;
  }
  return result;
}

module.exports = {
  asyncExecute,
  createArgsForScriptCommand,
  createProcessStream,
  checkOutput,
  forkWithExecEnvironment,
  getOutputStream,
  safeSpawn,
  scriptSafeSpawn,
  scriptSafeSpawnAndObserveOutput,
  createExecEnvironment,
  observeProcessExit,
  observeProcess,
  COMMON_BINARY_PATHS,
  __test__: {
    DARWIN_PATH_HELPER_REGEXP,
  },
};
