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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {IPCBreakpoint} from '../types';
import type {
  ScriptId,
  BreakpointId,
  BreakpointResolvedEvent,
  DebuggerEvent,
} from '../../../nuclide-debugger-base/lib/protocol-types';

import {Subject, Observable} from 'rxjs';

/**
 * Responsible for sending and receiving debugger domain protocols from
 * debug engine.
 */
class DebuggerDomainDispatcher {
  _agent: Object; // debugger agent from chrome protocol.
  _parsedFiles: Map<ScriptId, NuclideUri>;
  _debugEvent$: Subject<DebuggerEvent>;

  constructor(agent: Object) {
    this._agent = agent;
    this._parsedFiles = new Map();
    this._debugEvent$ = new Subject();
  }

  resume(): void {
    this._agent.resume();
  }

  pause(): void {
    this._agent.pause();
  }

  stepOver(): void {
    this._agent.stepOver();
  }

  stepInto(): void {
    this._agent.stepInto();
  }

  stepOut(): void {
    this._agent.stepOut();
  }

  setBreakpointByUrl(breakpoint: IPCBreakpoint, callback: Function): void {
    this._agent.setBreakpointByUrl(
      breakpoint.lineNumber,
      breakpoint.sourceURL,
      undefined, // urlRegex. Not used.
      0, // column. Not used yet.
      breakpoint.condition,
      callback,
    );
  }

  removeBreakpoint(breakpointId: BreakpointId): void {
    this._agent.removeBreakpoint(breakpointId);
  }

  getEventObservable(): Observable<DebuggerEvent> {
    return this._debugEvent$.asObservable();
  }

  resumed(): void {
    // TODO:
  }

  threadsUpdated(
    owningProcessId: string,
    stopThreadId: string,
    threads_payload: string,
  ): void {
    // TODO
  }

  breakpointResolved(params: BreakpointResolvedEvent): void {
    this._debugEvent$.next({
      method: 'Debugger.breakpointResolved',
      params,
    });
  }

  scriptParsed(scriptId: ScriptId, sourceURL: string): void {
    this._parsedFiles.set(scriptId, sourceURL);
  }
}

// Use old school export to allow legacy code to import it.
module.exports = DebuggerDomainDispatcher;
