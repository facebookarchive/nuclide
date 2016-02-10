'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {CompositeDisposable, Disposable} = require('atom');
/* eslint-disable no-unused-vars */
const BreakpointStore = require('./BreakpointStore.js');
/* eslint-enable no-unused-vars */

/**
 * A single delegate which handles events from the object.
 *
 * This is simpler than registering handlers using emitter events directly, as
 * there's less messy bookkeeping regarding lifetimes of the unregister
 * Disposable objects.
 */
type BreakpointDisplayControllerDelegate = {
  handleTextEditorDestroyed: (controller: BreakpointDisplayController) => void,
};

/**
 * Handles displaying breakpoints and processing events for a single text
 * editor.
 */
class BreakpointDisplayController {
  _breakpointStore: BreakpointStore;
  _delegate: BreakpointDisplayControllerDelegate;
  _disposables: CompositeDisposable;
  _editor: atom$TextEditor;
  _gutter: ?atom$Gutter;
  _markers: Array<atom$Marker>;

  constructor(
      delegate: BreakpointDisplayControllerDelegate,
      breakpointStore: BreakpointStore,
      editor: atom$TextEditor
  ) {
    this._delegate = delegate;
    this._disposables = new CompositeDisposable();
    this._breakpointStore = breakpointStore;
    this._editor = editor;
    this._markers = [];

    // Configure the gutter.
    const gutter = editor.addGutter({
      name: 'nuclide-breakpoint',
      visible: false,
    });
    this._disposables.add(gutter.onDidDestroy(this._handleGutterDestroyed.bind(this)));
    this._gutter = gutter;
    const boundClickHandler = this._handleGutterClick.bind(this);
    const gutterView = atom.views.getView(gutter);
    gutterView.addEventListener('click', boundClickHandler);
    this._disposables.add(
      new Disposable(() => gutterView.removeEventListener('click', boundClickHandler)));

    // Add click listeners into line number gutter for setting breakpoints.
    const lineNumberGutter = editor.gutterWithName('line-number');
    if (lineNumberGutter) {
      const lineNumberGutterView = atom.views.getView(lineNumberGutter);
      const boundLineNumberClickHandler = this._handleLineNumberGutterClick.bind(this);
      lineNumberGutterView.addEventListener('click', boundLineNumberClickHandler);
      this._disposables.add(new Disposable(() => {
        lineNumberGutterView.removeEventListener('click', boundLineNumberClickHandler);
      }));
    }

    this._disposables.add(
      this._breakpointStore.onChange(this._handleBreakpointsChanged.bind(this)));
    this._disposables.add(this._editor.onDidDestroy(this._handleTextEditorDestroyed.bind(this)));
    this._update();
  }

  dispose() {
    this._disposables.dispose();
    this._markers.forEach(marker => marker.destroy());
    if (this._gutter) {
      this._gutter.destroy();
    }
  }

  getEditor(): atom$TextEditor {
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
    if (!gutter) {
      return;
    }

    const path = this._editor.getPath();
    const breakpoints = path ? this._breakpointStore.getBreakpointsForPath(path) : new Set();

    const unhandledLines = new Set(breakpoints);
    const markersToKeep = [];

    // Destroy markers that no longer correspond to breakpoints.
    this._markers.forEach(marker => {
      const line = marker.getStartBufferPosition().row;
      if (breakpoints.has(line)) {
        markersToKeep.push(marker);
        unhandledLines.delete(line);
      } else {
        marker.destroy();
      }
    });

    // Add new markers for breakpoints without corresponding markers.
    unhandledLines.forEach(line => {
      if (!gutter) { // flow seems a bit confused here.
        return;
      }
      const marker = this._editor.markBufferPosition([line, 0], {
        persistent: false,
        invalidate: 'touch',
      });
      marker.onDidChange(this._handleMarkerChange.bind(this));
      const elem = document.createElement('a');
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
  _handleMarkerChange(event: Object) {
    const path = this._editor.getPath();
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

  _handleBreakpointsChanged(path: string) {
    if (path === this._editor.getPath()) {
      this._update();
    }
  }

  _handleGutterClick(event: Event) {
    const path = this._editor.getPath();
    if (!path) {
      return;
    }
    // Beware, screenPositionForMouseEvent is not a public api and may change in future versions.
    // $FlowIssue
    const screenPos = atom.views.getView(this._editor).component.screenPositionForMouseEvent(event);
    const bufferPos = this._editor.bufferPositionForScreenPosition(screenPos);
    this._breakpointStore.toggleBreakpoint(path, bufferPos.row);
  }

  _handleLineNumberGutterClick(event: Event) {
    // Filter out clicks to other line number gutter elements, e.g. the folding chevron.
    const target: Object = event.target; // classList isn't in the defs of HTMLElement...
    if (!target.classList.contains('line-number')) {
      return;
    }
    this._handleGutterClick(event);
  }
}

module.exports = BreakpointDisplayController;
