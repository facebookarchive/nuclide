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
  CallFrame,
  GetThreadStackResponse,
} from 'nuclide-debugger-common/protocol-types';
import type DebuggerDomainDispatcher from './DebuggerDomainDispatcher';

import {Subject, Observable} from 'rxjs';
import {reportError} from './EventReporter';

/**
 * Bridge between Nuclide IPC and RPC threading protocols.
 */
export default class ThreadManager {
  _debuggerDispatcher: DebuggerDomainDispatcher;
  _threadEvent$: Subject<Array<mixed>>;
  _selectedThread: ?string;

  constructor(debuggerDispatcher: DebuggerDomainDispatcher) {
    this._debuggerDispatcher = debuggerDispatcher;
    this._threadEvent$ = new Subject();
    this._selectedThread = null;
  }

  selectThread(threadId: string): void {
    this._selectedThread = threadId;
    this._debuggerDispatcher.selectThread(Number(threadId));
  }

  getSelectedThread(): ?string {
    return this._selectedThread;
  }

  setSelectedThread(threadId: string): void {
    this._selectedThread = threadId;
  }

  getThreadStack(threadId: string): Promise<Array<CallFrame>> {
    return new Promise((resolve, reject) => {
      function callback(error: Error, response: GetThreadStackResponse) {
        if (error != null) {
          reportError(`getThreadStack failed with ${JSON.stringify(error)}`);
          reject(error);
        }
        resolve(response.callFrames);
      }
      this._debuggerDispatcher.getThreadStack(
        Number(threadId),
        callback.bind(this),
      );
    });
  }

  raiseThreadsUpdated(params: ThreadsUpdatedEvent): void {
    this._raiseIPCEvent('ThreadsUpdate', params);
  }

  raiseThreadUpdated(params: ThreadUpdatedEvent): void {
    this._raiseIPCEvent('ThreadUpdate', params.thread);
  }

  getEventObservable(): Observable<Array<mixed>> {
    return this._threadEvent$.asObservable();
  }

  // Not a real IPC event, but simulate the chrome IPC events/responses
  // across bridge boundary.
  _raiseIPCEvent(...args: Array<mixed>): void {
    this._threadEvent$.next(args);
  }
}
