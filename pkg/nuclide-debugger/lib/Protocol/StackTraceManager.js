'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * Bridge between Nuclide IPC and RPC stack trace protocols.
 */
class StackTraceManager {

  constructor(debuggerDispatcher) {
    this._stackTraceEvent$ = new _rxjsBundlesRxMinJs.Subject();
    this._currentCallFrameIndex = 0;
    this._currentThreadFrames = [];
    this._debuggerDispatcher = debuggerDispatcher;
  }

  getEventObservable() {
    return this._stackTraceEvent$.asObservable();
  }

  setSelectedCallFrameIndex(index) {
    if (this.isEmpty()) {
      return;
    }

    if (!(index >= 0 && index < this._currentThreadFrames.length)) {
      throw new Error('Invariant violation: "index >= 0 && index < this._currentThreadFrames.length"');
    }

    this._currentCallFrameIndex = index;
    const currentFrame = this.getCurrentFrame();

    if (!(currentFrame != null)) {
      throw new Error('Invariant violation: "currentFrame != null"');
    }

    this._raiseIPCEvent('CallFrameSelected', {
      sourceURL: this._debuggerDispatcher.getFileUriFromScriptId(currentFrame.location.scriptId),
      lineNumber: currentFrame.location.lineNumber
    });
  }

  isEmpty() {
    return this._currentThreadFrames.length === 0;
  }

  getCurrentFrame() {
    if (this.isEmpty()) {
      return null;
    }

    if (!(this._currentCallFrameIndex < this._currentThreadFrames.length)) {
      throw new Error('Invariant violation: "this._currentCallFrameIndex < this._currentThreadFrames.length"');
    }

    return this._currentThreadFrames[this._currentCallFrameIndex];
  }

  /**
   * Refresh with new list of stack frames.
   * Like, user switches to a new thread.
   */
  refreshStack(stackFrames) {
    this._currentThreadFrames = stackFrames;
    const callstack = this._parseCallstack();
    this._raiseIPCEvent('CallstackUpdate', callstack);
    this._selectFirstFrameWithSource();
  }

  _selectFirstFrameWithSource() {
    const frameWithSourceIndex = this._currentThreadFrames.findIndex(frame => frame.hasSource !== false);
    // Default to first frame if can't find any frame with source.
    this.setSelectedCallFrameIndex(frameWithSourceIndex !== -1 ? frameWithSourceIndex : 0);
  }

  _parseCallstack() {
    return this._currentThreadFrames.map(frame => {
      return {
        name: frame.functionName, // TODO: format
        location: {
          path: this._debuggerDispatcher.getFileUriFromScriptId(frame.location.scriptId),
          line: frame.location.lineNumber,
          column: frame.location.columnNumber,
          hasSource: frame.hasSource
        }
      };
    });
  }

  clearPauseStates() {
    this._currentCallFrameIndex = 0;
    this._currentThreadFrames = [];
  }

  // Not a real IPC event, but simulate the chrome IPC events/responses
  // across bridge boundary.
  _raiseIPCEvent(...args) {
    this._stackTraceEvent$.next(args);
  }
}
exports.default = StackTraceManager; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */