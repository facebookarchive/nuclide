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

var promiseForBehaviorSubject = _asyncToGenerator(function* (subject) {
  try {
    yield subject.toPromise();
  } catch (e) {
    (0, _nuclideLogging.getLogger)().warn('promiseForBehaviorSubject: Subject observed error.', e);
    return null;
  }
  return subject.getValue();
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideLogging = require('../../nuclide-logging');

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
      var subject = undefined;
      if (this._expressionsInFlight.has(expression)) {
        subject = this._expressionsInFlight.get(expression);
      } else {
        subject = new _rx2['default'].BehaviorSubject();
        this._expressionsInFlight.set(expression, subject);
        (0, _assert2['default'])(this._webview != null);
        this._webview.send('command', 'evaluateOnSelectedCallFrame', expression);
      }
      (0, _assert2['default'])(subject != null);
      var result = yield promiseForBehaviorSubject(subject);
      this._expressionsInFlight['delete'](expression);
      return result;
    })
  }, {
    key: '_handleExpressionEvaluationResponse',
    value: function _handleExpressionEvaluationResponse(additionalData) {
      var expression = additionalData.expression;
      var result = additionalData.result;
      var error = additionalData.error;

      var subject = this._expressionsInFlight.get(expression);
      if (subject == null) {
        // Nobody is listening for the result of this expression.
        return;
      }
      if (error != null) {
        subject.onError(error);
      } else {
        subject.onNext(result);
        subject.onCompleted();
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
            case 'DebuggerResumed':
              this._handleDebuggerResumed();
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
    }
  }, {
    key: '_handleDebuggerResumed',
    value: function _handleDebuggerResumed() {
      this._setSelectedCallFrameLine(null);
      this._debuggerModel.getStore().setDebuggerMode(_DebuggerStore.DebuggerMode.RUNNING);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJyaWRnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQTBDZSx5QkFBeUIscUJBQXhDLFdBQTRDLE9BQThCLEVBQWU7QUFDdkYsTUFBSTtBQUNGLFVBQU0sT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO0dBQzNCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixvQ0FBVyxDQUFDLElBQUksQ0FBQyxvREFBb0QsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRSxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsU0FBTyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7Q0FDM0I7Ozs7Ozs7O2tCQXZCYyxJQUFJOzs7O3NCQUNHLFFBQVE7Ozs7OEJBR04sdUJBQXVCOzs2QkFFcEIsaUJBQWlCOztlQUpGLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQWxELG1CQUFtQixZQUFuQixtQkFBbUI7SUFBRSxVQUFVLFlBQVYsVUFBVTs7QUFHdEMsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7O0FBR3RELElBQU0sWUFBWSxHQUFHOztBQUVuQix5Q0FBeUM7O0FBRXpDLDhEQUE4RCxDQUMvRCxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7SUFZTCxNQUFNO0FBWUMsV0FaUCxNQUFNLENBWUUsYUFBNEIsRUFBRTswQkFadEMsTUFBTTs7QUFhUixRQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztBQUNwQyxRQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0FBQ3JELFFBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7QUFDckMsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDckIsUUFBSSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztBQUNyQyxRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksbUJBQW1CLENBQ3pDLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQzFGLENBQUM7QUFDRixRQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztHQUN2Qzs7ZUF0QkcsTUFBTTs7V0F3Qk8sMkJBQUMsT0FBdUIsRUFBRTtBQUN6QyxVQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztBQUN4QixVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZELGFBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDdEQsVUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLFVBQVUsQ0FBQztlQUMxQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFDO0tBQzlEOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNmLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7Ozs7O1dBR00sbUJBQUc7QUFDUixVQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbkMsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDckIsVUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7S0FDdEM7OztXQUVPLHFCQUFHO0FBQ1QsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztPQUMzQztLQUNGOzs7V0FFTyxvQkFBRztBQUNULFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7T0FDM0M7S0FDRjs7O1dBRU8sb0JBQUc7QUFDVCxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO09BQzNDO0tBQ0Y7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztPQUMxQztLQUNGOzs7NkJBRWdDLFdBQUMsVUFBa0IsRUFBOEI7QUFDaEYsVUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtBQUN6QixlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsVUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLFVBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUM3QyxlQUFPLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUNyRCxNQUFNO0FBQ0wsZUFBTyxHQUFHLElBQUksZ0JBQUcsZUFBZSxFQUFFLENBQUM7QUFDbkMsWUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkQsaUNBQVUsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUNqQyxZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsNkJBQTZCLEVBQUUsVUFBVSxDQUFDLENBQUM7T0FDMUU7QUFDRCwrQkFBVSxPQUFPLElBQUksSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBTSxNQUF3QixHQUFJLE1BQU0seUJBQXlCLENBQUMsT0FBTyxDQUFDLEFBQU0sQ0FBQztBQUNqRixVQUFJLENBQUMsb0JBQW9CLFVBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM3QyxhQUFPLE1BQU0sQ0FBQztLQUNmOzs7V0FFa0MsNkNBQUMsY0FBZ0MsRUFBUTtVQUV4RSxVQUFVLEdBR1IsY0FBYyxDQUhoQixVQUFVO1VBQ1YsTUFBTSxHQUVKLGNBQWMsQ0FGaEIsTUFBTTtVQUNOLEtBQUssR0FDSCxjQUFjLENBRGhCLEtBQUs7O0FBRVAsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMxRCxVQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7O0FBRW5CLGVBQU87T0FDUjtBQUNELFVBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixlQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ3hCLE1BQU07QUFDTCxlQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZCLGVBQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztPQUN2QjtLQUNGOzs7V0FFZ0IsMkJBQUMsUUFBZSxFQUFROzs7O0FBSXZDLFVBQU0sS0FBcUMsR0FBRyxRQUFRLENBQUM7QUFDdkQsY0FBUSxLQUFLLENBQUMsT0FBTztBQUNuQixhQUFLLGNBQWM7QUFDakIsa0JBQVEsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbkIsaUJBQUssT0FBTztBQUNWLGtCQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUMzQixrQkFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2xCLG9CQUFNO0FBQUEsQUFDUixpQkFBSyxtQkFBbUI7QUFDdEIsa0JBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUMsb0JBQU07QUFBQSxBQUNSLGlCQUFLLG9CQUFvQjtBQUN2QixrQkFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QyxvQkFBTTtBQUFBLEFBQ1IsaUJBQUssaUJBQWlCO0FBQ3BCLGtCQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztBQUM5QixvQkFBTTtBQUFBLEFBQ1IsaUJBQUssaUJBQWlCO0FBQ3BCLGtCQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxvQkFBTTtBQUFBLEFBQ1IsaUJBQUssbUJBQW1CO0FBQ3RCLGtCQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLG9CQUFNO0FBQUEsQUFDUixpQkFBSyxnQkFBZ0I7QUFDbkIsa0JBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUMsb0JBQU07QUFBQSxBQUNSLGlCQUFLLDhCQUE4QjtBQUNqQyxrQkFBSSxDQUFDLG1DQUFtQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4RCxvQkFBTTtBQUFBLFdBQ1Q7QUFDRCxnQkFBTTtBQUFBLE9BQ1Q7S0FDRjs7O1dBRW9CLCtCQUFDLGNBQW9DLEVBQVE7QUFDaEUsVUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUMsNEJBQWEsTUFBTSxDQUFDLENBQUM7S0FDckU7OztXQUVxQixrQ0FBUztBQUM3QixVQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsVUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUMsNEJBQWEsT0FBTyxDQUFDLENBQUM7S0FDdEU7OztXQUV3QixtQ0FBQyxlQUF5RCxFQUFFOzs7QUFDbkYsVUFBSSxlQUFlLEVBQUU7O0FBQ25CLGNBQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQztBQUNoQyxjQUFNLElBQUksR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMxRCxjQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLEVBQUU7O0FBQzFDLGdCQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBQyxjQUFjLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDL0Qsb0JBQUssNkJBQTZCLEVBQUUsQ0FBQztBQUNyQyxvQkFBSyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzFELENBQUMsQ0FBQztXQUNKOztPQUNGLE1BQU07QUFDTCxZQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztPQUN0QztLQUNGOzs7V0FFa0IsNkJBQUMsZUFBeUQsRUFBRTtBQUM3RSxVQUFJLGVBQWUsRUFBRTs7QUFDbkIsY0FBTSxPQUFPLEdBQUcsZUFBZSxDQUFDO0FBQ2hDLGNBQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFELGNBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksRUFBRTs7QUFDMUMsZ0JBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUMvRCxvQkFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELG9CQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDekQsQ0FBQyxDQUFDO1dBQ0o7O09BQ0Y7S0FDRjs7O1dBRXNCLGlDQUFDLE1BQXVCLEVBQUUsSUFBWSxFQUFFO0FBQzdELFVBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQ25DLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFDN0IsRUFBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO0FBQzVDLFlBQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFO0FBQzVCLFlBQUksRUFBRSxNQUFNO0FBQ1osaUJBQU8sZ0NBQWdDO09BQ3hDLENBQUMsQ0FBQztBQUNILFVBQUksQ0FBQyx3QkFBd0IsR0FBRyxNQUFNLENBQUM7S0FDeEM7OztXQUVhLHdCQUFDLFFBQWlELEVBQUU7QUFDaEUsVUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRTNELFVBQUksSUFBSSxFQUFFO0FBQ1IsWUFBSTtBQUNGLGNBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUM7QUFDcEMsY0FBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ25GLFNBQVM7QUFDUixjQUFJLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxDQUFDO1NBQ3RDO09BQ0Y7S0FDRjs7O1dBRWdCLDJCQUFDLFFBQWlELEVBQUU7QUFDbkUsVUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRTNELFVBQUksSUFBSSxFQUFFO0FBQ1IsWUFBSTtBQUNGLGNBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUM7QUFDcEMsY0FBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDdEYsU0FBUztBQUNSLGNBQUksQ0FBQyx1QkFBdUIsR0FBRyxLQUFLLENBQUM7U0FDdEM7T0FDRjtLQUNGOzs7V0FFNEIseUNBQUc7QUFDOUIsVUFBSSxJQUFJLENBQUMsd0JBQXdCLEVBQUU7QUFDakMsWUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3hDLFlBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7T0FDdEM7S0FDRjs7O1dBRTJCLHNDQUFDLElBQVksRUFBRTtBQUN6QyxVQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztLQUM1Qjs7O1dBRWtCLCtCQUFHOzs7O0FBRXBCLFVBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDOUIsVUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUU7O0FBQzVDLGNBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNuQixpQkFBSyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBRSxHQUFHLEVBQUs7QUFDbEYsbUJBQU8sQ0FBQyxJQUFJLENBQUM7QUFDWCx1QkFBUyxFQUFFLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDO0FBQ3pDLHdCQUFVLEVBQUUsSUFBSTthQUNqQixDQUFDLENBQUM7V0FDSixDQUFDLENBQUM7QUFDSCxpQkFBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUM7O09BQ3JEO0tBQ0Y7OztXQUVTLHNCQUFHO0FBQ1gsVUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtBQUN6QixZQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztPQUN2QztLQUNGOzs7U0F4UEcsTUFBTTs7O0FBNFBaLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwiZmlsZSI6IkJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIERlYnVnZ2VyTW9kZWwgZnJvbSAnLi9EZWJ1Z2dlck1vZGVsJztcblxudHlwZSBFeHByZXNzaW9uUmVzdWx0ID0ge1xuICBleHByZXNzaW9uOiBzdHJpbmc7XG4gIHJlc3VsdDogP0V2YWx1YXRpb25SZXN1bHQ7XG4gIGVycm9yOiA/T2JqZWN0O1xufTtcblxuZXhwb3J0IHR5cGUgRXZhbHVhdGlvblJlc3VsdCA9IHtcbiAgX3R5cGU6IHN0cmluZztcbiAgLy8gRWl0aGVyOlxuICB2YWx1ZT86IHN0cmluZztcbiAgLy8gT3I6XG4gIF9kZXNjcmlwdGlvbj8gOiBzdHJpbmc7XG59O1xuXG5pbXBvcnQgUnggZnJvbSAncngnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaScpO1xuaW1wb3J0IHtEZWJ1Z2dlck1vZGV9IGZyb20gJy4vRGVidWdnZXJTdG9yZSc7XG5cbmNvbnN0IElOSkVDVEVEX0NTUyA9IFtcbiAgLyogRm9yY2UgdGhlIGluc3BlY3RvciB0byBzY3JvbGwgdmVydGljYWxseSBvbiBBdG9tIOKJpSAxLjQuMCAqL1xuICAnYm9keSA+IC5yb290LXZpZXcge292ZXJmbG93LXk6IHNjcm9sbDt9JyxcbiAgLyogRm9yY2UgdGhlIGNvbnRlbnRzIG9mIHRoZSBtaW5pIGNvbnNvbGUgKG9uIHRoZSBib3R0b20pIHRvIHNjcm9sbCB2ZXJ0aWNhbGx5ICovXG4gICcuaW5zZXJ0aW9uLXBvaW50LXNpZGViYXIjZHJhd2VyLWNvbnRlbnRzIHtvdmVyZmxvdy15OiBhdXRvO30nLFxuXS5qb2luKCcnKTtcblxuYXN5bmMgZnVuY3Rpb24gcHJvbWlzZUZvckJlaGF2aW9yU3ViamVjdDxUPihzdWJqZWN0OiBSeC5CZWhhdmlvclN1YmplY3Q8VD4pOiBQcm9taXNlPD9UPiB7XG4gIHRyeSB7XG4gICAgYXdhaXQgc3ViamVjdC50b1Byb21pc2UoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGdldExvZ2dlcigpLndhcm4oJ3Byb21pc2VGb3JCZWhhdmlvclN1YmplY3Q6IFN1YmplY3Qgb2JzZXJ2ZWQgZXJyb3IuJywgZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIHN1YmplY3QuZ2V0VmFsdWUoKTtcbn1cblxuY2xhc3MgQnJpZGdlIHtcbiAgX2RlYnVnZ2VyTW9kZWw6IERlYnVnZ2VyTW9kZWw7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgLy8gQ29udGFpbnMgZGlzcG9zYWJsZSBpdGVtcyBzaG91bGQgYmUgZGlzcG9zZWQgYnlcbiAgLy8gY2xlYW51cCgpIG1ldGhvZC5cbiAgX2NsZWFudXBEaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyOiA/YXRvbSRNYXJrZXI7XG4gIF93ZWJ2aWV3OiA/V2Vidmlld0VsZW1lbnQ7XG4gIF9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jOiBib29sZWFuO1xuICAvLyBUcmFja3MgcmVxdWVzdHMgZm9yIGV4cHJlc3Npb24gZXZhbHVhdGlvbiwga2V5ZWQgYnkgdGhlIGV4cHJlc3Npb24gYm9keS5cbiAgX2V4cHJlc3Npb25zSW5GbGlnaHQ6IE1hcDxzdHJpbmcsIFJ4LkJlaGF2aW9yU3ViamVjdDw/RXZhbHVhdGlvblJlc3VsdD4+O1xuXG4gIGNvbnN0cnVjdG9yKGRlYnVnZ2VyTW9kZWw6IERlYnVnZ2VyTW9kZWwpIHtcbiAgICB0aGlzLl9kZWJ1Z2dlck1vZGVsID0gZGVidWdnZXJNb2RlbDtcbiAgICB0aGlzLl9jbGVhbnVwRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyID0gbnVsbDtcbiAgICB0aGlzLl93ZWJ2aWV3ID0gbnVsbDtcbiAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gZmFsc2U7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGRlYnVnZ2VyTW9kZWwuZ2V0QnJlYWtwb2ludFN0b3JlKCkub25DaGFuZ2UodGhpcy5faGFuZGxlQnJlYWtwb2ludFN0b3JlQ2hhbmdlLmJpbmQodGhpcykpLFxuICAgICk7XG4gICAgdGhpcy5fZXhwcmVzc2lvbnNJbkZsaWdodCA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIHNldFdlYnZpZXdFbGVtZW50KHdlYnZpZXc6IFdlYnZpZXdFbGVtZW50KSB7XG4gICAgdGhpcy5fd2VidmlldyA9IHdlYnZpZXc7XG4gICAgY29uc3QgYm91bmRIYW5kbGVyID0gdGhpcy5faGFuZGxlSXBjTWVzc2FnZS5iaW5kKHRoaXMpO1xuICAgIHdlYnZpZXcuYWRkRXZlbnRMaXN0ZW5lcignaXBjLW1lc3NhZ2UnLCBib3VuZEhhbmRsZXIpO1xuICAgIHRoaXMuX2NsZWFudXBEaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT5cbiAgICAgIHdlYnZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignaXBjLW1lc3NhZ2UnLCBib3VuZEhhbmRsZXIpKSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuY2xlYW51cCgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8vIENsZWFuIHVwIGFueSBzdGF0ZSBjaGFuZ2VkIGFmdGVyIGNvbnN0cnVjdG9yLlxuICBjbGVhbnVwKCkge1xuICAgIHRoaXMuX2NsZWFudXBEaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fd2VidmlldyA9IG51bGw7XG4gICAgdGhpcy5fY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpO1xuICB9XG5cbiAgY29udGludWUoKSB7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdDb250aW51ZScpO1xuICAgIH1cbiAgfVxuXG4gIHN0ZXBPdmVyKCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3RlcE92ZXInKTtcbiAgICB9XG4gIH1cblxuICBzdGVwSW50bygpIHtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdjb21tYW5kJywgJ1N0ZXBJbnRvJyk7XG4gICAgfVxuICB9XG5cbiAgc3RlcE91dCgpIHtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdjb21tYW5kJywgJ1N0ZXBPdXQnKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBldmFsdWF0ZU9uU2VsZWN0ZWRDYWxsRnJhbWUoZXhwcmVzc2lvbjogc3RyaW5nKTogUHJvbWlzZTw/RXZhbHVhdGlvblJlc3VsdD4ge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgc3ViamVjdDtcbiAgICBpZiAodGhpcy5fZXhwcmVzc2lvbnNJbkZsaWdodC5oYXMoZXhwcmVzc2lvbikpIHtcbiAgICAgIHN1YmplY3QgPSB0aGlzLl9leHByZXNzaW9uc0luRmxpZ2h0LmdldChleHByZXNzaW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3ViamVjdCA9IG5ldyBSeC5CZWhhdmlvclN1YmplY3QoKTtcbiAgICAgIHRoaXMuX2V4cHJlc3Npb25zSW5GbGlnaHQuc2V0KGV4cHJlc3Npb24sIHN1YmplY3QpO1xuICAgICAgaW52YXJpYW50KHRoaXMuX3dlYnZpZXcgIT0gbnVsbCk7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnZXZhbHVhdGVPblNlbGVjdGVkQ2FsbEZyYW1lJywgZXhwcmVzc2lvbik7XG4gICAgfVxuICAgIGludmFyaWFudChzdWJqZWN0ICE9IG51bGwpO1xuICAgIGNvbnN0IHJlc3VsdDogRXZhbHVhdGlvblJlc3VsdCA9IChhd2FpdCBwcm9taXNlRm9yQmVoYXZpb3JTdWJqZWN0KHN1YmplY3QpOiBhbnkpO1xuICAgIHRoaXMuX2V4cHJlc3Npb25zSW5GbGlnaHQuZGVsZXRlKGV4cHJlc3Npb24pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBfaGFuZGxlRXhwcmVzc2lvbkV2YWx1YXRpb25SZXNwb25zZShhZGRpdGlvbmFsRGF0YTogRXhwcmVzc2lvblJlc3VsdCk6IHZvaWQge1xuICAgIGNvbnN0IHtcbiAgICAgIGV4cHJlc3Npb24sXG4gICAgICByZXN1bHQsXG4gICAgICBlcnJvcixcbiAgICB9ID0gYWRkaXRpb25hbERhdGE7XG4gICAgY29uc3Qgc3ViamVjdCA9IHRoaXMuX2V4cHJlc3Npb25zSW5GbGlnaHQuZ2V0KGV4cHJlc3Npb24pO1xuICAgIGlmIChzdWJqZWN0ID09IG51bGwpIHtcbiAgICAgIC8vIE5vYm9keSBpcyBsaXN0ZW5pbmcgZm9yIHRoZSByZXN1bHQgb2YgdGhpcyBleHByZXNzaW9uLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXJyb3IgIT0gbnVsbCkge1xuICAgICAgc3ViamVjdC5vbkVycm9yKGVycm9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3ViamVjdC5vbk5leHQocmVzdWx0KTtcbiAgICAgIHN1YmplY3Qub25Db21wbGV0ZWQoKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlSXBjTWVzc2FnZShzdGRFdmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBhZGRFdmVudExpc3RlbmVyIGV4cGVjdHMgaXRzIGNhbGxiYWNrIHRvIHRha2UgYW4gRXZlbnQuIEknbSBub3Qgc3VyZSBob3cgdG8gcmVjb25jaWxlIGl0IHdpdGhcbiAgICAvLyB0aGUgdHlwZSB0aGF0IGlzIGV4cGVjdGVkIGhlcmUuXG4gICAgLy8gJEZsb3dGaXhNZShqZWZmcmV5dGFuKVxuICAgIGNvbnN0IGV2ZW50OiB7Y2hhbm5lbDogc3RyaW5nOyBhcmdzOiBhbnlbXX0gPSBzdGRFdmVudDtcbiAgICBzd2l0Y2ggKGV2ZW50LmNoYW5uZWwpIHtcbiAgICAgIGNhc2UgJ25vdGlmaWNhdGlvbic6XG4gICAgICAgIHN3aXRjaCAoZXZlbnQuYXJnc1swXSkge1xuICAgICAgICAgIGNhc2UgJ3JlYWR5JzpcbiAgICAgICAgICAgIHRoaXMuX3NlbmRBbGxCcmVha3BvaW50cygpO1xuICAgICAgICAgICAgdGhpcy5faW5qZWN0Q1NTKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdDYWxsRnJhbWVTZWxlY3RlZCc6XG4gICAgICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZENhbGxGcmFtZUxpbmUoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdPcGVuU291cmNlTG9jYXRpb24nOlxuICAgICAgICAgICAgdGhpcy5fb3BlblNvdXJjZUxvY2F0aW9uKGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnRGVidWdnZXJSZXN1bWVkJzpcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZURlYnVnZ2VyUmVzdW1lZCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnQnJlYWtwb2ludEFkZGVkJzpcbiAgICAgICAgICAgIHRoaXMuX2FkZEJyZWFrcG9pbnQoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdCcmVha3BvaW50UmVtb3ZlZCc6XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVCcmVha3BvaW50KGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnRGVidWdnZXJQYXVzZWQnOlxuICAgICAgICAgICAgdGhpcy5faGFuZGxlRGVidWdnZXJQYXVzZWQoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdFeHByZXNzaW9uRXZhbHVhdGlvblJlc3BvbnNlJzpcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUV4cHJlc3Npb25FdmFsdWF0aW9uUmVzcG9uc2UoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlRGVidWdnZXJQYXVzZWQoYWRkaXRpb25hbERhdGE6IHtzb3VyY2VVcmw/OiBzdHJpbmd9KTogdm9pZCB7XG4gICAgdGhpcy5fZGVidWdnZXJNb2RlbC5nZXRTdG9yZSgpLnNldERlYnVnZ2VyTW9kZShEZWJ1Z2dlck1vZGUuUEFVU0VEKTtcbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z2dlclJlc3VtZWQoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0U2VsZWN0ZWRDYWxsRnJhbWVMaW5lKG51bGwpO1xuICAgIHRoaXMuX2RlYnVnZ2VyTW9kZWwuZ2V0U3RvcmUoKS5zZXREZWJ1Z2dlck1vZGUoRGVidWdnZXJNb2RlLlJVTk5JTkcpO1xuICB9XG5cbiAgX3NldFNlbGVjdGVkQ2FsbEZyYW1lTGluZShudWxsYWJsZU9wdGlvbnM6ID97c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBpZiAobnVsbGFibGVPcHRpb25zKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gbnVsbGFibGVPcHRpb25zOyAvLyBGb3IgdXNlIGluIGNhcHR1cmUgd2l0aG91dCByZS1jaGVja2luZyBudWxsXG4gICAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShvcHRpb25zLnNvdXJjZVVSTCk7XG4gICAgICBpZiAocGF0aCAhPSBudWxsICYmIGF0b20ud29ya3NwYWNlICE9IG51bGwpIHsgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCwge3NlYXJjaEFsbFBhbmVzOiB0cnVlfSkudGhlbihlZGl0b3IgPT4ge1xuICAgICAgICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIoKTtcbiAgICAgICAgICB0aGlzLl9oaWdobGlnaHRDYWxsRnJhbWVMaW5lKGVkaXRvciwgb3B0aW9ucy5saW5lTnVtYmVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIoKTtcbiAgICB9XG4gIH1cblxuICBfb3BlblNvdXJjZUxvY2F0aW9uKG51bGxhYmxlT3B0aW9uczogP3tzb3VyY2VVUkw6IHN0cmluZzsgbGluZU51bWJlcjogbnVtYmVyfSkge1xuICAgIGlmIChudWxsYWJsZU9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBudWxsYWJsZU9wdGlvbnM7IC8vIEZvciB1c2UgaW4gY2FwdHVyZSB3aXRob3V0IHJlLWNoZWNraW5nIG51bGxcbiAgICAgIGNvbnN0IHBhdGggPSByZW1vdGVVcmkudXJpVG9OdWNsaWRlVXJpKG9wdGlvbnMuc291cmNlVVJMKTtcbiAgICAgIGlmIChwYXRoICE9IG51bGwgJiYgYXRvbS53b3Jrc3BhY2UgIT0gbnVsbCkgeyAvLyBvbmx5IGhhbmRsZSByZWFsIGZpbGVzIGZvciBub3cuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCwge3NlYXJjaEFsbFBhbmVzOiB0cnVlfSkudGhlbihlZGl0b3IgPT4ge1xuICAgICAgICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtvcHRpb25zLmxpbmVOdW1iZXIsIDBdKTtcbiAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW29wdGlvbnMubGluZU51bWJlciwgMF0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaGlnaGxpZ2h0Q2FsbEZyYW1lTGluZShlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgbGluZTogbnVtYmVyKSB7XG4gICAgY29uc3QgbWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShcbiAgICAgIFtbbGluZSwgMF0sIFtsaW5lLCBJbmZpbml0eV1dLFxuICAgICAge3BlcnNpc3RlbnQ6IGZhbHNlLCBpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgY2xhc3M6ICdudWNsaWRlLWN1cnJlbnQtbGluZS1oaWdobGlnaHQnLFxuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyID0gbWFya2VyO1xuICB9XG5cbiAgX2FkZEJyZWFrcG9pbnQobG9jYXRpb246IHtzb3VyY2VVUkw6IHN0cmluZzsgbGluZU51bWJlcjogbnVtYmVyfSkge1xuICAgIGNvbnN0IHBhdGggPSByZW1vdGVVcmkudXJpVG9OdWNsaWRlVXJpKGxvY2F0aW9uLnNvdXJjZVVSTCk7XG4gICAgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93LlxuICAgIGlmIChwYXRoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fZGVidWdnZXJNb2RlbC5nZXRCcmVha3BvaW50U3RvcmUoKS5hZGRCcmVha3BvaW50KHBhdGgsIGxvY2F0aW9uLmxpbmVOdW1iZXIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9yZW1vdmVCcmVha3BvaW50KGxvY2F0aW9uOiB7c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShsb2NhdGlvbi5zb3VyY2VVUkwpO1xuICAgIC8vIG9ubHkgaGFuZGxlIHJlYWwgZmlsZXMgZm9yIG5vdy5cbiAgICBpZiAocGF0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2RlYnVnZ2VyTW9kZWwuZ2V0QnJlYWtwb2ludFN0b3JlKCkuZGVsZXRlQnJlYWtwb2ludChwYXRoLCBsb2NhdGlvbi5saW5lTnVtYmVyKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuX3N1cHByZXNzQnJlYWtwb2ludFN5bmMgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpIHtcbiAgICBpZiAodGhpcy5fc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlQnJlYWtwb2ludFN0b3JlQ2hhbmdlKHBhdGg6IHN0cmluZykge1xuICAgIHRoaXMuX3NlbmRBbGxCcmVha3BvaW50cygpO1xuICB9XG5cbiAgX3NlbmRBbGxCcmVha3BvaW50cygpIHtcbiAgICAvLyBTZW5kIGFuIGFycmF5IG9mIGZpbGUvbGluZSBvYmplY3RzLlxuICAgIGNvbnN0IHdlYnZpZXcgPSB0aGlzLl93ZWJ2aWV3O1xuICAgIGlmICh3ZWJ2aWV3ICYmICF0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jKSB7XG4gICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICB0aGlzLl9kZWJ1Z2dlck1vZGVsLmdldEJyZWFrcG9pbnRTdG9yZSgpLmdldEFsbEJyZWFrcG9pbnRzKCkuZm9yRWFjaCgobGluZSwga2V5KSA9PiB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgc291cmNlVVJMOiByZW1vdGVVcmkubnVjbGlkZVVyaVRvVXJpKGtleSksXG4gICAgICAgICAgbGluZU51bWJlcjogbGluZSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHdlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdTeW5jQnJlYWtwb2ludHMnLCByZXN1bHRzKTtcbiAgICB9XG4gIH1cblxuICBfaW5qZWN0Q1NTKCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuaW5zZXJ0Q1NTKElOSkVDVEVEX0NTUyk7XG4gICAgfVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCcmlkZ2U7XG4iXX0=