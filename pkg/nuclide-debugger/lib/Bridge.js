var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _DebuggerStore2;

function _DebuggerStore() {
  return _DebuggerStore2 = require('./DebuggerStore');
}

var INJECTED_CSS = [
/* Force the inspector to scroll vertically on Atom ≥ 1.4.0 */
'body > .root-view {overflow-y: scroll;}',
/* Force the contents of the mini console (on the bottom) to scroll vertically */
'.insertion-point-sidebar#drawer-contents {overflow-y: auto;}',
/* imitate chrome table styles for threads window */
'\n  .nuclide-chrome-debugger-data-grid table {\n    border-spacing: 0;\n  }\n\n  .nuclide-chrome-debugger-data-grid thead {\n    background-color: #eee;\n  }\n\n  .nuclide-chrome-debugger-data-grid thead td {\n    border-bottom: 1px solid #aaa;\n  }\n\n  .nuclide-chrome-debugger-data-grid tbody tr:nth-child(2n+1) {\n    background: aliceblue;\n  }\n\n  .nuclide-chrome-debugger-data-grid td {\n    border-left: 1px solid #aaa;\n    padding: 2px 4px;\n  }\n\n  .nuclide-chrome-debugger-data-grid td:first-child {\n    border-left: none;\n  }\n  '].join('');

var Bridge = (function () {
  function Bridge(debuggerModel) {
    _classCallCheck(this, Bridge);

    this._debuggerModel = debuggerModel;
    this._cleanupDisposables = new (_atom2 || _atom()).CompositeDisposable();
    this._webview = null;
    this._suppressBreakpointSync = false;
    this._disposables = new (_atom2 || _atom()).CompositeDisposable(debuggerModel.getBreakpointStore().onUserChange(this._handleUserBreakpointChange.bind(this)));
  }

  _createClass(Bridge, [{
    key: 'setWebviewElement',
    value: function setWebviewElement(webview) {
      this._webview = webview;
      var boundHandler = this._handleIpcMessage.bind(this);
      webview.addEventListener('ipc-message', boundHandler);
      this._cleanupDisposables.add(new (_atom2 || _atom()).Disposable(function () {
        return webview.removeEventListener('ipc-message', boundHandler);
      }));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.cleanup();
      this._disposables.dispose();
    }

    // Clean up any state changed after constructor.
  }, {
    key: 'cleanup',
    value: function cleanup() {
      var _this = this;

      this._cleanupDisposables.dispose();
      this._webview = null;
      // Poor man's `waitFor` to prevent nested dispatch. Actual `waitsFor` requires passing around
      // dispatch tokens between unrelated stores, which is quite cumbersome.
      // TODO @jxg move to redux to eliminate this problem altogether.
      setTimeout(function () {
        _this._debuggerModel.getActions().clearInterface();
      });
    }
  }, {
    key: 'continue',
    value: function _continue() {
      if (this._webview) {
        this._webview.send('command', 'Continue');
      }
    }
  }, {
    key: 'stepOver',
    value: function stepOver() {
      if (this._webview) {
        this._webview.send('command', 'StepOver');
      }
    }
  }, {
    key: 'stepInto',
    value: function stepInto() {
      if (this._webview) {
        this._webview.send('command', 'StepInto');
      }
    }
  }, {
    key: 'stepOut',
    value: function stepOut() {
      if (this._webview) {
        this._webview.send('command', 'StepOut');
      }
    }
  }, {
    key: 'triggerAction',
    value: function triggerAction(actionId) {
      if (this._webview) {
        this._webview.send('command', 'triggerDebuggerAction', actionId);
      }
    }
  }, {
    key: 'setSelectedCallFrameIndex',
    value: function setSelectedCallFrameIndex(callFrameIndex) {
      if (this._webview != null) {
        this._webview.send('command', 'setSelectedCallFrameIndex', callFrameIndex);
      }
    }
  }, {
    key: 'setPauseOnException',
    value: function setPauseOnException(pauseOnExceptionEnabled) {
      if (this._webview) {
        this._webview.send('command', 'setPauseOnException', pauseOnExceptionEnabled);
      }
    }
  }, {
    key: 'setPauseOnCaughtException',
    value: function setPauseOnCaughtException(pauseOnCaughtExceptionEnabled) {
      if (this._webview) {
        this._webview.send('command', 'setPauseOnCaughtException', pauseOnCaughtExceptionEnabled);
      }
    }
  }, {
    key: 'setSingleThreadStepping',
    value: function setSingleThreadStepping(singleThreadStepping) {
      if (this._webview) {
        this._webview.send('command', 'setSingleThreadStepping', singleThreadStepping);
      }
    }
  }, {
    key: 'selectThread',
    value: function selectThread(threadId) {
      if (this._webview) {
        this._webview.send('command', 'selectThread', threadId);
      }
    }
  }, {
    key: 'sendEvaluationCommand',
    value: function sendEvaluationCommand(command, evalId) {
      if (this._webview != null) {
        var _webview;

        for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        (_webview = this._webview).send.apply(_webview, ['command', command, evalId].concat(args));
      }
    }
  }, {
    key: '_handleExpressionEvaluationResponse',
    value: function _handleExpressionEvaluationResponse(response) {
      this._debuggerModel.getActions().receiveExpressionEvaluationResponse(response.id, response);
    }
  }, {
    key: '_handleGetPropertiesResponse',
    value: function _handleGetPropertiesResponse(response) {
      this._debuggerModel.getActions().receiveGetPropertiesResponse(response.id, response);
    }
  }, {
    key: '_handleCallstackUpdate',
    value: function _handleCallstackUpdate(callstack) {
      this._debuggerModel.getActions().updateCallstack(callstack);
    }
  }, {
    key: '_handleLocalsUpdate',
    value: function _handleLocalsUpdate(locals) {
      this._debuggerModel.getActions().updateLocals(locals);
    }
  }, {
    key: '_handleIpcMessage',
    value: function _handleIpcMessage(stdEvent) {
      // addEventListener expects its callback to take an Event. I'm not sure how to reconcile it with
      // the type that is expected here.

      var event = stdEvent;
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
              this._bindBreakpoint(event.args[1]);
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
            case 'LocalsUpdate':
              this._handleLocalsUpdate(event.args[1]);
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
  }, {
    key: '_updateDebuggerSettings',
    value: function _updateDebuggerSettings() {
      var webview = this._webview;
      if (webview != null) {
        webview.send('command', 'UpdateSettings', this._debuggerModel.getStore().getSettings().getSerializedData());
      }
    }
  }, {
    key: '_syncDebuggerState',
    value: function _syncDebuggerState() {
      var store = this._debuggerModel.getStore();
      this.setPauseOnException(store.getTogglePauseOnException());
      this.setPauseOnCaughtException(store.getTogglePauseOnCaughtException());
      this.setSingleThreadStepping(store.getEnableSingleThreadStepping());
    }
  }, {
    key: '_handleDebuggerPaused',
    value: function _handleDebuggerPaused(options) {
      this._debuggerModel.getActions().setDebuggerMode((_DebuggerStore2 || _DebuggerStore()).DebuggerMode.PAUSED);
      if (options != null) {
        if (options.stopThreadId != null) {
          this._handleStopThreadUpdate(options.stopThreadId);
        }
        this._handleStopThreadSwitch(options.threadSwitchNotification);
      }
    }
  }, {
    key: '_handleDebuggerResumed',
    value: function _handleDebuggerResumed() {
      this._debuggerModel.getActions().setDebuggerMode((_DebuggerStore2 || _DebuggerStore()).DebuggerMode.RUNNING);
    }
  }, {
    key: '_handleLoaderBreakpointResumed',
    value: function _handleLoaderBreakpointResumed() {
      this._debuggerModel.getStore().loaderBreakpointResumed();
    }
  }, {
    key: '_handleClearInterface',
    value: function _handleClearInterface() {
      this._debuggerModel.getActions().clearInterface();
    }
  }, {
    key: '_setSelectedCallFrameLine',
    value: function _setSelectedCallFrameLine(options) {
      this._debuggerModel.getActions().setSelectedCallFrameLine(options);
    }
  }, {
    key: '_openSourceLocation',
    value: function _openSourceLocation(options) {
      if (options == null) {
        return;
      }
      this._debuggerModel.getActions().openSourceLocation(options.sourceURL, options.lineNumber);
    }
  }, {
    key: '_handleStopThreadSwitch',
    value: function _handleStopThreadSwitch(options) {
      if (options == null) {
        return;
      }
      this._debuggerModel.getActions().notifyThreadSwitch(options.sourceURL, options.lineNumber, options.message);
    }
  }, {
    key: '_bindBreakpoint',
    value: function _bindBreakpoint(breakpoint) {
      var sourceURL = breakpoint.sourceURL;
      var lineNumber = breakpoint.lineNumber;
      var condition = breakpoint.condition;
      var enabled = breakpoint.enabled;

      var path = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.uriToNuclideUri(sourceURL);
      // only handle real files for now.
      if (path) {
        try {
          this._suppressBreakpointSync = true;
          this._debuggerModel.getActions().bindBreakpointIPC(path, lineNumber, condition, enabled);
        } finally {
          this._suppressBreakpointSync = false;
        }
      }
    }
  }, {
    key: '_removeBreakpoint',
    value: function _removeBreakpoint(breakpoint) {
      var sourceURL = breakpoint.sourceURL;
      var lineNumber = breakpoint.lineNumber;

      var path = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.uriToNuclideUri(sourceURL);
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
  }, {
    key: '_handleUserBreakpointChange',
    value: function _handleUserBreakpointChange(params) {
      var webview = this._webview;
      if (webview != null) {
        var action = params.action;
        var breakpoint = params.breakpoint;

        webview.send('command', action, {
          sourceURL: (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.nuclideUriToUri(breakpoint.path),
          lineNumber: breakpoint.line,
          condition: breakpoint.condition,
          enabled: breakpoint.enabled
        });
      }
    }
  }, {
    key: '_handleThreadsUpdate',
    value: function _handleThreadsUpdate(threadData) {
      this._debuggerModel.getActions().updateThreads(threadData);
    }
  }, {
    key: '_handleThreadUpdate',
    value: function _handleThreadUpdate(thread) {
      this._debuggerModel.getActions().updateThread(thread);
    }
  }, {
    key: '_handleStopThreadUpdate',
    value: function _handleStopThreadUpdate(id) {
      this._debuggerModel.getActions().updateStopThread(id);
    }
  }, {
    key: '_sendAllBreakpoints',
    value: function _sendAllBreakpoints() {
      var _this2 = this;

      // Send an array of file/line objects.
      var webview = this._webview;
      if (webview && !this._suppressBreakpointSync) {
        (function () {
          var results = [];
          _this2._debuggerModel.getBreakpointStore().getAllBreakpoints().forEach(function (breakpoint) {
            results.push({
              sourceURL: (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.nuclideUriToUri(breakpoint.path),
              lineNumber: breakpoint.line,
              condition: breakpoint.condition,
              enabled: breakpoint.enabled
            });
          });
          webview.send('command', 'SyncBreakpoints', results);
        })();
      }
    }
  }, {
    key: '_injectCSS',
    value: function _injectCSS() {
      if (this._webview != null) {
        this._webview.insertCSS(INJECTED_CSS);
      }
    }
  }]);

  return Bridge;
})();

module.exports = Bridge;

// Contains disposable items should be disposed by
// cleanup() method.
// $FlowFixMe(jeffreytan)