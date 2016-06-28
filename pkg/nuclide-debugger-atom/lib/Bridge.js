Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
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
    this._disposables = new (_atom2 || _atom()).CompositeDisposable(debuggerModel.getBreakpointStore().onChange(this._handleBreakpointStoreChange.bind(this)));
    this._expressionsInFlight = new Map();
    this._getPropertiesRequestsInFlight = new Map();
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
    key: 'getProperties',
    value: function getProperties(objectId) {
      return this._cachedSendCommand(this._getPropertiesRequestsInFlight, 'getProperties', objectId);
    }
  }, {
    key: 'evaluateWatchExpression',
    value: function evaluateWatchExpression(expression) {
      return this._evaluateOnSelectedCallFrame(expression);
    }
  }, {
    key: 'evaluateConsoleExpression',
    value: function evaluateConsoleExpression(expression) {
      if (this._debuggerModel.getStore().getDebuggerMode() === 'paused') {
        return this._evaluateOnSelectedCallFrame(expression);
      } else {
        return this._runtimeEvaluate(expression);
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
    key: '_evaluateOnSelectedCallFrame',
    value: function _evaluateOnSelectedCallFrame(expression) {
      return this._cachedSendCommand(this._expressionsInFlight, 'evaluateOnSelectedCallFrame', expression);
    }
  }, {
    key: '_runtimeEvaluate',
    value: function _runtimeEvaluate(expression) {
      return this._cachedSendCommand(this._expressionsInFlight, 'runtimeEvaluate', expression);
    }
  }, {
    key: '_cachedSendCommand',
    value: _asyncToGenerator(function* (cache, command, value) {
      var webview = this._webview;
      if (webview == null) {
        return null;
      }
      var deferred = undefined;
      if (cache.has(value)) {
        deferred = cache.get(value);
      } else {
        deferred = new (_commonsNodePromise2 || _commonsNodePromise()).Deferred();
        cache.set(value, deferred);
        webview.send('command', command, value);
      }
      (0, (_assert2 || _assert()).default)(deferred != null);
      var result = undefined;
      try {
        result = yield deferred.promise;
      } catch (e) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().warn(command + ': Error getting result.', e);
        result = null;
      }
      cache.delete(value);
      return result;
    })
  }, {
    key: '_handleExpressionEvaluationResponse',
    value: function _handleExpressionEvaluationResponse(response) {
      this._handleResponseForPendingRequest(this._expressionsInFlight, response, response.expression);
    }
  }, {
    key: '_handleGetPropertiesResponse',
    value: function _handleGetPropertiesResponse(response) {
      this._handleResponseForPendingRequest(this._getPropertiesRequestsInFlight, response, response.objectId);
    }
  }, {
    key: '_handleCallstackUpdate',
    value: function _handleCallstackUpdate(callstack) {
      this._debuggerModel.getActions().updateCallstack(callstack);
    }
  }, {
    key: '_handleResponseForPendingRequest',
    value: function _handleResponseForPendingRequest(pending, response, key) {
      var result = response.result;
      var error = response.error;

      var deferred = pending.get(key);
      if (deferred == null) {
        // Nobody is listening for the result of this expression.
        return;
      }
      if (error != null) {
        deferred.reject(error);
      } else {
        deferred.resolve(result);
      }
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
              this._addBreakpoint(event.args[1]);
              break;
            case 'BreakpointRemoved':
              this._removeBreakpoint(event.args[1]);
              break;
            case 'LoaderBreakpointHit':
              this._handleLoaderBreakpointHit(event.args[1]);
              break;
            case 'NonLoaderDebuggerPaused':
              this._handleNonLoaderDebuggerPaused(event.args[1]);
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
    key: '_handleLoaderBreakpointHit',
    value: function _handleLoaderBreakpointHit(additionalData) {
      this._handleDebuggerPaused(additionalData);
    }
  }, {
    key: '_handleNonLoaderDebuggerPaused',
    value: function _handleNonLoaderDebuggerPaused(additionalData) {
      this._handleDebuggerPaused(additionalData);
      setTimeout(function () {
        if (!atom.getCurrentWindow().isFocused()) {
          // It is likely that we need to bring the user back into focus if they are not already.
          atom.notifications.addInfo('Nuclide Debugger', {
            detail: 'Paused at a breakpoint',
            nativeFriendly: true
          });
        }
      }, 3000);
    }
  }, {
    key: '_handleDebuggerPaused',
    value: function _handleDebuggerPaused(additionalData) {
      this._expressionsInFlight.clear();
      this._debuggerModel.getActions().setDebuggerMode((_DebuggerStore2 || _DebuggerStore()).DebuggerMode.PAUSED);
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
      this._debuggerModel.getActions().setSelectedCallFrameline(options);
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
    key: '_addBreakpoint',
    value: function _addBreakpoint(location) {
      var path = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.uriToNuclideUri(location.sourceURL);
      // only handle real files for now.
      if (path) {
        try {
          this._suppressBreakpointSync = true;
          this._debuggerModel.getActions().addBreakpoint(path, location.lineNumber);
        } finally {
          this._suppressBreakpointSync = false;
        }
      }
    }
  }, {
    key: '_removeBreakpoint',
    value: function _removeBreakpoint(location) {
      var path = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.uriToNuclideUri(location.sourceURL);
      // only handle real files for now.
      if (path) {
        try {
          this._suppressBreakpointSync = true;
          this._debuggerModel.getActions().deleteBreakpoint(path, location.lineNumber);
        } finally {
          this._suppressBreakpointSync = false;
        }
      }
    }
  }, {
    key: '_handleBreakpointStoreChange',
    value: function _handleBreakpointStoreChange(path) {
      this._sendAllBreakpoints();
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
          _this2._debuggerModel.getBreakpointStore().getAllBreakpoints().forEach(function (line, key) {
            results.push({
              sourceURL: (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.nuclideUriToUri(key),
              lineNumber: line
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

// Either:
// Or:
// Contains disposable items should be disposed by
// cleanup() method.

// Tracks requests for expression evaluation, keyed by the expression body.
// $FlowFixMe(jeffreytan)