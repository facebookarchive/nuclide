'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BREAKPOINT_NEED_UI_UPDATE = 'BREAKPOINT_NEED_UI_UPDATE'; /**
                                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                                * All rights reserved.
                                                                *
                                                                * This source code is licensed under the license found in the LICENSE file in
                                                                * the root directory of this source tree.
                                                                *
                                                                * 
                                                                * @format
                                                                */

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

  constructor(dispatcher, initialBreakpoints, debuggerStore) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new _atom.CompositeDisposable(new _atom.Disposable(() => {
      dispatcher.unregister(dispatcherToken);
    }));
    this._debuggerStore = debuggerStore;
    this._breakpointIdSeed = 0;
    this._breakpoints = new Map();
    this._idToBreakpointMap = new Map();
    this._emitter = new _atom.Emitter();
    if (initialBreakpoints) {
      this._deserializeBreakpoints(initialBreakpoints);
    }
  }

  _handlePayload(payload) {
    switch (payload.actionType) {
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ADD_BREAKPOINT:
        this._addBreakpoint(payload.data.path, payload.data.line);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_BREAKPOINT_CONDITION:
        this._updateBreakpointCondition(payload.data.breakpointId, payload.data.condition);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_BREAKPOINT_ENABLED:
        this._updateBreakpointEnabled(payload.data.breakpointId, payload.data.enabled);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DELETE_BREAKPOINT:
        this._deleteBreakpoint(payload.data.path, payload.data.line);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DELETE_ALL_BREAKPOINTS:
        this._deleteAllBreakpoints();
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ENABLE_ALL_BREAKPOINTS:
        this._enableAllBreakpoints();
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DISABLE_ALL_BREAKPOINTS:
        this._disableAllBreakpoints();
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TOGGLE_BREAKPOINT:
        this._toggleBreakpoint(payload.data.path, payload.data.line);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DELETE_BREAKPOINT_IPC:
        this._deleteBreakpoint(payload.data.path, payload.data.line, false);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_BREAKPOINT_HITCOUNT:
        this._updateBreakpointHitcount(payload.data.path, payload.data.line, payload.data.hitCount);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.BIND_BREAKPOINT_IPC:
        this._bindBreakpoint(payload.data.path, payload.data.line, payload.data.condition, payload.data.enabled, payload.data.resolved);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DEBUGGER_MODE_CHANGE:
        this._handleDebuggerModeChange(payload.data);
        break;
      default:
        return;
    }
  }

  _addBreakpoint(path, line, condition = '', resolved = false, userAction = true, enabled = true) {
    this._breakpointIdSeed++;
    const breakpoint = {
      id: this._breakpointIdSeed,
      path,
      line,
      condition,
      enabled,
      resolved
    };
    this._idToBreakpointMap.set(breakpoint.id, breakpoint);
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const lineMap = this._breakpoints.get(path);

    if (!(lineMap != null)) {
      throw new Error('Invariant violation: "lineMap != null"');
    }

    lineMap.set(line, breakpoint);
    this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, path);
    if (userAction) {
      this._emitter.emit(BREAKPOINT_USER_CHANGED, {
        action: ADDBREAKPOINT_ACTION,
        breakpoint
      });
    }
  }

  _updateBreakpointHitcount(path, line, hitCount) {
    const breakpoint = this.getBreakpointAtLine(path, line);
    if (breakpoint == null) {
      return;
    }
    breakpoint.hitCount = hitCount;
    this._updateBreakpoint(breakpoint);
  }

  _updateBreakpointEnabled(breakpointId, enabled) {
    const breakpoint = this._idToBreakpointMap.get(breakpointId);
    if (breakpoint == null) {
      return;
    }
    breakpoint.enabled = enabled;
    this._updateBreakpoint(breakpoint);
  }

  _updateBreakpointCondition(breakpointId, condition) {
    const breakpoint = this._idToBreakpointMap.get(breakpointId);
    if (breakpoint == null) {
      return;
    }
    breakpoint.condition = condition;
    this._updateBreakpoint(breakpoint);
  }

  _updateBreakpoint(breakpoint) {
    this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, breakpoint.path);
    this._emitter.emit(BREAKPOINT_USER_CHANGED, {
      action: 'UpdateBreakpoint',
      breakpoint
    });
  }

  _forEachBreakpoint(callback) {
    for (const path of this._breakpoints.keys()) {
      const lineMap = this._breakpoints.get(path);

      if (!(lineMap != null)) {
        throw new Error('Invariant violation: "lineMap != null"');
      }

      for (const line of lineMap.keys()) {
        const bp = lineMap.get(line);

        if (!(bp != null)) {
          throw new Error('Invariant violation: "bp != null"');
        }

        callback(path, line, bp.id);
      }
    }
  }

  _deleteAllBreakpoints() {
    this._forEachBreakpoint((path, line, breakpointId) => this._deleteBreakpoint(path, line));
  }

  _enableAllBreakpoints() {
    this._forEachBreakpoint((path, line, breakpointId) => this._updateBreakpointEnabled(breakpointId, true));
  }

  _disableAllBreakpoints() {
    this._forEachBreakpoint((path, line, breakpointId) => this._updateBreakpointEnabled(breakpointId, false));
  }

  _deleteBreakpoint(path, line, userAction = true) {
    const lineMap = this._breakpoints.get(path);
    if (lineMap == null) {
      return;
    }
    const breakpoint = lineMap.get(line);
    if (lineMap.delete(line)) {
      if (!breakpoint) {
        throw new Error('Invariant violation: "breakpoint"');
      }

      this._idToBreakpointMap.delete(breakpoint.id);
      this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, path);
      if (userAction) {
        this._emitter.emit(BREAKPOINT_USER_CHANGED, {
          action: DELETEBREAKPOINT_ACTION,
          breakpoint
        });
      }
    }
  }

  _toggleBreakpoint(path, line) {
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const lineMap = this._breakpoints.get(path);

    if (!(lineMap != null)) {
      throw new Error('Invariant violation: "lineMap != null"');
    }

    if (lineMap.has(line)) {
      this._deleteBreakpoint(path, line);
    } else {
      this._addBreakpoint(path, line, '');
    }
  }

  _bindBreakpoint(path, line, condition, enabled, resolved) {
    // The Chrome devtools always bind a new breakpoint as enabled the first time. If this
    // breakpoint is known to be disabled in the front-end, sync the enabled state with Chrome.
    const existingBp = this.getBreakpointAtLine(path, line);
    const updateEnabled = existingBp != null && existingBp.enabled !== enabled;

    this._addBreakpoint(path, line, condition, resolved, false, // userAction
    enabled);

    if (updateEnabled) {
      const updatedBp = this.getBreakpointAtLine(path, line);
      if (updatedBp != null) {
        updatedBp.enabled = !enabled;
        this._updateBreakpoint(updatedBp);
      }
    }

    const debuggerStore = this.getDebuggerStore();
    if (debuggerStore != null) {
      const currentInfo = debuggerStore.getDebugProcessInfo();
      if (condition !== '' && currentInfo != null && !currentInfo.getDebuggerCapabilities().conditionalBreakpoints) {
        // If the current debugger does not support conditional breakpoints, and the bp that
        // was just bound has a condition on it, warn the user that the condition isn't going
        // to be honored.
        atom.notifications.addWarning('The current debugger does not support conditional breakpoints. The breakpoint at this location will hit without ' + 'evaluating the specified condition expression:\n' + `${(_nuclideUri || _load_nuclideUri()).default.basename(path)}:${line}`);
        const updatedBp = this.getBreakpointAtLine(path, line);
        if (updatedBp != null) {
          this._updateBreakpointCondition(updatedBp.id, '');
        }
      }
    }
  }

  _handleDebuggerModeChange(newMode) {
    if (newMode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED) {
      // All breakpoints should be unresolved after stop debugging.
      this._resetBreakpoints();
    } else {
      for (const breakpoint of this.getAllBreakpoints()) {
        if (!breakpoint.resolved) {
          this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, breakpoint.path);
        }
      }
    }
  }

  _resetBreakpoints() {
    for (const breakpoint of this.getAllBreakpoints()) {
      breakpoint.resolved = false;
      breakpoint.hitCount = undefined;
      this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, breakpoint.path);
    }
  }

  getBreakpointsForPath(path) {
    if (!this._breakpoints.has(path)) {
      this._breakpoints.set(path, new Map());
    }
    const ret = this._breakpoints.get(path);

    if (!ret) {
      throw new Error('Invariant violation: "ret"');
    }

    return ret;
  }

  getBreakpointLinesForPath(path) {
    const lineMap = this._breakpoints.get(path);
    return lineMap != null ? new Set(lineMap.keys()) : new Set();
  }

  getBreakpointAtLine(path, line) {
    const lineMap = this._breakpoints.get(path);
    if (lineMap == null) {
      return null;
    }
    return lineMap.get(line);
  }

  getAllBreakpoints() {
    const breakpoints = [];
    for (const [, lineMap] of this._breakpoints) {
      for (const breakpoint of lineMap.values()) {
        breakpoints.push(breakpoint);
      }
    }
    return breakpoints;
  }

  getSerializedBreakpoints() {
    const breakpoints = [];
    for (const [path, lineMap] of this._breakpoints) {
      for (const line of lineMap.keys()) {
        const breakpoint = lineMap.get(line);
        if (breakpoint == null) {
          continue;
        }

        breakpoints.push({
          line,
          sourceURL: path,
          disabled: !breakpoint.enabled,
          condition: breakpoint.condition
        });
      }
    }
    return breakpoints;
  }

  getDebuggerStore() {
    return this._debuggerStore;
  }

  breakpointSupportsConditions(breakpoint) {
    // If currently debugging, return whether or not the current debugger supports this.
    const debuggerStore = this.getDebuggerStore();
    if (debuggerStore != null && debuggerStore.getDebuggerMode() !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED) {
      const currentDebugInfo = debuggerStore.getDebugProcessInfo();
      if (currentDebugInfo != null) {
        return currentDebugInfo.getDebuggerCapabilities().conditionalBreakpoints;
      }
    }

    // If not currently debugging, return if any of the debuggers that support
    // the file extension this bp is in support conditions.
    // TODO: have providers register their file extensions and filter correctly here.
    return true;
  }

  _deserializeBreakpoints(breakpoints) {
    for (const breakpoint of breakpoints) {
      const { line, sourceURL, disabled, condition } = breakpoint;
      this._addBreakpoint(sourceURL, line, condition || '', false, // resolved
      false, // user action
      !disabled);
    }
  }

  /**
   * Register a change handler that is invoked when the breakpoints UI
   * needs to be updated for a file.
   */
  onNeedUIUpdate(callback) {
    return this._emitter.on(BREAKPOINT_NEED_UI_UPDATE, callback);
  }

  /**
   * Register a change handler that is invoked when a breakpoint is changed
   * by user action, like user explicitly added, deleted a breakpoint.
   */
  onUserChange(callback) {
    return this._emitter.on(BREAKPOINT_USER_CHANGED, callback);
  }

  dispose() {
    this._emitter.dispose();
    this._disposables.dispose();
  }
}
exports.default = BreakpointStore;