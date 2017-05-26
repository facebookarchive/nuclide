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

import type {Observable} from 'rxjs';
import type {IPCEvent, IPCBreakpoint, ObjectGroup} from '../types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import DebuggerDomainDispatcher from './DebuggerDomainDispatcher';
import BreakpointManager from './BreakpointManager';
import StackTraceManager from './StackTraceManager';
import ExecutionManager from './ExecutionManager';
import ThreadManager from './ThreadManager';
import ExpressionEvaluationManager from './ExpressionEvaluationManager';

export default class BridgeAdapter {
  _subscriptions: UniversalDisposable;
  _debuggerDispatcher: DebuggerDomainDispatcher;
  _breakpointManager: BreakpointManager;
  _stackTraceManager: StackTraceManager;
  _executionManager: ExecutionManager;
  _threadManager: ThreadManager;
  _expressionEvaluationManager: ExpressionEvaluationManager;

  constructor(debuggerDispatcher: DebuggerDomainDispatcher) {
    this._debuggerDispatcher = debuggerDispatcher;
    this._subscriptions = new UniversalDisposable(
      (this._breakpointManager = new BreakpointManager(
        this._debuggerDispatcher,
      )),
      (this._stackTraceManager = new StackTraceManager(
        this._debuggerDispatcher,
      )),
      (this._executionManager = new ExecutionManager(
        this._debuggerDispatcher,
        this._breakpointManager,
      )),
      (this._threadManager = new ThreadManager(this._debuggerDispatcher)),
      (this._expressionEvaluationManager = new ExpressionEvaluationManager(
        this._debuggerDispatcher,
      )),
    );
  }

  resume(): void {
    this._executionManager.resume();
  }

  pause(): void {
    this._executionManager.pause();
  }

  stepOver(): void {
    this._executionManager.stepOver();
  }

  stepInto(): void {
    this._executionManager.stepInto();
  }

  stepOut(): void {
    this._executionManager.stepOut();
  }

  runToLocation(fileUri: NuclideUri, line: number): void {
    this._executionManager.runToLocation(fileUri, line);
  }

  setSelectedCallFrameIndex(index: number): void {
    this._stackTraceManager.setSelectedCallFrameIndex(index);
  }

  setInitialBreakpoints(breakpoints: Array<IPCBreakpoint>): void {
    this._breakpointManager.setInitialBreakpoints(breakpoints);
  }

  setFilelineBreakpoint(breakpoint: IPCBreakpoint): void {
    this._breakpointManager.setFilelineBreakpoint(breakpoint);
  }

  removeBreakpoint(breakpoint: IPCBreakpoint): void {
    this._breakpointManager.removeBreakpoint(breakpoint);
  }

  updateBreakpoint(breakpoint: IPCBreakpoint): void {
    this._breakpointManager.updateBreakpoint(breakpoint);
  }

  evaluateExpression(
    transactionId: number,
    expression: string,
    objectGroup: ObjectGroup,
  ): void {
    // TODO: check pause or run mode and dispatch to corresponding
    // protocol.
    const callFrameId = this._stackTraceManager.getSelectedFrameId();
    this._expressionEvaluationManager.evaluateOnCallFrame(
      transactionId,
      callFrameId,
      expression,
      objectGroup,
    );
  }

  getEventObservable(): Observable<IPCEvent> {
    // TODO: hook other debug events when it's ready.
    const breakpointManager = this._breakpointManager;
    const stackTraceManager = this._stackTraceManager;
    const executionManager = this._executionManager;
    const threadManager = this._threadManager;
    const expessionEvaluatorManager = this._expressionEvaluationManager;
    return breakpointManager
      .getEventObservable()
      .merge(stackTraceManager.getEventObservable())
      .merge(executionManager.getEventObservable())
      .merge(threadManager.getEventObservable())
      .merge(expessionEvaluatorManager.getEventObservable())
      .map(args => {
        return {channel: 'notification', args};
      });
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}
