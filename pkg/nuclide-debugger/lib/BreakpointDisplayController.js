'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mouseToPosition;

function _load_mouseToPosition() {
  return _mouseToPosition = require('../../commons-atom/mouse-to-position');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Handles displaying breakpoints and processing events for a single text
 * editor.
 */


/**
 * A single delegate which handles events from the object.
 *
 * This is simpler than registering handlers using emitter events directly, as
 * there's less messy bookkeeping regarding lifetimes of the unregister
 * Disposable objects.
 */
class BreakpointDisplayController {

  constructor(delegate, breakpointStore, editor, debuggerActions) {
    this._delegate = delegate;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._breakpointStore = breakpointStore;
    this._debuggerActions = debuggerActions;
    this._editor = editor;
    this._markers = [];
    this._lastShadowBreakpointMarker = null;

    // Configure the gutter.
    const gutter = editor.addGutter({
      name: 'nuclide-breakpoint',
      visible: false,
      // Priority is -200 by default and 0 is the line number
      priority: -1100
    });
    this._gutter = gutter;
    this._disposables.add(gutter.onDidDestroy(this._handleGutterDestroyed.bind(this)), editor.observeGutters(this._registerGutterMouseHandlers.bind(this)), this._breakpointStore.onNeedUIUpdate(this._handleBreakpointsChanged.bind(this)), this._editor.onDidDestroy(this._handleTextEditorDestroyed.bind(this)));
    this._update();
  }

  _registerGutterMouseHandlers(gutter) {
    const gutterView = atom.views.getView(gutter);
    if (gutter.name !== 'line-number' && gutter.name !== 'nuclide-breakpoint') {
      return;
    }
    const boundClickHandler = this._handleGutterClick.bind(this);
    const boundMouseMoveHandler = this._handleGutterMouseMove.bind(this);
    const boundMouseLeaveHandler = this._handleGutterMouseLeave.bind(this);
    // Add mouse listeners gutter for setting breakpoints.
    gutterView.addEventListener('click', boundClickHandler);
    gutterView.addEventListener('mousemove', boundMouseMoveHandler);
    gutterView.addEventListener('mouseleave', boundMouseLeaveHandler);
    this._disposables.add(() => gutterView.removeEventListener('click', boundClickHandler), () => gutterView.removeEventListener('mousemove', boundMouseMoveHandler), () => gutterView.removeEventListener('mouseleave', boundMouseLeaveHandler));
  }

  dispose() {
    this._disposables.dispose();
    this._markers.forEach(marker => marker.destroy());
    if (this._gutter) {
      this._gutter.destroy();
    }
  }

  getEditor() {
    return this._editor;
  }

  _handleTextEditorDestroyed() {
    // Gutter.destroy seems to fail after text editor is destroyed, and
    // Gutter.onDidDestroy doesn't seem to be called in that case.
    this._gutter = null;
    this._delegate.handleTextEditorDestroyed(this);
  }

  _handleGutterDestroyed() {
    // If gutter is destroyed by some outside force, ensure the gutter is not
    // destroyed again.
    this._gutter = null;
  }

  /**
   * Update the display with the current set of breakpoints for this editor.
   */
  _update() {
    const gutter = this._gutter;
    if (gutter == null) {
      return;
    }

    const path = this._editor.getPath();
    if (path == null) {
      return;
    }
    const breakpoints = this._breakpointStore.getBreakpointsForPath(path);
    // A mutable unhandled lines map.
    const unhandledLines = this._breakpointStore.getBreakpointLinesForPath(path);
    const markersToKeep = [];

    // Destroy markers that no longer correspond to breakpoints.
    this._markers.forEach(marker => {
      const line = marker.getStartBufferPosition().row;
      if (unhandledLines.has(line)) {
        markersToKeep.push(marker);
        unhandledLines.delete(line);
      } else {
        marker.destroy();
      }
    });

    // Add new markers for breakpoints without corresponding markers.
    for (const [line] of breakpoints) {
      if (!unhandledLines.has(line)) {
        // This line has been handled.
        continue;
      }
      const marker = this._createBreakpointMarkerAtLine(line, false);
      marker.onDidChange(this._handleMarkerChange.bind(this));
      markersToKeep.push(marker);
    }

    gutter.show();
    this._markers = markersToKeep;
  }

  /**
   * Handler for marker movements due to text being edited.
   */
  _handleMarkerChange(event) {
    const path = this._editor.getPath();
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

  _handleBreakpointsChanged(path) {
    if (path === this._editor.getPath()) {
      this._update();
    }
  }

  _handleGutterClick(event) {
    // classList isn't in the defs of EventTarget...
    const target = event.target;
    if (target.classList.contains('icon-right')) {
      return;
    }

    const path = this._editor.getPath();
    if (!path) {
      return;
    }
    this._debuggerActions.toggleBreakpoint(path, this._getCurrentMouseEventLine(event));
  }

  _getCurrentMouseEventLine(event) {
    // $FlowIssue
    const bufferPos = (0, (_mouseToPosition || _load_mouseToPosition()).bufferPositionForMouseEvent)(event, this._editor);
    return bufferPos.row;
  }

  _handleGutterMouseMove(event) {
    const curLine = this._getCurrentMouseEventLine(event);
    if (this._isLineOverLastShadowBreakpoint(curLine)) {
      return;
    }
    // User moves to a new line we need to delete the old shadow breakpoint
    // and create a new one.
    this._removeLastShadowBreakpoint();
    this._createShadowBreakpointAtLine(this._editor, curLine);
  }

  _handleGutterMouseLeave(event) {
    this._removeLastShadowBreakpoint();
  }

  _isLineOverLastShadowBreakpoint(curLine) {
    const shadowBreakpointMarker = this._lastShadowBreakpointMarker;
    return shadowBreakpointMarker != null && shadowBreakpointMarker.getStartBufferPosition().row === curLine;
  }

  _removeLastShadowBreakpoint() {
    if (this._lastShadowBreakpointMarker != null) {
      this._lastShadowBreakpointMarker.destroy();
      this._lastShadowBreakpointMarker = null;
    }
  }

  _createShadowBreakpointAtLine(editor, line) {
    this._lastShadowBreakpointMarker = this._createBreakpointMarkerAtLine(line, true);
  }

  _createBreakpointMarkerAtLine(line, isShadow) {
    const marker = this._editor.markBufferPosition([line, 0], {
      invalidate: 'never'
    });
    const elem = document.createElement('span');
    elem.className = isShadow ? 'nuclide-debugger-shadow-breakpoint-icon' : 'nuclide-debugger-breakpoint-icon';

    if (!(this._gutter != null)) {
      throw new Error('Invariant violation: "this._gutter != null"');
    }

    this._gutter.decorateMarker(marker, { item: elem });
    return marker;
  }
}
exports.default = BreakpointDisplayController; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                */