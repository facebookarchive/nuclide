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
import type {nuclide_debugger$Service} from 'nuclide-debugger-interfaces/service';
import type DebuggerStoreType from './DebuggerStore';
import type DebuggerProcessInfoType from './DebuggerProcessInfo';
import type BridgeType from './Bridge';

function track(...args: any) {
  const trackFunc = require('nuclide-analytics').track;
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

  attachToProcess(processInfo: DebuggerProcessInfoType, launchTarget: ?string) {
    track(AnalyticsEvents.DEBUGGER_START, {
      serviceName: processInfo.getServiceName(),
    });
    beginTimerTracking('nuclide-debugger-atom:attachToProcess');

    this.killDebugger(); // Kill the existing session.
    this.setError(null);

    let process = null;
    if (launchTarget) {
      process = processInfo.launch(launchTarget);
    } else {
      process = processInfo.attach();
    }
    this._dispatcher.dispatch({
      actionType: Constants.Actions.SET_DEBUGGER_PROCESS,
      data: process,
    });

    // TODO[jeffreytan]: currently only HHVM debugger implements this method
    // investigate if LLDB/Node needs to implement it.
    if (process.onSessionEnd) {
      this._disposables.add(process.onSessionEnd(this._handleSessionEnd.bind(this)));
    }

    process.getWebsocketAddress().then(
      socketAddr => {
        endTimerTracking();
        this._dispatcher.dispatch({
          actionType: Constants.Actions.SET_PROCESS_SOCKET,
          data: socketAddr,
        });
      },
      err => {
        failTimerTracking(err);
        track(AnalyticsEvents.DEBUGGER_START_FAIL, {});
        this.setError('Failed to start debugger process: ' + err);
        this.killDebugger();
      }
    );
  }

  _handleSessionEnd(): void {
    this.killDebugger();
  }

  killDebugger() {
    track(AnalyticsEvents.DEBUGGER_STOP);
    endTimerTracking();
    const process = this._store.getDebuggerProcess();
    if (process) {
      process.dispose();
      this._dispatcher.dispatch({
        actionType: Constants.Actions.SET_DEBUGGER_PROCESS,
        data: null,
      });
    }
    this._dispatcher.dispatch({
      actionType: Constants.Actions.SET_PROCESS_SOCKET,
      data: null,
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
    require('nuclide-logging').getLogger().error(error);
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
}

module.exports = DebuggerActions;
