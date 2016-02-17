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

import type {Dispatcher} from 'flux';
import type {nuclide_debugger$Service} from '../../interfaces/service';
import type DebuggerStoreType from './DebuggerStore';
import type DebuggerProcessInfoType from './DebuggerProcessInfo';
import type BridgeType from './Bridge';
import type DebuggerInstance from './DebuggerInstance';

function track(...args: any) {
  const trackFunc = require('../../../analytics').track;
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
  _store: DebuggerStoreType;
  _bridge: BridgeType;

  constructor(dispatcher: Dispatcher, store: DebuggerStoreType) {
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
      data: 'starting',
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

    // TODO[jeffreytan]: currently only HHVM debugger implements this method
    // investigate if LLDB/Node needs to implement it.
    if (debugSession.onSessionEnd) {
      this._disposables.add(debugSession.onSessionEnd(this._handleSessionEnd.bind(this)));
    }

    const socketAddr = await debugSession.getWebsocketAddress();
    endTimerTracking();

    this._dispatcher.dispatch({
      actionType: Constants.Actions.SET_PROCESS_SOCKET,
      data: socketAddr,
    });
    this._dispatcher.dispatch({
      actionType: Constants.Actions.DEBUGGER_MODE_CHANGE,
      data: 'debugging',  // Debugger finished initializing and enterig debug mode.
    });
  }

  _handleSessionEnd(): void {
    this.killDebugger();
  }

  killDebugger() {
    track(AnalyticsEvents.DEBUGGER_STOP);
    endTimerTracking();
    this._handleDebugModeEnd();
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
      data: 'stopped',
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

  setError(error: ?string) {
    require('../../../logging').getLogger().error(error);
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

  dispose() {
    endTimerTracking();
    this._disposables.dispose();
  }

  _handleDebugModeStart(): void {
    // Open the output window if it's not already opened.
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-output:show');
  }

  _handleDebugModeEnd(): void {
    // Close the output window when we are done with debugging.
    // TODO(jonaldislarry) don't close the window if it was open prior to debugging.
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-output:hide');
  }
}

module.exports = DebuggerActions;
