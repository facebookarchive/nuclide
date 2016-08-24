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
import {observeStream, splitStream, takeWhileInclusive} from './stream';
import {maybeToString} from './string';
import {Observable} from 'rxjs';
import {PromiseQueue} from './promise-executors';
import invariant from 'assert';
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

const blockingQueues = {};

const STREAM_NAMES = ['stdin', 'stdout', 'stderr'];

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
export function safeSpawn(
  command: string,
  args?: Array<string> = [],
  options?: Object = {},
): child_process$ChildProcess {
  const child = child_process.spawn(command, args, options);
  monitorStreamErrors(child, command, args, options);
  child.on('error', error => {
    logError('error with command:', command, args, options, 'error:', error);
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
): Observable<{stderr?: string, stdout?: string}> {
  return Observable.create((observer: Observer<any>) => {
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
  createProcess: () => child_process$ChildProcess,
  throwOnError: boolean,
): Observable<child_process$ChildProcess> {
  return Observable.defer(() => {
    const process = createProcess();
    let finished = false;

    // If the process returned by `createProcess()` was not created by it (or at least in the same
    // tick), it's possible that its error event has already been dispatched. This is a bug that
    // needs to be fixed in the caller. Generally, that would just mean refactoring your code to
    // create the process in the function you pass. If for some reason, this is absolutely not
    // possible, you need to make sure that the process is passed here immediately after it's
    // created (i.e. before an ENOENT error event would be dispatched). Don't refactor your code to
    // avoid this function; you'll have the same bug, you just won't be notified! XD
    invariant(
      process.exitCode == null && !process.killed,
      'Process already exited. (This indicates a race condition in Nuclide.)',
    );

    const errors = Observable.fromEvent(process, 'error');
    const exit = Observable.fromEvent(process, 'exit', (code, signal) => signal)
      // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
      .filter(signal => signal !== 'SIGUSR1');

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
        if (!finished) {
          process.kill();
        }
      });
  });
}

export function createProcessStream(
  createProcess: () => child_process$ChildProcess,
): Observable<child_process$ChildProcess> {
  return _createProcessStream(createProcess, true);
}

/**
 * Observe the stdout, stderr and exit code of a process.
 * stdout and stderr are split by newlines.
 */
export function observeProcessExit(
  createProcess: () => child_process$ChildProcess,
): Observable<number> {
  return _createProcessStream(createProcess, false)
    .flatMap(process => Observable.fromEvent(process, 'exit').take(1));
}

export function getOutputStream(
  process: child_process$ChildProcess,
): Observable<ProcessMessage> {
  return Observable.defer(() => {
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
  createProcess: () => child_process$ChildProcess,
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
  const executor = (resolve, reject) => {
    const process = child_process.execFile(
      command,
      args,
      {
        maxBuffer: DEFAULT_MAX_BUFFER,
        ...options,
      },
      // Node embeds various properties like code/errno in the Error object.
      (err: any /* Error */, stdoutBuf, stderrBuf) => {
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
