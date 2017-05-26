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

import type {IPCBreakpoint} from '../types';
import type {
  BreakpointId,
  Location,
  DebuggerEvent,
  BreakpointResolvedEvent,
} from '../../../nuclide-debugger-base/lib/protocol-types';
import type DebuggerDomainDispatcher from './DebuggerDomainDispatcher';

import invariant from 'assert';
import {reportError, reportWarning} from './Utils';
import {Subject, Observable} from 'rxjs';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

const UNCONFIRMED_BREAKPOINT_ID = 'Unassigned';

type UserBreakpoint = {
  id: BreakpointId,
  request: IPCBreakpoint,
};

type BreakpointEngineChangeDisposition =
  | 'NoAction'
  | 'AddBreakpoint'
  | 'RemoveBreakpoint'
  | 'ReplaceBreakpoint';

/**
 * Bridge between Nuclide IPC and RPC breakpoint protocols.
 */
export default class BreakpointManager {
  _debuggerDispatcher: DebuggerDomainDispatcher;
  _breakpointList: Array<UserBreakpoint>;
  _breakpointEvent$: Subject<Array<mixed>>;
  _subscriptions: UniversalDisposable;

  constructor(debuggerDispatcher: DebuggerDomainDispatcher) {
    this._breakpointList = [];
    this._breakpointEvent$ = new Subject();
    this._subscriptions = new UniversalDisposable();
    this._debuggerDispatcher = debuggerDispatcher;
    (this: any)._handleBreakpointResolved = this._handleBreakpointResolved.bind(
      this,
    );
    this._subscriptions.add(
      debuggerDispatcher
        .getEventObservable()
        .filter(evnt => evnt.method === 'Debugger.breakpointResolved')
        .subscribe(evnt => this._handleBreakpointResolved(evnt)),
    );
  }

  getEventObservable(): Observable<Array<mixed>> {
    return this._breakpointEvent$.asObservable();
  }

  setFilelineBreakpoint(request: IPCBreakpoint): void {
    function callback(
      error: Error,
      breakpointId: BreakpointId,
      resolved: boolean,
      locations: Array<Location>,
    ) {
      if (error != null) {
        reportError(
          `setFilelineBreakpoint failed with ${JSON.stringify(error)}`,
        );
      }
      this._assignBreakpointId(request, breakpointId);

      // true or undefined. This is because any legacy engine may
      // not implement "resolved" flag in resolved resposne.
      if (resolved !== false) {
        for (const location of locations) {
          this._sendBreakpointResolved(breakpointId, location);
        }
      }
    }
    this._breakpointList.push({id: UNCONFIRMED_BREAKPOINT_ID, request});
    this._debuggerDispatcher.setBreakpointByUrl(request, callback.bind(this));
  }

  _assignBreakpointId(
    request: IPCBreakpoint,
    breakpointId: BreakpointId,
  ): void {
    const breakpoint = this._findBreakpointOnFileLine(
      request.sourceURL,
      request.lineNumber,
    );
    if (breakpoint == null) {
      reportError('Why are we assigning id to a non-exist breakpoint?');
      return;
    }
    breakpoint.id = breakpointId;
  }

  updateBreakpoint(request: IPCBreakpoint): void {
    const breakpoint = this._findBreakpointOnFileLine(
      request.sourceURL,
      request.lineNumber,
    );
    if (breakpoint != null) {
      this._updateEngineForChanges(breakpoint.request, request);
      breakpoint.request = request;
    } else {
      // In current design, there is a UI race between user sets breakpoint
      // while engine haven't created it yet so this may be expected.
      // Issue an warning instead of error.
      reportWarning('Do you try to update a breakpoint not exist?');
    }
  }

  _updateEngineForChanges(
    oldRequest: IPCBreakpoint,
    newRequest: IPCBreakpoint,
  ): void {
    const disposition = this._getRequestChangeDisposition(
      oldRequest,
      newRequest,
    );
    switch (disposition) {
      case 'AddBreakpoint':
        this.setFilelineBreakpoint(newRequest);
        break;
      case 'RemoveBreakpoint':
        this.removeBreakpoint(newRequest);
        break;
      case 'ReplaceBreakpoint':
        this.removeBreakpoint(newRequest);
        this.setFilelineBreakpoint(newRequest);
        break;
      default:
        invariant(disposition === 'NoAction');
        break;
    }
  }

  _getRequestChangeDisposition(
    oldRequest: IPCBreakpoint,
    newRequest: IPCBreakpoint,
  ): BreakpointEngineChangeDisposition {
    if (!oldRequest.enabled && newRequest.enabled) {
      return 'AddBreakpoint';
    } else if (oldRequest.enabled && !newRequest.enabled) {
      return 'RemoveBreakpoint';
    } else if (
      newRequest.enabled &&
      newRequest.condition !== oldRequest.condition
    ) {
      return 'ReplaceBreakpoint';
    } else {
      return 'NoAction';
    }
  }

  removeBreakpoint(request: IPCBreakpoint): void {
    const breakpoint = this._findBreakpointOnFileLine(
      request.sourceURL,
      request.lineNumber,
    );
    if (breakpoint != null) {
      // Remove from engine.
      if (this._isConfirmedBreakpoint(breakpoint)) {
        this._debuggerDispatcher.removeBreakpoint(breakpoint.id);
      }
      // Remove from our record list.
      this._removeBreakpointFromList(request);
    } else {
      // In current design, there is a UI race between user remove breakpoint
      // while engine haven't created it yet so this may be expected.
      // Issue an warning instead of error.
      reportWarning('Do you try to remove a breakpoint not exist?');
    }
  }

  _removeBreakpointFromList(request: IPCBreakpoint): void {
    const index = this._findBreakpointIndexOnFileLine(
      request.sourceURL,
      request.lineNumber,
    );
    invariant(index !== -1);
    this._breakpointList.splice(index, 1);
  }

  _isConfirmedBreakpoint(breakpoint: UserBreakpoint): boolean {
    return breakpoint.id !== UNCONFIRMED_BREAKPOINT_ID;
  }

  _findBreakpointOnFileLine(sourceUrl: string, line: number): ?UserBreakpoint {
    const index = this._findBreakpointIndexOnFileLine(sourceUrl, line);
    if (index !== -1) {
      return this._breakpointList[index];
    }
    return null;
  }

  _findBreakpointIndexOnFileLine(sourceUrl: string, line: number): number {
    for (const [index, breakpoint] of this._breakpointList.entries()) {
      if (
        breakpoint.request.sourceURL === sourceUrl &&
        breakpoint.request.lineNumber === line
      ) {
        return index;
      }
    }
    return -1;
  }

  _sendBreakpointResolved(
    breakpointId: BreakpointId,
    location: Location,
  ): void {
    const breakpoint = this._getBreakpointFromId(breakpointId);
    if (breakpoint != null) {
      this._breakpointEvent$.next(['BreakpointRemoved', breakpoint.request]);
      this._breakpointEvent$.next([
        'BreakpointAdded',
        this._createIPCBreakpointFromLocation(breakpoint.request, location),
      ]);
    } else {
      reportError(
        `Got breakpoint resolved for non-existing breakpoint: ${breakpointId}, ${JSON.stringify(location)};`,
      );
    }
  }

  _getBreakpointFromId(breakpointId: BreakpointId): ?UserBreakpoint {
    return this._breakpointList.find(bp => bp.id === breakpointId);
  }

  _createIPCBreakpointFromLocation(
    originalRequest: IPCBreakpoint,
    bpLocation: Location,
  ): IPCBreakpoint {
    const newCopy = {...originalRequest};
    // TODO: also get the new source URL from ScriptId in Location.
    newCopy.lineNumber = bpLocation.lineNumber;
    newCopy.resolved = true;
    return newCopy;
  }

  _handleBreakpointResolved(evnt: DebuggerEvent): void {
    invariant(evnt.method === 'Debugger.breakpointResolved');
    const {breakpointId, location} = (evnt.params: BreakpointResolvedEvent);
    if (this._getBreakpointFromId(breakpointId) !== null) {
      this._sendBreakpointResolved(breakpointId, location);
    } else {
      // User has removed this breakpoint before engine resolves it.
      // This is an expected scenario, just ignore it.
    }
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}
