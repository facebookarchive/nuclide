'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const INJECTED_CSS = [
/* Force the inspector to scroll vertically on Atom ≥ 1.4.0 */
'body > .root-view {overflow-y: scroll;}',
/* Force the contents of the mini console (on the bottom) to scroll vertically */
'.insertion-point-sidebar#drawer-contents {overflow-y: auto;}',
/* imitate chrome table styles for threads window */
`
  .nuclide-chrome-debugger-data-grid table {
    border-spacing: 0;
  }

  .nuclide-chrome-debugger-data-grid thead {
    background-color: #eee;
  }

  .nuclide-chrome-debugger-data-grid thead td {
    border-bottom: 1px solid #aaa;
  }

  .nuclide-chrome-debugger-data-grid tbody tr:nth-child(2n+1) {
    background: aliceblue;
  }

  .nuclide-chrome-debugger-data-grid td {
    border-left: 1px solid #aaa;
    padding: 2px 4px;
  }

  .nuclide-chrome-debugger-data-grid td:first-child {
    border-left: none;
  }
  `].join('');

class Bridge {
  // Contains disposable items should be disposed by
  // cleanup() method.
  constructor(debuggerModel) {
    this._handleIpcMessage = this._handleIpcMessage.bind(this);
    this._debuggerModel = debuggerModel;
    this._suppressBreakpointSync = false;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(debuggerModel.getBreakpointStore().onUserChange(this._handleUserBreakpointChange.bind(this)));
  }

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
    if (this._webview) {
      this._webview.send('command', 'Continue');
    }
  }

  stepOver() {
    if (this._webview) {
      this._webview.send('command', 'StepOver');
    }
  }

  stepInto() {
    if (this._webview) {
      this._webview.send('command', 'StepInto');
    }
  }

  stepOut() {
    if (this._webview) {
      this._webview.send('command', 'StepOut');
    }
  }

  runToLocation(filePath, line) {
    if (this._webview) {
      this._webview.send('command', 'RunToLocation', filePath, line);
    }
  }

  triggerAction(actionId) {
    if (this._webview) {
      this._webview.send('command', 'triggerDebuggerAction', actionId);
    }
  }

  setSelectedCallFrameIndex(callFrameIndex) {
    if (this._webview != null) {
      this._webview.send('command', 'setSelectedCallFrameIndex', callFrameIndex);
    }
  }

  setPauseOnException(pauseOnExceptionEnabled) {
    if (this._webview) {
      this._webview.send('command', 'setPauseOnException', pauseOnExceptionEnabled);
    }
  }

  setPauseOnCaughtException(pauseOnCaughtExceptionEnabled) {
    if (this._webview) {
      this._webview.send('command', 'setPauseOnCaughtException', pauseOnCaughtExceptionEnabled);
    }
  }

  setSingleThreadStepping(singleThreadStepping) {
    if (this._webview) {
      this._webview.send('command', 'setSingleThreadStepping', singleThreadStepping);
    }
  }

  selectThread(threadId) {
    if (this._webview) {
      this._webview.send('command', 'selectThread', threadId);
    }
  }

  sendEvaluationCommand(command, evalId, ...args) {
    if (this._webview != null) {
      this._webview.send('command', command, evalId, ...args);
    }
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
            this._updateDebuggerSettings();
            this._sendAllBreakpoints();
            this._injectCSS();
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
    const webview = this._webview;
    if (webview != null) {
      webview.send('command', 'UpdateSettings', this._debuggerModel.getStore().getSettings().getSerializedData());
    }
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
    const webview = this._webview;
    if (webview != null) {
      const { action, breakpoint } = params;
      webview.send('command', action, {
        sourceURL: (_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(breakpoint.path),
        lineNumber: breakpoint.line,
        condition: breakpoint.condition,
        enabled: breakpoint.enabled
      });
    }
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
    const webview = this._webview;
    if (webview && !this._suppressBreakpointSync) {
      const results = [];
      this._debuggerModel.getBreakpointStore().getAllBreakpoints().forEach(breakpoint => {
        results.push({
          sourceURL: (_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(breakpoint.path),
          lineNumber: breakpoint.line,
          condition: breakpoint.condition,
          enabled: breakpoint.enabled
        });
      });
      webview.send('command', 'SyncBreakpoints', results);
    }
  }

  _injectCSS() {
    if (this._webview != null) {
      this._webview.insertCSS(INJECTED_CSS);
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

    if (!(this._cleanupDisposables == null)) {
      throw new Error('Invariant violation: "this._cleanupDisposables == null"');
    }

    this._cleanupDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(_rxjsBundlesRxMinJs.Observable.fromEvent(webview, 'ipc-message').subscribe(this._handleIpcMessage), () => {
      webview.remove();
      this._webview = null;
      this._webviewUrl = null;
    });
  }

  openDevTools() {
    if (this._webview == null) {
      return;
    }
    this._webview.openDevTools();
  }
}
exports.default = Bridge;