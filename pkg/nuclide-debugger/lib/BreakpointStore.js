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
  BreakpointUserChangeArgType,
  DebuggerModeType,
} from './types';

import invariant from 'assert';
import {
  Disposable,
  CompositeDisposable,
} from 'atom';
import {Emitter} from 'atom';
import Constants from './Constants';
import {DebuggerMode} from './DebuggerStore';

export type LineToBreakpointMap = Map<number, FileLineBreakpoint>;

const BREAKPOINT_NEED_UI_UPDATE = 'BREAKPOINT_NEED_UI_UPDATE';
const BREAKPOINT_USER_CHANGED = 'breakpoint_user_changed';

const ADDBREAKPOINT_ACTION = 'AddBreakpoint';
const DELETEBREAKPOINT_ACTION = 'DeleteBreakpoint';

/**
 * Stores the currently set breakpoints as (path, line) pairs.
 *
 * Mutations to this object fires off high level events to listeners such as UI
 * controllers, giving them a chance to update.
 */
class BreakpointStore {
  _disposables: IDisposable;
  _breakpoints: Map<string, LineToBreakpointMap>;
  _idToBreakpointMap: Map<number, FileLineBreakpoint>;
  _emitter: atom$Emitter;
  _breakpointIdSeed: number;

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
    this._breakpointIdSeed = 0;
    this._breakpoints = new Map();
    this._idToBreakpointMap = new Map();
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
      case Constants.Actions.UPDATE_BREAKPOINT:
        this._updateBreakpoint(data.breakpointId, data.condition);
        break;
      case Constants.Actions.DELETE_BREAKPOINT:
        this._deleteBreakpoint(data.path, data.line);
        break;
      case Constants.Actions.DELETE_ALL_BREAKPOINTS:
        this._deleteAllBreakpoints();
        break;
      case Constants.Actions.TOGGLE_BREAKPOINT:
        this._toggleBreakpoint(data.path, data.line);
        break;
      case Constants.Actions.DELETE_BREAKPOINT_IPC:
        this._deleteBreakpoint(data.path, data.line, false);
        break;
      case Constants.Actions.BIND_BREAKPOINT_IPC:
        this._bindBreakpoint(data.path, data.line, data.condition);
        break;
      case Constants.Actions.DEBUGGER_MODE_CHANGE:
        this._handleDebuggerModeChange(data);
        break;
      default:
        return;
    }
  }

  _addBreakpoint(
    path: string,
    line: number,
    condition: string = '',
    resolved: boolean = false,
    userAction: boolean = true,
  ): void {
    this._breakpointIdSeed++;
    const breakpoint = {
      id: this._breakpointIdSeed,
      path,
      line,
      condition,
      enabled: true,
      resolved,
    };
    this._idToBreakpointMap.set(breakpoint.id, breakpoint);
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const lineMap = this._breakpoints.get(path);
    invariant(lineMap != null);
    lineMap.set(line, breakpoint);
    this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, path);
    if (userAction) {
      this._emitter.emit(BREAKPOINT_USER_CHANGED, {
        action: ADDBREAKPOINT_ACTION,
        breakpoint,
      });
    }
  }

  _updateBreakpoint(
    breakpointId: number,
    condition: string,
  ): void {
    const breakpoint = this._idToBreakpointMap.get(breakpointId);
    if (breakpoint == null) {
      return;
    }
    breakpoint.condition = condition;
    this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, breakpoint.path);
    this._emitter.emit(BREAKPOINT_USER_CHANGED, {
      action: 'UpdateBreakpoint',
      breakpoint,
    });
  }

  _deleteAllBreakpoints(): void {
    for (const path of this._breakpoints.keys()) {
      const lineMap = this._breakpoints.get(path);
      invariant(lineMap != null);
      for (const line of lineMap.keys()) {
        this._deleteBreakpoint(path, line);
      }
    }
  }

  _deleteBreakpoint(
    path: string,
    line: number,
    userAction: boolean = true,
  ): void {
    const lineMap = this._breakpoints.get(path);
    invariant(lineMap != null);
    const breakpoint = lineMap.get(line);
    if (lineMap.delete(line)) {
      invariant(breakpoint);
      this._idToBreakpointMap.delete(breakpoint.id);
      this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, path);
      if (userAction) {
        this._emitter.emit(BREAKPOINT_USER_CHANGED, {
          action: DELETEBREAKPOINT_ACTION,
          breakpoint,
        });
      }
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
      this._addBreakpoint(path, line, '');
    }
  }

  _bindBreakpoint(path: string, line: number, condition: string): void {
    this._addBreakpoint(
      path,
      line,
      condition,
      true,   // resolved
      false,  // userAction
    );
  }

  _handleDebuggerModeChange(newMode: DebuggerModeType): void {
    if (newMode === DebuggerMode.STOPPED) {
      // All breakpoints should be unresolved after stop debugging.
      this._resetBreakpointUnresolved();
    }
  }

  _resetBreakpointUnresolved(): void {
    for (const breakpoint of this.getAllBreakpoints()) {
      breakpoint.resolved = false;
    }
  }

  getBreakpointsForPath(path: string): LineToBreakpointMap {
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const ret = this._breakpoints.get(path);
    invariant(ret);
    return ret;
  }

  getBreakpointLinesForPath(path: string): Set<number> {
    const lineMap = this._breakpoints.get(path);
    return lineMap != null ? new Set(lineMap.keys()) : new Set();
  }

  getBreakpointAtLine(path: string, line: number): ?FileLineBreakpoint {
    const lineMap = this._breakpoints.get(path);
    if (lineMap == null) {
      return;
    }
    return lineMap.get(line);
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
        // TODO: serialize condition and enabled states.
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
   * Register a change handler that is invoked when the breakpoints UI
   * needs to be updated for a file.
   */
  onNeedUIUpdate(callback: (path: string) => void): IDisposable {
    return this._emitter.on(BREAKPOINT_NEED_UI_UPDATE, callback);
  }

  /**
   * Register a change handler that is invoked when a breakpoint is changed
   * by user action, like user explicitly added, deleted a breakpoint.
   */
  onUserChange(callback: (params: BreakpointUserChangeArgType) => void): IDisposable {
    return this._emitter.on(BREAKPOINT_USER_CHANGED, callback);
  }

  dispose(): void {
    this._emitter.dispose();
    this._disposables.dispose();
  }
}

module.exports = BreakpointStore;
