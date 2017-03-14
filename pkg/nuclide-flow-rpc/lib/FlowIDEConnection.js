/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {FlowStatusOutput} from './flowOutputTypes';

import {Disposable} from 'event-kit';
import {Observable, Subject} from 'rxjs';
import * as rpc from 'vscode-jsonrpc';
import through from 'through';

import {getLogger} from '../../nuclide-logging';

// TODO put these in flow-typed when they are fleshed out better

type MessageHandler = (...args: any) => mixed;

type RpcConnection = {
  onNotification(methodName: string, handler: MessageHandler): void,
  sendNotification(methodName: string, ...args: any): void,
  // TODO requests
  listen(): void,
  dispose(): void,
};

const SUBSCRIBE_METHOD_NAME = 'subscribeToDiagnostics';

const NOTIFICATION_METHOD_NAME = 'diagnosticsNotification';

// Manages the connection to a single `flow ide` process. The lifecycle of an instance of this class
// is tied to the lifecycle of a the `flow ide` process.
export class FlowIDEConnection {
  _connection: RpcConnection;
  _ideProcess: child_process$ChildProcess;
  _isDisposed: boolean;
  _onWillDisposeCallbacks: Set<() => mixed>;

  constructor(
    process: child_process$ChildProcess,
  ) {
    this._isDisposed = false;
    this._onWillDisposeCallbacks = new Set();
    this._ideProcess = process;
    this._ideProcess.stderr.pipe(through(
      msg => {
        getLogger().info('Flow IDE process stderr: ', msg.toString());
      },
    ));
    this._connection = rpc.createMessageConnection(
      new rpc.StreamMessageReader(this._ideProcess.stdout),
      new rpc.StreamMessageWriter(this._ideProcess.stdin),
    );
    this._connection.listen();

    this._ideProcess.on('exit', () => this.dispose());
    this._ideProcess.on('close', () => this.dispose());
  }

  dispose(): void {
    if (!this._isDisposed) {
      for (const callback of this._onWillDisposeCallbacks) {
        callback();
      }

      this._ideProcess.stdin.end();
      this._ideProcess.kill();

      this._connection.dispose();
      this._isDisposed = true;
    }
  }

  onWillDispose(callback: () => mixed): IDisposable {
    this._onWillDisposeCallbacks.add(callback);
    return new Disposable(() => {
      this._onWillDisposeCallbacks.delete(callback);
    });
  }

  observeDiagnostics(): Observable<FlowStatusOutput> {
    const s = new Subject();
    this._connection.onNotification(NOTIFICATION_METHOD_NAME, (arg: FlowStatusOutput) => {
      s.next(arg);
    });
    this._connection.sendNotification(SUBSCRIBE_METHOD_NAME);
    // This is a temporary hack used to simplify the temporary vscode-jsonrpc implementation in
    // Flow: D4659335
    this._ideProcess.stdin.write('\r\n');
    return s.publishReplay(1).refCount();
  }
}
