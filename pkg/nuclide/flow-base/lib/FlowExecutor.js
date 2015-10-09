'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {asyncExecute, safeSpawn, object as commonsObject} from 'nuclide-commons';
const {assign} = commonsObject;

var logger = require('nuclide-logging').getLogger();

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
  for (var server of startedServers) {
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
export async function execFlow(args: Array<any>, options: Object, file: string): Promise<?Object> {
  var maxTries = 5;
  var flowOptions = await getFlowExecOptions(file);
  if (!flowOptions) {
    return null;
  }
  var root = flowOptions.cwd;
  var localOptions = assign({}, options, flowOptions);
  if (failedRoots.has(root)) {
    return null;
  }
  args.push('--no-auto-start');
  args.push('--from', 'nuclide');
  var pathToFlow = getPathToFlow();
  for (var i = 0; ; i++) {
    try {
      var result = await asyncExecute(pathToFlow, args, localOptions);
      return result;
    } catch (e) {
      if (i >= maxTries) {
        throw e;
      }
      if (/There is no [fF]low server running/.test(e.stderr)) {
        // `flow server` will start a server in the foreground. asyncExecute
        // will not resolve the promise until the process exits, which in this
        // case is never. We need to use spawn directly to get access to the
        // ChildProcess object.
        var serverProcess = await safeSpawn(pathToFlow, ['server', root]);
        var logIt = data => {
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
        throw e;
      }
      // try again
    }
  }
  // otherwise flow complains
  return {};
}
