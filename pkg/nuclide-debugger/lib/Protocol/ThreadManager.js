/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {
  ThreadsUpdatedEvent,
  ThreadUpdatedEvent,
} from '../../../nuclide-debugger-base/lib/protocol-types';
import type DebuggerDomainDispatcher from './DebuggerDomainDispatcher';

import {Subject, Observable} from 'rxjs';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

/**
 * Bridge between Nuclide IPC and RPC threading protocols.
 */
export default class ThreadManager {
  _debuggerDispatcher: DebuggerDomainDispatcher;
  _threadEvent$: Subject<Array<mixed>>;
  _subscriptions: UniversalDisposable;

  constructor(debuggerDispatcher: DebuggerDomainDispatcher) {
    this._debuggerDispatcher = debuggerDispatcher;
    this._threadEvent$ = new Subject();
    this._subscriptions = new UniversalDisposable(
      this._debuggerDispatcher.getEventObservable().subscribe(event => {
        if (event.method === 'Debugger.threadsUpdated') {
          const params: ThreadsUpdatedEvent = event.params;
          this._handleThreadsUpdated(params);
        } else if (event.method === 'Debugger.threadUpdated') {
          const params: ThreadUpdatedEvent = event.params;
          this._handleThreadUpdated(params);
        }
      }),
    );
  }

  _handleThreadsUpdated(params: ThreadsUpdatedEvent): void {
    this._raiseIPCEvent('ThreadsUpdate', params);
  }

  _handleThreadUpdated(params: ThreadUpdatedEvent): void {
    this._raiseIPCEvent('ThreadUpdate', params);
  }

  getEventObservable(): Observable<Array<mixed>> {
    return this._threadEvent$.asObservable();
  }

  // Not a real IPC event, but simulate the chrome IPC events/responses
  // across bridge boundary.
  _raiseIPCEvent(...args: Array<mixed>): void {
    this._threadEvent$.next(args);
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}
