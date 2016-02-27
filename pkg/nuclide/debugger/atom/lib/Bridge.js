var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var remoteUri = require('../../../remote-uri');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

var INJECTED_CSS = [
/* Force the inspector to scroll vertically on Atom ≥ 1.4.0 */
'body > .root-view {overflow-y: scroll;}',
/* Force the contents of the mini console (on the bottom) to scroll vertically */
'.insertion-point-sidebar#drawer-contents {overflow-y: auto;}'].join('');

var Bridge = (function () {
  function Bridge(breakpointStore) {
    _classCallCheck(this, Bridge);

    this._breakpointStore = breakpointStore;
    this._cleanupDisposables = new CompositeDisposable();
    this._selectedCallFrameMarker = null;
    this._webview = null;
    this._suppressBreakpointSync = false;
    this._disposables = new CompositeDisposable(breakpointStore.onChange(this._handleBreakpointStoreChange.bind(this)));
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
              this._setSelectedCallFrameLine(null);
              break;
            case 'BreakpointAdded':
              this._addBreakpoint(event.args[1]);
              break;
            case 'BreakpointRemoved':
              this._removeBreakpoint(event.args[1]);
              break;
          }
          break;
      }
    }
  }, {
    key: '_setSelectedCallFrameLine',
    value: function _setSelectedCallFrameLine(nullableOptions) {
      var _this = this;

      if (nullableOptions) {
        (function () {
          var options = nullableOptions; // For use in capture without re-checking null
          var path = remoteUri.uriToNuclideUri(options.sourceURL);
          if (path != null) {
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
          if (path != null) {
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
          this._breakpointStore.addBreakpoint(path, location.lineNumber);
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
          this._breakpointStore.deleteBreakpoint(path, location.lineNumber);
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
          _this2._breakpointStore.getAllBreakpoints().forEach(function (line, key) {
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

// Contains disposable items should be disposed by
// cleanup() method.
// $FlowFixMe(jeffreytan)
//# sourceMappingURL=data:application/json;base64,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QUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUM5QixVQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRTs7QUFDNUMsY0FBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ25CLGlCQUFLLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBSztBQUMvRCxtQkFBTyxDQUFDLElBQUksQ0FBQztBQUNYLHVCQUFTLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUM7QUFDekMsd0JBQVUsRUFBRSxJQUFJO2FBQ2pCLENBQUMsQ0FBQztXQUNKLENBQUMsQ0FBQztBQUNILGlCQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQzs7T0FDckQ7S0FDRjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ3pCLFlBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQ3ZDO0tBQ0Y7OztTQWhNRyxNQUFNOzs7QUFtTVosTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMiLCJmaWxlIjoiQnJpZGdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5pbXBvcnQgdHlwZSBCcmVha3BvaW50U3RvcmVUeXBlIGZyb20gJy4vQnJlYWtwb2ludFN0b3JlJztcblxuY29uc3QgSU5KRUNURURfQ1NTID0gW1xuICAvKiBGb3JjZSB0aGUgaW5zcGVjdG9yIHRvIHNjcm9sbCB2ZXJ0aWNhbGx5IG9uIEF0b20g4omlIDEuNC4wICovXG4gICdib2R5ID4gLnJvb3QtdmlldyB7b3ZlcmZsb3cteTogc2Nyb2xsO30nLFxuICAvKiBGb3JjZSB0aGUgY29udGVudHMgb2YgdGhlIG1pbmkgY29uc29sZSAob24gdGhlIGJvdHRvbSkgdG8gc2Nyb2xsIHZlcnRpY2FsbHkgKi9cbiAgJy5pbnNlcnRpb24tcG9pbnQtc2lkZWJhciNkcmF3ZXItY29udGVudHMge292ZXJmbG93LXk6IGF1dG87fScsXG5dLmpvaW4oJycpO1xuXG5jbGFzcyBCcmlkZ2Uge1xuICBfYnJlYWtwb2ludFN0b3JlOiBCcmVha3BvaW50U3RvcmVUeXBlO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIC8vIENvbnRhaW5zIGRpc3Bvc2FibGUgaXRlbXMgc2hvdWxkIGJlIGRpc3Bvc2VkIGJ5XG4gIC8vIGNsZWFudXAoKSBtZXRob2QuXG4gIF9jbGVhbnVwRGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9zZWxlY3RlZENhbGxGcmFtZU1hcmtlcjogP2F0b20kTWFya2VyO1xuICBfd2VidmlldzogP1dlYnZpZXdFbGVtZW50O1xuICBfc3VwcHJlc3NCcmVha3BvaW50U3luYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihicmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZVR5cGUpIHtcbiAgICB0aGlzLl9icmVha3BvaW50U3RvcmUgPSBicmVha3BvaW50U3RvcmU7XG4gICAgdGhpcy5fY2xlYW51cERpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlciA9IG51bGw7XG4gICAgdGhpcy5fd2VidmlldyA9IG51bGw7XG4gICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IGZhbHNlO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBicmVha3BvaW50U3RvcmUub25DaGFuZ2UodGhpcy5faGFuZGxlQnJlYWtwb2ludFN0b3JlQ2hhbmdlLmJpbmQodGhpcykpLFxuICAgICk7XG4gIH1cblxuICBzZXRXZWJ2aWV3RWxlbWVudCh3ZWJ2aWV3OiBXZWJ2aWV3RWxlbWVudCkge1xuICAgIHRoaXMuX3dlYnZpZXcgPSB3ZWJ2aWV3O1xuICAgIGNvbnN0IGJvdW5kSGFuZGxlciA9IHRoaXMuX2hhbmRsZUlwY01lc3NhZ2UuYmluZCh0aGlzKTtcbiAgICB3ZWJ2aWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2lwYy1tZXNzYWdlJywgYm91bmRIYW5kbGVyKTtcbiAgICB0aGlzLl9jbGVhbnVwRGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+XG4gICAgICB3ZWJ2aWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lwYy1tZXNzYWdlJywgYm91bmRIYW5kbGVyKSkpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmNsZWFudXAoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICAvLyBDbGVhbiB1cCBhbnkgc3RhdGUgY2hhbmdlZCBhZnRlciBjb25zdHJ1Y3Rvci5cbiAgY2xlYW51cCgpIHtcbiAgICB0aGlzLl9jbGVhbnVwRGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIHRoaXMuX3dlYnZpZXcgPSBudWxsO1xuICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIoKTtcbiAgfVxuXG4gIGNvbnRpbnVlKCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnQ29udGludWUnKTtcbiAgICB9XG4gIH1cblxuICBzdGVwT3ZlcigpIHtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdjb21tYW5kJywgJ1N0ZXBPdmVyJyk7XG4gICAgfVxuICB9XG5cbiAgc3RlcEludG8oKSB7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdTdGVwSW50bycpO1xuICAgIH1cbiAgfVxuXG4gIHN0ZXBPdXQoKSB7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdTdGVwT3V0Jyk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUlwY01lc3NhZ2Uoc3RkRXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgLy8gYWRkRXZlbnRMaXN0ZW5lciBleHBlY3RzIGl0cyBjYWxsYmFjayB0byB0YWtlIGFuIEV2ZW50LiBJJ20gbm90IHN1cmUgaG93IHRvIHJlY29uY2lsZSBpdCB3aXRoXG4gICAgLy8gdGhlIHR5cGUgdGhhdCBpcyBleHBlY3RlZCBoZXJlLlxuICAgIC8vICRGbG93Rml4TWUoamVmZnJleXRhbilcbiAgICBjb25zdCBldmVudDoge2NoYW5uZWw6IHN0cmluZzsgYXJnczogYW55W119ID0gc3RkRXZlbnQ7XG4gICAgc3dpdGNoIChldmVudC5jaGFubmVsKSB7XG4gICAgICBjYXNlICdub3RpZmljYXRpb24nOlxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmFyZ3NbMF0pIHtcbiAgICAgICAgICBjYXNlICdyZWFkeSc6XG4gICAgICAgICAgICB0aGlzLl9zZW5kQWxsQnJlYWtwb2ludHMoKTtcbiAgICAgICAgICAgIHRoaXMuX2luamVjdENTUygpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnQ2FsbEZyYW1lU2VsZWN0ZWQnOlxuICAgICAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRDYWxsRnJhbWVMaW5lKGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnT3BlblNvdXJjZUxvY2F0aW9uJzpcbiAgICAgICAgICAgIHRoaXMuX29wZW5Tb3VyY2VMb2NhdGlvbihldmVudC5hcmdzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ0RlYnVnZ2VyUmVzdW1lZCc6XG4gICAgICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZENhbGxGcmFtZUxpbmUobnVsbCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdCcmVha3BvaW50QWRkZWQnOlxuICAgICAgICAgICAgdGhpcy5fYWRkQnJlYWtwb2ludChldmVudC5hcmdzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ0JyZWFrcG9pbnRSZW1vdmVkJzpcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUJyZWFrcG9pbnQoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfc2V0U2VsZWN0ZWRDYWxsRnJhbWVMaW5lKG51bGxhYmxlT3B0aW9uczogP3tzb3VyY2VVUkw6IHN0cmluZzsgbGluZU51bWJlcjogbnVtYmVyfSkge1xuICAgIGlmIChudWxsYWJsZU9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBudWxsYWJsZU9wdGlvbnM7IC8vIEZvciB1c2UgaW4gY2FwdHVyZSB3aXRob3V0IHJlLWNoZWNraW5nIG51bGxcbiAgICAgIGNvbnN0IHBhdGggPSByZW1vdGVVcmkudXJpVG9OdWNsaWRlVXJpKG9wdGlvbnMuc291cmNlVVJMKTtcbiAgICAgIGlmIChwYXRoICE9IG51bGwpIHsgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCwge3NlYXJjaEFsbFBhbmVzOiB0cnVlfSkudGhlbihlZGl0b3IgPT4ge1xuICAgICAgICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIoKTtcbiAgICAgICAgICB0aGlzLl9oaWdobGlnaHRDYWxsRnJhbWVMaW5lKGVkaXRvciwgb3B0aW9ucy5saW5lTnVtYmVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIoKTtcbiAgICB9XG4gIH1cblxuICBfb3BlblNvdXJjZUxvY2F0aW9uKG51bGxhYmxlT3B0aW9uczogP3tzb3VyY2VVUkw6IHN0cmluZzsgbGluZU51bWJlcjogbnVtYmVyfSkge1xuICAgIGlmIChudWxsYWJsZU9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBudWxsYWJsZU9wdGlvbnM7IC8vIEZvciB1c2UgaW4gY2FwdHVyZSB3aXRob3V0IHJlLWNoZWNraW5nIG51bGxcbiAgICAgIGNvbnN0IHBhdGggPSByZW1vdGVVcmkudXJpVG9OdWNsaWRlVXJpKG9wdGlvbnMuc291cmNlVVJMKTtcbiAgICAgIGlmIChwYXRoICE9IG51bGwpIHsgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93LlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgsIHtzZWFyY2hBbGxQYW5lczogdHJ1ZX0pLnRoZW4oZWRpdG9yID0+IHtcbiAgICAgICAgICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbb3B0aW9ucy5saW5lTnVtYmVyLCAwXSk7XG4gICAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtvcHRpb25zLmxpbmVOdW1iZXIsIDBdKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2hpZ2hsaWdodENhbGxGcmFtZUxpbmUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIGxpbmU6IG51bWJlcikge1xuICAgIGNvbnN0IG1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoXG4gICAgICBbW2xpbmUsIDBdLCBbbGluZSwgSW5maW5pdHldXSxcbiAgICAgIHtwZXJzaXN0ZW50OiBmYWxzZSwgaW52YWxpZGF0ZTogJ25ldmVyJ30pO1xuICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgIGNsYXNzOiAnbnVjbGlkZS1jdXJyZW50LWxpbmUtaGlnaGxpZ2h0JyxcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlciA9IG1hcmtlcjtcbiAgfVxuXG4gIF9hZGRCcmVha3BvaW50KGxvY2F0aW9uOiB7c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShsb2NhdGlvbi5zb3VyY2VVUkwpO1xuICAgIC8vIG9ubHkgaGFuZGxlIHJlYWwgZmlsZXMgZm9yIG5vdy5cbiAgICBpZiAocGF0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5hZGRCcmVha3BvaW50KHBhdGgsIGxvY2F0aW9uLmxpbmVOdW1iZXIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9yZW1vdmVCcmVha3BvaW50KGxvY2F0aW9uOiB7c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShsb2NhdGlvbi5zb3VyY2VVUkwpO1xuICAgIC8vIG9ubHkgaGFuZGxlIHJlYWwgZmlsZXMgZm9yIG5vdy5cbiAgICBpZiAocGF0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5kZWxldGVCcmVha3BvaW50KHBhdGgsIGxvY2F0aW9uLmxpbmVOdW1iZXIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9jbGVhclNlbGVjdGVkQ2FsbEZyYW1lTWFya2VyKCkge1xuICAgIGlmICh0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlcikge1xuICAgICAgdGhpcy5fc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVCcmVha3BvaW50U3RvcmVDaGFuZ2UocGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5fc2VuZEFsbEJyZWFrcG9pbnRzKCk7XG4gIH1cblxuICBfc2VuZEFsbEJyZWFrcG9pbnRzKCkge1xuICAgIC8vIFNlbmQgYW4gYXJyYXkgb2YgZmlsZS9saW5lIG9iamVjdHMuXG4gICAgY29uc3Qgd2VidmlldyA9IHRoaXMuX3dlYnZpZXc7XG4gICAgaWYgKHdlYnZpZXcgJiYgIXRoaXMuX3N1cHByZXNzQnJlYWtwb2ludFN5bmMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5nZXRBbGxCcmVha3BvaW50cygpLmZvckVhY2goKGxpbmUsIGtleSkgPT4ge1xuICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgIHNvdXJjZVVSTDogcmVtb3RlVXJpLm51Y2xpZGVVcmlUb1VyaShrZXkpLFxuICAgICAgICAgIGxpbmVOdW1iZXI6IGxpbmUsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB3ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3luY0JyZWFrcG9pbnRzJywgcmVzdWx0cyk7XG4gICAgfVxuICB9XG5cbiAgX2luamVjdENTUygpIHtcbiAgICBpZiAodGhpcy5fd2VidmlldyAhPSBudWxsKSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3Lmluc2VydENTUyhJTkpFQ1RFRF9DU1MpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJyaWRnZTtcbiJdfQ==