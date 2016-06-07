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
  nuclide_debugger$Service,
  NuclideDebuggerProvider,
  NuclideEvaluationExpressionProvider,
} from '../../nuclide-debugger-interfaces/service';
import type {DebuggerStore, DebuggerModeType} from './DebuggerStore';
import type DebuggerProcessInfoType from './DebuggerProcessInfo';
import type DebuggerInstance from './DebuggerInstance';

import Constants from './Constants';
import {CompositeDisposable} from 'atom';
import {beginTimerTracking, failTimerTracking, endTimerTracking} from './AnalyticsHelper';
import remoteUri from '../../nuclide-remote-uri';
import invariant from 'assert';
import {DebuggerMode} from './DebuggerStore';
import passesGK from '../../commons-node/passesGK';

function track(...args: any) {
  const trackFunc = require('../../nuclide-analytics').track;
  trackFunc.apply(null, args);
}

const AnalyticsEvents = Object.freeze({
  DEBUGGER_START: 'debugger-start',
  DEBUGGER_START_FAIL: 'debugger-start-fail',
  DEBUGGER_STOP: 'debugger-stop',
});

const GK_DEBUGGER_THREADS_WINDOW = 'nuclide_debugger_threads_window';
const GK_DEBUGGER_CONSOLE_WINDOW = 'nuclide_debugger_console_window';

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

  async startDebugging(processInfo: DebuggerProcessInfoType): Promise<void> {
    track(AnalyticsEvents.DEBUGGER_START, {
      serviceName: processInfo.getServiceName(),
    });
    beginTimerTracking('nuclide-debugger-atom:startDebugging');

    this.stopDebugging(); // stop existing session.
    this.setError(null);
    this._handleDebugModeStart();
    this._setDebuggerMode(DebuggerMode.STARTING);
    try {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      const debuggerInstance = await processInfo.debug();
      if (await passesGK(GK_DEBUGGER_CONSOLE_WINDOW)) {
        this._registerConsole();
      }
      const supportThreadsWindow = processInfo.supportThreads()
        && await passesGK(GK_DEBUGGER_THREADS_WINDOW);
      this._store.getSettings().set('SupportThreadsWindow', supportThreadsWindow);
      await this._waitForChromeConnection(debuggerInstance);
    } catch (err) {
      failTimerTracking(err);
      track(AnalyticsEvents.DEBUGGER_START_FAIL, {});
      this.setError('Failed to start debugger process: ' + err);
      this.stopDebugging();
    }
  }

  _setDebuggerMode(debuggerMode: DebuggerModeType): void {
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
    this._setDebuggerMode(DebuggerMode.RUNNING);

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
    this._setDebuggerMode(DebuggerMode.STOPPING);
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
    this._setDebuggerMode(DebuggerMode.STOPPED);
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

  addService(service: nuclide_debugger$Service) {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.ADD_SERVICE,
      data: service,
    });
  }

  removeService(service: nuclide_debugger$Service) {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.REMOVE_SERVICE,
      data: service,
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
      require('../../nuclide-logging').getLogger().error(error);
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
      return remoteUri.isRemote(path);
    }).map(remotePath => {
      const {hostname} = remoteUri.parseRemoteUri(remotePath);
      return remoteUri.createRemoteUri(hostname, '/');
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

  dispose() {
    endTimerTracking();
    this._disposables.dispose();
  }

  _handleDebugModeStart(): void {
    // Open the console window if it's not already opened.
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');
  }
}

module.exports = DebuggerActions;
