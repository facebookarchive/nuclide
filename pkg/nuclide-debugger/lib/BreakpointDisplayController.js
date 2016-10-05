var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
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
    _classCallCheck(this, BreakpointDisplayController);

    this._delegate = delegate;
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._breakpointStore = breakpointStore;
    this._debuggerActions = debuggerActions;
    this._editor = editor;
    this._markers = [];
    this._lastShadowBreakpointMarker = null;

    // Configure the gutter.
    var gutter = editor.addGutter({
      name: 'nuclide-breakpoint',
      visible: false
    });
    this._gutter = gutter;
    this._disposables.add(gutter.onDidDestroy(this._handleGutterDestroyed.bind(this)), editor.observeGutters(this._registerGutterMouseHandlers.bind(this)), this._breakpointStore.onNeedUIUpdate(this._handleBreakpointsChanged.bind(this)), this._editor.onDidDestroy(this._handleTextEditorDestroyed.bind(this)));
    this._update();
  }

  _createClass(BreakpointDisplayController, [{
    key: '_registerGutterMouseHandlers',
    value: function _registerGutterMouseHandlers(gutter) {
      var gutterView = atom.views.getView(gutter);
      var boundClickHandler = this._handleGutterClick.bind(this);
      var boundMouseMoveHandler = this._handleGutterMouseMove.bind(this);
      var boundMouseOutHandler = this._handleGutterMouseOut.bind(this);
      // Add mouse listeners gutter for setting breakpoints.
      gutterView.addEventListener('click', boundClickHandler);
      gutterView.addEventListener('mousemove', boundMouseMoveHandler);
      gutterView.addEventListener('mouseout', boundMouseOutHandler);
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
        gutterView.removeEventListener('click', boundClickHandler);
        gutterView.removeEventListener('mousemove', boundMouseMoveHandler);
        gutterView.removeEventListener('mouseout', boundMouseOutHandler);
      }));
    }
  }, {
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
      var gutter = this._gutter;
      if (gutter == null) {
        return;
      }

      var path = this._editor.getPath();
      if (path == null) {
        return;
      }
      var breakpoints = this._breakpointStore.getBreakpointsForPath(path);
      // A mutable unhandled lines map.
      var unhandledLines = this._breakpointStore.getBreakpointLinesForPath(path);
      var markersToKeep = [];

      // Destroy markers that no longer correspond to breakpoints.
      this._markers.forEach(function (marker) {
        var line = marker.getStartBufferPosition().row;
        if (unhandledLines.has(line)) {
          markersToKeep.push(marker);
          unhandledLines.delete(line);
        } else {
          marker.destroy();
        }
      });

      // Add new markers for breakpoints without corresponding markers.
      for (var _ref3 of breakpoints) {
        var _ref2 = _slicedToArray(_ref3, 1);

        var line = _ref2[0];

        if (!unhandledLines.has(line)) {
          // This line has been handled.
          continue;
        }
        var marker = this._createBreakpointMarkerAtLine(line, false);
        // isShadow
        marker.onDidChange(this._handleMarkerChange.bind(this));
        markersToKeep.push(marker);
      }

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
      // Filter out clicks to the folding chevron.
      var FOLDING_CHEVRON_CLASS_NAME = 'icon-right';
      var BLAME_HASH_CLICKABLE_CLASS_NAME = 'nuclide-blame-hash-clickable';
      var target = event.target; // classList isn't in the defs of HTMLElement...
      if (target.classList.contains(FOLDING_CHEVRON_CLASS_NAME) || target.classList.contains(BLAME_HASH_CLICKABLE_CLASS_NAME)) {
        return;
      }

      var path = this._editor.getPath();
      if (!path) {
        return;
      }
      this._debuggerActions.toggleBreakpoint(path, this._getCurrentMouseEventLine(event));
    }
  }, {
    key: '_getCurrentMouseEventLine',
    value: function _getCurrentMouseEventLine(event) {
      // Beware, screenPositionForMouseEvent is not a public api and may change in future versions.
      // $FlowIssue
      var screenPos = atom.views.getView(this._editor).component.screenPositionForMouseEvent(event);
      var bufferPos = this._editor.bufferPositionForScreenPosition(screenPos);
      return bufferPos.row;
    }
  }, {
    key: '_handleGutterMouseMove',
    value: function _handleGutterMouseMove(event) {
      var curLine = this._getCurrentMouseEventLine(event);
      if (this._isLineOverLastShadowBreakpoint(curLine)) {
        return;
      }
      // User moves to a new line we need to delete the old shadow breakpoint
      // and create a new one.
      this._removeLastShadowBreakpoint();
      this._createShadowBreakpointAtLine(this._editor, curLine);
    }
  }, {
    key: '_handleGutterMouseOut',
    value: function _handleGutterMouseOut(event) {
      this._removeLastShadowBreakpoint();
    }
  }, {
    key: '_isLineOverLastShadowBreakpoint',
    value: function _isLineOverLastShadowBreakpoint(curLine) {
      var shadowBreakpointMarker = this._lastShadowBreakpointMarker;
      return shadowBreakpointMarker != null && shadowBreakpointMarker.getStartBufferPosition().row === curLine;
    }
  }, {
    key: '_removeLastShadowBreakpoint',
    value: function _removeLastShadowBreakpoint() {
      if (this._lastShadowBreakpointMarker != null) {
        this._lastShadowBreakpointMarker.destroy();
        this._lastShadowBreakpointMarker = null;
      }
    }
  }, {
    key: '_createShadowBreakpointAtLine',
    value: function _createShadowBreakpointAtLine(editor, line) {
      this._lastShadowBreakpointMarker = this._createBreakpointMarkerAtLine(line, true);
    }
  }, {
    key: '_createBreakpointMarkerAtLine',
    // isShadow
    value: function _createBreakpointMarkerAtLine(line, isShadow) {
      var marker = this._editor.markBufferPosition([line, 0], {
        invalidate: 'never'
      });
      var elem = document.createElement('a');
      elem.className = isShadow ? 'nuclide-debugger-shadow-breakpoint-icon' : 'nuclide-debugger-breakpoint-icon';
      (0, (_assert2 || _assert()).default)(this._gutter != null);
      this._gutter.decorateMarker(marker, { item: elem });
      return marker;
    }
  }]);

  return BreakpointDisplayController;
})();

module.exports = BreakpointDisplayController;