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