'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {process$asyncExecuteRet} from 'nuclide-commons';

import {asyncExecute, safeSpawn, object as commonsObject} from 'nuclide-commons';
const {assign} = commonsObject;

const logger = require('nuclide-logging').getLogger();

import {
  getPathToFlow,
  getFlowExecOptions,
} from './FlowHelpers.js';

// The set of Flow server processes we have started, so we can kill them on
// teardown
const startedServers: Set<child_process$ChildProcess> = new Set();
// The set of roots for which we have observed a Flow crash. If Flow crashes,
// we don't want to keep restarting Flow servers. We also don't want to
// disable Flow globally if only a specific Flow root in the project causes a
// crash.
const failedRoots: Set<string> = new Set();

export async function dispose(): Promise<void> {
  for (const server of startedServers) {
    // The default, SIGTERM, does not reliably kill the flow servers.
    server.kill('SIGKILL');
  }
  startedServers.clear();
  failedRoots.clear();
}

/**
 * Returns null if it is unsafe to run Flow (i.e. if it is not installed or if
 * no .flowconfig file can be found).
 */
export async function execFlow(args: Array<any>, options: Object, file: string)
    : Promise<?process$asyncExecuteRet> {
  const maxTries = 5;
  const flowOptions = await getFlowExecOptions(file);
  if (!flowOptions) {
    return null;
  }
  const root = flowOptions.cwd;
  const localOptions = assign({}, options, flowOptions);
  if (failedRoots.has(root)) {
    return null;
  }
  args.push('--no-auto-start');
  args.push('--from', 'nuclide');
  const pathToFlow = getPathToFlow();
  for (let i = 0; ; i++) {
    try {
      const result =
        await asyncExecute(pathToFlow, args, localOptions); // eslint-disable-line no-await-in-loop
      return result;
    } catch (e) {
      if (i < maxTries && /There is no [fF]low server running/.test(e.stderr)) {
        // `flow server` will start a server in the foreground. asyncExecute
        // will not resolve the promise until the process exits, which in this
        // case is never. We need to use spawn directly to get access to the
        // ChildProcess object.
        const serverProcess =
          await safeSpawn(pathToFlow, ['server', root]); // eslint-disable-line no-await-in-loop
        const logIt = data => {
          logger.debug('flow server: ' + data);
        };
        serverProcess.stdout.on('data', logIt);
        serverProcess.stderr.on('data', logIt);
        serverProcess.on('exit', (code, signal) => {
          // We only want to blacklist this root if the Flow processes
          // actually failed, rather than being killed manually. It seems that
          // if they are killed, the code is null and the signal is 'SIGTERM'.
          // In the Flow crashes I have observed, the code is 2 and the signal
          // is null. So, let's blacklist conservatively for now and we can
          // add cases later if we observe Flow crashes that do not fit this
          // pattern.
          if (code === 2 && signal === null) {
            logger.error('Flow server unexpectedly exited', root);
            failedRoots.add(root);
          }
        });
        startedServers.add(serverProcess);
      } else {
        // not sure what happened, but we'll let the caller deal with it
        logger.error(`Flow failed: flow ${args.join(' ')}. Error: ${JSON.stringify(e)}`);
        throw e;
      }
      // try again
    }
  }
  // otherwise flow complains
  return null;
}
