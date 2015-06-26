'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {
  execFile,
  spawn,
} = require('child_process');
var {assign} = require('./object');
var path = require('path');
var PromiseQueue = require('./PromiseQueue');

var platformPathPromise: ?Promise<string>;

var blockingQueues = {};
var COMMON_BINARY_PATHS = ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin'];

/* Captures the value of the PATH env variable returned by Darwin's (OS X) `path_helper` utility.
 * `path_helper -s`'s return value looks like this:
 *
 *     PATH="/usr/bin"; export PATH;
 */
var DARWIN_PATH_HELPER_REGEXP = /PATH=\"([^\"]+)\"/;

const STREAM_NAMES = ['stdin', 'stdout', 'stderr'];

function getPlatformPath(): Promise<string> {
  if (platformPathPromise) {
    // Path is being fetched, await the Promise that's in flight.
    return platformPathPromise;
  }

  if (process.platform === 'darwin') {
    // OS X apps don't inherit PATH when not launched from the CLI, so reconstruct it. This is a
    // bug, filed against Atom Linter here: https://github.com/AtomLinter/Linter/issues/150
    // TODO(jjiaa): remove this hack when the Atom issue is closed
    platformPathPromise = new Promise((resolve, reject) => {
      execFile('/usr/libexec/path_helper', ['-s'], (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          var match = stdout.match(DARWIN_PATH_HELPER_REGEXP);
          resolve((match && match.length > 1) ? match[1] : '');
        }
      });
    });
  } else {
    platformPathPromise = Promise.resolve('');
  }

  return platformPathPromise;
}

function appendCommonBinaryPaths(env: Object, commonBinaryPaths: Array<string>): void {
  commonBinaryPaths.forEach((binaryPath) => {
    if (env.PATH.indexOf(binaryPath) === -1) {
      env.PATH += path.delimiter + binaryPath;
    }
  });
}

async function createExecEnvironment(
    originalEnv: Object, commonBinaryPaths: Array<string>): Promise<Object> {
  var execEnv = assign({}, originalEnv);
  execEnv.PATH = execEnv.PATH || '';

  var platformPath;
  var commonBinaryPathsAppended = false;
  try {
    platformPath = await getPlatformPath();
  } catch (error) {
    // If there's an error fetching the platform's PATH, use the default set of common binary paths.
    appendCommonBinaryPaths(execEnv, commonBinaryPaths);
    commonBinaryPathsAppended = true;
  }

  // If the platform returns a non-empty PATH, use it. Otherwise use the default set of common
  // binary paths.
  if (platformPath) {
    execEnv.PATH = platformPath;
  } else if (!commonBinaryPathsAppended) {
    appendCommonBinaryPaths(execEnv, commonBinaryPaths);
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
    process[streamName].on('error', error => {
      // This can happen without the full execution of the command to fail, but we want to learn about it.
      logError('stream error with command:', command, args, options, 'error:', error);
    });
  });
}

/** Basically like spawn, except it handles and logs errors instead of crashing
  * the process. This is much lower-level than asyncExecute. Unless you have a
  * specific reason you should use asyncExecute instead. */
function safeSpawn(command: string, args: Array<string> = [], options: Object = {}): child_process$ChildProcess {
  var child = spawn(command, args, options);
  monitorStreamErrors(child, command, args, options);
  child.on('error', error => {
    logError('error with command:', command, args, options, 'error:', error);
  });
  return child;
}

type process$asyncExecuteRet = {
  command?: string;
  errorMessage?: string;
  exitCode: number;
  stderr: string;
  stdout: string;
};

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
  var localOptions = assign({}, options);

  var executor = (resolve, reject) => {
    var firstChild;
    var lastChild;

    var firstChildStderr;
    if (localOptions.pipedCommand) {
      // If a second command is given, pipe stdout of first to stdin of second. String output
      // returned in this function's Promise will be stderr/stdout of the second command.
      firstChild = spawn(command, args, localOptions);
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

      lastChild = spawn(localOptions.pipedCommand, localOptions.pipedArgs, localOptions);
      monitorStreamErrors(lastChild, command, args, localOptions);
      firstChild.stdout.pipe(lastChild.stdin);
    } else {
      lastChild = spawn(command, args, localOptions);
      monitorStreamErrors(lastChild, command, args, localOptions);
      firstChild = lastChild;
    }

    var stderr = '';
    var stdout = '';
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

  function makePromise() {
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
    err => {
      localOptions.env = localOptions.env || process.env;
      return makePromise();
    }
  );
}

async function asyncExecute(
    command: string,
    args: Array<string>,
    options: ?Object = {}): Promise<process$asyncExecuteRet> {
  var result = await checkOutput(command, args, options);
  if (result.exitCode !== 0) {
    throw result;
  }
  return result;
}

module.exports = {
  asyncExecute,
  checkOutput,
  safeSpawn,
  __test__: {
    DARWIN_PATH_HELPER_REGEXP,
    createExecEnvironment,
  },
};
