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

import {CompositeDisposable, Disposable} from 'atom';
import {
  editorChangesDebounced,
  editorScrollTopDebounced,
} from '../../commons-atom/debounced';

/**
 * A single delegate which handles events from the object.
 *
 * This is simpler than registering handlers using emitter events directly, as
 * there's less messy bookkeeping regarding lifetimes of the unregister
 * Disposable objects.
 */
type BreakpointDisplayControllerDelegate = {
  handleTextEditorDestroyed: (controller: BreakpointDisplayController) => void;
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
  _shadowMarkerRows: Set<number>;
  _shadowMarkers: Array<atom$Marker>;

  constructor(
      delegate: BreakpointDisplayControllerDelegate,
      breakpointStore: BreakpointStore,
      editor: atom$TextEditor,
  ) {
    this._delegate = delegate;
    this._disposables = new CompositeDisposable();
    this._breakpointStore = breakpointStore;
    this._editor = editor;
    this._markers = [];
    this._shadowMarkerRows = new Set([]);
    this._shadowMarkers = [];

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
      new Disposable(() => gutterView.removeEventListener('click', boundClickHandler))
    );

    // Add click listeners into line number gutter for setting breakpoints.
    const lineNumberGutter = editor.gutterWithName('line-number');
    if (lineNumberGutter) {
      const lineNumberGutterView = atom.views.getView(lineNumberGutter);
      const boundLineNumberClickHandler = this._handleLineNumberGutterClick.bind(this);
      const boundLineNumberMouseOverOrOutHandler =
        this._handleLineNumberGutterMouseOverOrOut.bind(this);
      lineNumberGutterView.addEventListener('click', boundLineNumberClickHandler);
      lineNumberGutterView.addEventListener('mouseover', boundLineNumberMouseOverOrOutHandler);
      lineNumberGutterView.addEventListener('mouseout', boundLineNumberMouseOverOrOutHandler);
      this._disposables.add(new Disposable(() => {
        lineNumberGutterView.removeEventListener('click', boundLineNumberClickHandler);
        lineNumberGutterView.removeEventListener('mouseover', boundLineNumberMouseOverOrOutHandler);
        lineNumberGutterView.removeEventListener('mouseout', boundLineNumberMouseOverOrOutHandler);
      }));
    }

    this._disposables.add(
      this._breakpointStore.onChange(this._handleBreakpointsChanged.bind(this)),
    );
    this._disposables.add(this._editor.onDidDestroy(this._handleTextEditorDestroyed.bind(this)));

    // Update shadow breakpoints on debounced editor change and debounced view scroll
    editorScrollTopDebounced(this._editor, 300, false)
      .subscribe(this._update.bind(this));
    editorChangesDebounced(this._editor, 300, false)
      .subscribe(this._update.bind(this, true));

    const disposableCallback =
      atom.workspace.onDidChangeActivePaneItem(this._handleEditorChanged.bind(this));
    this._disposables.add(disposableCallback);

    this._update();
  }

  _handleEditorChanged(editor: mixed): void {
    if (this._editor !== editor) {
      this._removeAllShadowMarkers();
    } else {
      this._update();
    }
  }

  dispose() {
    this._disposables.dispose();
    this._markers.forEach(marker => marker.destroy());
    this._shadowMarkers.forEach(marker => marker.destroy());
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

  _removeAllShadowMarkers(): void {
    if (this._shadowMarkerRows.size !== 0) {
      this._shadowMarkers.forEach(marker => marker.destroy());
      this._shadowMarkerRows.clear();
      if (this._gutter != null) {
        this._gutter.show();
      }
    }
  }

  /**
   * Update the display with the current set of breakpoints for this editor.
   */
  _update(
    resetAllShadowMarkers : boolean = false,
  ) : void {
    const gutter = this._gutter;
    if (!gutter) {
      return;
    }

    const path = this._editor.getPath();
    const breakpoints = path ? this._breakpointStore.getBreakpointsForPath(path) : new Set();

    const unhandledLines = new Set(breakpoints);
    const markersToKeep = [];

    // Use sets for faster lookup
    const shadowMarkerRowsToFill = new Set(this._rowsOnScreen());
    const shadowMarkerRowsToDelete = new Set();

    // Destroy markers that no longer correspond to breakpoints.
    this._markers.forEach(marker => {
      const line = marker.getStartBufferPosition().row;
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
      gutter.decorateMarker(marker, {item: elem});
      markersToKeep.push(marker);
      // Don't create a shadow marker on a line with a real marker and
      // mark any existing shadow markers on these rows for deletion
      shadowMarkerRowsToFill.delete(line);
      shadowMarkerRowsToDelete.add(line);
    });

    if (resetAllShadowMarkers) {
      // Destroy all markers
      this._shadowMarkers.forEach(marker => marker.destroy());
      this._shadowMarkerRows.clear();
    } else {
      // Destroy off-screen shadow markers (and the DOM elements they're decorated with)
      // or those that occupy lines with breakpoints.
      // Use iterative loop since array is mutated during iteration
      for (let i = 0; i < this._shadowMarkers.length; i++) {
        const marker = this._shadowMarkers[i];
        const line = marker.getStartBufferPosition().row;
        if (!shadowMarkerRowsToFill.has(line) || shadowMarkerRowsToDelete.has(line)) {
          marker.destroy();
          this._shadowMarkerRows.delete(line);
          this._shadowMarkers.splice(i--, 1);
        }
      }
    }

    // Create a marker element and add it to the DOM for each unmarked row on the screen
    shadowMarkerRowsToFill
      .forEach(line => {
        // Only add markers to rows that don't already have markers
        if (this._shadowMarkerRows.has(line)) {
          return;
        }
        const shadowMarker = this._editor.markBufferPosition([line, 0], {
          persistent: true,
          invalidate: 'never',
        });
        const elem: HTMLAnchorElement = document.createElement('a');
        elem.classList.add(
          'nuclide-debugger-atom-shadow-breakpoint',
          `nuclide-debugger-atom-shadow-${line}`
        );
        gutter.decorateMarker(shadowMarker, {item: elem});
        this._shadowMarkerRows.add(line);
        this._shadowMarkers.push(shadowMarker);
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

  _handleBreakpointsChanged(path: string): void {
    if (path === this._editor.getPath()) {
      this._update();
    }
  }

  _handleGutterClick(event: Event): void {
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

  _handleLineNumberGutterMouseOverOrOut(event: Event): void {
    const target: Element = event.srcElement;
    if (!target.classList.contains('line-number')) {
      return;
    }
    const row = target.getAttribute('data-buffer-row');
    if (!row) {
      return;
    }

    const gutter: ?atom$Gutter = this._editor.gutterWithName('nuclide-breakpoint');
    if (gutter == null) {
      return;
    }
    const gutterView = atom.views.getView(gutter);
    if (!gutterView) {
      return;
    }
    const shadowMarkerElement =
      gutterView.getElementsByClassName(`nuclide-debugger-atom-shadow-${row}`)[0];
    if (!shadowMarkerElement) {
      return;
    }
    if (event.type === 'mouseover') {
      shadowMarkerElement.classList.add('nuclide-debugger-atom-shadow-breakpoint-icon');
    } else {
      shadowMarkerElement.classList.remove('nuclide-debugger-atom-shadow-breakpoint-icon');
    }
  }

  _handleLineNumberGutterClick(event: Event): void {
    // Filter out clicks to other line number gutter elements, e.g. the folding chevron.
    const target: Object = event.target; // classList isn't in the defs of HTMLElement...
    if (!target.classList.contains('line-number')) {
      return;
    }
    this._handleGutterClick(event);
  }

  _rowsOnScreen() : Array<number> {
    // `rowsPerPage` is 2 rows less than the number of rows on the screen ¯\_(ツ)_/¯
    const numRows: number = this._editor.rowsPerPage + 2;
    let currentRow: number = this._editor.firstVisibleScreenRow;
    const rows: Array<number> = [];
    let firstRow: boolean = true;
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
}

module.exports = BreakpointDisplayController;
