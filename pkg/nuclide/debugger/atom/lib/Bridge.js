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
  }]);

  return Bridge;
})();

module.exports = Bridge;

// Contains disposable items should be disposed by
// cleanup() method.
// $FlowFixMe(jeffreytan)
//# sourceMappingURL=data:application/json;base64,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QUFDLElBQUksQ0FBQztBQUNYLHVCQUFTLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUM7QUFDekMsd0JBQVUsRUFBRSxJQUFJO2FBQ2pCLENBQUMsQ0FBQztXQUNKLENBQUMsQ0FBQztBQUNILGlCQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQzs7T0FDckQ7S0FDRjs7O1NBMUxHLE1BQU07OztBQTZMWixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsImZpbGUiOiJCcmlkZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCByZW1vdGVVcmkgPSByZXF1aXJlKCcuLi8uLi8uLi9yZW1vdGUtdXJpJyk7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmltcG9ydCB0eXBlIEJyZWFrcG9pbnRTdG9yZVR5cGUgZnJvbSAnLi9CcmVha3BvaW50U3RvcmUnO1xuXG5jbGFzcyBCcmlkZ2Uge1xuICBfYnJlYWtwb2ludFN0b3JlOiBCcmVha3BvaW50U3RvcmVUeXBlO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIC8vIENvbnRhaW5zIGRpc3Bvc2FibGUgaXRlbXMgc2hvdWxkIGJlIGRpc3Bvc2VkIGJ5XG4gIC8vIGNsZWFudXAoKSBtZXRob2QuXG4gIF9jbGVhbnVwRGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9zZWxlY3RlZENhbGxGcmFtZU1hcmtlcjogP2F0b20kTWFya2VyO1xuICBfd2VidmlldzogP1dlYnZpZXdFbGVtZW50O1xuICBfc3VwcHJlc3NCcmVha3BvaW50U3luYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihicmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZVR5cGUpIHtcbiAgICB0aGlzLl9icmVha3BvaW50U3RvcmUgPSBicmVha3BvaW50U3RvcmU7XG4gICAgdGhpcy5fY2xlYW51cERpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlciA9IG51bGw7XG4gICAgdGhpcy5fd2VidmlldyA9IG51bGw7XG4gICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IGZhbHNlO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBicmVha3BvaW50U3RvcmUub25DaGFuZ2UodGhpcy5faGFuZGxlQnJlYWtwb2ludFN0b3JlQ2hhbmdlLmJpbmQodGhpcykpLFxuICAgICk7XG4gIH1cblxuICBzZXRXZWJ2aWV3RWxlbWVudCh3ZWJ2aWV3OiBXZWJ2aWV3RWxlbWVudCkge1xuICAgIHRoaXMuX3dlYnZpZXcgPSB3ZWJ2aWV3O1xuICAgIGNvbnN0IGJvdW5kSGFuZGxlciA9IHRoaXMuX2hhbmRsZUlwY01lc3NhZ2UuYmluZCh0aGlzKTtcbiAgICB3ZWJ2aWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2lwYy1tZXNzYWdlJywgYm91bmRIYW5kbGVyKTtcbiAgICB0aGlzLl9jbGVhbnVwRGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+XG4gICAgICB3ZWJ2aWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lwYy1tZXNzYWdlJywgYm91bmRIYW5kbGVyKSkpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmNsZWFudXAoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICAvLyBDbGVhbiB1cCBhbnkgc3RhdGUgY2hhbmdlZCBhZnRlciBjb25zdHJ1Y3Rvci5cbiAgY2xlYW51cCgpIHtcbiAgICB0aGlzLl9jbGVhbnVwRGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIHRoaXMuX3dlYnZpZXcgPSBudWxsO1xuICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIoKTtcbiAgfVxuXG4gIGNvbnRpbnVlKCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnQ29udGludWUnKTtcbiAgICB9XG4gIH1cblxuICBzdGVwT3ZlcigpIHtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdjb21tYW5kJywgJ1N0ZXBPdmVyJyk7XG4gICAgfVxuICB9XG5cbiAgc3RlcEludG8oKSB7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdTdGVwSW50bycpO1xuICAgIH1cbiAgfVxuXG4gIHN0ZXBPdXQoKSB7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdTdGVwT3V0Jyk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUlwY01lc3NhZ2Uoc3RkRXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgLy8gYWRkRXZlbnRMaXN0ZW5lciBleHBlY3RzIGl0cyBjYWxsYmFjayB0byB0YWtlIGFuIEV2ZW50LiBJJ20gbm90IHN1cmUgaG93IHRvIHJlY29uY2lsZSBpdCB3aXRoXG4gICAgLy8gdGhlIHR5cGUgdGhhdCBpcyBleHBlY3RlZCBoZXJlLlxuICAgIC8vICRGbG93Rml4TWUoamVmZnJleXRhbilcbiAgICBjb25zdCBldmVudDoge2NoYW5uZWw6IHN0cmluZzsgYXJnczogYW55W119ID0gc3RkRXZlbnQ7XG4gICAgc3dpdGNoIChldmVudC5jaGFubmVsKSB7XG4gICAgICBjYXNlICdub3RpZmljYXRpb24nOlxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmFyZ3NbMF0pIHtcbiAgICAgICAgICBjYXNlICdyZWFkeSc6XG4gICAgICAgICAgICB0aGlzLl9zZW5kQWxsQnJlYWtwb2ludHMoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ0NhbGxGcmFtZVNlbGVjdGVkJzpcbiAgICAgICAgICAgIHRoaXMuX3NldFNlbGVjdGVkQ2FsbEZyYW1lTGluZShldmVudC5hcmdzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ09wZW5Tb3VyY2VMb2NhdGlvbic6XG4gICAgICAgICAgICB0aGlzLl9vcGVuU291cmNlTG9jYXRpb24oZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdEZWJ1Z2dlclJlc3VtZWQnOlxuICAgICAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRDYWxsRnJhbWVMaW5lKG51bGwpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnQnJlYWtwb2ludEFkZGVkJzpcbiAgICAgICAgICAgIHRoaXMuX2FkZEJyZWFrcG9pbnQoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdCcmVha3BvaW50UmVtb3ZlZCc6XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVCcmVha3BvaW50KGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgX3NldFNlbGVjdGVkQ2FsbEZyYW1lTGluZShudWxsYWJsZU9wdGlvbnM6ID97c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBpZiAobnVsbGFibGVPcHRpb25zKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gbnVsbGFibGVPcHRpb25zOyAvLyBGb3IgdXNlIGluIGNhcHR1cmUgd2l0aG91dCByZS1jaGVja2luZyBudWxsXG4gICAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShvcHRpb25zLnNvdXJjZVVSTCk7XG4gICAgICBpZiAocGF0aCkgeyAvLyBvbmx5IGhhbmRsZSByZWFsIGZpbGVzIGZvciBub3dcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoKS50aGVuKGVkaXRvciA9PiB7XG4gICAgICAgICAgdGhpcy5fY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpO1xuICAgICAgICAgIHRoaXMuX2hpZ2hsaWdodENhbGxGcmFtZUxpbmUoZWRpdG9yLCBvcHRpb25zLmxpbmVOdW1iZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJTZWxlY3RlZENhbGxGcmFtZU1hcmtlcigpO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU291cmNlTG9jYXRpb24obnVsbGFibGVPcHRpb25zOiA/e3NvdXJjZVVSTDogc3RyaW5nOyBsaW5lTnVtYmVyOiBudW1iZXJ9KSB7XG4gICAgaWYgKG51bGxhYmxlT3B0aW9ucykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IG51bGxhYmxlT3B0aW9uczsgLy8gRm9yIHVzZSBpbiBjYXB0dXJlIHdpdGhvdXQgcmUtY2hlY2tpbmcgbnVsbFxuICAgICAgY29uc3QgcGF0aCA9IHJlbW90ZVVyaS51cmlUb051Y2xpZGVVcmkob3B0aW9ucy5zb3VyY2VVUkwpO1xuICAgICAgaWYgKHBhdGgpIHsgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93LlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgpXG4gICAgICAgICAgLnRoZW4oKGVkaXRvcikgPT4ge1xuICAgICAgICAgICAgZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW29wdGlvbnMubGluZU51bWJlciwgMF0pO1xuICAgICAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtvcHRpb25zLmxpbmVOdW1iZXIsIDBdKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaGlnaGxpZ2h0Q2FsbEZyYW1lTGluZShlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgbGluZTogbnVtYmVyKSB7XG4gICAgY29uc3QgbWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShcbiAgICAgIFtbbGluZSwgMF0sIFtsaW5lLCBJbmZpbml0eV1dLFxuICAgICAge3BlcnNpc3RlbnQ6IGZhbHNlLCBpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgY2xhc3M6ICdudWNsaWRlLWN1cnJlbnQtbGluZS1oaWdobGlnaHQnLFxuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyID0gbWFya2VyO1xuICB9XG5cbiAgX2FkZEJyZWFrcG9pbnQobG9jYXRpb246IHtzb3VyY2VVUkw6IHN0cmluZzsgbGluZU51bWJlcjogbnVtYmVyfSkge1xuICAgIGNvbnN0IHBhdGggPSByZW1vdGVVcmkudXJpVG9OdWNsaWRlVXJpKGxvY2F0aW9uLnNvdXJjZVVSTCk7XG4gICAgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93LlxuICAgIGlmIChwYXRoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlLmFkZEJyZWFrcG9pbnQocGF0aCwgbG9jYXRpb24ubGluZU51bWJlcik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZUJyZWFrcG9pbnQobG9jYXRpb246IHtzb3VyY2VVUkw6IHN0cmluZzsgbGluZU51bWJlcjogbnVtYmVyfSkge1xuICAgIGNvbnN0IHBhdGggPSByZW1vdGVVcmkudXJpVG9OdWNsaWRlVXJpKGxvY2F0aW9uLnNvdXJjZVVSTCk7XG4gICAgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93LlxuICAgIGlmIChwYXRoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlLmRlbGV0ZUJyZWFrcG9pbnQocGF0aCwgbG9jYXRpb24ubGluZU51bWJlcik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyU2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIoKSB7XG4gICAgaWYgKHRoaXMuX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlci5kZXN0cm95KCk7XG4gICAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUJyZWFrcG9pbnRTdG9yZUNoYW5nZShwYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zZW5kQWxsQnJlYWtwb2ludHMoKTtcbiAgfVxuXG4gIF9zZW5kQWxsQnJlYWtwb2ludHMoKSB7XG4gICAgLy8gU2VuZCBhbiBhcnJheSBvZiBmaWxlL2xpbmUgb2JqZWN0cy5cbiAgICBjb25zdCB3ZWJ2aWV3ID0gdGhpcy5fd2VidmlldztcbiAgICBpZiAod2VidmlldyAmJiAhdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYykge1xuICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlLmdldEFsbEJyZWFrcG9pbnRzKCkuZm9yRWFjaCgobGluZSwga2V5KSA9PiB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgc291cmNlVVJMOiByZW1vdGVVcmkubnVjbGlkZVVyaVRvVXJpKGtleSksXG4gICAgICAgICAgbGluZU51bWJlcjogbGluZSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHdlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdTeW5jQnJlYWtwb2ludHMnLCByZXN1bHRzKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCcmlkZ2U7XG4iXX0=