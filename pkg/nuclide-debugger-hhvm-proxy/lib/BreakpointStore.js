'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import logger from './utils';
import {
  STATUS_STOPPING,
  STATUS_STOPPED,
  STATUS_ERROR,
  STATUS_END,
} from './DbgpSocket';

import type {Connection} from './Connection';

type BreakpointId = string;
type Breakpoint = {
  storeId: BreakpointId;
  filename: string;
  lineNumber: number;
};

export type ExceptionState = 'none' | 'uncaught' | 'all';

const PAUSE_ALL_EXCEPTION_NAME = '*';
const EXCEPTION_PAUSE_STATE_ALL = 'all';

// Stores breakpoints and connections.
//
// Added breakpoints are given a unique id and are added to all available connections.
//
// Breakpoints may be added before any connections.
//
// Care is taken to ensure that operations are atomic in the face of async turns.
// Specifically, removing a breakpoint removes it from all connection's maps
// before returning.
export class BreakpointStore {
  _breakpointCount: number;
  // For each connection a map from the Store's Breakpoint Id to the
  // Promise of the Connection's Breakpoint Id.
  _connections: Map<Connection, Map<BreakpointId, Promise<BreakpointId>>>;
  _breakpoints: Map<BreakpointId, Breakpoint>;
  _pauseAllExceptionBreakpointId: ?BreakpointId;

  constructor() {
    this._breakpointCount = 0;
    this._connections = new Map();
    this._breakpoints = new Map();
    this._pauseAllExceptionBreakpointId = null;
  }

  setBreakpoint(filename: string, lineNumber: number): BreakpointId {
    this._breakpointCount++;
    const storeId = String(this._breakpointCount);
    this._breakpoints.set(storeId, {storeId, filename, lineNumber});
    for (const entry of this._connections.entries()) {
      const [connection, map] = entry;
      map.set(storeId, connection.setBreakpoint(filename, lineNumber));
    }
    return storeId;
  }

  async removeBreakpoint(breakpointId: string): Promise<any> {
    this._breakpoints.delete(breakpointId);
    return await this._removeBreakpointFromConnections(breakpointId);
  }

  /**
   * TODO[jeffreytan]: look into unhandled exception support.
   * Dbgp protocol does not seem to support uncaught exception handling
   * so we only support 'all' and treat all other states as 'none'.
   */
  async setPauseOnExceptions(state: ExceptionState): Promise<any> {
    if (state === EXCEPTION_PAUSE_STATE_ALL) {
      this._breakpointCount++;
      const breakpiontId = String(this._breakpointCount);
      this._pauseAllExceptionBreakpointId = breakpiontId;

      for (const entry of this._connections.entries()) {
        const [connection, map] = entry;
        map.set(
          breakpiontId,
          connection.setExceptionBreakpoint(PAUSE_ALL_EXCEPTION_NAME)
        );
      }
    } else {
      // Try to remove any existing exception breakpoint.
      await this._removePauseAllExceptionBreakpointIfNeeded();
    }
  }

  async _removePauseAllExceptionBreakpointIfNeeded(): Promise<any> {
    const breakpointId = this._pauseAllExceptionBreakpointId;
    if (breakpointId) {
      this._pauseAllExceptionBreakpointId = null;
      return await this._removeBreakpointFromConnections(breakpointId);
    } else {
      // This can happen if users switch between 'none' and 'uncaught' states.
      logger.log('No exception breakpoint to remove.');
      return Promise.resolve();
    }
  }

  async _removeBreakpointFromConnections(breakpointId: string): Promise<any> {
    return Promise.all(Array.from(this._connections.entries())
      .map(entry => {
        const [connection, map] = entry;
        if (map.has(breakpointId)) {
          const connectionIdPromise = map.get(breakpointId);
          invariant(connectionIdPromise != null);
          map.delete(breakpointId);
          // Ensure we've removed from the connection's map before awaiting.
          return (async () => connection.removeBreakpoint(await connectionIdPromise))();
        } else {
          return Promise.resolve();
        }
      }));
  }

  addConnection(connection: Connection): void {
    const map = new Map();
    this._breakpoints.forEach(breakpoint => {
      map.set(
        breakpoint.storeId,
        connection.setBreakpoint(breakpoint.filename, breakpoint.lineNumber)
      );
    });
    if (this._pauseAllExceptionBreakpointId) {
      map.set(
        this._pauseAllExceptionBreakpointId,
        connection.setExceptionBreakpoint(PAUSE_ALL_EXCEPTION_NAME)
      );
    }

    this._connections.set(connection, map);
    connection.onStatus(status => {
      switch (status) {
        case STATUS_STOPPING:
        case STATUS_STOPPED:
        case STATUS_ERROR:
        case STATUS_END:
          this._removeConnection(connection);
      }
    });
  }

  _removeConnection(connection: Connection): void {
    if (this._connections.has(connection)) {
      this._connections.delete(connection);
    }
  }
}
