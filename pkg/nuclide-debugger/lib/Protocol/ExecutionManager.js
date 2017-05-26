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

import type DebuggerDomainDispatcher from './DebuggerDomainDispatcher';
import type BreakpointManager from './BreakpointManager';
import type {
  PausedEvent,
} from '../../../nuclide-debugger-base/lib/protocol-types';

import {Subject, Observable} from 'rxjs';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

/**
 * Bridge between Nuclide IPC and RPC execution control protocols.
 */
export default class ExecutionManager {
  _debuggerDispatcher: DebuggerDomainDispatcher;
  _breakpointManager: BreakpointManager;
  _subscriptions: UniversalDisposable;
  _executionEvent$: Subject<Array<mixed>>;

  constructor(
    debuggerDispatcher: DebuggerDomainDispatcher,
    breakpointManager: BreakpointManager,
  ) {
    this._executionEvent$ = new Subject();
    this._subscriptions = new UniversalDisposable();
    this._debuggerDispatcher = debuggerDispatcher;
    this._breakpointManager = breakpointManager;
    this._subscriptions.add(
      debuggerDispatcher.getEventObservable().subscribe(event => {
        switch (event.method) {
          case 'Debugger.resumed':
            this._handleDebuggeeResumed();
            break;
          case 'Debugger.paused':
            const params: PausedEvent = event.params;
            this._handleDebuggerPaused(params);
            break;
          case 'Debugger.loaderBreakpoint':
            this._handleLoaderBreakpoint();
            break;
          default:
            break;
        }
      }),
    );
  }

  getEventObservable(): Observable<Array<mixed>> {
    return this._executionEvent$.asObservable();
  }

  resume(): void {
    this._debuggerDispatcher.resume();
  }

  pause(): void {
    this._debuggerDispatcher.pause();
  }

  stepOver(): void {
    this._debuggerDispatcher.stepOver();
  }

  stepInto(): void {
    this._debuggerDispatcher.stepInto();
  }

  stepOut(): void {
    this._debuggerDispatcher.stepOut();
  }

  _handleLoaderBreakpoint(): void {
    this._breakpointManager.syncInitialBreakpointsToEngine();
    this._debuggerDispatcher.resume();
  }

  _handleDebuggerPaused(params: PausedEvent): void {
    this._raiseIPCEvent('NonLoaderDebuggerPaused', {
      stopThreadId: params.stopThreadId,
      threadSwitchNotification: null, // TODO
    });
  }

  _handleDebuggeeResumed(): void {
    this._raiseIPCEvent('DebuggerResumed');
  }

  // Not a real IPC event, but simulate the chrome IPC events/responses
  // across bridge boundary.
  _raiseIPCEvent(...args: Array<mixed>): void {
    this._executionEvent$.next(args);
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}
