var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

/**
 * A single delegate which handles events from the object.
 *
 * This is simpler than registering handlers using emitter events directly, as
 * there's less messy bookkeeping regarding lifetimes of the unregister
 * Disposable objects.
 */

/**
 * Handles displaying breakpoints and processing events for a single text
 * editor.
 */

var BreakpointDisplayController = (function () {
  function BreakpointDisplayController(delegate, breakpointStore, editor) {
    var _this = this;

    _classCallCheck(this, BreakpointDisplayController);

    this._delegate = delegate;
    this._disposables = new CompositeDisposable();
    this._breakpointStore = breakpointStore;
    this._editor = editor;
    this._markers = [];

    // Configure the gutter.
    var gutter = editor.addGutter({
      name: 'nuclide-breakpoint',
      visible: false
    });
    this._disposables.add(gutter.onDidDestroy(this._handleGutterDestroyed.bind(this)));
    this._gutter = gutter;
    var boundClickHandler = this._handleGutterClick.bind(this);
    var gutterView = atom.views.getView(gutter);
    gutterView.addEventListener('click', boundClickHandler);
    this._disposables.add(new Disposable(function () {
      return gutterView.removeEventListener('click', boundClickHandler);
    }));

    // Add click listeners into line number gutter for setting breakpoints.
    var lineNumberGutter = editor.gutterWithName('line-number');
    if (lineNumberGutter) {
      (function () {
        var lineNumberGutterView = atom.views.getView(lineNumberGutter);
        var boundLineNumberClickHandler = _this._handleLineNumberGutterClick.bind(_this);
        lineNumberGutterView.addEventListener('click', boundLineNumberClickHandler);
        _this._disposables.add(new Disposable(function () {
          lineNumberGutterView.removeEventListener('click', boundLineNumberClickHandler);
        }));
      })();
    }

    this._disposables.add(this._breakpointStore.onChange(this._handleBreakpointsChanged.bind(this)));
    this._disposables.add(this._editor.onDidDestroy(this._handleTextEditorDestroyed.bind(this)));
    this._update();
  }

  _createClass(BreakpointDisplayController, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
      this._markers.forEach(function (marker) {
        return marker.destroy();
      });
      if (this._gutter) {
        this._gutter.destroy();
      }
    }
  }, {
    key: 'getEditor',
    value: function getEditor() {
      return this._editor;
    }
  }, {
    key: '_handleTextEditorDestroyed',
    value: function _handleTextEditorDestroyed() {
      // Gutter.destroy seems to fail after text editor is destroyed, and
      // Gutter.onDidDestroy doesn't seem to be called in that case.
      this._gutter = null;
      this._delegate.handleTextEditorDestroyed(this);
    }
  }, {
    key: '_handleGutterDestroyed',
    value: function _handleGutterDestroyed() {
      // If gutter is destroyed by some outside force, ensure the gutter is not
      // destroyed again.
      this._gutter = null;
    }

    /**
     * Update the display with the current set of breakpoints for this editor.
     */
  }, {
    key: '_update',
    value: function _update() {
      var _this2 = this;

      var gutter = this._gutter;
      if (!gutter) {
        return;
      }

      var path = this._editor.getPath();
      var breakpoints = path ? this._breakpointStore.getBreakpointsForPath(path) : new Set();

      var unhandledLines = new Set(breakpoints);
      var markersToKeep = [];

      // Destroy markers that no longer correspond to breakpoints.
      this._markers.forEach(function (marker) {
        var line = marker.getStartBufferPosition().row;
        if (breakpoints.has(line)) {
          markersToKeep.push(marker);
          unhandledLines['delete'](line);
        } else {
          marker.destroy();
        }
      });

      // Add new markers for breakpoints without corresponding markers.
      unhandledLines.forEach(function (line) {
        if (!gutter) {
          // flow seems a bit confused here.
          return;
        }
        var marker = _this2._editor.markBufferPosition([line, 0], {
          persistent: false,
          invalidate: 'touch'
        });
        marker.onDidChange(_this2._handleMarkerChange.bind(_this2));
        var elem = document.createElement('a');
        if (!(elem instanceof window.HTMLAnchorElement)) {
          throw 'should have created anchor element';
        }
        elem.className = 'nuclide-breakpoint-icon';
        gutter.decorateMarker(marker, { item: elem });
        markersToKeep.push(marker);
      });

      gutter.show();
      this._markers = markersToKeep;
    }

    /**
     * Handler for marker movements due to text being edited.
     */
  }, {
    key: '_handleMarkerChange',
    value: function _handleMarkerChange(event) {
      var path = this._editor.getPath();
      if (!path) {
        return;
      }
      if (!event.isValid) {
        this._breakpointStore.deleteBreakpoint(path, event.newHeadBufferPosition.row);
      } else if (event.oldHeadBufferPosition.row !== event.newHeadBufferPosition.row) {
        this._breakpointStore.deleteBreakpoint(path, event.oldHeadBufferPosition.row);
        this._breakpointStore.addBreakpoint(path, event.newHeadBufferPosition.row);
      }
    }
  }, {
    key: '_handleBreakpointsChanged',
    value: function _handleBreakpointsChanged(path) {
      if (path === this._editor.getPath()) {
        this._update();
      }
    }
  }, {
    key: '_handleGutterClick',
    value: function _handleGutterClick(event) {
      var path = this._editor.getPath();
      if (!path) {
        return;
      }
      // Beware, screenPositionForMouseEvent is not a public api and may change in future versions.
      // $FlowIssue
      var screenPos = atom.views.getView(this._editor).component.screenPositionForMouseEvent(event);
      var bufferPos = this._editor.bufferPositionForScreenPosition(screenPos);
      this._breakpointStore.toggleBreakpoint(path, bufferPos.row);
    }
  }, {
    key: '_handleLineNumberGutterClick',
    value: function _handleLineNumberGutterClick(event) {
      // Filter out clicks to other line number gutter elements, e.g. the folding chevron.
      var target = event.target; // classList isn't in the defs of HTMLElement...
      if (!target.classList.contains('line-number')) {
        return;
      }
      this._handleGutterClick(event);
    }
  }]);

  return BreakpointDisplayController;
})();

module.exports = BreakpointDisplayController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7ZUFhMEMsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBbEQsbUJBQW1CLFlBQW5CLG1CQUFtQjtJQUFFLFVBQVUsWUFBVixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7SUFpQmhDLDJCQUEyQjtBQVFwQixXQVJQLDJCQUEyQixDQVMzQixRQUE2QyxFQUM3QyxlQUFnQyxFQUNoQyxNQUF1QixFQUN6Qjs7OzBCQVpFLDJCQUEyQjs7QUFhN0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7QUFDMUIsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7QUFDOUMsUUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztBQUN4QyxRQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUN0QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQzs7O0FBR25CLFFBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDOUIsVUFBSSxFQUFFLG9CQUFvQjtBQUMxQixhQUFPLEVBQUUsS0FBSztLQUNmLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkYsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsUUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdELFFBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlDLGNBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMs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Q0FBQyxLQUFZLEVBQUU7O0FBRXpDLFVBQU0sTUFBYyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDcEMsVUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQzdDLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNoQzs7O1NBcEtHLDJCQUEyQjs7O0FBdUtqQyxNQUFNLENBQUMsT0FBTyxHQUFHLDJCQUEyQixDQUFDIiwiZmlsZSI6IkJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIEJyZWFrcG9pbnRTdG9yZSBmcm9tICcuL0JyZWFrcG9pbnRTdG9yZSc7XG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuLyoqXG4gKiBBIHNpbmdsZSBkZWxlZ2F0ZSB3aGljaCBoYW5kbGVzIGV2ZW50cyBmcm9tIHRoZSBvYmplY3QuXG4gKlxuICogVGhpcyBpcyBzaW1wbGVyIHRoYW4gcmVnaXN0ZXJpbmcgaGFuZGxlcnMgdXNpbmcgZW1pdHRlciBldmVudHMgZGlyZWN0bHksIGFzXG4gKiB0aGVyZSdzIGxlc3MgbWVzc3kgYm9va2tlZXBpbmcgcmVnYXJkaW5nIGxpZmV0aW1lcyBvZiB0aGUgdW5yZWdpc3RlclxuICogRGlzcG9zYWJsZSBvYmplY3RzLlxuICovXG50eXBlIEJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlckRlbGVnYXRlID0ge1xuICBoYW5kbGVUZXh0RWRpdG9yRGVzdHJveWVkOiAoY29udHJvbGxlcjogQnJlYWtwb2ludERpc3BsYXlDb250cm9sbGVyKSA9PiB2b2lkO1xufTtcblxuLyoqXG4gKiBIYW5kbGVzIGRpc3BsYXlpbmcgYnJlYWtwb2ludHMgYW5kIHByb2Nlc3NpbmcgZXZlbnRzIGZvciBhIHNpbmdsZSB0ZXh0XG4gKiBlZGl0b3IuXG4gKi9cbmNsYXNzIEJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlciB7XG4gIF9icmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZTtcbiAgX2RlbGVnYXRlOiBCcmVha3BvaW50RGlzcGxheUNvbnRyb2xsZXJEZWxlZ2F0ZTtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZWRpdG9yOiBhdG9tJFRleHRFZGl0b3I7XG4gIF9ndXR0ZXI6ID9hdG9tJEd1dHRlcjtcbiAgX21hcmtlcnM6IEFycmF5PGF0b20kTWFya2VyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIGRlbGVnYXRlOiBCcmVha3BvaW50RGlzcGxheUNvbnRyb2xsZXJEZWxlZ2F0ZSxcbiAgICAgIGJyZWFrcG9pbnRTdG9yZTogQnJlYWtwb2ludFN0b3JlLFxuICAgICAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3JcbiAgKSB7XG4gICAgdGhpcy5fZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlID0gYnJlYWtwb2ludFN0b3JlO1xuICAgIHRoaXMuX2VkaXRvciA9IGVkaXRvcjtcbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG5cbiAgICAvLyBDb25maWd1cmUgdGhlIGd1dHRlci5cbiAgICBjb25zdCBndXR0ZXIgPSBlZGl0b3IuYWRkR3V0dGVyKHtcbiAgICAgIG5hbWU6ICdudWNsaWRlLWJyZWFrcG9pbnQnLFxuICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgfSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGd1dHRlci5vbkRpZERlc3Ryb3kodGhpcy5faGFuZGxlR3V0dGVyRGVzdHJveWVkLmJpbmQodGhpcykpKTtcbiAgICB0aGlzLl9ndXR0ZXIgPSBndXR0ZXI7XG4gICAgY29uc3QgYm91bmRDbGlja0hhbmRsZXIgPSB0aGlzLl9oYW5kbGVHdXR0ZXJDbGljay5iaW5kKHRoaXMpO1xuICAgIGNvbnN0IGd1dHRlclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZ3V0dGVyKTtcbiAgICBndXR0ZXJWaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYm91bmRDbGlja0hhbmRsZXIpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IGd1dHRlclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBib3VuZENsaWNrSGFuZGxlcikpKTtcblxuICAgIC8vIEFkZCBjbGljayBsaXN0ZW5lcnMgaW50byBsaW5lIG51bWJlciBndXR0ZXIgZm9yIHNldHRpbmcgYnJlYWtwb2ludHMuXG4gICAgY29uc3QgbGluZU51bWJlckd1dHRlciA9IGVkaXRvci5ndXR0ZXJXaXRoTmFtZSgnbGluZS1udW1iZXInKTtcbiAgICBpZiAobGluZU51bWJlckd1dHRlcikge1xuICAgICAgY29uc3QgbGluZU51bWJlckd1dHRlclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcobGluZU51bWJlckd1dHRlcik7XG4gICAgICBjb25zdCBib3VuZExpbmVOdW1iZXJDbGlja0hhbmRsZXIgPSB0aGlzLl9oYW5kbGVMaW5lTnVtYmVyR3V0dGVyQ2xpY2suYmluZCh0aGlzKTtcbiAgICAgIGxpbmVOdW1iZXJHdXR0ZXJWaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYm91bmRMaW5lTnVtYmVyQ2xpY2tIYW5kbGVyKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIGxpbmVOdW1iZXJHdXR0ZXJWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYm91bmRMaW5lTnVtYmVyQ2xpY2tIYW5kbGVyKTtcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICB0aGlzLl9icmVha3BvaW50U3RvcmUub25DaGFuZ2UodGhpcy5faGFuZGxlQnJlYWtwb2ludHNDaGFuZ2VkLmJpbmQodGhpcykpKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQodGhpcy5fZWRpdG9yLm9uRGlkRGVzdHJveSh0aGlzLl9oYW5kbGVUZXh0RWRpdG9yRGVzdHJveWVkLmJpbmQodGhpcykpKTtcbiAgICB0aGlzLl91cGRhdGUoKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIHRoaXMuX21hcmtlcnMuZm9yRWFjaChtYXJrZXIgPT4gbWFya2VyLmRlc3Ryb3koKSk7XG4gICAgaWYgKHRoaXMuX2d1dHRlcikge1xuICAgICAgdGhpcy5fZ3V0dGVyLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBnZXRFZGl0b3IoKTogYXRvbSRUZXh0RWRpdG9yIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yO1xuICB9XG5cbiAgX2hhbmRsZVRleHRFZGl0b3JEZXN0cm95ZWQoKSB7XG4gICAgLy8gR3V0dGVyLmRlc3Ryb3kgc2VlbXMgdG8gZmFpbCBhZnRlciB0ZXh0IGVkaXRvciBpcyBkZXN0cm95ZWQsIGFuZFxuICAgIC8vIEd1dHRlci5vbkRpZERlc3Ryb3kgZG9lc24ndCBzZWVtIHRvIGJlIGNhbGxlZCBpbiB0aGF0IGNhc2UuXG4gICAgdGhpcy5fZ3V0dGVyID0gbnVsbDtcbiAgICB0aGlzLl9kZWxlZ2F0ZS5oYW5kbGVUZXh0RWRpdG9yRGVzdHJveWVkKHRoaXMpO1xuICB9XG5cbiAgX2hhbmRsZUd1dHRlckRlc3Ryb3llZCgpIHtcbiAgICAvLyBJZiBndXR0ZXIgaXMgZGVzdHJveWVkIGJ5IHNvbWUgb3V0c2lkZSBmb3JjZSwgZW5zdXJlIHRoZSBndXR0ZXIgaXMgbm90XG4gICAgLy8gZGVzdHJveWVkIGFnYWluLlxuICAgIHRoaXMuX2d1dHRlciA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBkaXNwbGF5IHdpdGggdGhlIGN1cnJlbnQgc2V0IG9mIGJyZWFrcG9pbnRzIGZvciB0aGlzIGVkaXRvci5cbiAgICovXG4gIF91cGRhdGUoKSB7XG4gICAgY29uc3QgZ3V0dGVyID0gdGhpcy5fZ3V0dGVyO1xuICAgIGlmICghZ3V0dGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGF0aCA9IHRoaXMuX2VkaXRvci5nZXRQYXRoKCk7XG4gICAgY29uc3QgYnJlYWtwb2ludHMgPSBwYXRoID8gdGhpcy5fYnJlYWtwb2ludFN0b3JlLmdldEJyZWFrcG9pbnRzRm9yUGF0aChwYXRoKSA6IG5ldyBTZXQoKTtcblxuICAgIGNvbnN0IHVuaGFuZGxlZExpbmVzID0gbmV3IFNldChicmVha3BvaW50cyk7XG4gICAgY29uc3QgbWFya2Vyc1RvS2VlcCA9IFtdO1xuXG4gICAgLy8gRGVzdHJveSBtYXJrZXJzIHRoYXQgbm8gbG9uZ2VyIGNvcnJlc3BvbmQgdG8gYnJlYWtwb2ludHMuXG4gICAgdGhpcy5fbWFya2Vycy5mb3JFYWNoKG1hcmtlciA9PiB7XG4gICAgICBjb25zdCBsaW5lID0gbWFya2VyLmdldFN0YXJ0QnVmZmVyUG9zaXRpb24oKS5yb3c7XG4gICAgICBpZiAoYnJlYWtwb2ludHMuaGFzKGxpbmUpKSB7XG4gICAgICAgIG1hcmtlcnNUb0tlZXAucHVzaChtYXJrZXIpO1xuICAgICAgICB1bmhhbmRsZWRMaW5lcy5kZWxldGUobGluZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXJrZXIuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQWRkIG5ldyBtYXJrZXJzIGZvciBicmVha3BvaW50cyB3aXRob3V0IGNvcnJlc3BvbmRpbmcgbWFya2Vycy5cbiAgICB1bmhhbmRsZWRMaW5lcy5mb3JFYWNoKGxpbmUgPT4ge1xuICAgICAgaWYgKCFndXR0ZXIpIHsgLy8gZmxvdyBzZWVtcyBhIGJpdCBjb25mdXNlZCBoZXJlLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKFtsaW5lLCAwXSwge1xuICAgICAgICBwZXJzaXN0ZW50OiBmYWxzZSxcbiAgICAgICAgaW52YWxpZGF0ZTogJ3RvdWNoJyxcbiAgICAgIH0pO1xuICAgICAgbWFya2VyLm9uRGlkQ2hhbmdlKHRoaXMuX2hhbmRsZU1hcmtlckNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgICAgIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICBpZiAoIShlbGVtIGluc3RhbmNlb2Ygd2luZG93LkhUTUxBbmNob3JFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyAnc2hvdWxkIGhhdmUgY3JlYXRlZCBhbmNob3IgZWxlbWVudCc7XG4gICAgICB9XG4gICAgICBlbGVtLmNsYXNzTmFtZSA9ICdudWNsaWRlLWJyZWFrcG9pbnQtaWNvbic7XG4gICAgICBndXR0ZXIuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7IGl0ZW06IGVsZW0gfSk7XG4gICAgICBtYXJrZXJzVG9LZWVwLnB1c2gobWFya2VyKTtcbiAgICB9KTtcblxuICAgIGd1dHRlci5zaG93KCk7XG4gICAgdGhpcy5fbWFya2VycyA9IG1hcmtlcnNUb0tlZXA7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlciBmb3IgbWFya2VyIG1vdmVtZW50cyBkdWUgdG8gdGV4dCBiZWluZyBlZGl0ZWQuXG4gICAqL1xuICBfaGFuZGxlTWFya2VyQ2hhbmdlKGV2ZW50OiBPYmplY3QpIHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5fZWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIXBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFldmVudC5pc1ZhbGlkKSB7XG4gICAgICB0aGlzLl9icmVha3BvaW50U3RvcmUuZGVsZXRlQnJlYWtwb2ludChwYXRoLCBldmVudC5uZXdIZWFkQnVmZmVyUG9zaXRpb24ucm93KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50Lm9sZEhlYWRCdWZmZXJQb3NpdGlvbi5yb3cgIT09IGV2ZW50Lm5ld0hlYWRCdWZmZXJQb3NpdGlvbi5yb3cpIHtcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5kZWxldGVCcmVha3BvaW50KHBhdGgsIGV2ZW50Lm9sZEhlYWRCdWZmZXJQb3NpdGlvbi5yb3cpO1xuICAgICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlLmFkZEJyZWFrcG9pbnQocGF0aCwgZXZlbnQubmV3SGVhZEJ1ZmZlclBvc2l0aW9uLnJvdyk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUJyZWFrcG9pbnRzQ2hhbmdlZChwYXRoOiBzdHJpbmcpIHtcbiAgICBpZiAocGF0aCA9PT0gdGhpcy5fZWRpdG9yLmdldFBhdGgoKSkge1xuICAgICAgdGhpcy5fdXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUd1dHRlckNsaWNrKGV2ZW50OiBFdmVudCkge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLl9lZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghcGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBCZXdhcmUsIHNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudCBpcyBub3QgYSBwdWJsaWMgYXBpIGFuZCBtYXkgY2hhbmdlIGluIGZ1dHVyZSB2ZXJzaW9ucy5cbiAgICAvLyAkRmxvd0lzc3VlXG4gICAgY29uc3Qgc2NyZWVuUG9zID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2VkaXRvcikuY29tcG9uZW50LnNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudChldmVudCk7XG4gICAgY29uc3QgYnVmZmVyUG9zID0gdGhpcy5fZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zKTtcbiAgICB0aGlzLl9icmVha3BvaW50U3RvcmUudG9nZ2xlQnJlYWtwb2ludChwYXRoLCBidWZmZXJQb3Mucm93KTtcbiAgfVxuXG4gIF9oYW5kbGVMaW5lTnVtYmVyR3V0dGVyQ2xpY2soZXZlbnQ6IEV2ZW50KSB7XG4gICAgLy8gRmlsdGVyIG91dCBjbGlja3MgdG8gb3RoZXIgbGluZSBudW1iZXIgZ3V0dGVyIGVsZW1lbnRzLCBlLmcuIHRoZSBmb2xkaW5nIGNoZXZyb24uXG4gICAgY29uc3QgdGFyZ2V0OiBPYmplY3QgPSBldmVudC50YXJnZXQ7IC8vIGNsYXNzTGlzdCBpc24ndCBpbiB0aGUgZGVmcyBvZiBIVE1MRWxlbWVudC4uLlxuICAgIGlmICghdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnbGluZS1udW1iZXInKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9oYW5kbGVHdXR0ZXJDbGljayhldmVudCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCcmVha3BvaW50RGlzcGxheUNvbnRyb2xsZXI7XG4iXX0=