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
    this._disposables = new CompositeDisposable();
    this._cleanupDisposables = new CompositeDisposable();
    this._selectedCallFrameMarker = null;
    this._webview = null;
    this._suppressBreakpointSync = false;
    this._disposables.add(breakpointStore.onChange(this._handleBreakpointStoreChange.bind(this)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJyaWRnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7ZUFDUCxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUFsRCxtQkFBbUIsWUFBbkIsbUJBQW1CO0lBQUUsVUFBVSxZQUFWLFVBQVU7O0lBSWhDLE1BQU07QUFVQyxXQVZQLE1BQU0sQ0FVRSxlQUFvQyxFQUFFOzBCQVY5QyxNQUFNOztBQVdSLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7QUFDeEMsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7QUFDOUMsUUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUNyRCxRQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyx1QkFBdUIsR0FBRyxLQUFLLENBQUM7QUFDckMsUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQ25CLGVBQWUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDM0U7O2VBbkJHLE1BQU07O1dBcUJPLDJCQUFDLE9BQXVCLEVBQUU7QUFDekMsVUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7QUFDeEIsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2RCxhQUFPLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3RELFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxVQUFVLENBQUM7ZUFDMUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQztLQUM5RDs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDZixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7OztXQUdNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ25DLFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLFVBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO0tBQ3RDOzs7V0FFTyxxQkFBRztBQUNULFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7T0FDM0M7S0FDRjs7O1dBRU8sb0JBQUc7QUFDVCxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO09BQzNDO0tBQ0Y7OztXQUVPLG9CQUFHO0FBQ1QsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztPQUMzQztLQUNGOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7T0FDMUM7S0FDRjs7O1dBRWdCLDJCQUFDLFFBQWUsRUFBUTs7OztBQUl2QyxVQUFNLEtBQXFDLEdBQUcsUUFBUSxDQUFDO0FBQ3ZELGNBQVEsS0FBSyxDQUFDLE9BQU87QUFDbkIsYUFBSyxjQUFjO0FBQ2pCLGtCQUFRLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ25CLGlCQUFLLE9BQU87QUFDVixrQkFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDM0Isb0JBQU07QUFBQSxBQUNSLGlCQUFLLG1CQUFtQjtBQUN0QixrQkFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QyxvQkFBTTtBQUFBLEFBQ1IsaUJBQUssb0JBQW9CO0FBQ3ZCLGtCQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLG9CQUFNO0FBQUEsQUFDUixpQkFBSyxpQkFBaUI7QUFDcEIsa0JBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyQyxvQkFBTTtBQUFBLEFBQ1IsaUJBQUssaUJBQWlCO0FBQ3BCLGtCQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxvQkFBTTtBQUFBLEFBQ1IsaUJBQUssbUJBQW1CO0FBQ3RCLGtCQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLG9CQUFNO0FBQUEsV0FDVDtBQUNELGdCQUFNO0FBQUEsT0FDVDtLQUNGOzs7V0FFd0IsbUNBQUMsZUFBeUQsRUFBRTs7O0FBQ25GLFVBQUksZUFBZSxFQUFFOztBQUNuQixjQUFNLE9BQU8sR0FBRyxlQUFlLENBQUM7QUFDaEMsY0FBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDMUQsY0FBSSxJQUFJLEVBQUU7O0FBQ1IsZ0JBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUN2QyxvQkFBSyw2QkFBNkIsRUFBRSxDQUFDO0FBQ3JDLG9CQUFLLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDMUQsQ0FBQyxDQUFDO1dBQ0o7O09BQ0YsTUFBTTtBQUNMLFlBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO09BQ3RDO0tBQ0Y7OztXQUVrQiw2QkFBQyxlQUF5RCxFQUFFO0FBQzdFLFVBQUksZUFBZSxFQUFFOztBQUNuQixjQUFNLE9BQU8sR0FBRyxlQUFlLENBQUM7QUFDaEMsY0FBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDMUQsY0FBSSxJQUFJLEVBQUU7O0FBQ1IsZ0JBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUN0QixJQUFJLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDaEIsb0JBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RCxvQkFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3pELENBQUMsQ0FBQztXQUNOOztPQUNGO0tBQ0Y7OztXQUVzQixpQ0FBQyxNQUF1QixFQUFFLElBQVksRUFBRTtBQUM3RCxVQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsZUFBZSxDQUNuQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQzdCLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztBQUM1QyxZQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRTtBQUM1QixZQUFJLEVBQUUsTUFBTTtBQUNaLGlCQUFPLGdDQUFnQztPQUN4QyxDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsd0JBQXdCLEdBQUcsTUFBTSxDQUFDO0tBQ3hDOzs7V0FFYSx3QkFBQyxRQUFpRCxFQUFFO0FBQ2hFLFVBQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUzRCxVQUFJLElBQUksRUFBRTtBQUNSLFlBQUk7QUFDRixjQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDO0FBQ3BDLGNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNoRSxTQUFTO0FBQ1IsY0FBSSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztTQUN0QztPQUNGO0tBQ0Y7OztXQUVnQiwyQkFBQyxRQUFpRCxFQUFFO0FBQ25FLFVBQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUzRCxVQUFJLElBQUksRUFBRTtBQUNSLFlBQUk7QUFDRixjQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDO0FBQ3BDLGNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ25FLFNBQVM7QUFDUixjQUFJLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxDQUFDO1NBQ3RDO09BQ0Y7S0FDRjs7O1dBRTRCLHlDQUFHO0FBQzlCLFVBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFO0FBQ2pDLFlBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QyxZQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO09BQ3RDO0tBQ0Y7OztXQUUyQixzQ0FBQyxJQUFZLEVBQUU7QUFDekMsVUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7S0FDNUI7OztXQUVrQiwrQkFBRzs7OztBQUVwQixVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzlCLFVBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFOztBQUM1QyxjQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbkIsaUJBQUssZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFLO0FBQy9ELG1CQUFPLENBQUMsSUFBSSxDQUFDO0FBQ1gsdUJBQVMsRUFBRSxTQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQztBQUN6Qyx3QkFBVSxFQUFFLElBQUk7YUFDakIsQ0FBQyxDQUFDO1dBQ0osQ0FBQyxDQUFDO0FBQ0gsaUJBQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDOztPQUNyRDtLQUNGOzs7U0ExTEcsTUFBTTs7O0FBNkxaLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwiZmlsZSI6IkJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuaW1wb3J0IHR5cGUgQnJlYWtwb2ludFN0b3JlVHlwZSBmcm9tICcuL0JyZWFrcG9pbnRTdG9yZSc7XG5cbmNsYXNzIEJyaWRnZSB7XG4gIF9icmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZVR5cGU7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgLy8gQ29udGFpbnMgZGlzcG9zYWJsZSBpdGVtcyBzaG91bGQgYmUgZGlzcG9zZWQgYnlcbiAgLy8gY2xlYW51cCgpIG1ldGhvZC5cbiAgX2NsZWFudXBEaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3NlbGVjdGVkQ2FsbEZyYW1lTWFya2VyOiA/YXRvbSRNYXJrZXI7XG4gIF93ZWJ2aWV3OiA/V2Vidmlld0VsZW1lbnQ7XG4gIF9zdXBwcmVzc0JyZWFrcG9pbnRTeW5jOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKGJyZWFrcG9pbnRTdG9yZTogQnJlYWtwb2ludFN0b3JlVHlwZSkge1xuICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZSA9IGJyZWFrcG9pbnRTdG9yZTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fY2xlYW51cERpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlciA9IG51bGw7XG4gICAgdGhpcy5fd2VidmlldyA9IG51bGw7XG4gICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IGZhbHNlO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGJyZWFrcG9pbnRTdG9yZS5vbkNoYW5nZSh0aGlzLl9oYW5kbGVCcmVha3BvaW50U3RvcmVDaGFuZ2UuYmluZCh0aGlzKSkpO1xuICB9XG5cbiAgc2V0V2Vidmlld0VsZW1lbnQod2VidmlldzogV2Vidmlld0VsZW1lbnQpIHtcbiAgICB0aGlzLl93ZWJ2aWV3ID0gd2VidmlldztcbiAgICBjb25zdCBib3VuZEhhbmRsZXIgPSB0aGlzLl9oYW5kbGVJcGNNZXNzYWdlLmJpbmQodGhpcyk7XG4gICAgd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIGJvdW5kSGFuZGxlcik7XG4gICAgdGhpcy5fY2xlYW51cERpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PlxuICAgICAgd2Vidmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIGJvdW5kSGFuZGxlcikpKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgLy8gQ2xlYW4gdXAgYW55IHN0YXRlIGNoYW5nZWQgYWZ0ZXIgY29uc3RydWN0b3IuXG4gIGNsZWFudXAoKSB7XG4gICAgdGhpcy5fY2xlYW51cERpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl93ZWJ2aWV3ID0gbnVsbDtcbiAgICB0aGlzLl9jbGVhclNlbGVjdGVkQ2FsbEZyYW1lTWFya2VyKCk7XG4gIH1cblxuICBjb250aW51ZSgpIHtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdjb21tYW5kJywgJ0NvbnRpbnVlJyk7XG4gICAgfVxuICB9XG5cbiAgc3RlcE92ZXIoKSB7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnY29tbWFuZCcsICdTdGVwT3ZlcicpO1xuICAgIH1cbiAgfVxuXG4gIHN0ZXBJbnRvKCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3RlcEludG8nKTtcbiAgICB9XG4gIH1cblxuICBzdGVwT3V0KCkge1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3RlcE91dCcpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVJcGNNZXNzYWdlKHN0ZEV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIC8vIGFkZEV2ZW50TGlzdGVuZXIgZXhwZWN0cyBpdHMgY2FsbGJhY2sgdG8gdGFrZSBhbiBFdmVudC4gSSdtIG5vdCBzdXJlIGhvdyB0byByZWNvbmNpbGUgaXQgd2l0aFxuICAgIC8vIHRoZSB0eXBlIHRoYXQgaXMgZXhwZWN0ZWQgaGVyZS5cbiAgICAvLyAkRmxvd0ZpeE1lKGplZmZyZXl0YW4pXG4gICAgY29uc3QgZXZlbnQ6IHtjaGFubmVsOiBzdHJpbmc7IGFyZ3M6IGFueVtdfSA9IHN0ZEV2ZW50O1xuICAgIHN3aXRjaCAoZXZlbnQuY2hhbm5lbCkge1xuICAgICAgY2FzZSAnbm90aWZpY2F0aW9uJzpcbiAgICAgICAgc3dpdGNoIChldmVudC5hcmdzWzBdKSB7XG4gICAgICAgICAgY2FzZSAncmVhZHknOlxuICAgICAgICAgICAgdGhpcy5fc2VuZEFsbEJyZWFrcG9pbnRzKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdDYWxsRnJhbWVTZWxlY3RlZCc6XG4gICAgICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZENhbGxGcmFtZUxpbmUoZXZlbnQuYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdPcGVuU291cmNlTG9jYXRpb24nOlxuICAgICAgICAgICAgdGhpcy5fb3BlblNvdXJjZUxvY2F0aW9uKGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnRGVidWdnZXJSZXN1bWVkJzpcbiAgICAgICAgICAgIHRoaXMuX3NldFNlbGVjdGVkQ2FsbEZyYW1lTGluZShudWxsKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ0JyZWFrcG9pbnRBZGRlZCc6XG4gICAgICAgICAgICB0aGlzLl9hZGRCcmVha3BvaW50KGV2ZW50LmFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnQnJlYWtwb2ludFJlbW92ZWQnOlxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQnJlYWtwb2ludChldmVudC5hcmdzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRTZWxlY3RlZENhbGxGcmFtZUxpbmUobnVsbGFibGVPcHRpb25zOiA/e3NvdXJjZVVSTDogc3RyaW5nOyBsaW5lTnVtYmVyOiBudW1iZXJ9KSB7XG4gICAgaWYgKG51bGxhYmxlT3B0aW9ucykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IG51bGxhYmxlT3B0aW9uczsgLy8gRm9yIHVzZSBpbiBjYXB0dXJlIHdpdGhvdXQgcmUtY2hlY2tpbmcgbnVsbFxuICAgICAgY29uc3QgcGF0aCA9IHJlbW90ZVVyaS51cmlUb051Y2xpZGVVcmkob3B0aW9ucy5zb3VyY2VVUkwpO1xuICAgICAgaWYgKHBhdGgpIHsgLy8gb25seSBoYW5kbGUgcmVhbCBmaWxlcyBmb3Igbm93XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCkudGhlbihlZGl0b3IgPT4ge1xuICAgICAgICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIoKTtcbiAgICAgICAgICB0aGlzLl9oaWdobGlnaHRDYWxsRnJhbWVMaW5lKGVkaXRvciwgb3B0aW9ucy5saW5lTnVtYmVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIoKTtcbiAgICB9XG4gIH1cblxuICBfb3BlblNvdXJjZUxvY2F0aW9uKG51bGxhYmxlT3B0aW9uczogP3tzb3VyY2VVUkw6IHN0cmluZzsgbGluZU51bWJlcjogbnVtYmVyfSkge1xuICAgIGlmIChudWxsYWJsZU9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBudWxsYWJsZU9wdGlvbnM7IC8vIEZvciB1c2UgaW4gY2FwdHVyZSB3aXRob3V0IHJlLWNoZWNraW5nIG51bGxcbiAgICAgIGNvbnN0IHBhdGggPSByZW1vdGVVcmkudXJpVG9OdWNsaWRlVXJpKG9wdGlvbnMuc291cmNlVVJMKTtcbiAgICAgIGlmIChwYXRoKSB7IC8vIG9ubHkgaGFuZGxlIHJlYWwgZmlsZXMgZm9yIG5vdy5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoKVxuICAgICAgICAgIC50aGVuKChlZGl0b3IpID0+IHtcbiAgICAgICAgICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtvcHRpb25zLmxpbmVOdW1iZXIsIDBdKTtcbiAgICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbb3B0aW9ucy5saW5lTnVtYmVyLCAwXSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2hpZ2hsaWdodENhbGxGcmFtZUxpbmUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIGxpbmU6IG51bWJlcikge1xuICAgIGNvbnN0IG1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoXG4gICAgICBbW2xpbmUsIDBdLCBbbGluZSwgSW5maW5pdHldXSxcbiAgICAgIHtwZXJzaXN0ZW50OiBmYWxzZSwgaW52YWxpZGF0ZTogJ25ldmVyJ30pO1xuICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgIGNsYXNzOiAnbnVjbGlkZS1jdXJyZW50LWxpbmUtaGlnaGxpZ2h0JyxcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlciA9IG1hcmtlcjtcbiAgfVxuXG4gIF9hZGRCcmVha3BvaW50KGxvY2F0aW9uOiB7c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShsb2NhdGlvbi5zb3VyY2VVUkwpO1xuICAgIC8vIG9ubHkgaGFuZGxlIHJlYWwgZmlsZXMgZm9yIG5vdy5cbiAgICBpZiAocGF0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5hZGRCcmVha3BvaW50KHBhdGgsIGxvY2F0aW9uLmxpbmVOdW1iZXIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9yZW1vdmVCcmVha3BvaW50KGxvY2F0aW9uOiB7c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn0pIHtcbiAgICBjb25zdCBwYXRoID0gcmVtb3RlVXJpLnVyaVRvTnVjbGlkZVVyaShsb2NhdGlvbi5zb3VyY2VVUkwpO1xuICAgIC8vIG9ubHkgaGFuZGxlIHJlYWwgZmlsZXMgZm9yIG5vdy5cbiAgICBpZiAocGF0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5kZWxldGVCcmVha3BvaW50KHBhdGgsIGxvY2F0aW9uLmxpbmVOdW1iZXIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50U3luYyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9jbGVhclNlbGVjdGVkQ2FsbEZyYW1lTWFya2VyKCkge1xuICAgIGlmICh0aGlzLl9zZWxlY3RlZENhbGxGcmFtZU1hcmtlcikge1xuICAgICAgdGhpcy5fc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fc2VsZWN0ZWRDYWxsRnJhbWVNYXJrZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVCcmVha3BvaW50U3RvcmVDaGFuZ2UocGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5fc2VuZEFsbEJyZWFrcG9pbnRzKCk7XG4gIH1cblxuICBfc2VuZEFsbEJyZWFrcG9pbnRzKCkge1xuICAgIC8vIFNlbmQgYW4gYXJyYXkgb2YgZmlsZS9saW5lIG9iamVjdHMuXG4gICAgY29uc3Qgd2VidmlldyA9IHRoaXMuX3dlYnZpZXc7XG4gICAgaWYgKHdlYnZpZXcgJiYgIXRoaXMuX3N1cHByZXNzQnJlYWtwb2ludFN5bmMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5nZXRBbGxCcmVha3BvaW50cygpLmZvckVhY2goKGxpbmUsIGtleSkgPT4ge1xuICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgIHNvdXJjZVVSTDogcmVtb3RlVXJpLm51Y2xpZGVVcmlUb1VyaShrZXkpLFxuICAgICAgICAgIGxpbmVOdW1iZXI6IGxpbmUsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB3ZWJ2aWV3LnNlbmQoJ2NvbW1hbmQnLCAnU3luY0JyZWFrcG9pbnRzJywgcmVzdWx0cyk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnJpZGdlO1xuIl19