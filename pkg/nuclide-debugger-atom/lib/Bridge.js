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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideLogging = require('../../nuclide-logging');

var _nuclideCommons = require('../../nuclide-commons');

var _DebuggerStore = require('./DebuggerStore');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

var remoteUri = require('../../nuclide-remote-uri');

var INJECTED_CSS = [
/* Force the inspector to scroll vertically on Atom ≥ 1.4.0 */
'body > .root-view {overflow-y: scroll;}',
/* Force the contents of the mini console (on the bottom) to scroll vertically */
'.insertion-point-sidebar#drawer-contents {overflow-y: auto;}'].join('');

var Bridge = (function () {
  function Bridge(debuggerModel) {
    _classCallCheck(this, Bridge);

    this._debuggerModel = debuggerModel;
    this._cleanupDisposables = new CompositeDisposable();
    this._selectedCallFrameMarker = null;
    this._webview = null;
    this._suppressBreakpointSync = false;
    this._disposables = new CompositeDisposable(debuggerModel.getBreakpointStore().onChange(this._handleBreakpointStoreChange.bind(this)));
    this._expressionsInFlight = new Map();
  }

  _createClass(Bridge, [{
    key: 'setWebviewElement',
    value: function setWebviewElement(webview) {
      this._webview = webview;
      var boundHandler = this._handleIpcMessage.bind(this);
      webview.addEventListener('ipc-message', boundHandler);
      this._cleanupDisposables.add(new Disposable(function () {
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
      this._cleanupDisposables.dispose();
      this._webview = null;
      this._clearSelectedCallFrameMarker();
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
    key: 'evaluateOnSelectedCallFrame',
    value: _asyncToGenerator(function* (expression) {
      if (this._webview == null) {
        return null;
      }
      var deferred = undefined;
      if (this._expressionsInFlight.has(expression)) {
        deferred = this._expressionsInFlight.get(expression);
      } else {
        deferred = new _nuclideCommons.Deferred();
        this._expressionsInFlight.set(expression, deferred);
        (0, _assert2['default'])(this._webview != null);
        this._webview.send('command', 'evaluateOnSelectedCallFrame', expression);
      }
      (0, _assert2['default'])(deferred != null);
      var result = undefined;
      try {
        result = yield deferred.promise;
      } catch (e) {
        (0, _nuclideLogging.getLogger)().warn('evaluateOnSelectedCallFrame: Error getting result.', e);
        result = null;
      }
      this._expressionsInFlight['delete'](expression);
      return result;
    })
  }, {
    key: '_handleExpressionEvaluationResponse',
    value: function _handleExpressionEvaluationResponse(additionalData) {
      var expression = additionalData.expression;
      var result = additionalData.result;
      var error = additionalData.error;

      var deferred = this._expressionsInFlight.get(expression);
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
            case 'DebuggerPaused':
              this._handleDebuggerPaused(event.args[1]);
              break;
            case 'ExpressionEvaluationResponse':
              this._handleExpressionEvaluationResponse(event.args[1]);
              break;
          }
          break;
      }
    }
  }, {
    key: '_handleDebuggerPaused',
    value: function _handleDebuggerPaused(additionalData) {
      this._debuggerModel.getStore().setDebuggerMode(_DebuggerStore.DebuggerMode.PAUSED);
      // TODO go through dispatcher
      this._debuggerModel.getWatchExpressionStore().triggerReevaluation();
    }
  }, {
    key: '_handleClearInterface',
    value: function _handleClearInterface() {
      this._setSelectedCallFrameLine(null);
    }
  }, {
    key: '_handleDebuggerResumed',
    value: function _handleDebuggerResumed() {
      this._debuggerModel.getStore().setDebuggerMode(_DebuggerStore.DebuggerMode.RUNNING);
    }
  }, {
    key: '_handleLoaderBreakpointResumed',
    value: function _handleLoaderBreakpointResumed() {
      this._debuggerModel.getStore().loaderBreakpointResumed();
    }
  }, {
    key: '_setSelectedCallFrameLine',
    value: function _setSelectedCallFrameLine(nullableOptions) {
      var _this = this;

      if (nullableOptions) {
        (function () {
          var options = nullableOptions; // For use in capture without re-checking null
          var path = remoteUri.uriToNuclideUri(options.sourceURL);
          if (path != null && atom.workspace != null) {
            // only handle real files for now
            atom.workspace.open(path, { searchAllPanes: true }).then(function (editor) {
              _this._clearSelectedCallFrameMarker();
              _this._highlightCallFrameLine(editor, options.lineNumber);
            });
          }
        })();
      } else {
        this._clearSelectedCallFrameMarker();
      }
    }
  }, {
    key: '_openSourceLocation',
    value: function _openSourceLocation(nullableOptions) {
      if (nullableOptions) {
        (function () {
          var options = nullableOptions; // For use in capture without re-checking null
          var path = remoteUri.uriToNuclideUri(options.sourceURL);
          if (path != null && atom.workspace != null) {
            // only handle real files for now.
            atom.workspace.open(path, { searchAllPanes: true }).then(function (editor) {
              editor.scrollToBufferPosition([options.lineNumber, 0]);
              editor.setCursorBufferPosition([options.lineNumber, 0]);
            });
          }
        })();
      }
    }
  }, {
    key: '_highlightCallFrameLine',
    value: function _highlightCallFrameLine(editor, line) {
      var marker = editor.markBufferRange([[line, 0], [line, Infinity]], { persistent: false, invalidate: 'never' });
      editor.decorateMarker(marker, {
        type: 'line',
        'class': 'nuclide-current-line-highlight'
      });
      this._selectedCallFrameMarker = marker;
    }
  }, {
    key: '_addBreakpoint',
    value: function _addBreakpoint(location) {
      var path = remoteUri.uriToNuclideUri(location.sourceURL);
      // only handle real files for now.
      if (path) {
        try {
          this._suppressBreakpointSync = true;
          this._debuggerModel.getBreakpointStore().addBreakpoint(path, location.lineNumber);
        } finally {
          this._suppressBreakpointSync = false;
        }
      }
    }
  }, {
    key: '_removeBreakpoint',
    value: function _removeBreakpoint(location) {
      var path = remoteUri.uriToNuclideUri(location.sourceURL);
      // only handle real files for now.
      if (path) {
        try {
          this._suppressBreakpointSync = true;
          this._debuggerModel.getBreakpointStore().deleteBreakpoint(path, location.lineNumber);
        } finally {
          this._suppressBreakpointSync = false;
        }
      }
    }
  }, {
    key: '_clearSelectedCallFrameMarker',
    value: function _clearSelectedCallFrameMarker() {
      if (this._selectedCallFrameMarker) {
        this._selectedCallFrameMarker.destroy();
        this._selectedCallFrameMarker = null;
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
              sourceURL: remoteUri.nuclideUriToUri(key),
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