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
  Location,
} from '../../../nuclide-debugger-base/lib/protocol-types';

import {Subject, Observable} from 'rxjs';

/**
 * Responsible for sending and receiving debugger domain protocols from
 * debug engine.
 */
class DebuggerDomainDispatcher {
  _agent: Object; // debugger agent from chrome protocol.
  _parsedFiles: Map<ScriptId, NuclideUri>;
  _breakpointMap: Map<BreakpointId, IPCBreakpoint>;
  _debugEvent$: Subject<Array<mixed>>;

  constructor(agent: Object) {
    this._agent = agent;
    this._parsedFiles = new Map();
    this._breakpointMap = new Map();
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

  setFilelineBreakpoint(breakpoint: IPCBreakpoint): void {
    function callback(
      error: Error,
      breakpointId: string,
      resolved: boolean,
      locations: Array<Location>,
    ) {
      if (error != null) {
        // TODO: report set breakpoint error to UI.
      }
      this._breakpointMap.set(breakpointId, breakpoint);
      // true or undefined. This is because any legacy engine may
      // not implement "resolved" flag in resolved resposne.
      if (resolved !== false) {
        for (const location of locations) {
          this._sendBreakpointResolved(breakpointId, location);
        }
      }
    }

    this._agent.setBreakpointByUrl(
      breakpoint.lineNumber,
      breakpoint.sourceURL,
      undefined, // urlRegex. Not used.
      0, // column. Not used yet.
      breakpoint.condition,
      callback.bind(this),
    );
  }

  _sendBreakpointResolved(breakpointId: string, location: Location): void {
    const breakpoint = this._breakpointMap.get(breakpointId);
    if (breakpoint != null) {
      breakpoint.lineNumber = location.lineNumber;
      breakpoint.resolved = true;
      this._debugEvent$.next(['BreakpointAdded', breakpoint]);
    } else {
      // TODO: Raise error to UI.
    }
  }

  getEventObservable(): Observable<Array<mixed>> {
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

  breakpointResolved(breakpointId: string, location: Location): void {
    this._sendBreakpointResolved(breakpointId, location);
  }

  scriptParsed(scriptId: ScriptId, sourceURL: string): void {
    this._parsedFiles.set(scriptId, sourceURL);
  }
}

// Use old school export to allow legacy code to import it.
module.exports = DebuggerDomainDispatcher;
