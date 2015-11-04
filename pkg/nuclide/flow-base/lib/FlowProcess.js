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

import type {ServerStatus} from './FlowService';

import {BehaviorSubject} from 'rx';

import {getLogger} from 'nuclide-logging';
const logger = getLogger();

import {
  asyncExecute,
  safeSpawn,
} from 'nuclide-commons';

import {
  isFlowInstalled,
  getPathToFlow,
} from './FlowHelpers.js';

export class FlowProcess {
  // If we had to start a Flow server, store the process here so we can kill it when we shut down.
  _startedServer: ?child_process$ChildProcess;
  // The current state of the Flow server in this directory
  _serverStatus: BehaviorSubject<ServerStatus>;
  // The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.
  _root: string;

  constructor(root: string) {
    this._serverStatus = new BehaviorSubject('unknown');
    this._root = root;
  }

  dispose(): void {
    this._serverStatus.onCompleted();
    if (this._startedServer) {
      // The default, SIGTERM, does not reliably kill the flow servers.
      this._startedServer.kill('SIGKILL');
    }
  }

  /**
   * Returns null if Flow cannot be found.
   */
  async execFlow(
    args: Array<any>,
    options: Object,
    file: string,
    logErrors?: boolean = true,
  ): Promise<?process$asyncExecuteRet> {
    const maxTries = 5;
    if (this._serverStatus.getValue() === 'failed') {
      return null;
    }
    for (let i = 0; ; i++) {
      try {
        const result = await this._rawExecFlow( // eslint-disable-line no-await-in-loop
          args,
          options,
        );
        return result;
      } catch (e) {
        if (i < maxTries && /There is no [fF]low server running/.test(e.stderr)) {
          await this._startFlowServer(); // eslint-disable-line no-await-in-loop
        } else {
          if (logErrors) {
            // not sure what happened, but we'll let the caller deal with it
            logger.error(`Flow failed: flow ${args.join(' ')}. Error: ${JSON.stringify(e)}`);
          }
          throw e;
        }
        // try again
      }
    }
    // otherwise flow complains
    return null;
  }

  /** Starts a Flow server in the current root */
  async _startFlowServer(): Promise<void> {
    const pathToFlow = getPathToFlow();
    // `flow server` will start a server in the foreground. asyncExecute
    // will not resolve the promise until the process exits, which in this
    // case is never. We need to use spawn directly to get access to the
    // ChildProcess object.
    const serverProcess = await safeSpawn( // eslint-disable-line no-await-in-loop
      pathToFlow,
      ['server', this._root],
    );
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
        logger.error('Flow server unexpectedly exited', this._root);
        this._serverStatus.onNext('failed');
        this._serverStatus.onCompleted();
      }
    });
    this._startedServer = serverProcess;
  }

  /** Execute Flow with the given arguments */
  async _rawExecFlow(args: Array<any>, options?: Object = {}): Promise<?process$asyncExecuteRet> {
    const flowOptions = await this._getFlowExecOptions();
    if (!flowOptions) {
      return null;
    }
    options = {...flowOptions, ...options};
    args = [
      ...args,
      '--no-auto-start',
      '--from', 'nuclide',
    ];
    const pathToFlow = getPathToFlow();
    return await asyncExecute(pathToFlow, args, options);
  }

  /**
  * If this returns null, then it is not safe to run flow.
  */
  async _getFlowExecOptions(): Promise<?{cwd: string}> {
    const installed = await isFlowInstalled();
    if (installed) {
      return {
        cwd: this._root,
      };
    } else {
      return null;
    }
  }
}
