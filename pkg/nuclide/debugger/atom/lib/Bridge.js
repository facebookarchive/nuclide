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
'body > .root-view {overflow-y: scroll;}'].join('');

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
          if (path) {
            // only handle real files for now
            atom.workspace.open(path).then(function (editor) {
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
          if (path) {
            // only handle real files for now.
            atom.workspace.open(path).then(function (editor) {
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
//# sourceMappingURL=data:application/json;base64,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QUcsRUFBRSxDQUFDO0FBQ25CLGlCQUFLLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBSztBQUMvRCxtQkFBTyxDQUFDLElBQUksQ0FBQztBQUNYLHVCQUFTLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUM7QUFDekMsd0JBQVUsRUFBRSxJQUFJO2FBQ2pCLENBQUMsQ0FBQztXQUNKLENBQUMsQ0FBQztBQUNILGlCQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQzs7T0FDckQ7S0FDRjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ3pCLFlBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQ3ZDO0tBQ0Y7OztTQWpNRyxNQUFNOzs7QUFvTVosTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMiLCJmaWxlIjoiQnJpZGdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5pbXBvcnQgdHlwZSBCcmVha3BvaW50U3RvcmVUeXBlIGZyb20gJy4vQnJlYWtwb2ludFN0b3JlJztcblxuY29uc3QgSU5KRUNURURfQ1NTID0gW1xuICAvKiBGb3JjZSB0aGUgaW5zcGVjdG9yIHRvIHNjcm9sbCB2ZXJ0aWNhbGx5IG9uIEF0b20g4omlIDEuNC4wICovXG4gICdib2R5ID4gLnJvb3QtdmlldyB7b3ZlcmZsb3cteTogc2Nyb2xsO30nLFxuXS5qb2luKCcnKTtcblxuY2xhc3MgQnJpZGdlIHtcbiAgX2JyZWFrcG9pbnRTdG9yZTogQnJlYWtwb2ludFN0b3JlVHlwZTtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICAvLyBDb250YWlucyBkaXNwb3NhYmxlIGl0ZW1zIHNob3VsZCBiZSBkaXNwb3NlZCBieVxuICAvLyBjbGVhbnVwKCkgbWV0aG9kLlxuICBfY2xlYW51cERpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXI6ID9hdG9tJE1hcmtlcjtcbiAgX3dlYnZpZXc6ID9XZWJ2aWV3RWxlbWVudDtcbiAgX3N1cHByZXNzQnJlYWtwb2ludFN5bmM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoYnJlYWtwb2ludFN0b3JlOiBCcmVha3BvaW50U3RvcmVUeXBlKSB7XG4gICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlID0gYnJlYWtwb2ludFN0b3JlO1xuICAgIHRoaXMuX2NsZWFudXBEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIgPSBudWxsO1xuICAgIHRoaXMuX3dlYnZpZXcgPSBudWxsO1xuICAgIHRoaXMuX3N1cHByZXNzQnJlYWtwb2ludFN5bmMgPSBmYWxzZTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgYnJlYWtwb2ludFN0b3JlLm9uQ2hhbmdlKHRoaXMuX2hhbmRsZUJyZWFrcG9pbnRTdG9yZUNoYW5nZS5iaW5kKHRoaXMpKSxcbiAgICApO1xuICB9XG5cbiAgc2V0V2Vidmlld0VsZW1lbnQod2VidmlldzogV2Vidmlld0VsZW1lbnQpIHtcbiAgICB0aGlzLl93ZWJ2aWV3ID0gd2VidmlldztcbiAgICBjb25zdCBib3VuZEhhbmRsZXIgPSB0aGlzLl9oYW5kbGVJcGNNZXNzYWdlLmJpbmQodGhpcyk7XG4gICAgd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIGJvdW5kSGFuZGxlcik7XG4gICAgdGhpcy5fY2xlYW51cERpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PlxuICAgICAgd2Vidmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIGJvdW5kSGFuZGxlcikpKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgLy8gQ2xlYW4gdXAgYW55IHN0YXRlIGNoYW5nZWQgYWZ0ZXIgY29uc3RydWN0b3IuXG4gIGNsZWFudXAoKSB7XG4gICAgdGhpcy5fY2xlYW51cERpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl93ZWJ2aWV3ID0gbnVsbDtcbiAgICB0aGlzLl9jbGVhclNlbGVjdGVkQ2FsbEZyYW1lTWFya2VyKCk7XG4gIH1cblxuICBjb250aW51ZSgpIHtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdjb21tYW5kJywgJ0NvbnRpbnVlJyk7XG4gICAgfVxuICB9XG5cbiAgc3RlcE92ZXIoKSB7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdTdGVwT3ZlcicpO1xuICAgIH1cbiAgfVxuXG4gIHN0ZXBJbnRvKCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3RlcEludG8nKTtcbiAgICB9XG4gIH1cblxuICBzdGVwT3V0KCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3RlcE91dCcpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVJcGNNZXNzYWdlKHN0ZEV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIC8vIGFkZEV2ZW50TGlzdGVuZXIgZXhwZWN0cyBpdHMgY2FsbGJhY2sgdG8gdGFrZSBhbiBFdmVudC4gSSdtIG5vdCBzdXJlIGhvdyB0byByZWNvbmNpbGUgaXQgd2l0aFxuICAgIC8vIHRoZSB0eXBlIHRoYXQgaXMgZXhwZWN0ZWQgaGVyZS5cbiAgICAvLyAkRmxvd0ZpeE1lKGplZmZyZXl0YW4pXG4gICAgY29uc3QgZXZlbnQ6IHtjaGFubmVsOiBzdHJpbmc7IGFyZ3M6IGFueVtdfSA9IHN0ZEV2ZW50O1xuICAgIHN3aXRjaCAoZXZlbnQuY2hhbm5lbCkge1xuICAgICAgY2FzZSAnbm90aWZpY2F0aW9uJzpcbiAgICAgICAgc3dpdGNoIChldmVudC5hcmdzWzBdKSB7XG4gICAgICAgICAgY2FzZSAncmVhZHknOlxuICAgICAgICAgICAgdGhpcy5fc2VuZEFsbEJyZWFrcG9pbnRzKCk7XG4gICAgICAgICAgICB0aGlzLl9pbmplY3RDU1MoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ0NhbGxGcmFtZVNlbGVjdGVkJzpcbiAgICAgICAgICAgIHRoaXMuX3NldFNlbGVjdGVkQ2FsbEZyYW1lTGluZShldmVudC5hcmdzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ09wZW5Tb3VyY2VMb2NhdGlvbic6XG4gICAgICAgICAgICB0aGlzLl9vcGVuU291cmNlTG9jYXRpb24oZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdEZWJ1Z2dlclJlc3VtZWQnOlxuICAgICAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRDYWxsRnJhbWVMaW5lKG51bGwpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnQnJlYWtwb2ludEFkZGVkJzpcbiAgICAgICAgICAgIHRoaXMuX2FkZEJyZWFrcG9pbnQoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdCcmVha3BvaW50UmVtb3ZlZCc6XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVCcmVha3BvaW50KGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgX3NldFNlbGVjdGVkQ2FsbEZyYW1lTGluZShudWxsYWJsZU9wdGlvbnM6ID97c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBpZiAobnVsbGFibGVPcHRpb25zKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gbnVsbGFibGVPcHRpb25zOyAvLyBGb3IgdXNlIGluIGNhcHR1cmUgd2l0aG91dCByZS1jaGVja2luZyBudWxsXG4gICAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShvcHRpb25zLnNvdXJjZVVSTCk7XG4gICAgICBpZiAocGF0aCkgeyAvLyBvbmx5IGhhbmRsZSByZWFsIGZpbGVzIGZvciBub3dcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoKS50aGVuKGVkaXRvciA9PiB7XG4gICAgICAgICAgdGhpcy5fY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpO1xuICAgICAgICAgIHRoaXMuX2hpZ2hsaWdodENhbGxGcmFtZUxpbmUoZWRpdG9yLCBvcHRpb25zLmxpbmVOdW1iZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU291cmNlTG9jYXRpb24obnVsbGFibGVPcHRpb25zOiA/e3NvdXJjZVVSTDogc3RyaW5nOyBsaW5lTnVtYmVyOiBudW1iZXJ9KSB7XG4gICAgaWYgKG51bGxhYmxlT3B0aW9ucykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IG51bGxhYmxlT3B0aW9uczsgLy8gRm9yIHVzZSBpbiBjYXB0dXJlIHdpdGhvdXQgcmUtY2hlY2tpbmcgbnVsbFxuICAgICAgY29uc3QgcGF0aCA9IHJlbW90ZVVyaS51cmlUb051Y2xpZGVVcmkob3B0aW9ucy5zb3VyY2VVUkwpO1xuICAgICAgaWYgKHBhdGgpIHsgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93LlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgpXG4gICAgICAgICAgLnRoZW4oZWRpdG9yID0+IHtcbiAgICAgICAgICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtvcHRpb25zLmxpbmVOdW1iZXIsIDBdKTtcbiAgICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbb3B0aW9ucy5saW5lTnVtYmVyLCAwXSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2hpZ2hsaWdodENhbGxGcmFtZUxpbmUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIGxpbmU6IG51bWJlcikge1xuICAgIGNvbnN0IG1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoXG4gICAgICBbW2xpbmUsIDBdLCBbbGluZSwgSW5maW5pdHldXSxcbiAgICAgIHtwZXJzaXN0ZW50OiBmYWxzZSwgaW52YWxpZGF0ZTogJ25ldmVyJ30pO1xuICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgIGNsYXNzOiAnbnVjbGlkZS1jdXJyZW50LWxpbmUtaGlnaGxpZ2h0JyxcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlciA9IG1hcmtlcjtcbiAgfVxuXG4gIF9hZGRCcmVha3BvaW50KGxvY2F0aW9uOiB7c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShsb2NhdGlvbi5zb3VyY2VVUkwpO1xuICAgIC8vIG9ubHkgaGFuZGxlIHJlYWwgZmlsZXMgZm9yIG5vdy5cbiAgICBpZiAocGF0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5hZGRCcmVha3BvaW50KHBhdGgsIGxvY2F0aW9uLmxpbmVOdW1iZXIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9yZW1vdmVCcmVha3BvaW50KGxvY2F0aW9uOiB7c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShsb2NhdGlvbi5zb3VyY2VVUkwpO1xuICAgIC8vIG9ubHkgaGFuZGxlIHJlYWwgZmlsZXMgZm9yIG5vdy5cbiAgICBpZiAocGF0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5kZWxldGVCcmVha3BvaW50KHBhdGgsIGxvY2F0aW9uLmxpbmVOdW1iZXIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9jbGVhclNlbGVjdGVkQ2FsbEZyYW1lTWFya2VyKCkge1xuICAgIGlmICh0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlcikge1xuICAgICAgdGhpcy5fc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVCcmVha3BvaW50U3RvcmVDaGFuZ2UocGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5fc2VuZEFsbEJyZWFrcG9pbnRzKCk7XG4gIH1cblxuICBfc2VuZEFsbEJyZWFrcG9pbnRzKCkge1xuICAgIC8vIFNlbmQgYW4gYXJyYXkgb2YgZmlsZS9saW5lIG9iamVjdHMuXG4gICAgY29uc3Qgd2VidmlldyA9IHRoaXMuX3dlYnZpZXc7XG4gICAgaWYgKHdlYnZpZXcgJiYgIXRoaXMuX3N1cHByZXNzQnJlYWtwb2ludFN5bmMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5nZXRBbGxCcmVha3BvaW50cygpLmZvckVhY2goKGxpbmUsIGtleSkgPT4ge1xuICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgIHNvdXJjZVVSTDogcmVtb3RlVXJpLm51Y2xpZGVVcmlUb1VyaShrZXkpLFxuICAgICAgICAgIGxpbmVOdW1iZXI6IGxpbmUsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB3ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3luY0JyZWFrcG9pbnRzJywgcmVzdWx0cyk7XG4gICAgfVxuICB9XG5cbiAgX2luamVjdENTUygpIHtcbiAgICBpZiAodGhpcy5fd2VidmlldyAhPSBudWxsKSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3Lmluc2VydENTUyhJTkpFQ1RFRF9DU1MpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJyaWRnZTtcbiJdfQ==