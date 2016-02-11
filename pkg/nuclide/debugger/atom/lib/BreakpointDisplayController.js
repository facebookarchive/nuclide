var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

/* eslint-disable no-unused-vars */
var BreakpointStore = require('./BreakpointStore.js');
/* eslint-enable no-unused-vars */

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7ZUFXMEMsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBbEQsbUJBQW1CLFlBQW5CLG1CQUFtQjtJQUFFLFVBQVUsWUFBVixVQUFVOzs7QUFFdEMsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQmxELDJCQUEyQjtBQVFwQixXQVJQLDJCQUEyQixDQVMzQixRQUE2QyxFQUM3QyxlQUFnQyxFQUNoQyxNQUF1QixFQUN6Qjs7OzBCQVpFLDJCQUEyQjs7QUFhN0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7QUFDMUIsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7QUFDOUMsUUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztBQUN4QyxRQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUN0QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQzs7O0FBR25CLFFBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDOUIsVUFBSSxFQUFFLG9CQUFvQjtBQUMxQixhQUFPLEVBQUUsS0FBSztLQUNmLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkYsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsUUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdELFFBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFD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LElBQUksRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDN0Q7OztXQUUyQixzQ0FBQyxLQUFZLEVBQUU7O0FBRXpDLFVBQU0sTUFBYyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDcEMsVUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQzdDLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNoQzs7O1NBcEtHLDJCQUEyQjs7O0FBdUtqQyxNQUFNLENBQUMsT0FBTyxHQUFHLDJCQUEyQixDQUFDIiwiZmlsZSI6IkJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5jb25zdCBCcmVha3BvaW50U3RvcmUgPSByZXF1aXJlKCcuL0JyZWFrcG9pbnRTdG9yZS5qcycpO1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG4vKipcbiAqIEEgc2luZ2xlIGRlbGVnYXRlIHdoaWNoIGhhbmRsZXMgZXZlbnRzIGZyb20gdGhlIG9iamVjdC5cbiAqXG4gKiBUaGlzIGlzIHNpbXBsZXIgdGhhbiByZWdpc3RlcmluZyBoYW5kbGVycyB1c2luZyBlbWl0dGVyIGV2ZW50cyBkaXJlY3RseSwgYXNcbiAqIHRoZXJlJ3MgbGVzcyBtZXNzeSBib29ra2VlcGluZyByZWdhcmRpbmcgbGlmZXRpbWVzIG9mIHRoZSB1bnJlZ2lzdGVyXG4gKiBEaXNwb3NhYmxlIG9iamVjdHMuXG4gKi9cbnR5cGUgQnJlYWtwb2ludERpc3BsYXlDb250cm9sbGVyRGVsZWdhdGUgPSB7XG4gIGhhbmRsZVRleHRFZGl0b3JEZXN0cm95ZWQ6IChjb250cm9sbGVyOiBCcmVha3BvaW50RGlzcGxheUNvbnRyb2xsZXIpID0+IHZvaWQ7XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgZGlzcGxheWluZyBicmVha3BvaW50cyBhbmQgcHJvY2Vzc2luZyBldmVudHMgZm9yIGEgc2luZ2xlIHRleHRcbiAqIGVkaXRvci5cbiAqL1xuY2xhc3MgQnJlYWtwb2ludERpc3BsYXlDb250cm9sbGVyIHtcbiAgX2JyZWFrcG9pbnRTdG9yZTogQnJlYWtwb2ludFN0b3JlO1xuICBfZGVsZWdhdGU6IEJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlckRlbGVnYXRlO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9lZGl0b3I6IGF0b20kVGV4dEVkaXRvcjtcbiAgX2d1dHRlcjogP2F0b20kR3V0dGVyO1xuICBfbWFya2VyczogQXJyYXk8YXRvbSRNYXJrZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZGVsZWdhdGU6IEJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlckRlbGVnYXRlLFxuICAgICAgYnJlYWtwb2ludFN0b3JlOiBCcmVha3BvaW50U3RvcmUsXG4gICAgICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvclxuICApIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZSA9IGRlbGVnYXRlO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9icmVha3BvaW50U3RvcmUgPSBicmVha3BvaW50U3RvcmU7XG4gICAgdGhpcy5fZWRpdG9yID0gZWRpdG9yO1xuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcblxuICAgIC8vIENvbmZpZ3VyZSB0aGUgZ3V0dGVyLlxuICAgIGNvbnN0IGd1dHRlciA9IGVkaXRvci5hZGRHdXR0ZXIoe1xuICAgICAgbmFtZTogJ251Y2xpZGUtYnJlYWtwb2ludCcsXG4gICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICB9KTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoZ3V0dGVyLm9uRGlkRGVzdHJveSh0aGlzLl9oYW5kbGVHdXR0ZXJEZXN0cm95ZWQuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuX2d1dHRlciA9IGd1dHRlcjtcbiAgICBjb25zdCBib3VuZENsaWNrSGFuZGxlciA9IHRoaXMuX2hhbmRsZUd1dHRlckNsaWNrLmJpbmQodGhpcyk7XG4gICAgY29uc3QgZ3V0dGVyVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhndXR0ZXIpO1xuICAgIGd1dHRlclZpZXcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBib3VuZENsaWNrSGFuZGxlcik7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4gZ3V0dGVyVmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGJvdW5kQ2xpY2tIYW5kbGVyKSkpO1xuXG4gICAgLy8gQWRkIGNsaWNrIGxpc3RlbmVycyBpbnRvIGxpbmUgbnVtYmVyIGd1dHRlciBmb3Igc2V0dGluZyBicmVha3BvaW50cy5cbiAgICBjb25zdCBsaW5lTnVtYmVyR3V0dGVyID0gZWRpdG9yLmd1dHRlcldpdGhOYW1lKCdsaW5lLW51bWJlcicpO1xuICAgIGlmIChsaW5lTnVtYmVyR3V0dGVyKSB7XG4gICAgICBjb25zdCBsaW5lTnVtYmVyR3V0dGVyVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhsaW5lTnVtYmVyR3V0dGVyKTtcbiAgICAgIGNvbnN0IGJvdW5kTGluZU51bWJlckNsaWNrSGFuZGxlciA9IHRoaXMuX2hhbmRsZUxpbmVOdW1iZXJHdXR0ZXJDbGljay5iaW5kKHRoaXMpO1xuICAgICAgbGluZU51bWJlckd1dHRlclZpZXcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBib3VuZExpbmVOdW1iZXJDbGlja0hhbmRsZXIpO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgbGluZU51bWJlckd1dHRlclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBib3VuZExpbmVOdW1iZXJDbGlja0hhbmRsZXIpO1xuICAgICAgfSkpO1xuICAgIH1cblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5vbkNoYW5nZSh0aGlzLl9oYW5kbGVCcmVha3BvaW50c0NoYW5nZWQuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9lZGl0b3Iub25EaWREZXN0cm95KHRoaXMuX2hhbmRsZVRleHRFZGl0b3JEZXN0cm95ZWQuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuX3VwZGF0ZSgpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fbWFya2Vycy5mb3JFYWNoKG1hcmtlciA9PiBtYXJrZXIuZGVzdHJveSgpKTtcbiAgICBpZiAodGhpcy5fZ3V0dGVyKSB7XG4gICAgICB0aGlzLl9ndXR0ZXIuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldEVkaXRvcigpOiBhdG9tJFRleHRFZGl0b3Ige1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3I7XG4gIH1cblxuICBfaGFuZGxlVGV4dEVkaXRvckRlc3Ryb3llZCgpIHtcbiAgICAvLyBHdXR0ZXIuZGVzdHJveSBzZWVtcyB0byBmYWlsIGFmdGVyIHRleHQgZWRpdG9yIGlzIGRlc3Ryb3llZCwgYW5kXG4gICAgLy8gR3V0dGVyLm9uRGlkRGVzdHJveSBkb2Vzbid0IHNlZW0gdG8gYmUgY2FsbGVkIGluIHRoYXQgY2FzZS5cbiAgICB0aGlzLl9ndXR0ZXIgPSBudWxsO1xuICAgIHRoaXMuX2RlbGVnYXRlLmhhbmRsZVRleHRFZGl0b3JEZXN0cm95ZWQodGhpcyk7XG4gIH1cblxuICBfaGFuZGxlR3V0dGVyRGVzdHJveWVkKCkge1xuICAgIC8vIElmIGd1dHRlciBpcyBkZXN0cm95ZWQgYnkgc29tZSBvdXRzaWRlIGZvcmNlLCBlbnN1cmUgdGhlIGd1dHRlciBpcyBub3RcbiAgICAvLyBkZXN0cm95ZWQgYWdhaW4uXG4gICAgdGhpcy5fZ3V0dGVyID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGRpc3BsYXkgd2l0aCB0aGUgY3VycmVudCBzZXQgb2YgYnJlYWtwb2ludHMgZm9yIHRoaXMgZWRpdG9yLlxuICAgKi9cbiAgX3VwZGF0ZSgpIHtcbiAgICBjb25zdCBndXR0ZXIgPSB0aGlzLl9ndXR0ZXI7XG4gICAgaWYgKCFndXR0ZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYXRoID0gdGhpcy5fZWRpdG9yLmdldFBhdGgoKTtcbiAgICBjb25zdCBicmVha3BvaW50cyA9IHBhdGggPyB0aGlzLl9icmVha3BvaW50U3RvcmUuZ2V0QnJlYWtwb2ludHNGb3JQYXRoKHBhdGgpIDogbmV3IFNldCgpO1xuXG4gICAgY29uc3QgdW5oYW5kbGVkTGluZXMgPSBuZXcgU2V0KGJyZWFrcG9pbnRzKTtcbiAgICBjb25zdCBtYXJrZXJzVG9LZWVwID0gW107XG5cbiAgICAvLyBEZXN0cm95IG1hcmtlcnMgdGhhdCBubyBsb25nZXIgY29ycmVzcG9uZCB0byBicmVha3BvaW50cy5cbiAgICB0aGlzLl9tYXJrZXJzLmZvckVhY2gobWFya2VyID0+IHtcbiAgICAgIGNvbnN0IGxpbmUgPSBtYXJrZXIuZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbigpLnJvdztcbiAgICAgIGlmIChicmVha3BvaW50cy5oYXMobGluZSkpIHtcbiAgICAgICAgbWFya2Vyc1RvS2VlcC5wdXNoKG1hcmtlcik7XG4gICAgICAgIHVuaGFuZGxlZExpbmVzLmRlbGV0ZShsaW5lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcmtlci5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgbmV3IG1hcmtlcnMgZm9yIGJyZWFrcG9pbnRzIHdpdGhvdXQgY29ycmVzcG9uZGluZyBtYXJrZXJzLlxuICAgIHVuaGFuZGxlZExpbmVzLmZvckVhY2gobGluZSA9PiB7XG4gICAgICBpZiAoIWd1dHRlcikgeyAvLyBmbG93IHNlZW1zIGEgYml0IGNvbmZ1c2VkIGhlcmUuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1hcmtlciA9IHRoaXMuX2VkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24oW2xpbmUsIDBdLCB7XG4gICAgICAgIHBlcnNpc3RlbnQ6IGZhbHNlLFxuICAgICAgICBpbnZhbGlkYXRlOiAndG91Y2gnLFxuICAgICAgfSk7XG4gICAgICBtYXJrZXIub25EaWRDaGFuZ2UodGhpcy5faGFuZGxlTWFya2VyQ2hhbmdlLmJpbmQodGhpcykpO1xuICAgICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIGlmICghKGVsZW0gaW5zdGFuY2VvZiB3aW5kb3cuSFRNTEFuY2hvckVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93ICdzaG91bGQgaGF2ZSBjcmVhdGVkIGFuY2hvciBlbGVtZW50JztcbiAgICAgIH1cbiAgICAgIGVsZW0uY2xhc3NOYW1lID0gJ251Y2xpZGUtYnJlYWtwb2ludC1pY29uJztcbiAgICAgIGd1dHRlci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHsgaXRlbTogZWxlbSB9KTtcbiAgICAgIG1hcmtlcnNUb0tlZXAucHVzaChtYXJrZXIpO1xuICAgIH0pO1xuXG4gICAgZ3V0dGVyLnNob3coKTtcbiAgICB0aGlzLl9tYXJrZXJzID0gbWFya2Vyc1RvS2VlcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVyIGZvciBtYXJrZXIgbW92ZW1lbnRzIGR1ZSB0byB0ZXh0IGJlaW5nIGVkaXRlZC5cbiAgICovXG4gIF9oYW5kbGVNYXJrZXJDaGFuZ2UoZXZlbnQ6IE9iamVjdCkge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLl9lZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghcGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWV2ZW50LmlzVmFsaWQpIHtcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS5kZWxldGVCcmVha3BvaW50KHBhdGgsIGV2ZW50Lm5ld0hlYWRCdWZmZXJQb3NpdGlvbi5yb3cpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQub2xkSGVhZEJ1ZmZlclBvc2l0aW9uLnJvdyAhPT0gZXZlbnQubmV3SGVhZEJ1ZmZlclBvc2l0aW9uLnJvdykge1xuICAgICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlLmRlbGV0ZUJyZWFrcG9pbnQocGF0aCwgZXZlbnQub2xkSGVhZEJ1ZmZlclBvc2l0aW9uLnJvdyk7XG4gICAgICB0aGlzLl9icmVha3BvaW50U3RvcmUuYWRkQnJlYWtwb2ludChwYXRoLCBldmVudC5uZXdIZWFkQnVmZmVyUG9zaXRpb24ucm93KTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlQnJlYWtwb2ludHNDaGFuZ2VkKHBhdGg6IHN0cmluZykge1xuICAgIGlmIChwYXRoID09PSB0aGlzLl9lZGl0b3IuZ2V0UGF0aCgpKSB7XG4gICAgICB0aGlzLl91cGRhdGUoKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlR3V0dGVyQ2xpY2soZXZlbnQ6IEV2ZW50KSB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuX2VkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKCFwYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIEJld2FyZSwgc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50IGlzIG5vdCBhIHB1YmxpYyBhcGkgYW5kIG1heSBjaGFuZ2UgaW4gZnV0dXJlIHZlcnNpb25zLlxuICAgIC8vICRGbG93SXNzdWVcbiAgICBjb25zdCBzY3JlZW5Qb3MgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fZWRpdG9yKS5jb21wb25lbnQuc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KTtcbiAgICBjb25zdCBidWZmZXJQb3MgPSB0aGlzLl9lZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3MpO1xuICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZS50b2dnbGVCcmVha3BvaW50KHBhdGgsIGJ1ZmZlclBvcy5yb3cpO1xuICB9XG5cbiAgX2hhbmRsZUxpbmVOdW1iZXJHdXR0ZXJDbGljayhldmVudDogRXZlbnQpIHtcbiAgICAvLyBGaWx0ZXIgb3V0IGNsaWNrcyB0byBvdGhlciBsaW5lIG51bWJlciBndXR0ZXIgZWxlbWVudHMsIGUuZy4gdGhlIGZvbGRpbmcgY2hldnJvbi5cbiAgICBjb25zdCB0YXJnZXQ6IE9iamVjdCA9IGV2ZW50LnRhcmdldDsgLy8gY2xhc3NMaXN0IGlzbid0IGluIHRoZSBkZWZzIG9mIEhUTUxFbGVtZW50Li4uXG4gICAgaWYgKCF0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdsaW5lLW51bWJlcicpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2hhbmRsZUd1dHRlckNsaWNrKGV2ZW50KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlcjtcbiJdfQ==