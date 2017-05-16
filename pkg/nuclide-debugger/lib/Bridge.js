'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _CommandDispatcher;

function _load_CommandDispatcher() {
  return _CommandDispatcher = _interopRequireDefault(require('./CommandDispatcher'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Bridge {

  constructor(debuggerModel) {
    this._handleIpcMessage = this._handleIpcMessage.bind(this);
    this._debuggerModel = debuggerModel;
    this._suppressBreakpointSync = false;
    this._commandDipatcher = new (_CommandDispatcher || _load_CommandDispatcher()).default();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(debuggerModel.getBreakpointStore().onUserChange(this._handleUserBreakpointChange.bind(this)));
  }
  // Contains disposable items should be disposed by
  // cleanup() method.


  dispose() {
    this.cleanup();
    this._disposables.dispose();
  }

  // Clean up any state changed after constructor.
  cleanup() {
    if (this._cleanupDisposables != null) {
      this._cleanupDisposables.dispose();
      this._cleanupDisposables = null;
    }
  }

  continue() {
    this._commandDipatcher.send('Continue');
  }

  stepOver() {
    this._commandDipatcher.send('StepOver');
  }

  stepInto() {
    this._commandDipatcher.send('StepInto');
  }

  stepOut() {
    this._commandDipatcher.send('StepOut');
  }

  runToLocation(filePath, line) {
    this._commandDipatcher.send('RunToLocation', filePath, line);
  }

  triggerAction(actionId) {
    this._commandDipatcher.send('triggerDebuggerAction', actionId);
  }

  setSelectedCallFrameIndex(callFrameIndex) {
    this._commandDipatcher.send('setSelectedCallFrameIndex', callFrameIndex);
  }

  setPauseOnException(pauseOnExceptionEnabled) {
    this._commandDipatcher.send('setPauseOnException', pauseOnExceptionEnabled);
  }

  setPauseOnCaughtException(pauseOnCaughtExceptionEnabled) {
    this._commandDipatcher.send('setPauseOnCaughtException', pauseOnCaughtExceptionEnabled);
  }

  setSingleThreadStepping(singleThreadStepping) {
    this._commandDipatcher.send('setSingleThreadStepping', singleThreadStepping);
  }

  selectThread(threadId) {
    this._commandDipatcher.send('selectThread', threadId);
  }

  sendEvaluationCommand(command, evalId, ...args) {
    this._commandDipatcher.send(command, evalId, ...args);
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

  _handleIpcMessage(stdEvent) {
    // addEventListener expects its callback to take an Event. I'm not sure how to reconcile it with
    // the type that is expected here.
    const event = stdEvent;
    switch (event.channel) {
      case 'notification':
        switch (event.args[0]) {
          case 'ready':
            if (atom.config.get('nuclide.nuclide-debugger.openDevToolsOnDebuggerStart')) {
              this.openDevTools();
            }
            this._updateDebuggerSettings();
            this._sendAllBreakpoints();
            this._syncDebuggerState();
            break;
          case 'CallFrameSelected':
            this._setSelectedCallFrameLine(event.args[1]);
            break;
          case 'OpenSourceLocation':
            this._openSourceLocation(event.args[1]);
            break;
          case 'ClearInterface':
            this._handleClearInterface();
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
        }
        break;
    }
  }

  _updateDebuggerSettings() {
    this._commandDipatcher.send('UpdateSettings', this._debuggerModel.getStore().getSettings().getSerializedData());
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
    this._debuggerModel.getActions().setDebuggerMode((_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING);
  }

  _handleLoaderBreakpointResumed() {
    this._debuggerModel.getStore().loaderBreakpointResumed();
  }

  _handleClearInterface() {
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
    if (path) {
      try {
        this._suppressBreakpointSync = true;
        this._debuggerModel.getActions().bindBreakpointIPC(path, lineNumber, condition, enabled, resolved);
      } finally {
        this._suppressBreakpointSync = false;
      }
    }
  }

  _removeBreakpoint(breakpoint) {
    const { sourceURL, lineNumber } = breakpoint;
    const path = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(sourceURL);
    // only handle real files for now.
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
    this._commandDipatcher.send(action, {
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
      this._commandDipatcher.send('SyncBreakpoints', results);
    }
  }

  renderChromeWebview(url) {
    if (this._webview == null) {
      // Cast from HTMLElement down to WebviewElement without instanceof
      // checking, as WebviewElement constructor is not exposed.
      const webview = document.createElement('webview');
      webview.src = url;
      webview.nodeintegration = true;
      webview.disablewebsecurity = true;
      webview.classList.add('native-key-bindings'); // required to pass through certain key events
      webview.classList.add('nuclide-debugger-webview');

      // The webview is actually only used for its state; it's really more of a model that just has
      // to live in the DOM. We render it into the body to keep it separate from our view, which may
      // be detached. If the webview were a child, it would cause the webview to reload when
      // reattached, and we'd lose our state.

      if (!(document.body != null)) {
        throw new Error('Invariant violation: "document.body != null"');
      }

      document.body.appendChild(webview);

      this._setWebviewElement(webview);
    } else if (url !== this._webviewUrl) {
      this._webview.src = url;
    }
    this._webviewUrl = url;
  }

  // Exposed for tests
  _setWebviewElement(webview) {
    this._webview = webview;
    this._commandDipatcher.setupChromeChannel(webview);

    if (!(this._cleanupDisposables == null)) {
      throw new Error('Invariant violation: "this._cleanupDisposables == null"');
    }

    this._cleanupDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(_rxjsBundlesRxMinJs.Observable.fromEvent(webview, 'ipc-message').subscribe(this._handleIpcMessage), () => {
      webview.remove();
      this._webview = null;
      this._webviewUrl = null;
    });
  }

  setupNuclideChannel(debuggerInstance) {
    return this._commandDipatcher.setupNuclideChannel(debuggerInstance);
  }

  openDevTools() {
    if (this._webview == null) {
      return;
    }
    this._webview.openDevTools();
  }
}
exports.default = Bridge; /**
                           * Copyright (c) 2015-present, Facebook, Inc.
                           * All rights reserved.
                           *
                           * This source code is licensed under the license found in the LICENSE file in
                           * the root directory of this source tree.
                           *
                           * 
                           * @format
                           */