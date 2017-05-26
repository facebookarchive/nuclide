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

export default class BridgeAdapter {
  _debuggerDispatcher: ?DebuggerDomainDispatcher;

  constructor() {}

  async start(debuggerInstance: Object): Promise<void> {
    this._debuggerDispatcher = await InspectorBackendClass.bootstrap(
      debuggerInstance,
    );
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

  setFilelineBreakpoint(breakpoint: IPCBreakpoint): void {
    invariant(this._debuggerDispatcher != null);
    this._debuggerDispatcher.setFilelineBreakpoint(breakpoint);
  }

  getEventObservable(): Observable<IPCEvent> {
    invariant(this._debuggerDispatcher != null);
    return this._debuggerDispatcher.getEventObservable().map(args => {
      return {channel: 'notification', args};
    });
  }
}
