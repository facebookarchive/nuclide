'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _CommandDispatcher;

function _load_CommandDispatcher() {
  return _CommandDispatcher = _interopRequireDefault(require('./CommandDispatcher'));
}

var _ChromeActionRegistryActions;

function _load_ChromeActionRegistryActions() {
  return _ChromeActionRegistryActions = _interopRequireDefault(require('./ChromeActionRegistryActions'));
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-debugger');

class Bridge {
  // Contains disposable items that are only available during
  // debug mode.
  constructor(debuggerModel) {
    this._handleIpcMessage = event => {
      switch (event.channel) {
        case 'notification':
          switch (event.args[0]) {
            case 'ready':
              if (atom.config.get('nuclide.nuclide-debugger.openDevToolsOnDebuggerStart')) {
                this.openDevTools();
              }
              this._sendAllBreakpoints();
              this._syncDebuggerState();
              break;
            case 'CallFrameSelected':
              this._setSelectedCallFrameLine(event.args[1]);
              break;
            case 'OpenSourceLocation':
              this._openSourceLocation(event.args[1]);
              break;
            case 'DebuggerResumed':
              this._handleDebuggerResumed();
              break;
            case 'LoaderBreakpointResumed':
              this._handleLoaderBreakpointResumed();
              break;
            case 'BreakpointAdded':
              // BreakpointAdded from chrome side is actually
              // binding the breakpoint.
              this._bindBreakpoint(event.args[1], event.args[1].resolved === true);
              break;
            case 'BreakpointRemoved':
              this._removeBreakpoint(event.args[1]);
              break;
            case 'BreakpointHitCountChanged':
              this._handleBreakpointHitCountChanged(event.args[1]);
              break;
            case 'NonLoaderDebuggerPaused':
              this._handleDebuggerPaused(event.args[1]);
              break;
            case 'ExpressionEvaluationResponse':
              this._handleExpressionEvaluationResponse(event.args[1]);
              break;
            case 'GetPropertiesResponse':
              this._handleGetPropertiesResponse(event.args[1]);
              break;
            case 'CallstackUpdate':
              this._handleCallstackUpdate(event.args[1]);
              break;
            case 'ScopesUpdate':
              this._handleScopesUpdate(event.args[1]);
              break;
            case 'ThreadsUpdate':
              this._handleThreadsUpdate(event.args[1]);
              break;
            case 'ThreadUpdate':
              this._handleThreadUpdate(event.args[1]);
              break;
            case 'ReportError':
              this._reportEngineError(event.args[1]);
              break;
            case 'ReportWarning':
              this._reportEngineWarning(event.args[1]);
              break;
          }
          break;
      }
    };

    this._debuggerModel = debuggerModel;
    this._suppressBreakpointSync = false;
    this._commandDispatcher = new (_CommandDispatcher || _load_CommandDispatcher()).default(() => debuggerModel.getStore().getIsReadonlyTarget());
    this._consoleEvent$ = new _rxjsBundlesRxMinJs.Subject();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(debuggerModel.getBreakpointStore().onUserChange(this._handleUserBreakpointChange.bind(this)));
    const subscription = (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).registerConsoleLogging)('Debugger', this._consoleEvent$);
    if (subscription != null) {
      this._disposables.add(subscription);
    }
  }

  dispose() {
    this.leaveDebugMode();
    this._disposables.dispose();
  }

  enterDebugMode() {
    if (this._debugModeDisposables == null) {
      this._debugModeDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    }
  }

  // Clean up any debug mode states.
  leaveDebugMode() {
    if (this._debugModeDisposables != null) {
      this._debugModeDisposables.dispose();
      this._debugModeDisposables = null;
    }
  }

  continue() {
    this._clearInterfaceDelayed();
    this._commandDispatcher.send('Continue');
  }

  pause() {
    this._commandDispatcher.send('Pause');
  }

  stepOver() {
    this._clearInterfaceDelayed();
    this._commandDispatcher.send('StepOver');
  }

  stepInto() {
    this._clearInterfaceDelayed();
    this._commandDispatcher.send('StepInto');
  }

  stepOut() {
    this._clearInterfaceDelayed();
    this._commandDispatcher.send('StepOut');
  }

  runToLocation(filePath, line) {
    this._clearInterfaceDelayed();
    this._commandDispatcher.send('RunToLocation', filePath, line);
  }

  triggerAction(actionId) {
    this._clearInterfaceDelayed();
    switch (actionId) {
      case (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.RUN:
        this.continue();
        break;
      case (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.PAUSE:
        this.pause();
        break;
      case (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.STEP_INTO:
        this.stepInto();
        break;
      case (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.STEP_OVER:
        this.stepOver();
        break;
      case (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.STEP_OUT:
        this.stepOut();
        break;
    }
  }

  setSelectedCallFrameIndex(callFrameIndex) {
    this._commandDispatcher.send('setSelectedCallFrameIndex', callFrameIndex);
  }

  setPauseOnException(pauseOnExceptionEnabled) {
    this._commandDispatcher.send('setPauseOnException', pauseOnExceptionEnabled);
  }

  setPauseOnCaughtException(pauseOnCaughtExceptionEnabled) {
    this._commandDispatcher.send('setPauseOnCaughtException', pauseOnCaughtExceptionEnabled);
  }

  setSingleThreadStepping(singleThreadStepping) {
    this._commandDispatcher.send('setSingleThreadStepping', singleThreadStepping);
  }

  selectThread(threadId) {
    this._commandDispatcher.send('selectThread', threadId);
    const threadNo = parseInt(threadId, 10);
    if (!isNaN(threadNo)) {
      this._debuggerModel.getActions().updateSelectedThread(threadNo);
    }
  }

  sendEvaluationCommand(command, evalId, ...args) {
    this._commandDispatcher.send(command, evalId, ...args);
  }

  _handleExpressionEvaluationResponse(response) {
    this._debuggerModel.getActions().receiveExpressionEvaluationResponse(response.id, response);
  }

  _handleGetPropertiesResponse(response) {
    this._debuggerModel.getActions().receiveGetPropertiesResponse(response.id, response);
  }

  _handleCallstackUpdate(callstack) {
    this._debuggerModel.getActions().updateCallstack(callstack);
  }

  _handleScopesUpdate(scopeSections) {
    this._debuggerModel.getActions().updateScopes(scopeSections);
  }

  _sendConsoleMessage(level, text) {
    this._consoleEvent$.next(JSON.stringify({
      level,
      text
    }));
  }

  _reportEngineError(message) {
    const outputMessage = `Debugger engine reports error: ${message}`;
    logger.error(outputMessage);
  }

  _reportEngineWarning(message) {
    const outputMessage = `Debugger engine reports warning: ${message}`;
    logger.warn(outputMessage);
  }

  _updateDebuggerSettings() {
    this._commandDispatcher.send('UpdateSettings', this._debuggerModel.getStore().getSettings().getSerializedData());
  }

  _syncDebuggerState() {
    const store = this._debuggerModel.getStore();
    this.setPauseOnException(store.getTogglePauseOnException());
    this.setPauseOnCaughtException(store.getTogglePauseOnCaughtException());
    this.setSingleThreadStepping(store.getEnableSingleThreadStepping());
  }

  _handleDebuggerPaused(options) {
    this._debuggerModel.getActions().setDebuggerMode((_DebuggerStore || _load_DebuggerStore()).DebuggerMode.PAUSED);
    if (options != null) {
      if (options.stopThreadId != null) {
        this._handleStopThreadUpdate(options.stopThreadId);
      }
      this._handleStopThreadSwitch(options.threadSwitchNotification);
    }
  }

  _handleDebuggerResumed() {
    this._clearInterface();
    this._debuggerModel.getActions().setDebuggerMode((_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING);
  }

  _handleLoaderBreakpointResumed() {
    this._debuggerModel.getStore().loaderBreakpointResumed();
  }

  _clearInterfaceDelayed() {
    // Prevent dispatcher re-entrance error.
    process.nextTick(this._clearInterface.bind(this));
  }

  _clearInterface() {
    this._debuggerModel.getActions().clearInterface();
  }

  _setSelectedCallFrameLine(options) {
    this._debuggerModel.getActions().setSelectedCallFrameLine(options);
  }

  _openSourceLocation(options) {
    if (options == null) {
      return;
    }
    this._debuggerModel.getActions().openSourceLocation(options.sourceURL, options.lineNumber);
  }

  _handleStopThreadSwitch(options) {
    if (options == null) {
      return;
    }
    this._debuggerModel.getActions().notifyThreadSwitch(options.sourceURL, options.lineNumber, options.message);
  }

  _bindBreakpoint(breakpoint, resolved) {
    const { sourceURL, lineNumber, condition, enabled } = breakpoint;
    const path = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(sourceURL);
    // only handle real files for now.
    // flowlint-next-line sketchy-null-string:off
    if (path) {
      try {
        this._suppressBreakpointSync = true;
        this._debuggerModel.getActions().bindBreakpointIPC(path, lineNumber, condition, enabled, resolved);
      } finally {
        this._suppressBreakpointSync = false;
      }
    }
  }

  _handleBreakpointHitCountChanged(params) {
    const { breakpoint, hitCount } = params;
    const { sourceURL, lineNumber } = breakpoint;
    const path = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(sourceURL);
    // flowlint-next-line sketchy-null-string:off
    if (path) {
      this._debuggerModel.getActions().updateBreakpointHitCount(path, lineNumber, hitCount);
    }
  }

  _removeBreakpoint(breakpoint) {
    const { sourceURL, lineNumber } = breakpoint;
    const path = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(sourceURL);
    // only handle real files for now.
    // flowlint-next-line sketchy-null-string:off
    if (path) {
      try {
        this._suppressBreakpointSync = true;
        this._debuggerModel.getActions().deleteBreakpointIPC(path, lineNumber);
      } finally {
        this._suppressBreakpointSync = false;
      }
    }
  }

  _handleUserBreakpointChange(params) {
    const { action, breakpoint } = params;
    this._commandDispatcher.send(action, {
      sourceURL: (_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(breakpoint.path),
      lineNumber: breakpoint.line,
      condition: breakpoint.condition,
      enabled: breakpoint.enabled
    });
  }

  _handleThreadsUpdate(threadData) {
    this._debuggerModel.getActions().updateThreads(threadData);
  }

  _handleThreadUpdate(thread) {
    this._debuggerModel.getActions().updateThread(thread);
  }

  _handleStopThreadUpdate(id) {
    this._debuggerModel.getActions().updateStopThread(id);
  }

  _sendAllBreakpoints() {
    // Send an array of file/line objects.
    if (!this._suppressBreakpointSync) {
      const results = [];
      this._debuggerModel.getBreakpointStore().getAllBreakpoints().forEach(breakpoint => {
        results.push({
          sourceURL: (_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(breakpoint.path),
          lineNumber: breakpoint.line,
          condition: breakpoint.condition,
          enabled: breakpoint.enabled
        });
      });
      this._commandDispatcher.send('SyncBreakpoints', results);
    }
  }

  enableEventsListening() {
    const subscriptions = this._debugModeDisposables;

    if (!(subscriptions != null)) {
      throw new Error('Invariant violation: "subscriptions != null"');
    }

    subscriptions.add(this._commandDispatcher.getEventObservable().subscribe(this._handleIpcMessage));
    this._signalNewChannelReadyIfNeeded();
    subscriptions.add(() => this._commandDispatcher.cleanupSessionState());
  }

  // This will be unnecessary after we remove 'ready' event.
  _signalNewChannelReadyIfNeeded() {
    if (this._commandDispatcher.isNewChannel()) {
      this._handleIpcMessage({
        channel: 'notification',
        args: ['ready']
      });
    }
  }

  setupChromeChannel(url) {
    this._commandDispatcher.setupChromeChannel(url);
  }

  setupNuclideChannel(debuggerInstance) {
    return this._commandDispatcher.setupNuclideChannel(debuggerInstance);
  }

  openDevTools() {
    this._commandDispatcher.openDevTools();
  }
}
exports.default = Bridge;