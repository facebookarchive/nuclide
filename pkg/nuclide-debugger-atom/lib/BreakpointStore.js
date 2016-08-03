'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Dispatcher} from 'flux';
import type {
  SerializedBreakpoint,
  FileLineBreakpoint,
  FileLineBreakpoints,
} from './types';

import invariant from 'assert';
import {
  Disposable,
  CompositeDisposable,
} from 'atom';
import {Emitter} from 'atom';
import Constants from './Constants';

export type LineToBreakpointMap = Map<number, FileLineBreakpoint>;

/**
 * Stores the currently set breakpoints as (path, line) pairs.
 *
 * Mutations to this object fires off high level events to listeners such as UI
 * controllers, giving them a chance to update.
 */
class BreakpointStore {
  _disposables: IDisposable;
  _breakpoints: Map<string, LineToBreakpointMap>;
  _emitter: atom$Emitter;

  constructor(
    dispatcher: Dispatcher,
    initialBreakpoints: ?Array<SerializedBreakpoint>,
  ) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new CompositeDisposable(
      new Disposable(() => {
        dispatcher.unregister(dispatcherToken);
      }),
    );
    this._breakpoints = new Map();
    this._emitter = new Emitter();
    if (initialBreakpoints) {
      this._deserializeBreakpoints(initialBreakpoints);
    }
  }

  _handlePayload(payload: Object): void {
    const {data} = payload;
    switch (payload.actionType) {
      case Constants.Actions.ADD_BREAKPOINT:
        this._addBreakpoint(data.path, data.line);
        break;
      case Constants.Actions.DELETE_BREAKPOINT:
        this._deleteBreakpoint(data.path, data.line);
        break;
      case Constants.Actions.TOGGLE_BREAKPOINT:
        this._toggleBreakpoint(data.path, data.line);
        break;
      default:
        return;
    }
  }

  _addBreakpoint(path: string, line: number): void {
    const breakpoint = {
      path,
      line,
      enabled: true,
      resolved: false,
    };
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const lineMap = this._breakpoints.get(path);
    invariant(lineMap != null);
    lineMap.set(line, breakpoint);
    this._emitter.emit('change', path);
  }

  _deleteBreakpoint(path: string, line: number): void {
    const lineMap = this._breakpoints.get(path);
    invariant(lineMap != null);
    if (lineMap.delete(line)) {
      this._emitter.emit('change', path);
    }
  }

  _toggleBreakpoint(path: string, line: number): void {
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const lineMap = this._breakpoints.get(path);
    invariant(lineMap != null);
    if (lineMap.has(line)) {
      this._deleteBreakpoint(path, line);
    } else {
      this._addBreakpoint(path, line);
    }
  }

  getBreakpointsForPath(path: string): Set<number> {
    const lineMap = this._breakpoints.get(path);
    return lineMap != null ? new Set(lineMap.keys()) : new Set();
  }

  getAllBreakpoints(): FileLineBreakpoints {
    const breakpoints: FileLineBreakpoints = [];
    for (const [, lineMap] of this._breakpoints) {
      for (const breakpoint of lineMap.values()) {
        breakpoints.push(breakpoint);
      }
    }
    return breakpoints;
  }

  getSerializedBreakpoints(): Array<SerializedBreakpoint> {
    const breakpoints = [];
    for (const [path, lineMap] of this._breakpoints) {
      for (const line of lineMap.keys()) {
        breakpoints.push({
          line,
          sourceURL: path,
        });
      }
    }
    return breakpoints;
  }

  _deserializeBreakpoints(breakpoints: Array<SerializedBreakpoint>): void {
    for (const breakpoint of breakpoints) {
      const {line, sourceURL} = breakpoint;
      this._addBreakpoint(sourceURL, line);
    }
  }

  /**
   * Register a change handler that is invoked whenever the store changes.
   */
  onChange(callback: (path: string) => void): IDisposable {
    return this._emitter.on('change', callback);
  }

  dispose(): void {
    this._emitter.dispose();
    this._disposables.dispose();
  }
}

module.exports = BreakpointStore;
