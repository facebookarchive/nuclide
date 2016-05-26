'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Subscription} from 'rxjs';
import type {ProcessMessage} from './process';

import {StreamTransport, Rpc} from './Rpc';
import {getOutputStream} from './process';
import {serializeAsyncCall} from './promise';
import {getLogger} from '../nuclide-logging';
import invariant from 'assert';

export type ProcessMaker = () => Promise<child_process$ChildProcess>;

const logger = getLogger();

/**
 * A generic process wrapper around a stdio-based child process, providing a simple
 * promise-based call API. Commonly used to wrap a python (or any other language)
 * process, making it invokable through JS code.
 *
 * This class can be generalized further (to not require stdin/stdout as the communication method)
 * by having the Transport class injected, which is currently defaulted to StreamTransport.
 *
 * Child Process Implementation Notes:
 * - See Rpc.js for the JSON protocol that the child process implementation must follow.
 * - Note that stdin, stdout, and stderr must be piped, done by node by default.
 *   Don't override the stdio to close off any of these streams in the constructor opts.
 */
export default class RpcProcess<TReq, TResp> {
  _name: string;
  _disposed: boolean;
  _process: ?child_process$ChildProcess;
  _rpc: ?Rpc<TReq, TResp>;
  _subscription: ?Subscription;

  _ensureProcess: () => Promise<void>;

  /**
   * @param name           a name for this server, used to tag log entries
   * @param createProcess  a function to used create the child process when needed,
   *                       both during initialization and on restart
   */
  constructor(name: string, createProcess: ProcessMaker) {
    this._name = name;
    this._disposed = false;
    this._ensureProcess = serializeAsyncCall(() =>
      this._ensureProcessImpl(createProcess)
    );
  }

  getName(): string {
    return this._name;
  }

  /**
   * Perform an asynchronous call on the child process. The returned promise
   * will resolve upon receiving a stdout response from the child process marked
   * the id of the request. The promise will be rejected if any errors occur.
   *
   * @param  args    arbitrary payload to be sent with the request
   * @return         arbitrary payload, received as a response from the
   *                 child process.
   */
  async call(args: TReq): Promise<TResp> {
    invariant(
      !this._disposed,
      `${this._name} - Attempting to call on disposed connection: ${args}`
    );

    await this._ensureProcess();
    invariant(this._process, 'process is null');
    invariant(this._rpc, 'rpc is null');

    return this._rpc.call(args);
  }

  dispose(): void {
    logger.info(`${this._name} - disposing connection.`);
    this._disposed = true;
    this._cleanup();
  }

  /**
   * Ensures that the child process is available. Asynchronously creates the child process,
   * only if it is currently null.
   */
  async _ensureProcessImpl(createProcess: ProcessMaker): Promise<void> {
    if (this._process) {
      return;
    }
    try {
      const proc = await createProcess();
      logger.info(`${this._name} - created child process with PID: `, proc.pid);

      proc.stdin.on('error', error => {
        logger.error(`${this._name} - error writing data: `, error);
      });

      this._rpc = new Rpc(this._name, new StreamTransport(proc.stdin, proc.stdout));
      this._subscription = getOutputStream(proc)
        .subscribe(this._onProcessMessage.bind(this));
      this._process = proc;
    } catch (e) {
      logger.error(`${this._name} - error spawning child process: `, e);
      throw e;
    }
  }

  /**
   * Handles lifecycle messages from stderr, exit, and error streams,
   * responding by logging and staging for process restart.
   */
  _onProcessMessage(message: ProcessMessage): void {
    switch (message.kind) {
      case 'stdout':
        break;
      case 'stderr':
        logger.error(`${this._name} - error from stderr received: `, message.data.toString());
        break;
      case 'exit':
        // Log exit code if process exited not as a result of being disposed.
        if (!this._disposed) {
          logger.error(`${this._name} - exited: `, message.exitCode);
        }
        // Don't attempt to kill the process if it already exited.
        this._cleanup(false);
        break;
      case 'error':
        logger.error(`${this._name} - error received: `, message.error.message);
        this._cleanup();
        break;
      default:
        // This case should never be reached.
        invariant(false, `${this._name} - unknown message received: ${message}`);
    }
  }

  /**
   * Cleans up in case of disposal or failure, clearing all pending calls,
   * and killing the child process if necessary.
   */
  _cleanup(shouldKill: boolean = true): void {
    if (this._subscription != null) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
    if (this._rpc != null) {
      this._rpc.dispose();
      this._rpc = null;
    }
    if (this._process != null && shouldKill) {
      this._process.kill();
    }
    // If shouldKill is false, i.e. the process exited outside of this
    // object's control or disposal, the process still needs to be nulled out
    // to indicate that the process needs to be restarted upon the next call.
    this._process = null;
  }
}
