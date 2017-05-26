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
  DebuggerEvent,
  BreakpointResolvedEvent,
  ThreadsUpdatedEvent,
  PausedEvent,
  ScriptParsedEvent,
} from '../../../nuclide-debugger-base/lib/protocol-types';

import {Subject, Observable} from 'rxjs';

type LoaderBreakpointEvent = {
  method: 'Debugger.loaderBreakpoint',
  params: PausedEvent,
};

export type ProtocolDebugEvent = DebuggerEvent | LoaderBreakpointEvent;

/**
 * Responsible for sending and receiving debugger domain protocols from
 * debug engine.
 */
class DebuggerDomainDispatcher {
  _agent: Object; // debugger agent from chrome protocol.
  _parsedFiles: Map<ScriptId, NuclideUri>;
  _debugEvent$: Subject<ProtocolDebugEvent>;

  _pauseCount: number;

  constructor(agent: Object) {
    this._agent = agent;
    this._parsedFiles = new Map();
    this._debugEvent$ = new Subject();
    this._pauseCount = 0;
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

  getEventObservable(): Observable<ProtocolDebugEvent> {
    return this._debugEvent$.asObservable();
  }

  paused(params: PausedEvent): void {
    ++this._pauseCount;
    // Convert the first Debugger.paused to Debugger.loaderBreakpoint.
    if (this._pauseCount === 1) {
      this._raiseProtocolEvent({
        method: 'Debugger.loaderBreakpoint',
        params,
      });
    } else {
      this._raiseProtocolEvent({
        method: 'Debugger.paused',
        params,
      });
    }
  }

  resumed(): void {
    // TODO:
  }

  threadsUpdated(params: ThreadsUpdatedEvent): void {
    // TODO
  }

  breakpointResolved(params: BreakpointResolvedEvent): void {
    this._raiseProtocolEvent({
      method: 'Debugger.breakpointResolved',
      params,
    });
  }

  scriptParsed(params: ScriptParsedEvent): void {
    this._parsedFiles.set(params.scriptId, params.url);
  }

  getFileUriFromScriptId(scriptId: ScriptId): NuclideUri {
    // TODO: think about how to better deal with scriptId never parsed before.
    return this._parsedFiles.get(scriptId) || 'Unknown';
  }

  _raiseProtocolEvent(event: ProtocolDebugEvent): void {
    this._debugEvent$.next(event);
  }
}

// Use old school export to allow legacy code to import it.
module.exports = DebuggerDomainDispatcher;
