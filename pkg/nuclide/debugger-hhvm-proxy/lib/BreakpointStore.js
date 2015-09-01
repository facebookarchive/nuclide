'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Connection} from './Connection';

type BreakpointId = string;
type Breakpoint = {
  storeId: BreakpointId;
  filename: string;
  lineNumber: number;
};

var {
  STATUS_STOPPED,
  STATUS_ERROR,
  STATUS_END,
} = require('./DbgpSocket');

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

  constructor() {
    this._breakpointCount = 0;
    this._connections = new Map();
    this._breakpoints = new Map();
  }

  setBreakpoint(filename: string, lineNumber: number): BreakpointId {
    this._breakpointCount++;
    var storeId = String(this._breakpointCount);
    this._breakpoints.set(storeId, {storeId, filename, lineNumber});
    for (var entry of this._connections.entries()) {
      var [connection, map] = entry;
      map.set(storeId, connection.setBreakpoint(filename, lineNumber));
    }
    return storeId;
  }

  async removeBreakpoint(breakpointId: string): Promise {
    this._breakpoints.delete(breakpointId);
    return Promise.all(require('nuclide-commons').array.from(this._connections.entries())
      .map(entry => {
        var [connection, map] = entry;
        if (map.has(breakpointId)) {
          var connectionIdPromise = map.get(breakpointId);
          map.delete(breakpointId);
          // Ensure we've removed from the connection's map before awaiting.
          return (async () => connection.removeBreakpoint(await connectionIdPromise))();
        } else {
          return Promise.resolve();
        }
      }));
  }

  addConnection(connection: Connection): void {
    var map = new Map();
    this._breakpoints.forEach(breakpoint => {
      map.set(breakpoint.storeId, connection.setBreakpoint(breakpoint.filename, breakpoint.lineNumber));
    });
    this._connections.set(connection, map);
    connection.onStatus(status => {
      switch (status) {
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
