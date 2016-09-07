'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import nuclideUri from '../../commons-node/nuclideUri';
import type {Dispatcher} from 'flux';
import type {
  NuclideDebuggerProvider,
  NuclideEvaluationExpressionProvider,
} from '../../nuclide-debugger-interfaces/service';
import type {DebuggerStore} from './DebuggerStore';
import type {
  DebuggerProcessInfo,
  DebuggerInstance,
} from '../../nuclide-debugger-base';
import type {
  Callstack,
  DebuggerModeType,
  ExpansionResult,
  ExpressionResult,
  GetPropertiesResult,
  NuclideThreadData,
  ThreadItem,
} from './types';

import Constants from './Constants';
import {CompositeDisposable} from 'atom';
import {beginTimerTracking, failTimerTracking, endTimerTracking} from './AnalyticsHelper';
import invariant from 'assert';
import {DebuggerMode} from './DebuggerStore';
import passesGK from '../../commons-node/passesGK';
import {track} from '../../nuclide-analytics';
import {getLogger} from '../../nuclide-logging';
import {stringifyError} from '../../commons-node/string';
const logger = getLogger();

const AnalyticsEvents = Object.freeze({
  DEBUGGER_START: 'debugger-start',
  DEBUGGER_START_FAIL: 'debugger-start-fail',
  DEBUGGER_STOP: 'debugger-stop',
});

const GK_DEBUGGER_REQUEST_WINDOW = 'nuclide_debugger_php_request_window';
const GK_DEBUGGER_THREADS_WINDOW = 'nuclide_debugger_threads_window';
const GK_DEBUGGER_CONSOLE_WINDOW = 'nuclide_debugger_console_window';
const GK_DEBUGGER_SINGLE_THREAD_STEPPING = 'nuclide_debugger_single_thread_stepping';
/**
 * Flux style action creator for actions that affect the debugger.
 */
class DebuggerActions {
  _disposables: CompositeDisposable;
  _dispatcher: Dispatcher;
  _store: DebuggerStore;

  constructor(dispatcher: Dispatcher, store: DebuggerStore) {
    this._disposables = new CompositeDisposable();
    this._dispatcher = dispatcher;
    this._store = store;
  }

  async startDebugging(processInfo: DebuggerProcessInfo): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_START, {
      serviceName: processInfo.getServiceName(),
    });
    beginTimerTracking('nuclide-debugger-atom:startDebugging');

    this.stopDebugging(); // stop existing session.
    this.setError(null);
    this._handleDebugModeStart();
    this.setDebuggerMode(DebuggerMode.STARTING);
    try {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      const debuggerInstance = await processInfo.debug();
      if (await passesGK(GK_DEBUGGER_CONSOLE_WINDOW)) {
        this._registerConsole();
      }
      const supportThreadsWindow = processInfo.supportThreads()
        && await passesGK(GK_DEBUGGER_THREADS_WINDOW) &&
        await this._allowThreadsForPhp(processInfo);
      this._store.getSettings().set('SupportThreadsWindow', supportThreadsWindow);
      const singleThreadStepping = processInfo.supportSingleThreadStepping();
      if (singleThreadStepping && await passesGK(GK_DEBUGGER_SINGLE_THREAD_STEPPING)) {
        this._store.getSettings().set('SingleThreadStepping', singleThreadStepping);
        const singleThreadSteppingEnabled = processInfo.singleThreadSteppingEnabled();
        this.toggleSingleThreadStepping(singleThreadSteppingEnabled);
      }
      await this._waitForChromeConnection(debuggerInstance);
    } catch (err) {
      failTimerTracking(err);
      track(AnalyticsEvents.DEBUGGER_START_FAIL, {});
      const errorMessage = `Failed to start debugger process: ${stringifyError(err)}`;
      this.setError(errorMessage);
      atom.notifications.addError(errorMessage);
      this.stopDebugging();
    }
  }

  async _allowThreadsForPhp(processInfo: DebuggerProcessInfo): Promise<boolean> {
    if (processInfo.getServiceName() === 'hhvm') {
      return await passesGK(GK_DEBUGGER_REQUEST_WINDOW);
    }
    return true;
  }

  setDebuggerMode(debuggerMode: DebuggerModeType): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
      data: debuggerMode,
    });
  }

  async _waitForChromeConnection(debuggerInstance: DebuggerInstance): Promise<void> {
    this._setDebuggerInstance(debuggerInstance);
    if (debuggerInstance.onSessionEnd != null) {
      const handler = this._handleSessionEnd.bind(this, debuggerInstance);
      invariant(debuggerInstance.onSessionEnd);
      this._disposables.add(debuggerInstance.onSessionEnd(handler));
    }

    const socketAddr = await debuggerInstance.getWebsocketAddress();
    endTimerTracking();

    this._dispatcher.dispatch({
      actionType: Constants.Actions.SET_PROCESS_SOCKET,
      data: socketAddr,
    });
    // Debugger finished initializing and entered debug mode.
    this.setDebuggerMode(DebuggerMode.RUNNING);

    // Wait for 'resume' event from Bridge.js to guarantee we've passed the loader breakpoint.
    await this._store.loaderBreakpointResumePromise;
  }

  _setDebuggerInstance(debuggerInstance: ?DebuggerInstance): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.SET_DEBUGGER_INSTANCE,
      data: debuggerInstance,
    });
  }

  _handleSessionEnd(debuggerInstance: DebuggerInstance): void {
    if (this._store.getDebuggerInstance() === debuggerInstance) {
      this.stopDebugging();
    } else {
      // Do nothing, because either:
      // 1. Another DebuggerInstnace is alive. or
      // 2. DebuggerInstance has been disposed.
    }
  }

  stopDebugging() {
    if (this._store.getDebuggerMode() === DebuggerMode.STOPPING) {
      return;
    }
    this.setDebuggerMode(DebuggerMode.STOPPING);
    this._unregisterConsole();
    const debuggerInstance = this._store.getDebuggerInstance();
    if (debuggerInstance != null) {
      debuggerInstance.dispose();
      this._setDebuggerInstance(null);
    }
    this._dispatcher.dispatch({
      actionType: Constants.Actions.SET_PROCESS_SOCKET,
      data: null,
    });
    this.setDebuggerMode(DebuggerMode.STOPPED);
    track(AnalyticsEvents.DEBUGGER_STOP);
    endTimerTracking();

    invariant(this._store.getDebuggerInstance() === null);
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:hide');
  }

  _registerConsole(): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.REGISTER_CONSOLE,
    });
  }

  _unregisterConsole(): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.UNREGISTER_CONSOLE,
    });
  }

  addConsoleRegisterFunction(registerExecutor: () => IDisposable): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.ADD_REGISTER_EXECUTOR,
      data: registerExecutor,
    });
  }

  removeConsoleRegisterFunction(registerExecutor: () => IDisposable): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.REMOVE_REGISTER_EXECUTOR,
      data: registerExecutor,
    });
  }

  addDebuggerProvider(provider: NuclideDebuggerProvider) {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.ADD_DEBUGGER_PROVIDER,
      data: provider,
    });
  }

  removeDebuggerProvider(provider: NuclideDebuggerProvider) {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.REMOVE_DEBUGGER_PROVIDER,
      data: provider,
    });
  }

  addEvaluationExpressionProvider(provider: NuclideEvaluationExpressionProvider) {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.ADD_EVALUATION_EXPRESSION_PROVIDER,
      data: provider,
    });
  }

  removeEvaluationExpressionProvider(provider: NuclideEvaluationExpressionProvider) {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.REMOVE_EVALUATION_EXPRESSION_PROVIDER,
      data: provider,
    });
  }

  setError(error: ?string) {
    if (error != null) {
      logger.error(error);
    }
    this._dispatcher.dispatch({
      actionType: Constants.Actions.SET_ERROR,
      data: error,
    });
  }

  /**
   * Utility for debugging.
   *
   * This can be used to set an existing socket, bypassing normal UI flow to
   * improve iteration speed for development.
   */
  forceProcessSocket(socketAddr: ?string) {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.SET_PROCESS_SOCKET,
      data: socketAddr,
    });
  }

  /**
   * Utility for getting refreshed connections.
   * TODO: refresh connections when new directories are removed/added in file-tree.
   */
  updateConnections(): void {

    const connections = this._getRemoteConnections();
    // Always have one single local connection.
    connections.push('local');
    this._dispatcher.dispatch({
      actionType: Constants.Actions.UPDATE_CONNECTIONS,
      data: connections,
    });
  }

  /**
   * Get remote connections without duplication.
   */
  _getRemoteConnections(): Array<string> {
    // TODO: move this logic into RemoteConnection package.
    return atom.project.getPaths().filter(path => {
      return nuclideUri.isRemote(path);
    }).map(remotePath => {
      const {hostname} = nuclideUri.parseRemoteUri(remotePath);
      return nuclideUri.createRemoteUri(hostname, '/');
    }).filter((path, index, inputArray) => {
      return inputArray.indexOf(path) === index;
    });
  }

  addWatchExpression(expression: string): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.ADD_WATCH_EXPRESSION,
      data: {
        expression,
      },
    });
  }

  removeWatchExpression(index: number): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.REMOVE_WATCH_EXPRESSION,
      data: {
        index,
      },
    });
  }

  updateWatchExpression(index: number, newExpression: string): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.UPDATE_WATCH_EXPRESSION,
      data: {
        newExpression,
        index,
      },
    });
  }

  openSourceLocation(sourceURL: string, lineNumber: number): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.OPEN_SOURCE_LOCATION,
      data: {
        sourceURL,
        lineNumber,
      },
    });
  }

  /**
   * `actionId` is a debugger action understood by Chrome's `WebInspector.ActionRegistry`.
   */
  triggerDebuggerAction(actionId: string): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.TRIGGER_DEBUGGER_ACTION,
      data: {
        actionId,
      },
    });
  }

  updateCallstack(callstack: Callstack): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.UPDATE_CALLSTACK,
      data: {
        callstack,
      },
    });
  }

  setSelectedCallFrameline(options: ?{sourceURL: string, lineNumber: number}): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.SET_SELECTED_CALLFRAME_LINE,
      data: {
        options,
      },
    });
  }

  clearInterface(): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.CLEAR_INTERFACE,
      data: {},
    });
  }

  addBreakpoint(path: string, line: number): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.ADD_BREAKPOINT,
      data: {
        path,
        line,
      },
    });
  }

  updateBreakpoint(breakpointId: number, condition: string): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.UPDATE_BREAKPOINT,
      data: {
        breakpointId,
        condition,
      },
    });
  }

  deleteBreakpoint(path: string, line: number): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.DELETE_BREAKPOINT,
      data: {
        path,
        line,
      },
    });
  }

  deleteAllBreakpoints(): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.DELETE_ALL_BREAKPOINTS,
    });
  }

  toggleBreakpoint(path: string, line: number): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.TOGGLE_BREAKPOINT,
      data: {
        path,
        line,
      },
    });
  }

  deleteBreakpointIPC(path: string, line: number): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.DELETE_BREAKPOINT_IPC,
      data: {
        path,
        line,
      },
    });
  }

  bindBreakpointIPC(path: string, line: number, condition: string): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.BIND_BREAKPOINT_IPC,
      data: {
        path,
        line,
        condition,
      },
    });
  }

  togglePauseOnException(pauseOnException: boolean): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.TOGGLE_PAUSE_ON_EXCEPTION,
      data: pauseOnException,
    });
  }

  togglePauseOnCaughtException(pauseOnCaughtException: boolean): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.TOGGLE_PAUSE_ON_CAUGHT_EXCEPTION,
      data: pauseOnCaughtException,
    });
  }

  toggleSingleThreadStepping(singleThreadStepping: boolean): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.TOGGLE_SINGLE_THREAD_STEPPING,
      data: singleThreadStepping,
    });
  }

  updateLocals(locals: ExpansionResult): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.UPDATE_LOCALS,
      data: {
        locals,
      },
    });
  }

  dispose() {
    endTimerTracking();
    this._disposables.dispose();
  }

  updateThreads(threadData: NuclideThreadData): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.UPDATE_THREADS,
      data: {
        threadData,
      },
    });
  }

  updateThread(thread: ThreadItem): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.UPDATE_THREAD,
      data: {
        thread,
      },
    });
  }

  updateStopThread(id: number): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.UPDATE_STOP_THREAD,
      data: {
        id,
      },
    });
  }

  notifyThreadSwitch(sourceURL: string, lineNumber: number, message: string): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.NOTIFY_THREAD_SWITCH,
      data: {
        sourceURL,
        lineNumber,
        message,
      },
    });
  }

  receiveExpressionEvaluationResponse(id: number, response: ExpressionResult): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.RECEIVED_EXPRESSION_EVALUATION_RESPONSE,
      data: {
        id,
        response,
      },
    });
  }

  receiveGetPropertiesResponse(id: number, response: GetPropertiesResult): void {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.RECEIVED_GET_PROPERTIES_RESPONSE,
      data: {
        id,
        response,
      },
    });
  }

  _handleDebugModeStart(): void {
    // Open the console window if it's not already opened.
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-console:toggle',
      {visible: true},
    );
  }
}

module.exports = DebuggerActions;
