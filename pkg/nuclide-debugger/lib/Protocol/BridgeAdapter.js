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

require('./Object');
import invariant from 'assert';
import InspectorBackendClass from './NuclideProtocolParser';
import DebuggerDomainDispatcher from './DebuggerDomainDispatcher';
import BreakpointManager from './BreakpointManager';
import StackTraceManager from './StackTraceManager';

export default class BridgeAdapter {
  _debuggerDispatcher: ?DebuggerDomainDispatcher;
  _breakpointManager: ?BreakpointManager;
  _stackTraceManager: ?StackTraceManager;

  constructor() {}

  async start(debuggerInstance: Object): Promise<void> {
    this._debuggerDispatcher = await InspectorBackendClass.bootstrap(
      debuggerInstance,
    );
    this._breakpointManager = new BreakpointManager(this._debuggerDispatcher);
    this._stackTraceManager = new StackTraceManager(this._debuggerDispatcher);
  }

  resume(): void {
    invariant(this._debuggerDispatcher != null);
    this._debuggerDispatcher.resume();
  }

  pause(): void {
    invariant(this._debuggerDispatcher != null);
    this._debuggerDispatcher.pause();
  }

  stepOver(): void {
    invariant(this._debuggerDispatcher != null);
    this._debuggerDispatcher.stepOver();
  }

  stepInto(): void {
    invariant(this._debuggerDispatcher != null);
    this._debuggerDispatcher.stepInto();
  }

  stepOut(): void {
    invariant(this._debuggerDispatcher != null);
    this._debuggerDispatcher.stepOut();
  }

  setSelectedCallFrameIndex(index: number): void {
    invariant(this._stackTraceManager != null);
    this._stackTraceManager.setSelectedCallFrameIndex(index);
  }

  setInitialBreakpoints(breakpoints: Array<IPCBreakpoint>): void {
    invariant(this._breakpointManager != null);
    this._breakpointManager.sendInitialBreakpoints(breakpoints);
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
    invariant(breakpointManager != null);
    invariant(stackTraceManager != null);
    return breakpointManager
      .getEventObservable()
      .merge(stackTraceManager.getEventObservable())
      .map(args => {
        return {channel: 'notification', args};
      });
  }

  dispose(): void {
    if (this._breakpointManager != null) {
      this._breakpointManager.dispose();
      this._breakpointManager = null;
    }
  }
}
