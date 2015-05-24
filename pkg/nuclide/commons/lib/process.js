'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */
var exec = require('child_process').exec;
var path = require('path');
var PromiseQueue = require('./PromiseQueue');
var blockingQueues = {};

var COMMON_BINARY_PATHS = ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin'];

function createCommand(command: string, args: Array<string>):
    {commandString: string; commandStringWithArgs: string} {
  var commandStringWithArgs = command;
  if (args && args.length) {
    var shellescape = require('shell-escape');
    commandStringWithArgs += ' ' + shellescape(args);
  }

  var commandString = commandStringWithArgs;
  if (process.platform === 'darwin') {
    // OS X apps don't inherit PATH when not launched from the
    // CLI, so reconstruct it. This is a bug, filed
    // against Atom here: https://github.com/AtomLinter/Linter/issues/150
    // TODO(jjiaa): remove this hack when the Atom issue is closed
    commandString = 'eval `/usr/libexec/path_helper -s` && ' + commandString;
  }

  return {commandString, commandStringWithArgs};
}

function createExecEnvironment(originalEnvirnment: mixed, commonBinaryPaths: Array<string>): mixed {
  var execEnvironment = {};
  for (var key in originalEnvirnment) {
    execEnvironment[key] = originalEnvirnment[key];
  }
  execEnvironment.PATH = execEnvironment.PATH || '';
  for (var i = 0; i < commonBinaryPaths.length; i++) {
    var binaryPath = commonBinaryPaths[i];
    if (execEnvironment.PATH.indexOf(binaryPath) === -1) {
      execEnvironment.PATH += path.delimiter + binaryPath;
    }
  }
  return execEnvironment;
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
 * @return Promise that resolves to an object with the properties:
 *     stdout string The contents of the process's output stream.
 *     stderr string The contents of the process's error stream.
 *     exitCode number The exit code returned by the process.
 */
function asyncExecute(
    command: string,
    args: Array<string>,
    options: ?mixed = {}): Promise {
  var {commandString, commandStringWithArgs} = createCommand(command, args);

  // Add commons binary paths to the PATH when no custom env provided.
  options.env = options.env || createExecEnvironment(process.env, COMMON_BINARY_PATHS);

  var executor = (resolve, reject) => {
    // TODO(mbolin): Use child_process.execFile() instead of exec() so the args
    // do not need to be escaped. The only reason this isn't a one-line fix is
    // because of the PATH hack in createCommand(). Once this is cleaned up, we
    // can also eliminate our dependency on shell-escape.
    var child = exec(
      commandString,
      options,
      (error, stdout, stderr) => {
        var exitCode = error ? error.code : 0;
        var result = {
          stdout,
          stderr,
          exitCode,
          command: commandStringWithArgs,
        };
        (exitCode === 0 ? resolve : reject)(result);
      }
    );
    if ((typeof options.stdin) === 'string') {
      // Note that the Node docs have this scary warning about stdin.end() on
      // http://nodejs.org/api/child_process.html#child_process_child_stdin:
      //
      // "A Writable Stream that represents the child process's stdin. Closing
      // this stream via end() often causes the child process to terminate."
      //
      // In practice, this has not appeared to cause any issues thus far.
      child.stdin.write(options.stdin);
      child.stdin.end();
    }
  };
  if (options.queueName === undefined) {
    return new Promise(executor);
  } else {
    if (!blockingQueues[options.queueName]) {
      blockingQueues[options.queueName] = new PromiseQueue();
    }
    return blockingQueues[options.queueName].submit(executor);
  }
}

/**
 * Executes a command and returns stdout if exit code is 0, otherwise reject
 * with a message and stderr.
 */
async function checkOutput(cmd: string, args: string[], options?: Object): Promise<string> {
  var {stdout, stderr, exitCode} = await asyncExecute(cmd, args, options);
  if (exitCode !== 0) {
    throw new Error(`Process exited with non-zero exit code (${exitCode}). stderr: ${stderr}`);
  }
  return stdout;
}

module.exports = {
  asyncExecute,
  checkOutput,
  __test__: {
    createCommand,
    createExecEnvironment,
  },
};
