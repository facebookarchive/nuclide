/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {ExecResponse, SpawnResponse} from 'big-dig-vscode-server/Protocol';

import EventEmitter from 'events';
import Stream from 'stream';
import * as rxjs from 'rxjs';
import {getLogger} from 'log4js';
import {ConnectionWrapper} from './ConnectionWrapper';

const logger = getLogger('remote-process');

export type RemoteSpawnOptions = {
  /** Current working directory */
  cwd?: string,
  /** Environment variables (e.g. `{PATH: '/usr/bin/'}`) */
  env?: any,
  shell?: boolean | string,
  /** Inherit environment variables from the server */
  inheritEnv?: boolean,
  term?: string,
  /** Use tty, else use a dump pipe */
  usePty?: boolean,
  /** Make `code` available on the remote's PATH */
  addBigDigToPath?: boolean,
};

/**
 * A process running on a remote machine. This interface is modeled after NodeJS's `ChildProcess`,
 * but does not support all features (e.g. no IPC).
 */
export type RemoteChildProcess = RemoteProcess;

/**
 * Create a remote process.
 * @param conn remote server to create the process on
 * @param cmd path of the command/process to run
 * @param args arguments to pass to the process
 * @param opts options for starting the process
 */
export async function spawnRemote(
  conn: ConnectionWrapper,
  cmd: string,
  args: string[],
  opts?: RemoteSpawnOptions,
): Promise<RemoteChildProcess> {
  const options = opts == null ? {} : opts;
  // flowlint-next-line sketchy-null-string:off
  options.term = options.term || 'xterm';

  const proc = await conn.execSpawn({
    cmd,
    args,
    env: {TERM: options.term, ...options.env},
    shell: options.shell,
    cwd: options.cwd,
    usePty: options.usePty,
    addBigDigToPath: options.addBigDigToPath,
    inheritEnv: options.inheritEnv === undefined ? true : options.inheritEnv,
  });
  return RemoteProcess.create(conn, proc.share());
}

/**
 * Module-internal class to wrap a remote process after it has been spawned.
 */
class RemoteProcess extends EventEmitter {
  _conn: ConnectionWrapper;
  _sub: rxjs.Subscription;
  stdin: Stream.Writable;
  pid: number;
  isTty: boolean;

  /** @private */
  constructor(
    conn: ConnectionWrapper,
    params: SpawnResponse,
    stdio: rxjs.Observable<ExecResponse>,
  ) {
    super();
    this._conn = conn;
    this.pid = params.pid;
    this.isTty = params.isTty;
    this.stdin = new RemoteStdin(conn, this.pid);

    this._sub = stdio.subscribe(
      message => this._handleExecMessages(message),
      error => {
        this.emit('error', error);
      },
    );
  }

  static create(
    conn: ConnectionWrapper,
    stdio: rxjs.Observable<ExecResponse>,
  ): Promise<RemoteChildProcess> {
    return new Promise((resolve, reject) => {
      const sub = stdio.subscribe(
        message => handleSpawnMessage(message),
        error => reject(error),
      );

      function handleSpawnMessage(message: ExecResponse): mixed {
        try {
          if (message.kind === 'spawn') {
            resolve(new RemoteProcess(conn, message, stdio));
          } else {
            throw new Error(
              `Message of kind "${message.kind}" was received before "spawn".`,
            );
          }
        } catch (error) {
          reject(error);
        } finally {
          sub.unsubscribe();
        }
      }
    });
  }

  +stdout = new class extends Stream.Readable {
    _read() {}
  }();

  +stderr = new class extends Stream.Readable {
    _read() {}
  }();

  async kill(signal: string): Promise<void> {
    return this._conn.execKill(this.pid, signal).then(() => {});
  }

  async resize(columns: number, rows: number): Promise<void> {
    return this._conn.execResize(this.pid, columns, rows).then(() => {});
  }

  _handleExecMessages(message: ExecResponse): mixed {
    try {
      switch (message.kind) {
        case 'spawn':
          logger.warn(
            `Ignoring duplicate spawn message for process ${message.pid}`,
          );
          return;
        case 'stdout':
          return this.stdout.push(message.data);
        case 'stderr':
          return this.stderr.push(message.data);
        case 'stdout-end':
          return this.stdout.emit('end');
        case 'stderr-end':
          return this.stderr.emit('end');
        case 'stdin-error':
          return this.stdin.emit('error', message.message);
        case 'error':
          return this.emit('error', message.message);
        case 'close':
          return this.emit('close');
        case 'exit':
          return this.emit('exit', message.code, message.signal);
        default:
          return logger.warn('Unknown remote process message: ' + message.kind);
      }
    } catch (error) {
      logger.error(
        `Unhandled exception in event handling of message kind ${
          message.kind
        } of remote process.`,
        error,
      );
    }
  }
}

/**
 * A writable stream that wraps a remote process.
 */
class RemoteStdin extends Stream.Writable {
  _conn: ConnectionWrapper;
  _pid: number;

  constructor(conn: ConnectionWrapper, pid: number) {
    super();
    this._conn = conn;
    this._pid = pid;
  }

  async _do_write(data: string, callback: Function): Promise<void> {
    try {
      if (this._pid == null) {
        logger.error('Attempt to write to process that has been spawned yet');
      } else {
        await this._conn.execStdin(this._pid, data);
      }
      callback();
    } catch (error) {
      this.emit('error', error);
      callback(error);
    }
  }

  _write(
    chunk: Buffer | string,
    encoding: string,
    callback: Function,
  ): boolean {
    const data =
      typeof chunk === 'string'
        ? Buffer.from(chunk, (encoding: any)).toString('utf8')
        : chunk.toString('utf8');
    this._do_write(data, callback);
    return false;
  }
}
