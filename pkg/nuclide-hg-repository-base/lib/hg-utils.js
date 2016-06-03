'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {asyncExecute, createArgsForScriptCommand} from '../../commons-node/process';
import {getLogger} from '../../nuclide-logging';

/**
 * Calls out to checkOutput using the 'hg' command.
 * @param options as specified by http://nodejs.org/api/child_process.html. Additional options:
 *   - NO_HGPLAIN set if the $HGPLAIN environment variable should not be used.
 *   - TTY_OUTPUT set if the command should be run as if it were attached to a tty.
 */
export async function hgAsyncExecute(args: Array<string>, options: any): Promise<any> {
  if (!options.NO_HGPLAIN) {
    // Setting HGPLAIN=1 overrides any custom aliases a user has defined.
    if (options.env) {
      options.env.HGPLAIN = 1;
    } else {
      options.env = {...process.env || {}, HGPLAIN: 1};
    }
  }

  let cmd;
  if (options.TTY_OUTPUT) {
    cmd = 'script';
    args = createArgsForScriptCommand('hg', args);
  } else {
    cmd = 'hg';
  }
  const result = await asyncExecute(cmd, args, options);
  if (result.exitCode === 0) {
    return result;
  } else {
    getLogger().error(`Error executing hg command: ${JSON.stringify(args)} ` +
        `options: ${JSON.stringify(options)} ${JSON.stringify(result)}`);
    if (result.stderr.length > 0 && result.stdout.length > 0) {
      throw new Error(`hg error\nstderr: ${result.stderr}\nstdout: ${result.stdout}`);
    } else {
      // One of `stderr` or `stdout` is empty - not both.
      throw new Error(result.stderr || result.stdout);
    }
  }
}
