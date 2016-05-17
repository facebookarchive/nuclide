'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {checkOutput, createArgsForScriptCommand} from '../../commons-node/process';
import {getLogger} from '../../nuclide-logging';

/**
 * Calls out to checkOutput using the 'hg' command.
 * @param options as specified by http://nodejs.org/api/child_process.html. Additional options:
 *   - NO_HGPLAIN set if the $HGPLAIN environment variable should not be used.
 *   - TTY_OUTPUT set if the command should be run as if it were attached to a tty.
 */
export async function hgAsyncExecute(args: Array<string>, options: any): Promise<any> {
  if (!options['NO_HGPLAIN']) {
    // Setting HGPLAIN=1 overrides any custom aliases a user has defined.
    if (options.env) {
      options.env['HGPLAIN'] = 1;
    } else {
      options.env = {...process.env || {}, 'HGPLAIN': 1};
    }
  }

  let cmd;
  if (options['TTY_OUTPUT']) {
    cmd = 'script';
    args = createArgsForScriptCommand('hg', args);
  } else {
    cmd = 'hg';
  }
  try {
    return await checkOutput(cmd, args, options);
  } catch (e) {
    getLogger().error(`Error executing hg command: ${JSON.stringify(args)} ` +
        `options: ${JSON.stringify(options)} ${JSON.stringify(e)}`);
    throw e;
  }
}
