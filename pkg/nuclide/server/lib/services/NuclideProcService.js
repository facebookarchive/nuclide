'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This code implements the NuclideProcess service.  It exports the service on
 * http via the endpoint: http://your.server:your_port/proc/method where method
 * is one of exec, etc.
 */

var child_process = require('child_process');
var extend = require('util')._extend;

type ExecResult = {error: ?Error; stdout: string; stderr: string};

var DEFAULT_OPTIONS = {
  env: process.env,
  cwd: process.env.HOME,
};

/**
 * The exec endpoint accepts the following query parameters:
 *
 *   command: the command with params space separated
 *   options: see options as defined in
 *            http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
 *
 * The post body will be passed to stdin of the child process.  The body of the
 * response will be a JSON encoded object that looks like this:
 * {
 *    "error": [Error],
 *    "stdout": "",
 *    "stderr": "",
 * }
 */
function exec(command: string, options: mixed): Promise<ExecResult> {
  var mixedOptions = extend(extend({}, DEFAULT_OPTIONS), options);
  return new Promise((resolve, reject) => {
    var proc = child_process.exec(command, mixedOptions, (error, stdout, stderr) => {
      resolve({
        error,
        stdout,
        stderr,
      });
    });
    if (typeof options.stdin === 'string') {
      proc.stdin.write(options.stdin);
      proc.stdin.end();
    }
  });
}

module.exports = {
  services: {
    '/proc/exec': {handler: exec, method: 'post'},
  }
};
