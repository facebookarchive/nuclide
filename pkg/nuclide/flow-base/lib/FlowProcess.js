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

import type {ServerStatusType} from './FlowService';

import invariant from 'assert';

import {BehaviorSubject, Observable} from 'rx';

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

import {ServerStatus} from './FlowConstants';

// Names modeled after https://github.com/facebook/flow/blob/master/src/common/flowExitStatus.ml
export const FLOW_RETURN_CODES = {
  ok: 0,
  serverInitializing: 1,
  typeError: 2,
  noServerRunning: 6,
  // This means that the server exists, but it is not responding, typically because it is busy doing
  // other work.
  outOfRetries: 7,
  buildIdMismatch: 9,
};

const SERVER_READY_TIMEOUT_MS = 10 * 1000;

export class FlowProcess {
  // If we had to start a Flow server, store the process here so we can kill it when we shut down.
  _startedServer: ?child_process$ChildProcess;
  // The current state of the Flow server in this directory
  _serverStatus: BehaviorSubject<ServerStatusType>;
  // The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.
  _root: string;

  constructor(root: string) {
    this._serverStatus = new BehaviorSubject(ServerStatus.UNKNOWN);
    this._root = root;

    this._serverStatus.filter(x => x === ServerStatus.NOT_RUNNING).subscribe(() => {
      this._startFlowServer();
      this._pingServer();
    });
    function isBusyOrInit(status: ServerStatusType): boolean {
      return status === ServerStatus.BUSY || status === ServerStatus.INIT;
    }
    this._serverStatus.filter(isBusyOrInit).subscribe(() => {
      this._pingServer();
    });
  }

  dispose(): void {
    this._serverStatus.onCompleted();
    if (this._startedServer) {
      // The default, SIGTERM, does not reliably kill the flow servers.
      this._startedServer.kill('SIGKILL');
    }
  }

  getServerStatusUpdates(): Observable<ServerStatusType> {
    return this._serverStatus.asObservable();
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
    if (this._serverStatus.getValue() === ServerStatus.failed) {
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
        const shouldRetry = [ServerStatus.NOT_RUNNING, ServerStatus.INIT, ServerStatus.BUSY]
          .indexOf(this._serverStatus.getValue()) !== -1;
        if (i < maxTries && shouldRetry) {
          await this._serverIsReady(); // eslint-disable-line no-await-in-loop
          // Then try again.
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
        this._serverStatus.onNext(ServerStatus.FAILED);
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
    try {
      const result = await asyncExecute(pathToFlow, args, options);
      this._updateServerStatus(result);
      return result;
    } catch (e) {
      this._updateServerStatus(e);
      throw e;
    }
  }

  _updateServerStatus(result: ?process$asyncExecuteRet): void {
    let status;
    if (result == null) {
      status = ServerStatus.NOT_INSTALLED;
    } else {
      switch (result.exitCode) {
        case FLOW_RETURN_CODES.ok:
          // falls through
        case FLOW_RETURN_CODES.typeError:
          status = ServerStatus.READY;
          break;
        case FLOW_RETURN_CODES.serverInitializing:
          status = ServerStatus.INIT;
          break;
        case FLOW_RETURN_CODES.noServerRunning:
          status = ServerStatus.NOT_RUNNING;
          break;
        case FLOW_RETURN_CODES.outOfRetries:
          status = ServerStatus.BUSY;
          break;
        case FLOW_RETURN_CODES.buildIdMismatch:
          // If the version doesn't match, the server is automatically killed and the client
          // returns 9.
          logger.info('Killed flow server with incorrect version in', this._root);
          status = ServerStatus.NOT_RUNNING;
          break;
        default:
          logger.error('Unknown return code from Flow: ' + result.exitCode);
          status = ServerStatus.UNKNOWN;
      }
    }
    invariant(status != null);
    if (status !== this._serverStatus.getValue()) {
      this._serverStatus.onNext(status);
    }
  }

  /** Ping the server until it leaves the current state */
  async _pingServer(tries?: number = 5): Promise<void> {
    const fromState = this._serverStatus.getValue();
    let stateChanged = false;
    this._serverStatus.filter(newState => newState !== fromState).first().subscribe(() => {
      stateChanged = true;
    });
    for (let i = 0; !stateChanged && i < tries; i++) {
      /* eslint-disable no-await-in-loop */
      await this._rawExecFlow(['status']).catch(() => null);
      // Wait 1 second
      await Observable.just(null).delay(1000).toPromise();
      /* eslint-enable no-await-in-loop */
    }
  }

  /**
   * Resolves when the server is ready or the request times out, as indicated by the result of the
   * returned Promise.
   */
  _serverIsReady(): Promise<boolean> {
    return this._serverStatus
      .filter(x => x === ServerStatus.READY)
      .map(() => true)
      .timeout(
        SERVER_READY_TIMEOUT_MS,
        Observable.just(false),
      )
      .first()
      .toPromise();
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
