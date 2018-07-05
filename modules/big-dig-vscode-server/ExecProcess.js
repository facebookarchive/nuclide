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

import type {ITerminal} from 'nuclide-prebuilt-libs/pty';
import type {ExecResponse} from './Protocol';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import EventEmitter from 'events';
import {Observable, Subject} from 'rxjs';
import {getLogger} from 'log4js';
import * as child_process from 'child_process';

export type {ExecResponse} from './Protocol';

const logger = getLogger('exec');

/** Wraps a running process. */
export interface ExecProcess {
  kill(signal: string): void;
  resize(columns: number, rows: number): void;
  write(message: string): void;
  /** Streams process events, like stdout, close, exit, etc. */
  +stream: Observable<ExecResponse>;
  +pid: number;
  /** True if the process connection supports tty commands. */
  +isTty: boolean;
  /** Called (just once) when the process is terminated and channels closed. */
  onComplete(listener: () => void): IDisposable;
}

export type SpawnParams = {
  cmd: string,
  args: Array<string>,
  cwd?: string,
  // $FlowIssue
  env: {+[name: string]: string},
  shell: string | boolean,
  usePty: boolean,
};

export function exec(params: SpawnParams): ExecProcess {
  const {cmd, args, cwd, env, shell, usePty} = params;
  if (usePty) {
    try {
      // We optimistically attempt to spawn the process on a pty shell,
      // but pty may not be available
      return new ExecProcessPty(cmd, args, cwd, env, shell);
    } catch (err) {
      // Assume the above failed because pty was not available.
      // (It may actually exist, but not have the native bindings
      // for the current platform.)
      logger.warn('pty terminal failed to load:', err);
    }
  }
  // Fall back to a plain old pipe for communication.
  return new ExecProcessNodeJs(cmd, args, cwd, env, shell);
}

class ExecProcessNodeJs implements ExecProcess {
  _process: child_process$ChildProcess;
  _stream: Subject<ExecResponse> = new Subject();
  _isClosed = false;
  _isExited = false;
  _emitter = new EventEmitter();
  +isTty = false;

  +stream: Observable<ExecResponse> = Observable.defer(() =>
    Observable.of({
      kind: 'spawn',
      pid: this._process.pid,
      isTty: this.isTty,
    }).concat(this._stream),
  );

  constructor(
    cmd: string,
    args: Array<string>,
    cwd?: string,
    env: {+[name: string]: string},
    shell: boolean | string,
  ) {
    logger.info(`spawn: ${cmd} ${args.join(' ')}`);
    const process = child_process.spawn(cmd, args, {
      cwd,
      shell,
      env,
      detached: false,
      stdio: 'pipe',
    });
    logger.info(`spawned ${process.pid}`);
    this._process = process;

    process.stdout.on('data', (data: string | Buffer) => {
      this._stream.next({kind: 'stdout', data: data.toString()});
    });
    process.stdout.on('end', () => {
      this._stream.next({kind: 'stdout-end'});
    });
    process.stderr.on('data', (data: string | Buffer) => {
      this._stream.next({kind: 'stderr', data: data.toString()});
    });
    process.stderr.on('end', () => {
      this._stream.next({kind: 'stderr-end'});
    });
    process.stdin.on('error', err => {
      this._stream.next({kind: 'stdin-error', message: err.toString()});
    });
    process.once('error', err => {
      this._stream.next({kind: 'error', message: err.toString()});
    });
    process.once('close', (code, signal) => {
      logger.info(`closed ${process.pid} with code=${code} signal=${signal}`);
      this._stream.next({kind: 'close'});
      this._isClosed = true;
      this._checkComplete();
    });
    process.once('exit', (code, signal) => {
      this._stream.next({kind: 'exit', code, signal});
      this._isExited = true;
      this._checkComplete();
    });
    process.stdout.resume();
  }

  kill(signal: string): void {
    logger.info(`killed ${process.pid} with signal=${signal}`);
    this._process.kill(signal);
  }

  resize(columns: number, rows: number) {}

  write(message: string): void {
    this._process.stdin.write(message);
  }

  get pid(): number {
    return this._process.pid;
  }

  onComplete(listener: () => void): IDisposable {
    return new UniversalDisposable(
      this._stream.subscribe({complete: listener}),
    );
  }

  _checkComplete(): void {
    if (this._isClosed && this._isExited) {
      this._stream.complete();
    }
  }
}

class ExecProcessPty implements ExecProcess {
  _process: ITerminal;
  _stream: Subject<ExecResponse> = new Subject();
  _isClosed = false;
  _isExited = false;
  _emitter = new EventEmitter();
  +isTty = true;

  +stream: Observable<ExecResponse> = Observable.defer(() =>
    Observable.of({
      kind: 'spawn',
      pid: this._process.pid,
      isTty: this.isTty,
    }).concat(this._stream),
  );

  constructor(
    cmd: string,
    args: Array<string>,
    cwd?: string,
    env: {+[name: string]: string},
    shell: boolean | string,
  ) {
    // Lazy load pty.js because it may fail if native bindings cannot be found.
    // If this fails, then the caller should create a ExecProcessNodeJs
    // instead.
    const spawn = require('nuclide-prebuilt-libs/pty').spawn;

    logger.info(`spawn: ${cmd} ${args.join(' ')}`);
    // $FlowIssue
    const process = spawn(cmd, args, {cwd, env});
    logger.info(`spawned ${process.pid}`);
    this._process = process;

    // pty.spawn forwards events from a Node net.Socket.
    process.on('data', data => {
      this._stream.next({kind: 'stdout', data: data.toString()});
    });
    // The 'close' event is actually for the pty socket connecting to the
    // process. The event will generally occur before exit :/
    // We'll issue 'close' when 'exit' occurs.
    // process.once('close', () => { ... });

    process.once('error', err => {
      // When the pty's child process is closed, an EIO error is emitted.
      // This is safe to interpret as a 'stdout-end'.
      // flowlint-next-line sketchy-null-string:off
      if (err.code && err.code.includes('EIO')) {
        this._stream.next({kind: 'stdout-end'});
      } else {
        this._stream.error({kind: 'error', message: err.toString()});
      }
    });

    process.once('close', () => {
      this._isClosed = true;
      this._stream.next({kind: 'close'});
      this._checkComplete();
    });

    process.once('exit', (code, signal) => {
      logger.info(`exited ${process.pid} with code=${code} signal=${signal}`);
      this._stream.next({kind: 'exit', code, signal});
      this._isExited = true;
      this._checkComplete();
    });
  }

  kill(signal: string): void {
    logger.info(`killed ${this._process.pid} with signal=${signal}`);
    this._process.destroy();
  }

  resize(columns: number, rows: number) {
    this._process.resize(columns, rows);
  }

  write(message: string): void {
    this._process.write(message);
  }

  get pid(): number {
    return this._process.pid;
  }

  onComplete(listener: () => void): IDisposable {
    return new UniversalDisposable(
      this._stream.subscribe({complete: listener}),
    );
  }

  _checkComplete(): void {
    if (this._isClosed && this._isExited) {
      this._stream.complete();
    }
  }
}
