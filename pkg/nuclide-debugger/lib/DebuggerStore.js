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
  NuclideEvaluationExpressionProvider,
} from '../../nuclide-debugger-interfaces/service';
import type {
  DebuggerInstance,
} from '../../nuclide-debugger-base';
import type DebuggerModel from './DebuggerModel';
import type {RegisterExecutorFunction} from '../../nuclide-console/lib/types';
import type {DebuggerModeType} from './types';

import {Emitter} from 'atom';
import Constants from './Constants';
import {DebuggerSettings} from './DebuggerSettings';
import invariant from 'assert';

const DebuggerMode: {[key: string]: DebuggerModeType} = Object.freeze({
  STARTING: 'starting',
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
});

const DEBUGGER_CHANGE_EVENT = 'change';
const DEBUGGER_MODE_CHANGE_EVENT = 'debugger mode change';

/**
 * Flux style Store holding all data used by the debugger plugin.
 */
class DebuggerStore {
  _model: DebuggerModel;
  _dispatcher: Dispatcher;
  _dispatcherToken: any;
  _emitter: Emitter;

  // Stored values
  _debuggerSettings: DebuggerSettings;
  _debuggerInstance: ?DebuggerInstance;
  _error: ?string;
  _evaluationExpressionProviders: Set<NuclideEvaluationExpressionProvider>;
  _processSocket: ?string;
  _debuggerMode: DebuggerModeType;
  _togglePauseOnException: boolean;
  _togglePauseOnCaughtException: boolean;
  _enableSingleThreadStepping: boolean;
  _onLoaderBreakpointResume: () => void;
  _registerExecutor: ?() => IDisposable;
  _consoleDisposable: ?IDisposable;
  loaderBreakpointResumePromise: Promise<void>;

  constructor(dispatcher: Dispatcher, model: DebuggerModel) {
    this._dispatcher = dispatcher;
    this._model = model;
    this._emitter = new Emitter();
    this._dispatcherToken = this._dispatcher.register(this._handlePayload.bind(this));

    this._debuggerSettings = new DebuggerSettings();
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
    this.loaderBreakpointResumePromise = new Promise(resolve => {
      this._onLoaderBreakpointResume = resolve;
    });
  }

  dispose() {
    this._emitter.dispose();
    this._dispatcher.unregister(this._dispatcherToken);
    if (this._debuggerInstance) {
      this._debuggerInstance.dispose();
    }
  }

  loaderBreakpointResumed(): void {
    this._onLoaderBreakpointResume(); // Resolves onLoaderBreakpointResumePromise.
  }

  getConsoleExecutorFunction(): ?RegisterExecutorFunction {
    return this._registerExecutor;
  }

  getDebuggerInstance(): ?DebuggerInstance {
    return this._debuggerInstance;
  }

  getError(): ?string {
    return this._error;
  }

  getProcessSocket(): ?string {
    return this._processSocket;
  }

  getDebuggerMode(): DebuggerModeType {
    return this._debuggerMode;
  }

  getTogglePauseOnException(): boolean {
    return this._togglePauseOnException;
  }

  getTogglePauseOnCaughtException(): boolean {
    return this._togglePauseOnCaughtException;
  }

  getEnableSingleThreadStepping(): boolean {
    return this._enableSingleThreadStepping;
  }

  getSettings(): DebuggerSettings {
    return this._debuggerSettings;
  }

  getEvaluationExpressionProviders(): Set<NuclideEvaluationExpressionProvider> {
    return this._evaluationExpressionProviders;
  }

  initializeSingleThreadStepping(mode: boolean) {
    this._enableSingleThreadStepping = mode;
  }

  onChange(callback: () => void): IDisposable {
    return this._emitter.on(DEBUGGER_CHANGE_EVENT, callback);
  }

  onDebuggerModeChange(callback: () => void): IDisposable {
    return this._emitter.on(DEBUGGER_MODE_CHANGE_EVENT, callback);
  }

  _handlePayload(payload: Object) {
    switch (payload.actionType) {
      case Constants.Actions.SET_PROCESS_SOCKET:
        this._processSocket = payload.data;
        break;
      case Constants.Actions.SET_ERROR:
        this._error = payload.data;
        break;
      case Constants.Actions.SET_DEBUGGER_INSTANCE:
        this._debuggerInstance = payload.data;
        break;
      case Constants.Actions.TOGGLE_PAUSE_ON_EXCEPTION:
        const pauseOnException = payload.data;
        this._togglePauseOnException = pauseOnException;
        this._model.getBridge().setPauseOnException(pauseOnException);
        break;
      case Constants.Actions.TOGGLE_PAUSE_ON_CAUGHT_EXCEPTION:
        const pauseOnCaughtException = payload.data;
        this._togglePauseOnCaughtException = pauseOnCaughtException;
        this._model.getBridge().setPauseOnCaughtException(pauseOnCaughtException);
        break;
      case Constants.Actions.TOGGLE_SINGLE_THREAD_STEPPING:
        const singleThreadStepping = payload.data;
        this._enableSingleThreadStepping = singleThreadStepping;
        this._model.getBridge().setSingleThreadStepping(singleThreadStepping);
        break;
      case Constants.Actions.DEBUGGER_MODE_CHANGE:
        this._debuggerMode = payload.data;
        if (this._debuggerMode === DebuggerMode.STOPPED) {
          this.loaderBreakpointResumePromise = new Promise(resolve => {
            this._onLoaderBreakpointResume = resolve;
          });
        }
        this._emitter.emit(DEBUGGER_MODE_CHANGE_EVENT);
        break;
      case Constants.Actions.ADD_EVALUATION_EXPRESSION_PROVIDER:
        if (this._evaluationExpressionProviders.has(payload.data)) {
          return;
        }
        this._evaluationExpressionProviders.add(payload.data);
        break;
      case Constants.Actions.REMOVE_EVALUATION_EXPRESSION_PROVIDER:
        if (!this._evaluationExpressionProviders.has(payload.data)) {
          return;
        }
        this._evaluationExpressionProviders.delete(payload.data);
        break;
      case Constants.Actions.ADD_REGISTER_EXECUTOR:
        invariant(this._registerExecutor == null);
        this._registerExecutor = payload.data;
        break;
      case Constants.Actions.REMOVE_REGISTER_EXECUTOR:
        invariant(this._registerExecutor === payload.data);
        this._registerExecutor = null;
        break;
      case Constants.Actions.REGISTER_CONSOLE:
        if (this._registerExecutor != null) {
          this._consoleDisposable = this._registerExecutor();
        }
        break;
      case Constants.Actions.UNREGISTER_CONSOLE:
        if (this._consoleDisposable != null) {
          this._consoleDisposable.dispose();
          this._consoleDisposable = null;
        }
        break;
      default:
        return;
    }
    this._emitter.emit(DEBUGGER_CHANGE_EVENT);
  }
}

module.exports = {
  DebuggerMode,
  DebuggerStore,
};
