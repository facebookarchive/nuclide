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
import type {IPCEvent, IPCBreakpoint} from '../types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

require('./Object');
import invariant from 'assert';
import InspectorBackendClass from './NuclideProtocolParser';
import DebuggerDomainDispatcher from './DebuggerDomainDispatcher';
import BreakpointManager from './BreakpointManager';
import StackTraceManager from './StackTraceManager';
import ExecutionManager from './ExecutionManager';
import ThreadManager from './ThreadManager';

export default class BridgeAdapter {
  _debuggerDispatcher: ?DebuggerDomainDispatcher;
  _breakpointManager: ?BreakpointManager;
  _stackTraceManager: ?StackTraceManager;
  _executionManager: ?ExecutionManager;
  _threadManager: ?ThreadManager;

  constructor() {}

  async start(debuggerInstance: Object): Promise<void> {
    this._debuggerDispatcher = await InspectorBackendClass.bootstrap(
      debuggerInstance,
    );
    this._breakpointManager = new BreakpointManager(this._debuggerDispatcher);
    this._stackTraceManager = new StackTraceManager(this._debuggerDispatcher);
    this._executionManager = new ExecutionManager(
      this._debuggerDispatcher,
      this._breakpointManager,
    );
    this._threadManager = new ThreadManager(this._debuggerDispatcher);
  }

  resume(): void {
    invariant(this._executionManager != null);
    this._executionManager.resume();
  }

  pause(): void {
    invariant(this._executionManager != null);
    this._executionManager.pause();
  }

  stepOver(): void {
    invariant(this._executionManager != null);
    this._executionManager.stepOver();
  }

  stepInto(): void {
    invariant(this._executionManager != null);
    this._executionManager.stepInto();
  }

  stepOut(): void {
    invariant(this._executionManager != null);
    this._executionManager.stepOut();
  }

  runToLocation(fileUri: NuclideUri, line: number): void {
    invariant(this._executionManager != null);
    this._executionManager.runToLocation(fileUri, line);
  }

  setSelectedCallFrameIndex(index: number): void {
    invariant(this._stackTraceManager != null);
    this._stackTraceManager.setSelectedCallFrameIndex(index);
  }

  setInitialBreakpoints(breakpoints: Array<IPCBreakpoint>): void {
    invariant(this._breakpointManager != null);
    this._breakpointManager.setInitialBreakpoints(breakpoints);
  }

  setFilelineBreakpoint(breakpoint: IPCBreakpoint): void {
    invariant(this._breakpointManager != null);
    this._breakpointManager.setFilelineBreakpoint(breakpoint);
  }

  removeBreakpoint(breakpoint: IPCBreakpoint): void {
    invariant(this._breakpointManager != null);
    this._breakpointManager.removeBreakpoint(breakpoint);
  }

  updateBreakpoint(breakpoint: IPCBreakpoint): void {
    invariant(this._breakpointManager != null);
    this._breakpointManager.updateBreakpoint(breakpoint);
  }

  getEventObservable(): Observable<IPCEvent> {
    // TODO: hook other debug events when it's ready.
    const breakpointManager = this._breakpointManager;
    const stackTraceManager = this._stackTraceManager;
    const executionManager = this._executionManager;
    const threadManager = this._threadManager;
    invariant(breakpointManager != null);
    invariant(stackTraceManager != null);
    invariant(executionManager != null);
    invariant(threadManager != null);
    return breakpointManager
      .getEventObservable()
      .merge(stackTraceManager.getEventObservable())
      .merge(executionManager.getEventObservable())
      .merge(threadManager.getEventObservable())
      .map(args => {
        return {channel: 'notification', args};
      });
  }

  dispose(): void {
    if (this._breakpointManager != null) {
      this._breakpointManager.dispose();
      this._breakpointManager = null;
    }
    if (this._stackTraceManager != null) {
      this._stackTraceManager.dispose();
      this._stackTraceManager = null;
    }
    if (this._executionManager != null) {
      this._executionManager.dispose();
      this._executionManager = null;
    }
    if (this._threadManager != null) {
      this._threadManager.dispose();
      this._threadManager = null;
    }
  }
}
