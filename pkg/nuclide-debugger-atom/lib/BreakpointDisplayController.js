var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomDebounced2;

function _commonsAtomDebounced() {
  return _commonsAtomDebounced2 = require('../../commons-atom/debounced');
}

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
  function BreakpointDisplayController(delegate, breakpointStore, editor, debuggerActions) {
    var _this = this;

    _classCallCheck(this, BreakpointDisplayController);

    this._delegate = delegate;
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._breakpointStore = breakpointStore;
    this._debuggerActions = debuggerActions;
    this._editor = editor;
    this._markers = [];
    this._shadowMarkerRows = new Set([]);
    this._shadowMarkers = [];

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

    this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
      return gutterView.removeEventListener('click', boundClickHandler);
    }));

    // Add click listeners into line number gutter for setting breakpoints.
    var lineNumberGutter = editor.gutterWithName('line-number');
    if (lineNumberGutter) {
      (function () {
        var lineNumberGutterView = atom.views.getView(lineNumberGutter);
        var boundLineNumberClickHandler = _this._handleLineNumberGutterClick.bind(_this);
        var boundLineNumberMouseOverOrOutHandler = _this._handleLineNumberGutterMouseOverOrOut.bind(_this);
        lineNumberGutterView.addEventListener('click', boundLineNumberClickHandler);
        lineNumberGutterView.addEventListener('mouseover', boundLineNumberMouseOverOrOutHandler);
        lineNumberGutterView.addEventListener('mouseout', boundLineNumberMouseOverOrOutHandler);
        _this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
          lineNumberGutterView.removeEventListener('click', boundLineNumberClickHandler);
          lineNumberGutterView.removeEventListener('mouseover', boundLineNumberMouseOverOrOutHandler);
          lineNumberGutterView.removeEventListener('mouseout', boundLineNumberMouseOverOrOutHandler);
        }));
      })();
    }

    this._disposables.add(this._breakpointStore.onChange(this._handleBreakpointsChanged.bind(this)));
    this._disposables.add(this._editor.onDidDestroy(this._handleTextEditorDestroyed.bind(this)));

    // Update shadow breakpoints on debounced editor change and debounced view scroll
    (0, (_commonsAtomDebounced2 || _commonsAtomDebounced()).editorScrollTopDebounced)(this._editor, 300, false).subscribe(this._update.bind(this));
    (0, (_commonsAtomDebounced2 || _commonsAtomDebounced()).editorChangesDebounced)(this._editor, 300, false).subscribe(this._update.bind(this, true));

    var disposableCallback = atom.workspace.onDidChangeActivePaneItem(this._handleEditorChanged.bind(this));
    this._disposables.add(disposableCallback);

    this._update();
  }

  _createClass(BreakpointDisplayController, [{
    key: '_handleEditorChanged',
    value: function _handleEditorChanged(editor) {
      if (this._editor !== editor) {
        this._removeAllShadowMarkers();
      } else {
        this._update();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
      this._markers.forEach(function (marker) {
        return marker.destroy();
      });
      this._shadowMarkers.forEach(function (marker) {
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
  }, {
    key: '_removeAllShadowMarkers',
    value: function _removeAllShadowMarkers() {
      if (this._shadowMarkerRows.size !== 0) {
        this._shadowMarkers.forEach(function (marker) {
          return marker.destroy();
        });
        this._shadowMarkerRows.clear();
        if (this._gutter != null) {
          this._gutter.show();
        }
      }
    }

    /**
     * Update the display with the current set of breakpoints for this editor.
     */
  }, {
    key: '_update',
    value: function _update() {
      var _this2 = this;

      var resetAllShadowMarkers = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var gutter = this._gutter;
      if (!gutter) {
        return;
      }

      var path = this._editor.getPath();
      var breakpoints = path ? this._breakpointStore.getBreakpointsForPath(path) : new Set();

      var unhandledLines = new Set(breakpoints);
      var markersToKeep = [];

      // Use sets for faster lookup
      var shadowMarkerRowsToFill = new Set(this._rowsOnScreen());
      var shadowMarkerRowsToDelete = new Set();

      // Destroy markers that no longer correspond to breakpoints.
      this._markers.forEach(function (marker) {
        var line = marker.getStartBufferPosition().row;
        if (breakpoints.has(line)) {
          markersToKeep.push(marker);
          unhandledLines.delete(line);
          // Don't create a shadow marker on a line with a real marker
          // mark any existing shadow markers on these rows for deletion
          shadowMarkerRowsToFill.delete(line);
          shadowMarkerRowsToDelete.add(line);
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
        // Don't create a shadow marker on a line with a real marker and
        // mark any existing shadow markers on these rows for deletion
        shadowMarkerRowsToFill.delete(line);
        shadowMarkerRowsToDelete.add(line);
      });

      if (resetAllShadowMarkers) {
        // Destroy all markers
        this._shadowMarkers.forEach(function (marker) {
          return marker.destroy();
        });
        this._shadowMarkerRows.clear();
      } else {
        // Destroy off-screen shadow markers (and the DOM elements they're decorated with)
        // or those that occupy lines with breakpoints.
        // Use iterative loop since array is mutated during iteration
        for (var i = 0; i < this._shadowMarkers.length; i++) {
          var marker = this._shadowMarkers[i];
          var line = marker.getStartBufferPosition().row;
          if (!shadowMarkerRowsToFill.has(line) || shadowMarkerRowsToDelete.has(line)) {
            marker.destroy();
            this._shadowMarkerRows.delete(line);
            this._shadowMarkers.splice(i--, 1);
          }
        }
      }

      // Create a marker element and add it to the DOM for each unmarked row on the screen
      shadowMarkerRowsToFill.forEach(function (line) {
        // Only add markers to rows that don't already have markers
        if (_this2._shadowMarkerRows.has(line)) {
          return;
        }
        var shadowMarker = _this2._editor.markBufferPosition([line, 0], {
          persistent: true,
          invalidate: 'never'
        });
        var elem = document.createElement('a');
        elem.classList.add('nuclide-debugger-atom-shadow-breakpoint', 'nuclide-debugger-atom-shadow-' + line);
        gutter.decorateMarker(shadowMarker, { item: elem });
        _this2._shadowMarkerRows.add(line);
        _this2._shadowMarkers.push(shadowMarker);
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
        this._debuggerActions.deleteBreakpoint(path, event.newHeadBufferPosition.row);
      } else if (event.oldHeadBufferPosition.row !== event.newHeadBufferPosition.row) {
        this._debuggerActions.deleteBreakpoint(path, event.oldHeadBufferPosition.row);
        this._debuggerActions.addBreakpoint(path, event.newHeadBufferPosition.row);
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
      this._debuggerActions.toggleBreakpoint(path, bufferPos.row);
    }
  }, {
    key: '_handleLineNumberGutterMouseOverOrOut',
    value: function _handleLineNumberGutterMouseOverOrOut(event) {
      var target = event.srcElement;
      if (!target.classList.contains('line-number')) {
        return;
      }
      var row = target.getAttribute('data-buffer-row');
      if (!row) {
        return;
      }

      var gutter = this._editor.gutterWithName('nuclide-breakpoint');
      if (gutter == null) {
        return;
      }
      var gutterView = atom.views.getView(gutter);
      if (!gutterView) {
        return;
      }
      var shadowMarkerElement = gutterView.getElementsByClassName('nuclide-debugger-atom-shadow-' + row)[0];
      if (!shadowMarkerElement) {
        return;
      }
      if (event.type === 'mouseover') {
        shadowMarkerElement.classList.add('nuclide-debugger-atom-shadow-breakpoint-icon');
      } else {
        shadowMarkerElement.classList.remove('nuclide-debugger-atom-shadow-breakpoint-icon');
      }
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
  }, {
    key: '_rowsOnScreen',
    value: function _rowsOnScreen() {
      // `rowsPerPage` is 2 rows less than the number of rows on the screen ¯\_(ツ)_/¯
      var numRows = this._editor.rowsPerPage + 2;
      var currentRow = this._editor.firstVisibleScreenRow;
      var rows = [];
      var firstRow = true;
      while (rows.length < numRows && currentRow <= this._editor.getLastBufferRow()) {
        // Include first row of folded code
        if (!this._editor.isFoldedAtBufferRow(currentRow) || firstRow) {
          rows.push(currentRow);
          firstRow = !this._editor.isFoldedAtBufferRow(currentRow);
        }
        ++currentRow;
      }
      return rows;
    }
  }]);

  return BreakpointDisplayController;
})();

module.exports = BreakpointDisplayController;