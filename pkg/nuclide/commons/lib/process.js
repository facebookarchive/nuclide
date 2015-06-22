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
    originalEnv: any, commonBinaryPaths: Array<string>): Promise<Object> {
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
function asyncExecute(
    command: string,
    args: Array<string>,
    options: any = {}): Promise<process$asyncExecuteRet> {
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
      firstChildStderr = '';

      firstChild.on('close', exitCode => {
        // Reject if first child exits unexpectedly, but do not resolve yet. The last child of the
        // piped commands will resolve the promise when it exits.
        if (exitCode !== 0) {
          reject({
            exitCode,
            stderr: firstChildStderr,
            stdout: '',
          });
        }
      })

      firstChild.on('error', error => {
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

      lastChild = spawn(localOptions.pipedCommand, localOptions.pipedArgs, {env: localOptions.env});
      firstChild.stdout.pipe(lastChild.stdin);
    } else {
      lastChild = spawn(command, args, localOptions);
      firstChild = lastChild;
    }

    var stderr = '';
    var stdout = '';
    lastChild.on('close', exitCode => {
      // If the process exited with an error (non-zero code), reject, otherwise resolve.
      (exitCode === 0 ? resolve : reject)({
        exitCode,
        stderr,
        stdout,
      });
    });

    lastChild.on('error', error => {
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

    if ((typeof localOptions.stdin) === 'string') {
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

  if (localOptions.env) {
    return makePromise();
  } else {
    // If no environment is supplied, fetch it first and use it when executing the given command.
    return createExecEnvironment(process.env, COMMON_BINARY_PATHS).then(
      val => {
        localOptions.env = val;
        return makePromise();
      },
      err => makePromise()
    );
  }
}

/**
 * Executes a command and returns stdout if exit code is 0, otherwise reject
 * with a message and stderr.
 */
async function checkOutput(cmd: string, args: Array<string>, options: any = {}): Promise<string> {
  try {
    var {stdout} = await asyncExecute(cmd, args, options);
    return stdout;
  } catch(e) {
    throw new Error(`Process exited with non-zero exit code (${e.exitCode}). stderr: ${e.stderr}`);
  }
}

module.exports = {
  asyncExecute,
  checkOutput,
  __test__: {
    DARWIN_PATH_HELPER_REGEXP,
    createExecEnvironment,
  },
};
