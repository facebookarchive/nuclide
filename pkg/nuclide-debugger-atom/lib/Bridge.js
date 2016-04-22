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
//# sourceMappingURL=data:application/json;base64,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ZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIERlYnVnZ2VyTW9kZWwgZnJvbSAnLi9EZWJ1Z2dlck1vZGVsJztcblxudHlwZSBFeHByZXNzaW9uUmVzdWx0ID0ge1xuICBleHByZXNzaW9uOiBzdHJpbmc7XG4gIHJlc3VsdDogP0V2YWx1YXRpb25SZXN1bHQ7XG4gIGVycm9yOiA/T2JqZWN0O1xufTtcblxuZXhwb3J0IHR5cGUgRXZhbHVhdGlvblJlc3VsdCA9IHtcbiAgX3R5cGU6IHN0cmluZztcbiAgLy8gRWl0aGVyOlxuICB2YWx1ZT86IHN0cmluZztcbiAgLy8gT3I6XG4gIF9kZXNjcmlwdGlvbj8gOiBzdHJpbmc7XG59O1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJyk7XG5pbXBvcnQge0RlZmVycmVkfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtEZWJ1Z2dlck1vZGV9IGZyb20gJy4vRGVidWdnZXJTdG9yZSc7XG5cbmNvbnN0IElOSkVDVEVEX0NTUyA9IFtcbiAgLyogRm9yY2UgdGhlIGluc3BlY3RvciB0byBzY3JvbGwgdmVydGljYWxseSBvbiBBdG9tIOKJpSAxLjQuMCAqL1xuICAnYm9keSA+IC5yb290LXZpZXcge292ZXJmbG93LXk6IHNjcm9sbDt9JyxcbiAgLyogRm9yY2UgdGhlIGNvbnRlbnRzIG9mIHRoZSBtaW5pIGNvbnNvbGUgKG9uIHRoZSBib3R0b20pIHRvIHNjcm9sbCB2ZXJ0aWNhbGx5ICovXG4gICcuaW5zZXJ0aW9uLXBvaW50LXNpZGViYXIjZHJhd2VyLWNvbnRlbnRzIHtvdmVyZmxvdy15OiBhdXRvO30nLFxuXS5qb2luKCcnKTtcblxuY2xhc3MgQnJpZGdlIHtcbiAgX2RlYnVnZ2VyTW9kZWw6IERlYnVnZ2VyTW9kZWw7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgLy8gQ29udGFpbnMgZGlzcG9zYWJsZSBpdGVtcyBzaG91bGQgYmUgZGlzcG9zZWQgYnlcbiAgLy8gY2xlYW51cCgpIG1ldGhvZC5cbiAgX2NsZWFudXBEaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyOiA/YXRvbSRNYXJrZXI7XG4gIF93ZWJ2aWV3OiA/V2Vidmlld0VsZW1lbnQ7XG4gIF9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jOiBib29sZWFuO1xuICAvLyBUcmFja3MgcmVxdWVzdHMgZm9yIGV4cHJlc3Npb24gZXZhbHVhdGlvbiwga2V5ZWQgYnkgdGhlIGV4cHJlc3Npb24gYm9keS5cbiAgX2V4cHJlc3Npb25zSW5GbGlnaHQ6IE1hcDxzdHJpbmcsIERlZmVycmVkPD9FdmFsdWF0aW9uUmVzdWx0Pj47XG5cbiAgY29uc3RydWN0b3IoZGVidWdnZXJNb2RlbDogRGVidWdnZXJNb2RlbCkge1xuICAgIHRoaXMuX2RlYnVnZ2VyTW9kZWwgPSBkZWJ1Z2dlck1vZGVsO1xuICAgIHRoaXMuX2NsZWFudXBEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIgPSBudWxsO1xuICAgIHRoaXMuX3dlYnZpZXcgPSBudWxsO1xuICAgIHRoaXMuX3N1cHByZXNzQnJlYWtwb2ludFN5bmMgPSBmYWxzZTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgZGVidWdnZXJNb2RlbC5nZXRCcmVha3BvaW50U3RvcmUoKS5vbkNoYW5nZSh0aGlzLl9oYW5kbGVCcmVha3BvaW50U3RvcmVDaGFuZ2UuYmluZCh0aGlzKSksXG4gICAgKTtcbiAgICB0aGlzLl9leHByZXNzaW9uc0luRmxpZ2h0ID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgc2V0V2Vidmlld0VsZW1lbnQod2VidmlldzogV2Vidmlld0VsZW1lbnQpIHtcbiAgICB0aGlzLl93ZWJ2aWV3ID0gd2VidmlldztcbiAgICBjb25zdCBib3VuZEhhbmRsZXIgPSB0aGlzLl9oYW5kbGVJcGNNZXNzYWdlLmJpbmQodGhpcyk7XG4gICAgd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIGJvdW5kSGFuZGxlcik7XG4gICAgdGhpcy5fY2xlYW51cERpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PlxuICAgICAgd2Vidmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIGJvdW5kSGFuZGxlcikpKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgLy8gQ2xlYW4gdXAgYW55IHN0YXRlIGNoYW5nZWQgYWZ0ZXIgY29uc3RydWN0b3IuXG4gIGNsZWFudXAoKSB7XG4gICAgdGhpcy5fY2xlYW51cERpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl93ZWJ2aWV3ID0gbnVsbDtcbiAgICB0aGlzLl9jbGVhclNlbGVjdGVkQ2FsbEZyYW1lTWFya2VyKCk7XG4gIH1cblxuICBjb250aW51ZSgpIHtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdjb21tYW5kJywgJ0NvbnRpbnVlJyk7XG4gICAgfVxuICB9XG5cbiAgc3RlcE92ZXIoKSB7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdTdGVwT3ZlcicpO1xuICAgIH1cbiAgfVxuXG4gIHN0ZXBJbnRvKCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3RlcEludG8nKTtcbiAgICB9XG4gIH1cblxuICBzdGVwT3V0KCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3RlcE91dCcpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGV2YWx1YXRlT25TZWxlY3RlZENhbGxGcmFtZShleHByZXNzaW9uOiBzdHJpbmcpOiBQcm9taXNlPD9FdmFsdWF0aW9uUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBkZWZlcnJlZDtcbiAgICBpZiAodGhpcy5fZXhwcmVzc2lvbnNJbkZsaWdodC5oYXMoZXhwcmVzc2lvbikpIHtcbiAgICAgIGRlZmVycmVkID0gdGhpcy5fZXhwcmVzc2lvbnNJbkZsaWdodC5nZXQoZXhwcmVzc2lvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG4gICAgICB0aGlzLl9leHByZXNzaW9uc0luRmxpZ2h0LnNldChleHByZXNzaW9uLCBkZWZlcnJlZCk7XG4gICAgICBpbnZhcmlhbnQodGhpcy5fd2VidmlldyAhPSBudWxsKTtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdldmFsdWF0ZU9uU2VsZWN0ZWRDYWxsRnJhbWUnLCBleHByZXNzaW9uKTtcbiAgICB9XG4gICAgaW52YXJpYW50KGRlZmVycmVkICE9IG51bGwpO1xuICAgIGxldCByZXN1bHQ7XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IGF3YWl0IGRlZmVycmVkLnByb21pc2U7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZ2V0TG9nZ2VyKCkud2FybignZXZhbHVhdGVPblNlbGVjdGVkQ2FsbEZyYW1lOiBFcnJvciBnZXR0aW5nIHJlc3VsdC4nLCBlKTtcbiAgICAgIHJlc3VsdCA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX2V4cHJlc3Npb25zSW5GbGlnaHQuZGVsZXRlKGV4cHJlc3Npb24pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBfaGFuZGxlRXhwcmVzc2lvbkV2YWx1YXRpb25SZXNwb25zZShhZGRpdGlvbmFsRGF0YTogRXhwcmVzc2lvblJlc3VsdCk6IHZvaWQge1xuICAgIGNvbnN0IHtcbiAgICAgIGV4cHJlc3Npb24sXG4gICAgICByZXN1bHQsXG4gICAgICBlcnJvcixcbiAgICB9ID0gYWRkaXRpb25hbERhdGE7XG4gICAgY29uc3QgZGVmZXJyZWQgPSB0aGlzLl9leHByZXNzaW9uc0luRmxpZ2h0LmdldChleHByZXNzaW9uKTtcbiAgICBpZiAoZGVmZXJyZWQgPT0gbnVsbCkge1xuICAgICAgLy8gTm9ib2R5IGlzIGxpc3RlbmluZyBmb3IgdGhlIHJlc3VsdCBvZiB0aGlzIGV4cHJlc3Npb24uXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChlcnJvciAhPSBudWxsKSB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUlwY01lc3NhZ2Uoc3RkRXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgLy8gYWRkRXZlbnRMaXN0ZW5lciBleHBlY3RzIGl0cyBjYWxsYmFjayB0byB0YWtlIGFuIEV2ZW50LiBJJ20gbm90IHN1cmUgaG93IHRvIHJlY29uY2lsZSBpdCB3aXRoXG4gICAgLy8gdGhlIHR5cGUgdGhhdCBpcyBleHBlY3RlZCBoZXJlLlxuICAgIC8vICRGbG93Rml4TWUoamVmZnJleXRhbilcbiAgICBjb25zdCBldmVudDoge2NoYW5uZWw6IHN0cmluZzsgYXJnczogYW55W119ID0gc3RkRXZlbnQ7XG4gICAgc3dpdGNoIChldmVudC5jaGFubmVsKSB7XG4gICAgICBjYXNlICdub3RpZmljYXRpb24nOlxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmFyZ3NbMF0pIHtcbiAgICAgICAgICBjYXNlICdyZWFkeSc6XG4gICAgICAgICAgICB0aGlzLl9zZW5kQWxsQnJlYWtwb2ludHMoKTtcbiAgICAgICAgICAgIHRoaXMuX2luamVjdENTUygpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnQ2FsbEZyYW1lU2VsZWN0ZWQnOlxuICAgICAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRDYWxsRnJhbWVMaW5lKGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnT3BlblNvdXJjZUxvY2F0aW9uJzpcbiAgICAgICAgICAgIHRoaXMuX29wZW5Tb3VyY2VMb2NhdGlvbihldmVudC5hcmdzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ0NsZWFySW50ZXJmYWNlJzpcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUNsZWFySW50ZXJmYWNlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdEZWJ1Z2dlclJlc3VtZWQnOlxuICAgICAgICAgICAgdGhpcy5faGFuZGxlRGVidWdnZXJSZXN1bWVkKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdMb2FkZXJCcmVha3BvaW50UmVzdW1lZCc6XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVMb2FkZXJCcmVha3BvaW50UmVzdW1lZCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnQnJlYWtwb2ludEFkZGVkJzpcbiAgICAgICAgICAgIHRoaXMuX2FkZEJyZWFrcG9pbnQoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdCcmVha3BvaW50UmVtb3ZlZCc6XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVCcmVha3BvaW50KGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnRGVidWdnZXJQYXVzZWQnOlxuICAgICAgICAgICAgdGhpcy5faGFuZGxlRGVidWdnZXJQYXVzZWQoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdFeHByZXNzaW9uRXZhbHVhdGlvblJlc3BvbnNlJzpcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUV4cHJlc3Npb25FdmFsdWF0aW9uUmVzcG9uc2UoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlRGVidWdnZXJQYXVzZWQoYWRkaXRpb25hbERhdGE6IHtzb3VyY2VVcmw/OiBzdHJpbmd9KTogdm9pZCB7XG4gICAgdGhpcy5fZGVidWdnZXJNb2RlbC5nZXRTdG9yZSgpLnNldERlYnVnZ2VyTW9kZShEZWJ1Z2dlck1vZGUuUEFVU0VEKTtcbiAgICAvLyBUT0RPIGdvIHRocm91Z2ggZGlzcGF0Y2hlclxuICAgIHRoaXMuX2RlYnVnZ2VyTW9kZWwuZ2V0V2F0Y2hFeHByZXNzaW9uU3RvcmUoKS50cmlnZ2VyUmVldmFsdWF0aW9uKCk7XG4gIH1cblxuICBfaGFuZGxlQ2xlYXJJbnRlcmZhY2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0U2VsZWN0ZWRDYWxsRnJhbWVMaW5lKG51bGwpO1xuICB9XG5cbiAgX2hhbmRsZURlYnVnZ2VyUmVzdW1lZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWJ1Z2dlck1vZGVsLmdldFN0b3JlKCkuc2V0RGVidWdnZXJNb2RlKERlYnVnZ2VyTW9kZS5SVU5OSU5HKTtcbiAgfVxuXG4gIF9oYW5kbGVMb2FkZXJCcmVha3BvaW50UmVzdW1lZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWJ1Z2dlck1vZGVsLmdldFN0b3JlKCkubG9hZGVyQnJlYWtwb2ludFJlc3VtZWQoKTtcbiAgfVxuXG4gIF9zZXRTZWxlY3RlZENhbGxGcmFtZUxpbmUobnVsbGFibGVPcHRpb25zOiA/e3NvdXJjZVVSTDogc3RyaW5nOyBsaW5lTnVtYmVyOiBudW1iZXJ9KSB7XG4gICAgaWYgKG51bGxhYmxlT3B0aW9ucykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IG51bGxhYmxlT3B0aW9uczsgLy8gRm9yIHVzZSBpbiBjYXB0dXJlIHdpdGhvdXQgcmUtY2hlY2tpbmcgbnVsbFxuICAgICAgY29uc3QgcGF0aCA9IHJlbW90ZVVyaS51cmlUb051Y2xpZGVVcmkob3B0aW9ucy5zb3VyY2VVUkwpO1xuICAgICAgaWYgKHBhdGggIT0gbnVsbCAmJiBhdG9tLndvcmtzcGFjZSAhPSBudWxsKSB7IC8vIG9ubHkgaGFuZGxlIHJlYWwgZmlsZXMgZm9yIG5vd1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgsIHtzZWFyY2hBbGxQYW5lczogdHJ1ZX0pLnRoZW4oZWRpdG9yID0+IHtcbiAgICAgICAgICB0aGlzLl9jbGVhclNlbGVjdGVkQ2FsbEZyYW1lTWFya2VyKCk7XG4gICAgICAgICAgdGhpcy5faGlnaGxpZ2h0Q2FsbEZyYW1lTGluZShlZGl0b3IsIG9wdGlvbnMubGluZU51bWJlcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jbGVhclNlbGVjdGVkQ2FsbEZyYW1lTWFya2VyKCk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5Tb3VyY2VMb2NhdGlvbihudWxsYWJsZU9wdGlvbnM6ID97c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBpZiAobnVsbGFibGVPcHRpb25zKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gbnVsbGFibGVPcHRpb25zOyAvLyBGb3IgdXNlIGluIGNhcHR1cmUgd2l0aG91dCByZS1jaGVja2luZyBudWxsXG4gICAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShvcHRpb25zLnNvdXJjZVVSTCk7XG4gICAgICBpZiAocGF0aCAhPSBudWxsICYmIGF0b20ud29ya3NwYWNlICE9IG51bGwpIHsgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93LlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgsIHtzZWFyY2hBbGxQYW5lczogdHJ1ZX0pLnRoZW4oZWRpdG9yID0+IHtcbiAgICAgICAgICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbb3B0aW9ucy5saW5lTnVtYmVyLCAwXSk7XG4gICAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtvcHRpb25zLmxpbmVOdW1iZXIsIDBdKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2hpZ2hsaWdodENhbGxGcmFtZUxpbmUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIGxpbmU6IG51bWJlcikge1xuICAgIGNvbnN0IG1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoXG4gICAgICBbW2xpbmUsIDBdLCBbbGluZSwgSW5maW5pdHldXSxcbiAgICAgIHtwZXJzaXN0ZW50OiBmYWxzZSwgaW52YWxpZGF0ZTogJ25ldmVyJ30pO1xuICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgIGNsYXNzOiAnbnVjbGlkZS1jdXJyZW50LWxpbmUtaGlnaGxpZ2h0JyxcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlciA9IG1hcmtlcjtcbiAgfVxuXG4gIF9hZGRCcmVha3BvaW50KGxvY2F0aW9uOiB7c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShsb2NhdGlvbi5zb3VyY2VVUkwpO1xuICAgIC8vIG9ubHkgaGFuZGxlIHJlYWwgZmlsZXMgZm9yIG5vdy5cbiAgICBpZiAocGF0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2RlYnVnZ2VyTW9kZWwuZ2V0QnJlYWtwb2ludFN0b3JlKCkuYWRkQnJlYWtwb2ludChwYXRoLCBsb2NhdGlvbi5saW5lTnVtYmVyKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuX3N1cHByZXNzQnJlYWtwb2ludFN5bmMgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfcmVtb3ZlQnJlYWtwb2ludChsb2NhdGlvbjoge3NvdXJjZVVSTDogc3RyaW5nOyBsaW5lTnVtYmVyOiBudW1iZXJ9KSB7XG4gICAgY29uc3QgcGF0aCA9IHJlbW90ZVVyaS51cmlUb051Y2xpZGVVcmkobG9jYXRpb24uc291cmNlVVJMKTtcbiAgICAvLyBvbmx5IGhhbmRsZSByZWFsIGZpbGVzIGZvciBub3cuXG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuX3N1cHByZXNzQnJlYWtwb2ludFN5bmMgPSB0cnVlO1xuICAgICAgICB0aGlzLl9kZWJ1Z2dlck1vZGVsLmdldEJyZWFrcG9pbnRTdG9yZSgpLmRlbGV0ZUJyZWFrcG9pbnQocGF0aCwgbG9jYXRpb24ubGluZU51bWJlcik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyU2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIoKSB7XG4gICAgaWYgKHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlci5kZXN0cm95KCk7XG4gICAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUJyZWFrcG9pbnRTdG9yZUNoYW5nZShwYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zZW5kQWxsQnJlYWtwb2ludHMoKTtcbiAgfVxuXG4gIF9zZW5kQWxsQnJlYWtwb2ludHMoKSB7XG4gICAgLy8gU2VuZCBhbiBhcnJheSBvZiBmaWxlL2xpbmUgb2JqZWN0cy5cbiAgICBjb25zdCB3ZWJ2aWV3ID0gdGhpcy5fd2VidmlldztcbiAgICBpZiAod2VidmlldyAmJiAhdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYykge1xuICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgdGhpcy5fZGVidWdnZXJNb2RlbC5nZXRCcmVha3BvaW50U3RvcmUoKS5nZXRBbGxCcmVha3BvaW50cygpLmZvckVhY2goKGxpbmUsIGtleSkgPT4ge1xuICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgIHNvdXJjZVVSTDogcmVtb3RlVXJpLm51Y2xpZGVVcmlUb1VyaShrZXkpLFxuICAgICAgICAgIGxpbmVOdW1iZXI6IGxpbmUsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB3ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3luY0JyZWFrcG9pbnRzJywgcmVzdWx0cyk7XG4gICAgfVxuICB9XG5cbiAgX2luamVjdENTUygpIHtcbiAgICBpZiAodGhpcy5fd2VidmlldyAhPSBudWxsKSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3Lmluc2VydENTUyhJTkpFQ1RFRF9DU1MpO1xuICAgIH1cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnJpZGdlO1xuIl19