'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const Constants = require('./Constants');
const {CompositeDisposable} = require('atom');
import {beginTimerTracking, failTimerTracking, endTimerTracking} from './AnalyticsHelper';
import remoteUri from '../../nuclide-remote-uri';
import invariant from 'assert';
import {DebuggerMode} from './DebuggerStore';

import type {Dispatcher} from 'flux';
import type {
  nuclide_debugger$Service,
  NuclideDebuggerProvider,
  NuclideEvaluationExpressionProvider,
} from '../../nuclide-debugger-interfaces/service';
import type {DebuggerStore} from './DebuggerStore';
import type DebuggerProcessInfoType from './DebuggerProcessInfo';
import type BridgeType from './Bridge';
import type DebuggerInstance from './DebuggerInstance';

function track(...args: any) {
  const trackFunc = require('../../nuclide-analytics').track;
  trackFunc.apply(null, args);
}

const AnalyticsEvents = {
  DEBUGGER_START:       'debugger-start',
  DEBUGGER_START_FAIL:  'debugger-start-fail',
  DEBUGGER_STOP:        'debugger-stop',
};

/**
 * Flux style action creator for actions that affect the debugger.
 */
class DebuggerActions {
  _disposables: CompositeDisposable;
  _dispatcher: Dispatcher;
  _store: DebuggerStore;
  _bridge: BridgeType;

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

    this.killDebugger(); // Kill the existing session.
    this.setError(null);
    this._handleDebugModeStart();

    this._dispatcher.dispatch({
      actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
      data: DebuggerMode.STARTING,
    });

    try {
      const debugSession = await processInfo.debug();
      await this._waitForChromeConnection(debugSession);
    } catch (err) {
      failTimerTracking(err);
      track(AnalyticsEvents.DEBUGGER_START_FAIL, {});
      this.setError('Failed to start debugger process: ' + err);
      this.killDebugger();
    }
  }

  async _waitForChromeConnection(debugSession: DebuggerInstance): Promise<void> {
    this._dispatcher.dispatch({
      actionType: Constants.Actions.SET_DEBUGGER_PROCESS,
      data: debugSession,
    });

    if (debugSession.onSessionEnd != null) {
      const handler = this._handleSessionEnd.bind(this);
      invariant(debugSession.onSessionEnd);
      this._disposables.add(debugSession.onSessionEnd(handler));
    }

    const socketAddr = await debugSession.getWebsocketAddress();
    endTimerTracking();

    this._dispatcher.dispatch({
      actionType: Constants.Actions.SET_PROCESS_SOCKET,
      data: socketAddr,
    });
    this._dispatcher.dispatch({
      actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
      data: DebuggerMode.RUNNING,  // Debugger finished initializing and entered debug mode.
    });
  }

  _handleSessionEnd(): void {
    this.killDebugger();
  }

  killDebugger() {
    if (this._store.getDebuggerMode() === DebuggerMode.STOPPING) {
      return;
    }

    this._dispatcher.dispatch({
      actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
      data: DebuggerMode.STOPPING,
    });
    const debugSession = this._store.getDebuggerProcess();
    if (debugSession != null) {
      debugSession.dispose();
      this._dispatcher.dispatch({
        actionType: Constants.Actions.SET_DEBUGGER_PROCESS,
        data: null,
      });
    }
    this._dispatcher.dispatch({
      actionType: Constants.Actions.SET_PROCESS_SOCKET,
      data: null,
    });
    this._dispatcher.dispatch({
      actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
      data: DebuggerMode.STOPPED,
    });
    track(AnalyticsEvents.DEBUGGER_STOP);
    endTimerTracking();
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
    require('../../nuclide-logging').getLogger().error(error);
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
      const {hostname, port} = remoteUri.parseRemoteUri(remotePath);
      return remoteUri.createRemoteUri(hostname, Number(port), '/');
    }).filter((path, index, inputArray) => {
      return inputArray.indexOf(path) === index;
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
