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
import type {ProtocolDebugEvent} from './DebuggerDomainDispatcher';
import type {
  BreakpointResolvedEvent,
  PausedEvent,
} from '../../../nuclide-debugger-base/lib/protocol-types';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import BreakpointManager from './BreakpointManager';
import StackTraceManager from './StackTraceManager';
import ExecutionManager from './ExecutionManager';
import ThreadManager from './ThreadManager';
import ExpressionEvaluationManager from './ExpressionEvaluationManager';

export default class BridgeAdapter {
  _subscriptions: UniversalDisposable;
  _breakpointManager: BreakpointManager;
  _stackTraceManager: StackTraceManager;
  _executionManager: ExecutionManager;
  _threadManager: ThreadManager;
  _expressionEvaluationManager: ExpressionEvaluationManager;

  constructor(dispatchers: Object) {
    const {debuggerDispatcher, runtimeDispatcher} = dispatchers;
    (this: any)._handleDebugEvent = this._handleDebugEvent.bind(this);
    this._breakpointManager = new BreakpointManager(debuggerDispatcher);
    this._stackTraceManager = new StackTraceManager(debuggerDispatcher);
    this._executionManager = new ExecutionManager(debuggerDispatcher);
    this._threadManager = new ThreadManager(debuggerDispatcher);
    this._expressionEvaluationManager = new ExpressionEvaluationManager(
      debuggerDispatcher,
      runtimeDispatcher,
    );
    this._subscriptions = new UniversalDisposable(
      debuggerDispatcher.getEventObservable().subscribe(this._handleDebugEvent),
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

  _clearStates(): void {
    this._expressionEvaluationManager.clearPauseStates();
    this._stackTraceManager.clearPauseStates();
  }

  runToLocation(fileUri: NuclideUri, line: number): void {
    this._executionManager.runToLocation(fileUri, line);
  }

  setSelectedCallFrameIndex(index: number): void {
    this._stackTraceManager.setSelectedCallFrameIndex(index);
    this._updateCurrentScopes();
  }

  _updateCurrentScopes(): void {
    const currentFrame = this._stackTraceManager.getCurrentFrame();
    this._expressionEvaluationManager.updateCurrentFrameScope(
      currentFrame.scopeChain,
    );
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
    const callFrameId = this._stackTraceManager.getCurrentFrame().callFrameId;
    this._expressionEvaluationManager.evaluateOnCallFrame(
      transactionId,
      callFrameId,
      expression,
      objectGroup,
    );
  }

  _handleDebugEvent(event: ProtocolDebugEvent): void {
    switch (event.method) {
      case 'Debugger.loaderBreakpoint': {
        this._breakpointManager.syncInitialBreakpointsToEngine();
        // This should be the last method called.
        this._executionManager.continueFromLoaderBreakpoint();
        break;
      }
      case 'Debugger.breakpointResolved': {
        const params: BreakpointResolvedEvent = event.params;
        this._breakpointManager.handleBreakpointResolved(params);
        break;
      }
      case 'Debugger.resumed':
        this._executionManager.handleDebuggeeResumed();
        break;
      case 'Debugger.paused': {
        const params: PausedEvent = event.params;
        this._stackTraceManager._handleDebuggerPaused(params);
        this._executionManager.handleDebuggerPaused(params);
        this._updateCurrentScopes();
        break;
      }
      default:
        break;
    }
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
