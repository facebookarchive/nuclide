'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var {BufferedProcess} = require('atom');

/**
 * Wrapper around BufferedProcess that runs the command using unix `script`
 * command. Most of the commands (scripts) we run will color output only if
 * their stdout is terminal. `script` ensures terminal-like environment and
 * commands we run give colored output.
 */
class ScriptBufferedProcess extends BufferedProcess {
  constructor(options) {
    var localOptions = {...options};
    if (localOptions.args == null) {
      localOptions.args = [];
    }
    localOptions.args = ['-q', '/dev/null', localOptions.command].concat(localOptions.args);
    localOptions.command = 'script';
    super(localOptions);
  }
}

/**
 * @param options The argument to the constructor of ScriptBufferedProcess.
 * @return A ScriptBufferedProcess with common binary paths added to `options.env`.
 */
async function createScriptBufferedProcessWithEnv(options: Object): Promise<BufferedProcess> {
  var {createExecEnvironment, COMMON_BINARY_PATHS} = require('nuclide-commons');

  var localOptions = {...options};
  localOptions.env = await createExecEnvironment(localOptions.env ||  process.env,
    COMMON_BINARY_PATHS);
  return new ScriptBufferedProcess(localOptions);
}

module.exports = {
  createScriptBufferedProcessWithEnv,
};
