'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _EventReporter;

function _load_EventReporter() {
  return _EventReporter = require('./EventReporter');
}

/**
 * Bridge between Nuclide IPC and RPC threading protocols.
 */
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

class ThreadManager {

  constructor(debuggerDispatcher) {
    this._debuggerDispatcher = debuggerDispatcher;
    this._threadEvent$ = new _rxjsBundlesRxMinJs.Subject();
  }

  selectThread(threadId) {
    this._debuggerDispatcher.selectThread(Number(threadId));
  }

  getThreadStack(threadId) {
    return new Promise((resolve, reject) => {
      function callback(error, response) {
        if (error != null) {
          (0, (_EventReporter || _load_EventReporter()).reportError)(`getThreadStack failed with ${JSON.stringify(error)}`);
          reject(error);
        }
        resolve(response.callFrames);
      }
      this._debuggerDispatcher.getThreadStack(Number(threadId), callback.bind(this));
    });
  }

  raiseThreadsUpdated(params) {
    this._raiseIPCEvent('ThreadsUpdate', params);
  }

  raiseThreadUpdated(params) {
    this._raiseIPCEvent('ThreadUpdate', params.thread);
  }

  getEventObservable() {
    return this._threadEvent$.asObservable();
  }

  // Not a real IPC event, but simulate the chrome IPC events/responses
  // across bridge boundary.
  _raiseIPCEvent(...args) {
    this._threadEvent$.next(args);
  }
}
exports.default = ThreadManager;