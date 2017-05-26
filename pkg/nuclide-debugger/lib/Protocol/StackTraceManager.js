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
  CallFrameId,
  CallFrame,
  PausedEvent,
} from '../../../nuclide-debugger-base/lib/protocol-types';
import type {Callstack} from '../types';
import type DebuggerDomainDispatcher from './DebuggerDomainDispatcher';

import invariant from 'assert';
import {Subject, Observable} from 'rxjs';

/**
 * Bridge between Nuclide IPC and RPC stack trace protocols.
 */
export default class StackTraceManager {
  _debuggerDispatcher: DebuggerDomainDispatcher;
  _stackTraceEvent$: Subject<Array<mixed>>;
  _currentCallFrameIndex: number;
  _currentThreadFrames: Array<CallFrame>;

  constructor(debuggerDispatcher: DebuggerDomainDispatcher) {
    this._stackTraceEvent$ = new Subject();
    this._currentCallFrameIndex = 0;
    this._currentThreadFrames = [];
    this._debuggerDispatcher = debuggerDispatcher;
  }

  getEventObservable(): Observable<Array<mixed>> {
    return this._stackTraceEvent$.asObservable();
  }

  setSelectedCallFrameIndex(index: number): void {
    invariant(index < this._currentThreadFrames.length);
    this._currentCallFrameIndex = index;
    const currentFrame = this._getCurrentFrame();
    this._raiseIPCEvent('CallFrameSelected', {
      sourceURL: this._debuggerDispatcher.getFileUriFromScriptId(
        currentFrame.location.scriptId,
      ),
      lineNumber: currentFrame.location.lineNumber,
    });
  }

  getSelectedFrameId(): CallFrameId {
    return this._getCurrentFrame().callFrameId;
  }

  _getCurrentFrame(): CallFrame {
    invariant(this._currentCallFrameIndex < this._currentThreadFrames.length);
    return this._currentThreadFrames[this._currentCallFrameIndex];
  }

  _handleDebuggerPaused(params: PausedEvent): void {
    this._currentThreadFrames = params.callFrames;
    const callstack = this._parseCallstack();
    this._raiseIPCEvent('CallstackUpdate', callstack);
    this._selectFirstFrameWithSource();
  }

  _selectFirstFrameWithSource(): void {
    const frameWithSourceIndex = this._currentThreadFrames.findIndex(
      frame => frame.hasSource !== false, // undefined or true.
    );
    // Default to first frame if can't find any frame with source.
    this.setSelectedCallFrameIndex(frameWithSourceIndex || 0);
  }

  _parseCallstack(): Callstack {
    return this._currentThreadFrames.map(frame => {
      return {
        name: frame.functionName, // TODO: format
        location: {
          path: this._debuggerDispatcher.getFileUriFromScriptId(
            frame.location.scriptId,
          ),
          line: frame.location.lineNumber,
          column: frame.location.columnNumber,
          hasSource: frame.hasSource,
        },
      };
    });
  }

  // Not a real IPC event, but simulate the chrome IPC events/responses
  // across bridge boundary.
  _raiseIPCEvent(...args: Array<mixed>): void {
    this._stackTraceEvent$.next(args);
  }
}
