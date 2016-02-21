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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxRQUFRLENBQUM7QUFDOUIsVUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUU7O0FBQzVDLGNBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNuQixpQkFBSyxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBRSxHQUFHLEVBQUs7QUFDL0QsbUJBQU8sQ0FBQyxJQUFJLENBQUM7QUFDWCx1QkFBUyxFQUFFLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDO0FBQ3pDLHdCQUFVLEVBQUUsSUFBSTthQUNqQixDQUFDLENBQUM7V0FDSixDQUFDLENBQUM7QUFDSCxpQkFBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUM7O09BQ3JEO0tBQ0Y7OztXQUVTLHNCQUFHO0FBQ1gsVUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtBQUN6QixZQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztPQUN2QztLQUNGOzs7U0FoTUcsTUFBTTs7O0FBbU1aLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwiZmlsZSI6IkJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuaW1wb3J0IHR5cGUgQnJlYWtwb2ludFN0b3JlVHlwZSBmcm9tICcuL0JyZWFrcG9pbnRTdG9yZSc7XG5cbmNvbnN0IElOSkVDVEVEX0NTUyA9IFtcbiAgLyogRm9yY2UgdGhlIGluc3BlY3RvciB0byBzY3JvbGwgdmVydGljYWxseSBvbiBBdG9tIOKJpSAxLjQuMCAqL1xuICAnYm9keSA+IC5yb290LXZpZXcge292ZXJmbG93LXk6IHNjcm9sbDt9Jyxcbl0uam9pbignJyk7XG5cbmNsYXNzIEJyaWRnZSB7XG4gIF9icmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZVR5cGU7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgLy8gQ29udGFpbnMgZGlzcG9zYWJsZSBpdGVtcyBzaG91bGQgYmUgZGlzcG9zZWQgYnlcbiAgLy8gY2xlYW51cCgpIG1ldGhvZC5cbiAgX2NsZWFudXBEaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyOiA/YXRvbSRNYXJrZXI7XG4gIF93ZWJ2aWV3OiA/V2Vidmlld0VsZW1lbnQ7XG4gIF9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKGJyZWFrcG9pbnRTdG9yZTogQnJlYWtwb2ludFN0b3JlVHlwZSkge1xuICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZSA9IGJyZWFrcG9pbnRTdG9yZTtcbiAgICB0aGlzLl9jbGVhbnVwRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyID0gbnVsbDtcbiAgICB0aGlzLl93ZWJ2aWV3ID0gbnVsbDtcbiAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gZmFsc2U7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGJyZWFrcG9pbnRTdG9yZS5vbkNoYW5nZSh0aGlzLl9oYW5kbGVCcmVha3BvaW50U3RvcmVDaGFuZ2UuYmluZCh0aGlzKSksXG4gICAgKTtcbiAgfVxuXG4gIHNldFdlYnZpZXdFbGVtZW50KHdlYnZpZXc6IFdlYnZpZXdFbGVtZW50KSB7XG4gICAgdGhpcy5fd2VidmlldyA9IHdlYnZpZXc7XG4gICAgY29uc3QgYm91bmRIYW5kbGVyID0gdGhpcy5faGFuZGxlSXBjTWVzc2FnZS5iaW5kKHRoaXMpO1xuICAgIHdlYnZpZXcuYWRkRXZlbnRMaXN0ZW5lcignaXBjLW1lc3NhZ2UnLCBib3VuZEhhbmRsZXIpO1xuICAgIHRoaXMuX2NsZWFudXBEaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT5cbiAgICAgIHdlYnZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignaXBjLW1lc3NhZ2UnLCBib3VuZEhhbmRsZXIpKSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuY2xlYW51cCgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8vIENsZWFuIHVwIGFueSBzdGF0ZSBjaGFuZ2VkIGFmdGVyIGNvbnN0cnVjdG9yLlxuICBjbGVhbnVwKCkge1xuICAgIHRoaXMuX2NsZWFudXBEaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fd2VidmlldyA9IG51bGw7XG4gICAgdGhpcy5fY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpO1xuICB9XG5cbiAgY29udGludWUoKSB7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdDb250aW51ZScpO1xuICAgIH1cbiAgfVxuXG4gIHN0ZXBPdmVyKCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3RlcE92ZXInKTtcbiAgICB9XG4gIH1cblxuICBzdGVwSW50bygpIHtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdjb21tYW5kJywgJ1N0ZXBJbnRvJyk7XG4gICAgfVxuICB9XG5cbiAgc3RlcE91dCgpIHtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdjb21tYW5kJywgJ1N0ZXBPdXQnKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlSXBjTWVzc2FnZShzdGRFdmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBhZGRFdmVudExpc3RlbmVyIGV4cGVjdHMgaXRzIGNhbGxiYWNrIHRvIHRha2UgYW4gRXZlbnQuIEknbSBub3Qgc3VyZSBob3cgdG8gcmVjb25jaWxlIGl0IHdpdGhcbiAgICAvLyB0aGUgdHlwZSB0aGF0IGlzIGV4cGVjdGVkIGhlcmUuXG4gICAgLy8gJEZsb3dGaXhNZShqZWZmcmV5dGFuKVxuICAgIGNvbnN0IGV2ZW50OiB7Y2hhbm5lbDogc3RyaW5nOyBhcmdzOiBhbnlbXX0gPSBzdGRFdmVudDtcbiAgICBzd2l0Y2ggKGV2ZW50LmNoYW5uZWwpIHtcbiAgICAgIGNhc2UgJ25vdGlmaWNhdGlvbic6XG4gICAgICAgIHN3aXRjaCAoZXZlbnQuYXJnc1swXSkge1xuICAgICAgICAgIGNhc2UgJ3JlYWR5JzpcbiAgICAgICAgICAgIHRoaXMuX3NlbmRBbGxCcmVha3BvaW50cygpO1xuICAgICAgICAgICAgdGhpcy5faW5qZWN0Q1NTKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdDYWxsRnJhbWVTZWxlY3RlZCc6XG4gICAgICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZENhbGxGcmFtZUxpbmUoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdPcGVuU291cmNlTG9jYXRpb24nOlxuICAgICAgICAgICAgdGhpcy5fb3BlblNvdXJjZUxvY2F0aW9uKGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnRGVidWdnZXJSZXN1bWVkJzpcbiAgICAgICAgICAgIHRoaXMuX3NldFNlbGVjdGVkQ2FsbEZyYW1lTGluZShudWxsKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ0JyZWFrcG9pbnRBZGRlZCc6XG4gICAgICAgICAgICB0aGlzLl9hZGRCcmVha3BvaW50KGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnQnJlYWtwb2ludFJlbW92ZWQnOlxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQnJlYWtwb2ludChldmVudC5hcmdzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRTZWxlY3RlZENhbGxGcmFtZUxpbmUobnVsbGFibGVPcHRpb25zOiA/e3NvdXJjZVVSTDogc3RyaW5nOyBsaW5lTnVtYmVyOiBudW1iZXJ9KSB7XG4gICAgaWYgKG51bGxhYmxlT3B0aW9ucykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IG51bGxhYmxlT3B0aW9uczsgLy8gRm9yIHVzZSBpbiBjYXB0dXJlIHdpdGhvdXQgcmUtY2hlY2tpbmcgbnVsbFxuICAgICAgY29uc3QgcGF0aCA9IHJlbW90ZVVyaS51cmlUb051Y2xpZGVVcmkob3B0aW9ucy5zb3VyY2VVUkwpO1xuICAgICAgaWYgKHBhdGggIT0gbnVsbCkgeyAvLyBvbmx5IGhhbmRsZSByZWFsIGZpbGVzIGZvciBub3dcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLCB7c2VhcmNoQWxsUGFuZXM6IHRydWV9KS50aGVuKGVkaXRvciA9PiB7XG4gICAgICAgICAgdGhpcy5fY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpO1xuICAgICAgICAgIHRoaXMuX2hpZ2hsaWdodENhbGxGcmFtZUxpbmUoZWRpdG9yLCBvcHRpb25zLmxpbmVOdW1iZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU291cmNlTG9jYXRpb24obnVsbGFibGVPcHRpb25zOiA/e3NvdXJjZVVSTDogc3RyaW5nOyBsaW5lTnVtYmVyOiBudW1iZXJ9KSB7XG4gICAgaWYgKG51bGxhYmxlT3B0aW9ucykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IG51bGxhYmxlT3B0aW9uczsgLy8gRm9yIHVzZSBpbiBjYXB0dXJlIHdpdGhvdXQgcmUtY2hlY2tpbmcgbnVsbFxuICAgICAgY29uc3QgcGF0aCA9IHJlbW90ZVVyaS51cmlUb051Y2xpZGVVcmkob3B0aW9ucy5zb3VyY2VVUkwpO1xuICAgICAgaWYgKHBhdGggIT0gbnVsbCkgeyAvLyBvbmx5IGhhbmRsZSByZWFsIGZpbGVzIGZvciBub3cuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCwge3NlYXJjaEFsbFBhbmVzOiB0cnVlfSkudGhlbihlZGl0b3IgPT4ge1xuICAgICAgICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtvcHRpb25zLmxpbmVOdW1iZXIsIDBdKTtcbiAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW29wdGlvbnMubGluZU51bWJlciwgMF0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaGlnaGxpZ2h0Q2FsbEZyYW1lTGluZShlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgbGluZTogbnVtYmVyKSB7XG4gICAgY29uc3QgbWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShcbiAgICAgIFtbbGluZSwgMF0sIFtsaW5lLCBJbmZpbml0eV1dLFxuICAgICAge3BlcnNpc3RlbnQ6IGZhbHNlLCBpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgY2xhc3M6ICdudWNsaWRlLWN1cnJlbnQtbGluZS1oaWdobGlnaHQnLFxuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyID0gbWFya2VyO1xuICB9XG5cbiAgX2FkZEJyZWFrcG9pbnQobG9jYXRpb246IHtzb3VyY2VVUkw6IHN0cmluZzsgbGluZU51bWJlcjogbnVtYmVyfSkge1xuICAgIGNvbnN0IHBhdGggPSByZW1vdGVVcmkudXJpVG9OdWNsaWRlVXJpKGxvY2F0aW9uLnNvdXJjZVVSTCk7XG4gICAgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93LlxuICAgIGlmIChwYXRoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlLmFkZEJyZWFrcG9pbnQocGF0aCwgbG9jYXRpb24ubGluZU51bWJlcik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZUJyZWFrcG9pbnQobG9jYXRpb246IHtzb3VyY2VVUkw6IHN0cmluZzsgbGluZU51bWJlcjogbnVtYmVyfSkge1xuICAgIGNvbnN0IHBhdGggPSByZW1vdGVVcmkudXJpVG9OdWNsaWRlVXJpKGxvY2F0aW9uLnNvdXJjZVVSTCk7XG4gICAgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93LlxuICAgIGlmIChwYXRoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlLmRlbGV0ZUJyZWFrcG9pbnQocGF0aCwgbG9jYXRpb24ubGluZU51bWJlcik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyU2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIoKSB7XG4gICAgaWYgKHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlci5kZXN0cm95KCk7XG4gICAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUJyZWFrcG9pbnRTdG9yZUNoYW5nZShwYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zZW5kQWxsQnJlYWtwb2ludHMoKTtcbiAgfVxuXG4gIF9zZW5kQWxsQnJlYWtwb2ludHMoKSB7XG4gICAgLy8gU2VuZCBhbiBhcnJheSBvZiBmaWxlL2xpbmUgb2JqZWN0cy5cbiAgICBjb25zdCB3ZWJ2aWV3ID0gdGhpcy5fd2VidmlldztcbiAgICBpZiAod2VidmlldyAmJiAhdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYykge1xuICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlLmdldEFsbEJyZWFrcG9pbnRzKCkuZm9yRWFjaCgobGluZSwga2V5KSA9PiB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgc291cmNlVVJMOiByZW1vdGVVcmkubnVjbGlkZVVyaVRvVXJpKGtleSksXG4gICAgICAgICAgbGluZU51bWJlcjogbGluZSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHdlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdTeW5jQnJlYWtwb2ludHMnLCByZXN1bHRzKTtcbiAgICB9XG4gIH1cblxuICBfaW5qZWN0Q1NTKCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuaW5zZXJ0Q1NTKElOSkVDVEVEX0NTUyk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnJpZGdlO1xuIl19