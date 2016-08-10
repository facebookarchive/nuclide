'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type BreakpointStore from './BreakpointStore';
import type DebuggerActions from './DebuggerActions';

import {CompositeDisposable, Disposable} from 'atom';

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
  _debuggerActions: DebuggerActions;
  _delegate: BreakpointDisplayControllerDelegate;
  _disposables: CompositeDisposable;
  _editor: atom$TextEditor;
  _gutter: ?atom$Gutter;
  _markers: Array<atom$Marker>;
  _lastShadowBreakpointMarker: ?atom$Marker;

  constructor(
      delegate: BreakpointDisplayControllerDelegate,
      breakpointStore: BreakpointStore,
      editor: atom$TextEditor,
      debuggerActions: DebuggerActions,
  ) {
    this._delegate = delegate;
    this._disposables = new CompositeDisposable();
    this._breakpointStore = breakpointStore;
    this._debuggerActions = debuggerActions;
    this._editor = editor;
    this._markers = [];
    this._lastShadowBreakpointMarker = null;

    // Configure the gutter.
    const gutter = editor.addGutter({
      name: 'nuclide-breakpoint',
      visible: false,
    });
    this._disposables.add(gutter.onDidDestroy(this._handleGutterDestroyed.bind(this)));
    this._gutter = gutter;

    this._disposables.add(editor.observeGutters(this._registerGutterMouseHandlers.bind(this)));

    this._disposables.add(
      this._breakpointStore.onNeedUIUpdate(this._handleBreakpointsChanged.bind(this)),
    );
    this._disposables.add(this._editor.onDidDestroy(this._handleTextEditorDestroyed.bind(this)));

    this._update();
  }

  _registerGutterMouseHandlers(gutter: atom$Gutter): void {
    const gutterView = atom.views.getView(gutter);
    const boundClickHandler = this._handleGutterClick.bind(this);
    const boundMouseMoveHandler =
      this._handleGutterMouseMove.bind(this);
    const boundMouseOutHandler =
      this._handleGutterMouseOut.bind(this);
    // Add mouse listeners gutter for setting breakpoints.
    gutterView.addEventListener('click', boundClickHandler);
    gutterView.addEventListener('mousemove', boundMouseMoveHandler);
    gutterView.addEventListener('mouseout', boundMouseOutHandler);
    this._disposables.add(new Disposable(() => {
      gutterView.removeEventListener('click', boundClickHandler);
      gutterView.removeEventListener('mousemove', boundMouseMoveHandler);
      gutterView.removeEventListener('mouseout', boundMouseOutHandler);
    }));
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
  _update() : void {
    const gutter = this._gutter;
    if (!gutter) {
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
      gutter.decorateMarker(marker, {item: elem});
      markersToKeep.push(marker);
    }

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
      this._debuggerActions.deleteBreakpoint(path, event.newHeadBufferPosition.row);
    } else if (event.oldHeadBufferPosition.row !== event.newHeadBufferPosition.row) {
      this._debuggerActions.deleteBreakpoint(path, event.oldHeadBufferPosition.row);
      this._debuggerActions.addBreakpoint(path, event.newHeadBufferPosition.row);
    }
  }

  _handleBreakpointsChanged(path: string): void {
    if (path === this._editor.getPath()) {
      this._update();
    }
  }

  _handleGutterClick(event: Event): void {
    // Filter out clicks to the folding chevron.
    const FOLDING_CHEVRON_CLASS_NAME = 'icon-right';
    const target: Object = event.target; // classList isn't in the defs of HTMLElement...
    if (target.classList.contains(FOLDING_CHEVRON_CLASS_NAME)) {
      return;
    }

    const path = this._editor.getPath();
    if (!path) {
      return;
    }
    this._debuggerActions.toggleBreakpoint(path, this._getCurrentMouseEventLine(event));
  }

  _getCurrentMouseEventLine(event: Event): number {
    // Beware, screenPositionForMouseEvent is not a public api and may change in future versions.
    // $FlowIssue
    const screenPos = atom.views.getView(this._editor).component.screenPositionForMouseEvent(event);
    const bufferPos = this._editor.bufferPositionForScreenPosition(screenPos);
    return bufferPos.row;
  }

  _handleGutterMouseMove(event: Event): void {
    const curLine = this._getCurrentMouseEventLine(event);
    this._removeLastShadownBreakpoint();
    this._createShadowBreakpointAtLine(this._editor, curLine);
  }

  _handleGutterMouseOut(event: Event): void {
    this._removeLastShadownBreakpoint();
  }

  _removeLastShadownBreakpoint(): void {
    if (this._lastShadowBreakpointMarker != null) {
      this._lastShadowBreakpointMarker.destroy();
      this._lastShadowBreakpointMarker = null;
    }
  }

  _createShadowBreakpointAtLine(editor: TextEditor, line: number): void {
    const gutter: ?atom$Gutter = editor.gutterWithName('nuclide-breakpoint');
    if (gutter == null) {
      return;
    }
    const shadowMarker = editor.markBufferPosition([line, 0], {
      persistent: true,
      invalidate: 'never',
    });
    const elem: HTMLAnchorElement = document.createElement('a');
    elem.classList.add(
      'nuclide-debugger-atom-shadow-breakpoint',
      `nuclide-debugger-atom-shadow-${line}`,
      'nuclide-debugger-atom-shadow-breakpoint-icon',
    );
    gutter.decorateMarker(shadowMarker, {item: elem});
    this._lastShadowBreakpointMarker = shadowMarker;
  }
}

module.exports = BreakpointDisplayController;
