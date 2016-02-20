'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {Emitter} = require('atom');
const Multimap = require('./Multimap');

export type SerializedBreakpoint = {
  line: number;
  sourceURL: string;
};

/**
 * Stores the currently set breakpoints as (path, line) pairs.
 *
 * Mutations to this object fires off high level events to listeners such as UI
 * controllers, giving them a chance to update.
 */
class BreakpointStore {
  _breakpoints: Multimap<string, number>;
  _emitter: atom$Emitter;

  constructor(initialBreakpoints: ?Array<SerializedBreakpoint>) {
    this._breakpoints = new Multimap();
    this._emitter = new Emitter();
    if (initialBreakpoints) {
      this._deserializeBreakpoints(initialBreakpoints);
    }
  }

  dispose() {
    this._emitter.dispose();
  }

  addBreakpoint(path: string, line: number) {
    this._breakpoints.set(path, line);
    this._emitter.emit('change', path);
  }

  deleteBreakpoint(path: string, line: number) {
    if (this._breakpoints.delete(path, line)) {
      this._emitter.emit('change', path);
    }
  }

  toggleBreakpoint(path: string, line: number) {
    if (this._breakpoints.hasEntry(path, line)) {
      this.deleteBreakpoint(path, line);
    } else {
      this.addBreakpoint(path, line);
    }
  }

  getBreakpointsForPath(path: string): Set<number> {
    return this._breakpoints.get(path);
  }

  getAllBreakpoints(): Multimap<string, number> {
    return this._breakpoints;
  }

  getSerializedBreakpoints(): Array<SerializedBreakpoint> {
    const breakpoints = [];
    this._breakpoints.forEach((line, sourceURL) => {
      breakpoints.push({line, sourceURL});
    });
    return breakpoints;
  }

  _deserializeBreakpoints(breakpoints: Array<SerializedBreakpoint>): void {
    for (const breakpoint of breakpoints) {
      const {line, sourceURL} = breakpoint;
      this.addBreakpoint(sourceURL, line);
    }
  }

  /**
   * Register a change handler that is invoked whenever the store changes.
   */
  onChange(callback: (path: string) => void): IDisposable {
    return this._emitter.on('change', callback);
  }
}

module.exports = BreakpointStore;
