var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var remoteUri = require('../../nuclide-remote-uri');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

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

// Contains disposable items should be disposed by
// cleanup() method.
// $FlowFixMe(jeffreytan)
//# sourceMappingURL=data:application/json;base64,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RUFBRSxDQUFDO0tBQzVCOzs7V0FFa0IsK0JBQUc7Ozs7QUFFcEIsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUM5QixVQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRTs7QUFDNUMsY0FBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ25CLGlCQUFLLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBSztBQUNsRixtQkFBTyxDQUFDLElBQUksQ0FBQztBQUNYLHVCQUFTLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUM7QUFDekMsd0JBQVUsRUFBRSxJQUFJO2FBQ2pCLENBQUMsQ0FBQztXQUNKLENBQUMsQ0FBQztBQUNILGlCQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQzs7T0FDckQ7S0FDRjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ3pCLFlBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQ3ZDO0tBQ0Y7OztTQWhNRyxNQUFNOzs7QUFtTVosTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMiLCJmaWxlIjoiQnJpZGdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGVidWdnZXJNb2RlbCBmcm9tICcuL0RlYnVnZ2VyTW9kZWwnO1xuXG5jb25zdCByZW1vdGVVcmkgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuY29uc3QgSU5KRUNURURfQ1NTID0gW1xuICAvKiBGb3JjZSB0aGUgaW5zcGVjdG9yIHRvIHNjcm9sbCB2ZXJ0aWNhbGx5IG9uIEF0b20g4omlIDEuNC4wICovXG4gICdib2R5ID4gLnJvb3QtdmlldyB7b3ZlcmZsb3cteTogc2Nyb2xsO30nLFxuICAvKiBGb3JjZSB0aGUgY29udGVudHMgb2YgdGhlIG1pbmkgY29uc29sZSAob24gdGhlIGJvdHRvbSkgdG8gc2Nyb2xsIHZlcnRpY2FsbHkgKi9cbiAgJy5pbnNlcnRpb24tcG9pbnQtc2lkZWJhciNkcmF3ZXItY29udGVudHMge292ZXJmbG93LXk6IGF1dG87fScsXG5dLmpvaW4oJycpO1xuXG5jbGFzcyBCcmlkZ2Uge1xuICBfZGVidWdnZXJNb2RlbDogRGVidWdnZXJNb2RlbDtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICAvLyBDb250YWlucyBkaXNwb3NhYmxlIGl0ZW1zIHNob3VsZCBiZSBkaXNwb3NlZCBieVxuICAvLyBjbGVhbnVwKCkgbWV0aG9kLlxuICBfY2xlYW51cERpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXI6ID9hdG9tJE1hcmtlcjtcbiAgX3dlYnZpZXc6ID9XZWJ2aWV3RWxlbWVudDtcbiAgX3N1cHByZXNzQnJlYWtwb2ludFN5bmM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoZGVidWdnZXJNb2RlbDogRGVidWdnZXJNb2RlbCkge1xuICAgIHRoaXMuX2RlYnVnZ2VyTW9kZWwgPSBkZWJ1Z2dlck1vZGVsO1xuICAgIHRoaXMuX2NsZWFudXBEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIgPSBudWxsO1xuICAgIHRoaXMuX3dlYnZpZXcgPSBudWxsO1xuICAgIHRoaXMuX3N1cHByZXNzQnJlYWtwb2ludFN5bmMgPSBmYWxzZTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgZGVidWdnZXJNb2RlbC5nZXRCcmVha3BvaW50U3RvcmUoKS5vbkNoYW5nZSh0aGlzLl9oYW5kbGVCcmVha3BvaW50U3RvcmVDaGFuZ2UuYmluZCh0aGlzKSksXG4gICAgKTtcbiAgfVxuXG4gIHNldFdlYnZpZXdFbGVtZW50KHdlYnZpZXc6IFdlYnZpZXdFbGVtZW50KSB7XG4gICAgdGhpcy5fd2VidmlldyA9IHdlYnZpZXc7XG4gICAgY29uc3QgYm91bmRIYW5kbGVyID0gdGhpcy5faGFuZGxlSXBjTWVzc2FnZS5iaW5kKHRoaXMpO1xuICAgIHdlYnZpZXcuYWRkRXZlbnRMaXN0ZW5lcignaXBjLW1lc3NhZ2UnLCBib3VuZEhhbmRsZXIpO1xuICAgIHRoaXMuX2NsZWFudXBEaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT5cbiAgICAgIHdlYnZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignaXBjLW1lc3NhZ2UnLCBib3VuZEhhbmRsZXIpKSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuY2xlYW51cCgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8vIENsZWFuIHVwIGFueSBzdGF0ZSBjaGFuZ2VkIGFmdGVyIGNvbnN0cnVjdG9yLlxuICBjbGVhbnVwKCkge1xuICAgIHRoaXMuX2NsZWFudXBEaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fd2VidmlldyA9IG51bGw7XG4gICAgdGhpcy5fY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpO1xuICB9XG5cbiAgY29udGludWUoKSB7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdDb250aW51ZScpO1xuICAgIH1cbiAgfVxuXG4gIHN0ZXBPdmVyKCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3RlcE92ZXInKTtcbiAgICB9XG4gIH1cblxuICBzdGVwSW50bygpIHtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdjb21tYW5kJywgJ1N0ZXBJbnRvJyk7XG4gICAgfVxuICB9XG5cbiAgc3RlcE91dCgpIHtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdjb21tYW5kJywgJ1N0ZXBPdXQnKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlSXBjTWVzc2FnZShzdGRFdmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBhZGRFdmVudExpc3RlbmVyIGV4cGVjdHMgaXRzIGNhbGxiYWNrIHRvIHRha2UgYW4gRXZlbnQuIEknbSBub3Qgc3VyZSBob3cgdG8gcmVjb25jaWxlIGl0IHdpdGhcbiAgICAvLyB0aGUgdHlwZSB0aGF0IGlzIGV4cGVjdGVkIGhlcmUuXG4gICAgLy8gJEZsb3dGaXhNZShqZWZmcmV5dGFuKVxuICAgIGNvbnN0IGV2ZW50OiB7Y2hhbm5lbDogc3RyaW5nOyBhcmdzOiBhbnlbXX0gPSBzdGRFdmVudDtcbiAgICBzd2l0Y2ggKGV2ZW50LmNoYW5uZWwpIHtcbiAgICAgIGNhc2UgJ25vdGlmaWNhdGlvbic6XG4gICAgICAgIHN3aXRjaCAoZXZlbnQuYXJnc1swXSkge1xuICAgICAgICAgIGNhc2UgJ3JlYWR5JzpcbiAgICAgICAgICAgIHRoaXMuX3NlbmRBbGxCcmVha3BvaW50cygpO1xuICAgICAgICAgICAgdGhpcy5faW5qZWN0Q1NTKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdDYWxsRnJhbWVTZWxlY3RlZCc6XG4gICAgICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZENhbGxGcmFtZUxpbmUoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdPcGVuU291cmNlTG9jYXRpb24nOlxuICAgICAgICAgICAgdGhpcy5fb3BlblNvdXJjZUxvY2F0aW9uKGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnRGVidWdnZXJSZXN1bWVkJzpcbiAgICAgICAgICAgIHRoaXMuX3NldFNlbGVjdGVkQ2FsbEZyYW1lTGluZShudWxsKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ0JyZWFrcG9pbnRBZGRlZCc6XG4gICAgICAgICAgICB0aGlzLl9hZGRCcmVha3BvaW50KGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnQnJlYWtwb2ludFJlbW92ZWQnOlxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQnJlYWtwb2ludChldmVudC5hcmdzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRTZWxlY3RlZENhbGxGcmFtZUxpbmUobnVsbGFibGVPcHRpb25zOiA/e3NvdXJjZVVSTDogc3RyaW5nOyBsaW5lTnVtYmVyOiBudW1iZXJ9KSB7XG4gICAgaWYgKG51bGxhYmxlT3B0aW9ucykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IG51bGxhYmxlT3B0aW9uczsgLy8gRm9yIHVzZSBpbiBjYXB0dXJlIHdpdGhvdXQgcmUtY2hlY2tpbmcgbnVsbFxuICAgICAgY29uc3QgcGF0aCA9IHJlbW90ZVVyaS51cmlUb051Y2xpZGVVcmkob3B0aW9ucy5zb3VyY2VVUkwpO1xuICAgICAgaWYgKHBhdGggIT0gbnVsbCkgeyAvLyBvbmx5IGhhbmRsZSByZWFsIGZpbGVzIGZvciBub3dcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLCB7c2VhcmNoQWxsUGFuZXM6IHRydWV9KS50aGVuKGVkaXRvciA9PiB7XG4gICAgICAgICAgdGhpcy5fY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpO1xuICAgICAgICAgIHRoaXMuX2hpZ2hsaWdodENhbGxGcmFtZUxpbmUoZWRpdG9yLCBvcHRpb25zLmxpbmVOdW1iZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU291cmNlTG9jYXRpb24obnVsbGFibGVPcHRpb25zOiA/e3NvdXJjZVVSTDogc3RyaW5nOyBsaW5lTnVtYmVyOiBudW1iZXJ9KSB7XG4gICAgaWYgKG51bGxhYmxlT3B0aW9ucykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IG51bGxhYmxlT3B0aW9uczsgLy8gRm9yIHVzZSBpbiBjYXB0dXJlIHdpdGhvdXQgcmUtY2hlY2tpbmcgbnVsbFxuICAgICAgY29uc3QgcGF0aCA9IHJlbW90ZVVyaS51cmlUb051Y2xpZGVVcmkob3B0aW9ucy5zb3VyY2VVUkwpO1xuICAgICAgaWYgKHBhdGggIT0gbnVsbCkgeyAvLyBvbmx5IGhhbmRsZSByZWFsIGZpbGVzIGZvciBub3cuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCwge3NlYXJjaEFsbFBhbmVzOiB0cnVlfSkudGhlbihlZGl0b3IgPT4ge1xuICAgICAgICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtvcHRpb25zLmxpbmVOdW1iZXIsIDBdKTtcbiAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW29wdGlvbnMubGluZU51bWJlciwgMF0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaGlnaGxpZ2h0Q2FsbEZyYW1lTGluZShlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgbGluZTogbnVtYmVyKSB7XG4gICAgY29uc3QgbWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShcbiAgICAgIFtbbGluZSwgMF0sIFtsaW5lLCBJbmZpbml0eV1dLFxuICAgICAge3BlcnNpc3RlbnQ6IGZhbHNlLCBpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgY2xhc3M6ICdudWNsaWRlLWN1cnJlbnQtbGluZS1oaWdobGlnaHQnLFxuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyID0gbWFya2VyO1xuICB9XG5cbiAgX2FkZEJyZWFrcG9pbnQobG9jYXRpb246IHtzb3VyY2VVUkw6IHN0cmluZzsgbGluZU51bWJlcjogbnVtYmVyfSkge1xuICAgIGNvbnN0IHBhdGggPSByZW1vdGVVcmkudXJpVG9OdWNsaWRlVXJpKGxvY2F0aW9uLnNvdXJjZVVSTCk7XG4gICAgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93LlxuICAgIGlmIChwYXRoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fZGVidWdnZXJNb2RlbC5nZXRCcmVha3BvaW50U3RvcmUoKS5hZGRCcmVha3BvaW50KHBhdGgsIGxvY2F0aW9uLmxpbmVOdW1iZXIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9yZW1vdmVCcmVha3BvaW50KGxvY2F0aW9uOiB7c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShsb2NhdGlvbi5zb3VyY2VVUkwpO1xuICAgIC8vIG9ubHkgaGFuZGxlIHJlYWwgZmlsZXMgZm9yIG5vdy5cbiAgICBpZiAocGF0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2RlYnVnZ2VyTW9kZWwuZ2V0QnJlYWtwb2ludFN0b3JlKCkuZGVsZXRlQnJlYWtwb2ludChwYXRoLCBsb2NhdGlvbi5saW5lTnVtYmVyKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuX3N1cHByZXNzQnJlYWtwb2ludFN5bmMgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpIHtcbiAgICBpZiAodGhpcy5fc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlQnJlYWtwb2ludFN0b3JlQ2hhbmdlKHBhdGg6IHN0cmluZykge1xuICAgIHRoaXMuX3NlbmRBbGxCcmVha3BvaW50cygpO1xuICB9XG5cbiAgX3NlbmRBbGxCcmVha3BvaW50cygpIHtcbiAgICAvLyBTZW5kIGFuIGFycmF5IG9mIGZpbGUvbGluZSBvYmplY3RzLlxuICAgIGNvbnN0IHdlYnZpZXcgPSB0aGlzLl93ZWJ2aWV3O1xuICAgIGlmICh3ZWJ2aWV3ICYmICF0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jKSB7XG4gICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICB0aGlzLl9kZWJ1Z2dlck1vZGVsLmdldEJyZWFrcG9pbnRTdG9yZSgpLmdldEFsbEJyZWFrcG9pbnRzKCkuZm9yRWFjaCgobGluZSwga2V5KSA9PiB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgc291cmNlVVJMOiByZW1vdGVVcmkubnVjbGlkZVVyaVRvVXJpKGtleSksXG4gICAgICAgICAgbGluZU51bWJlcjogbGluZSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHdlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdTeW5jQnJlYWtwb2ludHMnLCByZXN1bHRzKTtcbiAgICB9XG4gIH1cblxuICBfaW5qZWN0Q1NTKCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuaW5zZXJ0Q1NTKElOSkVDVEVEX0NTUyk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnJpZGdlO1xuIl19