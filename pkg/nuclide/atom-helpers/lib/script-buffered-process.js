'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {BufferedProcess} = require('atom');
const {createArgsForScriptCommand} = require('../../commons');

/**
 * Wrapper around BufferedProcess that runs the command using unix `script`
 * command. Most of the commands (scripts) we run will color output only if
 * their stdout is terminal. `script` ensures terminal-like environment and
 * commands we run give colored output.
 */
class ScriptBufferedProcess extends BufferedProcess {
  constructor(options) {
    const localOptions = {...options};
    localOptions.args = createArgsForScriptCommand(localOptions.command, localOptions.args);
    localOptions.command = 'script';
    super(localOptions);
  }
}

/**
 * @param options The argument to the constructor of ScriptBufferedProcess.
 * @return A ScriptBufferedProcess with common binary paths added to `options.env`.
 */
async function createScriptBufferedProcessWithEnv(options: Object): Promise<BufferedProcess> {
  const {createExecEnvironment, COMMON_BINARY_PATHS} = require('../../commons');

  const localOptions = {...options};
  localOptions.env = await createExecEnvironment(localOptions.env ||  process.env,
    COMMON_BINARY_PATHS);
  // Flow infers Promise<ScriptBufferedProcess> and believes that to be incompatible with
  // Promise<BufferedProcess> so we need to cast.
  return (new ScriptBufferedProcess(localOptions): BufferedProcess);
}

module.exports = {
  createScriptBufferedProcessWithEnv,
};
