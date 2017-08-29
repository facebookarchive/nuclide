'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _BreakpointManager;

function _load_BreakpointManager() {
  return _BreakpointManager = _interopRequireDefault(require('./BreakpointManager'));
}

var _StackTraceManager;

function _load_StackTraceManager() {
  return _StackTraceManager = _interopRequireDefault(require('./StackTraceManager'));
}

var _ExecutionManager;

function _load_ExecutionManager() {
  return _ExecutionManager = _interopRequireDefault(require('./ExecutionManager'));
}

var _ThreadManager;

function _load_ThreadManager() {
  return _ThreadManager = _interopRequireDefault(require('./ThreadManager'));
}

var _ExpressionEvaluationManager;

function _load_ExpressionEvaluationManager() {
  return _ExpressionEvaluationManager = _interopRequireDefault(require('./ExpressionEvaluationManager'));
}

var _DebuggerSettingsManager;

function _load_DebuggerSettingsManager() {
  return _DebuggerSettingsManager = _interopRequireDefault(require('./DebuggerSettingsManager'));
}

var _EventReporter;

function _load_EventReporter() {
  return _EventReporter = _interopRequireWildcard(require('./EventReporter'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BridgeAdapter {

  constructor(dispatchers, getIsReadonlyTarget) {
    this._handleDebugEvent = event => {
      switch (event.method) {
        case 'Debugger.loaderBreakpoint':
          {
            this._engineCreated = true;
            this._debuggerSettingsManager.syncToEngine();
            this._breakpointManager.syncInitialBreakpointsToEngine();
            this._breakpointManager.syncPauseExceptionState();
            // This should be the last method called.
            if (!this._executionManager.continueFromLoaderBreakpoint()) {
              // If this target was not resumed from the loader breakpoint, handle
              const params = event.params;
              this._handlePausedEvent(params);
            }
            break;
          }
        case 'Debugger.breakpointResolved':
          {
            const params = event.params;
            this._breakpointManager.handleBreakpointResolved(params);
            break;
          }
        case 'Debugger.breakpointHitCountChanged':
          {
            const params = event.params;
            this._breakpointManager.handleBreakpointHitCountChanged(params);
            break;
          }
        case 'Debugger.resumed':
          this._pausedMode = false;
          this._executionManager.handleDebuggeeResumed();
          break;
        case 'Debugger.paused':
          {
            const params = event.params;
            this._handlePausedEvent(params);
            break;
          }
        case 'Debugger.threadsUpdated':
          {
            const params = event.params;
            this._threadManager.raiseThreadsUpdated(params);
            break;
          }
        case 'Debugger.threadUpdated':
          {
            const params = event.params;
            this._threadManager.raiseThreadUpdated(params);
            break;
          }
        default:
          break;
      }
    };

    const { debuggerDispatcher, runtimeDispatcher } = dispatchers;
    this._debuggerDispatcher = debuggerDispatcher;
    this._runtimeDispatcher = runtimeDispatcher;
    this._engineCreated = false;
    this._pausedMode = false;
    this._breakpointManager = new (_BreakpointManager || _load_BreakpointManager()).default(debuggerDispatcher);
    this._stackTraceManager = new (_StackTraceManager || _load_StackTraceManager()).default(debuggerDispatcher);
    this._executionManager = new (_ExecutionManager || _load_ExecutionManager()).default(debuggerDispatcher, getIsReadonlyTarget);
    this._threadManager = new (_ThreadManager || _load_ThreadManager()).default(debuggerDispatcher);
    this._debuggerSettingsManager = new (_DebuggerSettingsManager || _load_DebuggerSettingsManager()).default(debuggerDispatcher);
    this._expressionEvaluationManager = new (_ExpressionEvaluationManager || _load_ExpressionEvaluationManager()).default(debuggerDispatcher, runtimeDispatcher);
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(debuggerDispatcher.getEventObservable().subscribe(this._handleDebugEvent));
    this._getIsReadonlyTarget = getIsReadonlyTarget;
  }

  enable() {
    this._debuggerDispatcher.enable();
    this._runtimeDispatcher.enable();
  }

  resume() {
    if (!this._getIsReadonlyTarget()) {
      this._clearStates();
      this._executionManager.resume();
    }
  }

  pause() {
    if (!this._getIsReadonlyTarget()) {
      this._clearStates();
      this._executionManager.pause();
    }
  }

  stepOver() {
    if (!this._getIsReadonlyTarget()) {
      this._clearStates();
      this._executionManager.stepOver();
    }
  }

  stepInto() {
    if (!this._getIsReadonlyTarget()) {
      this._clearStates();
      this._executionManager.stepInto();
    }
  }

  stepOut() {
    if (!this._getIsReadonlyTarget()) {
      this._clearStates();
      this._executionManager.stepOut();
    }
  }

  _clearStates() {
    this._pausedMode = false;
    this._expressionEvaluationManager.clearPauseStates();
    this._stackTraceManager.clearPauseStates();
  }

  runToLocation(fileUri, line) {
    if (!this._getIsReadonlyTarget()) {
      this._clearStates();
      this._executionManager.runToLocation(fileUri, line);
    }
  }

  setSelectedCallFrameIndex(index) {
    this._stackTraceManager.setSelectedCallFrameIndex(index);
    this._updateCurrentScopes();
  }

  _updateCurrentScopes() {
    const currentFrame = this._stackTraceManager.getCurrentFrame();
    if (currentFrame != null) {
      this._expressionEvaluationManager.updateCurrentFrameScope(currentFrame.scopeChain);
    }
  }

  setInitialBreakpoints(breakpoints) {
    this._breakpointManager.setInitialBreakpoints(breakpoints);
  }

  setFilelineBreakpoint(breakpoint) {
    this._breakpointManager.setFilelineBreakpoint(breakpoint);
  }

  removeBreakpoint(breakpoint) {
    this._breakpointManager.removeBreakpoint(breakpoint);
  }

  updateBreakpoint(breakpoint) {
    this._breakpointManager.updateBreakpoint(breakpoint);
  }

  evaluateExpression(transactionId, expression, objectGroup) {
    if (this._pausedMode) {
      const currentFrame = this._stackTraceManager.getCurrentFrame();
      if (currentFrame != null) {
        const callFrameId = currentFrame.callFrameId;
        this._expressionEvaluationManager.evaluateOnCallFrame(transactionId, callFrameId, expression, objectGroup);
      }
    } else {
      this._expressionEvaluationManager.runtimeEvaluate(transactionId, expression, objectGroup);
    }
  }

  getProperties(id, objectId) {
    this._expressionEvaluationManager.getProperties(id, objectId);
  }

  selectThread(threadId) {
    this._threadManager.selectThread(threadId);
    this._threadManager.getThreadStack(threadId).then(stackFrames => {
      this._stackTraceManager.refreshStack(stackFrames);
      this._updateCurrentScopes();
    });
  }

  setSingleThreadStepping(enable) {
    this._debuggerSettingsManager.setSingleThreadStepping(enable);
    if (this._engineCreated) {
      this._debuggerSettingsManager.syncToEngine();
    }
  }

  setPauseOnException(enable) {
    this._breakpointManager.setPauseExceptionState({
      state: enable ? 'uncaught' : 'none'
    });
    if (this._engineCreated) {
      this._breakpointManager.syncPauseExceptionState();
    }
  }

  setPauseOnCaughtException(enable) {
    if (enable) {
      this._breakpointManager.setPauseExceptionState({
        state: 'all'
      });
    }
    if (this._engineCreated) {
      this._breakpointManager.syncPauseExceptionState();
    }
  }

  _handlePausedEvent(params) {
    this._pausedMode = true;
    this._stackTraceManager.refreshStack(params.callFrames);
    const currentFrame = this._stackTraceManager.getCurrentFrame();
    this._executionManager.raiseDebuggerPause(params, currentFrame ? currentFrame.location : null);
    this._updateCurrentScopes();
  }

  getEventObservable() {
    // TODO: hook other debug events when it's ready.
    const breakpointManager = this._breakpointManager;
    const stackTraceManager = this._stackTraceManager;
    const executionManager = this._executionManager;
    const threadManager = this._threadManager;
    const expessionEvaluatorManager = this._expressionEvaluationManager;
    return breakpointManager.getEventObservable().merge(stackTraceManager.getEventObservable()).merge(executionManager.getEventObservable()).merge(threadManager.getEventObservable()).merge(expessionEvaluatorManager.getEventObservable()).merge((_EventReporter || _load_EventReporter()).getEventObservable()).map(args => {
      return { channel: 'notification', args };
    });
  }

  dispose() {
    this._subscriptions.dispose();
  }
}
exports.default = BridgeAdapter; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  * @format
                                  */