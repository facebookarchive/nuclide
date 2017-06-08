'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Utils;

function _load_Utils() {
  return _Utils = require('./Utils');
}

/**
 * Bridge between Nuclide IPC and RPC execution control protocols.
 */
class ExecutionManager {

  constructor(debuggerDispatcher) {
    this._executionEvent$ = new _rxjsBundlesRxMinJs.Subject();
    this._debuggerDispatcher = debuggerDispatcher;
  }

  getEventObservable() {
    return this._executionEvent$.asObservable();
  }

  resume() {
    this._debuggerDispatcher.resume();
  }

  pause() {
    this._debuggerDispatcher.pause();
  }

  stepOver() {
    this._debuggerDispatcher.stepOver();
  }

  stepInto() {
    this._debuggerDispatcher.stepInto();
  }

  stepOut() {
    this._debuggerDispatcher.stepOut();
  }

  runToLocation(fileUri, line) {
    // Chrome's continueToLocation implementation incorrect
    // uses source uri instead of scriptId as the location ScriptId
    // field, we mirrow the same behavior for compatibility reason.
    const scriptId = this._debuggerDispatcher.getSourceUriFromUri(fileUri);
    if (scriptId != null) {
      this._debuggerDispatcher.continueToLocation({
        scriptId,
        lineNumber: line,
        columnNumber: 0
      });
    } else {
      (0, (_Utils || _load_Utils()).reportError)(`Cannot find resolve location for file: ${fileUri}`);
    }
  }

  continueFromLoaderBreakpoint() {
    this._debuggerDispatcher.resume();
    this._raiseIPCEvent('LoaderBreakpointResumed');
  }

  handleDebuggerPaused(params) {
    this._raiseIPCEvent('NonLoaderDebuggerPaused', {
      stopThreadId: params.stopThreadId,
      threadSwitchNotification: null });
  }

  handleDebuggeeResumed() {
    this._raiseIPCEvent('DebuggerResumed');
  }

  // Not a real IPC event, but simulate the chrome IPC events/responses
  // across bridge boundary.
  _raiseIPCEvent(...args) {
    this._executionEvent$.next(args);
  }
}
exports.default = ExecutionManager; /**
                                     * Copyright (c) 2015-present, Facebook, Inc.
                                     * All rights reserved.
                                     *
                                     * This source code is licensed under the license found in the LICENSE file in
                                     * the root directory of this source tree.
                                     *
                                     * 
                                     * @format
                                     */