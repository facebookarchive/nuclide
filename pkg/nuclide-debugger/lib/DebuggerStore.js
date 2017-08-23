'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerStore = exports.DebuggerMode = undefined;

var _atom = require('atom');

var _DebuggerSettings;

function _load_DebuggerSettings() {
  return _DebuggerSettings = require('./DebuggerSettings');
}

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const DebuggerMode = exports.DebuggerMode = Object.freeze({
  STARTING: 'starting',
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPING: 'stopping',
  STOPPED: 'stopped'
});

// This is to work around flow's missing support of enums.
DebuggerMode;

const DEBUGGER_CHANGE_EVENT = 'change';
const DEBUGGER_MODE_CHANGE_EVENT = 'debugger mode change';

/**
 * Flux style Store holding all data used by the debugger plugin.
 */
class DebuggerStore {

  // Stored values
  constructor(dispatcher, model) {
    this._dispatcher = dispatcher;
    this._model = model;
    this._emitter = new _atom.Emitter();
    this._dispatcherToken = this._dispatcher.register(this._handlePayload.bind(this));

    this._debuggerSettings = new (_DebuggerSettings || _load_DebuggerSettings()).DebuggerSettings();
    this._debuggerInstance = null;
    this._error = null;
    this._evaluationExpressionProviders = new Set();
    this._processSocket = null;
    this._debuggerMode = DebuggerMode.STOPPED;
    this._togglePauseOnException = false;
    this._togglePauseOnCaughtException = false;
    this._enableSingleThreadStepping = false;
    this._registerExecutor = null;
    this._consoleDisposable = null;
    this._customControlButtons = [];
    this._debugProcessInfo = null;
    this._setSourcePathCallback = null;
    this.loaderBreakpointResumePromise = new Promise(resolve => {
      this._onLoaderBreakpointResume = resolve;
    });
  }

  dispose() {
    this._emitter.dispose();
    this._dispatcher.unregister(this._dispatcherToken);
    const debuggerInstance = this._debuggerInstance;
    if (debuggerInstance != null) {
      // On package deactivation, this field is expected to be nulled out, which must happen here
      // because the dispatcher for this store is now unregistered.
      this._debuggerInstance = null;
      debuggerInstance.dispose();
    }
    if (this._debugProcessInfo != null) {
      this._debugProcessInfo.dispose();
    }
  }

  loaderBreakpointResumed() {
    this._onLoaderBreakpointResume(); // Resolves onLoaderBreakpointResumePromise.
  }

  getCustomControlButtons() {
    return this._customControlButtons;
  }

  getConsoleExecutorFunction() {
    return this._registerExecutor;
  }

  getBridge() {
    return this._model.getBridge();
  }

  getDebuggerInstance() {
    return this._debuggerInstance;
  }

  getError() {
    return this._error;
  }

  getProcessSocket() {
    return this._processSocket;
  }

  getDebuggerMode() {
    return this._debuggerMode;
  }

  isDebugging() {
    return this._debuggerMode !== DebuggerMode.STOPPED && this._debuggerMode !== DebuggerMode.STOPPING;
  }

  getTogglePauseOnException() {
    return this._togglePauseOnException;
  }

  getTogglePauseOnCaughtException() {
    return this._togglePauseOnCaughtException;
  }

  getEnableSingleThreadStepping() {
    return this._enableSingleThreadStepping;
  }

  getIsReadonlyTarget() {
    return this._debugProcessInfo != null && this._debugProcessInfo.getDebuggerCapabilities().readOnlyTarget;
  }

  getSettings() {
    return this._debuggerSettings;
  }

  getEvaluationExpressionProviders() {
    return this._evaluationExpressionProviders;
  }

  getCanSetSourcePaths() {
    return this._setSourcePathCallback != null;
  }

  getCanRestartDebugger() {
    return this._debugProcessInfo != null;
  }

  getDebugProcessInfo() {
    return this._debugProcessInfo;
  }

  initializeSingleThreadStepping(mode) {
    this._enableSingleThreadStepping = mode;
  }

  onChange(callback) {
    return this._emitter.on(DEBUGGER_CHANGE_EVENT, callback);
  }

  onDebuggerModeChange(callback) {
    return this._emitter.on(DEBUGGER_MODE_CHANGE_EVENT, callback);
  }

  _handlePayload(payload) {
    switch (payload.actionType) {
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_PROCESS_SOCKET:
        this._processSocket = payload.data;
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_ERROR:
        this._error = payload.data;
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_DEBUGGER_INSTANCE:
        this._debuggerInstance = payload.data;
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TOGGLE_PAUSE_ON_EXCEPTION:
        const pauseOnException = payload.data;
        this._togglePauseOnException = pauseOnException;
        if (this.isDebugging()) {
          this.getBridge().setPauseOnException(pauseOnException);
        }
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TOGGLE_PAUSE_ON_CAUGHT_EXCEPTION:
        const pauseOnCaughtException = payload.data;
        this._togglePauseOnCaughtException = pauseOnCaughtException;
        if (this.isDebugging()) {
          this.getBridge().setPauseOnCaughtException(pauseOnCaughtException);
        }
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.TOGGLE_SINGLE_THREAD_STEPPING:
        const singleThreadStepping = payload.data;
        this._enableSingleThreadStepping = singleThreadStepping;
        if (this.isDebugging()) {
          this.getBridge().setSingleThreadStepping(singleThreadStepping);
        }
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DEBUGGER_MODE_CHANGE:
        this._debuggerMode = payload.data;
        if (this._debuggerMode === DebuggerMode.STOPPED) {
          this.loaderBreakpointResumePromise = new Promise(resolve => {
            this._onLoaderBreakpointResume = resolve;
          });
        }
        this._emitter.emit(DEBUGGER_MODE_CHANGE_EVENT);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ADD_EVALUATION_EXPRESSION_PROVIDER:
        if (this._evaluationExpressionProviders.has(payload.data)) {
          return;
        }
        this._evaluationExpressionProviders.add(payload.data);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.REMOVE_EVALUATION_EXPRESSION_PROVIDER:
        if (!this._evaluationExpressionProviders.has(payload.data)) {
          return;
        }
        this._evaluationExpressionProviders.delete(payload.data);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ADD_REGISTER_EXECUTOR:
        if (!(this._registerExecutor == null)) {
          throw new Error('Invariant violation: "this._registerExecutor == null"');
        }

        this._registerExecutor = payload.data;
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.REMOVE_REGISTER_EXECUTOR:
        if (!(this._registerExecutor === payload.data)) {
          throw new Error('Invariant violation: "this._registerExecutor === payload.data"');
        }

        this._registerExecutor = null;
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.REGISTER_CONSOLE:
        if (this._registerExecutor != null) {
          this._consoleDisposable = this._registerExecutor();
        }
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UNREGISTER_CONSOLE:
        if (this._consoleDisposable != null) {
          this._consoleDisposable.dispose();
          this._consoleDisposable = null;
        }
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_CUSTOM_CONTROL_BUTTONS:
        this._customControlButtons = payload.data;
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_CONFIGURE_SOURCE_PATHS_CALLBACK:
        this._setSourcePathCallback = payload.data;
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.CONFIGURE_SOURCE_PATHS:
        if (this._setSourcePathCallback != null) {
          this._setSourcePathCallback();
        }
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_DEBUG_PROCESS_INFO:
        if (this._debugProcessInfo != null) {
          this._debugProcessInfo.dispose();
        }
        this._debugProcessInfo = payload.data;
        break;
      default:
        return;
    }
    this._emitter.emit(DEBUGGER_CHANGE_EVENT);
  }
}
exports.DebuggerStore = DebuggerStore;