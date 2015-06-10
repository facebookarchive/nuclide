'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {trackTiming} = require('nuclide-analytics');

class ClickToSymbol {
  symbolNavigationMarkers: ?array<DisplayBufferMarker>;

  /**
   * Promise that `findDelegateAndClickableRanges` resolves to a
   * {delegate: ClickToSymbolDelegate; clickableRanges: ?array<Range>} or null
   * if no delegate can handle click to given position.
   */
  constructor(
      textEditor: TextEditor,
      shouldUseCmdKeyToActivate: () => boolean,
      findClickableRangesAndCallback: ?(editor: TextEditor, row: number, column: number, shiftKey: boolean) => Promise) {
    this.editorView = atom.views.getView(textEditor);
    this._findClickableRangesAndCallback = findClickableRangesAndCallback;
    this.shouldUseCmdKeyToActivate = shouldUseCmdKeyToActivate;
    this.symbolNavigationMarkers = null;

    this.editor = textEditor;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.editorView.addEventListener('mousedown', this.onMouseDown);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.editorView.addEventListener('mousemove', this.onMouseMove);
  }

  @trackTiming()
  findClickableRangesAndCallback(...args): Promise {
    return this._findClickableRangesAndCallback.apply(this, args);
  }

  async onMouseDown(e: MouseEvent) {
    var active = this.shouldUseCmdKeyToActivate() ? e.metaKey : e.altKey;
    if (!active) {
      return;
    }
    // By default atom's text editor will try to add another
    // cursor on the screen with meta+click. If we're hijacking the
    // meta key, disable this behavior.
    if (this.shouldUseCmdKeyToActivate()) {
      e.stopPropagation();
    }

    var rowAndColumn = this.getRowAndColumnForMouseEvent(e);
    var clickableRangesAndCallback = await this.findClickableRangesAndCallback(
          this.editor,
          rowAndColumn.row,
          rowAndColumn.column,
          e.shiftKey);
    if (clickableRangesAndCallback) {
      clickableRangesAndCallback.callback();
    }
  }

  onMouseMove(e: MouseEvent) {
    var active = this.shouldUseCmdKeyToActivate() ? e.metaKey : e.altKey;
    if (!active) {
      if (this.symbolNavigationMarkers) {
        this.updateSymbolNavigationMarkers(null);
      }
      return;
    }

    var rowAndColumn = this.getRowAndColumnForMouseEvent(e);
    this.findClickableRangesAndCallback(
        this.editor, rowAndColumn.row, rowAndColumn.column
    ).then((clickableRangesAndCallback) => {
      var clickableRanges = clickableRangesAndCallback ?
          clickableRangesAndCallback.clickableRanges : null;
      this.updateSymbolNavigationMarkers(clickableRanges);
    });
  }

  getRowAndColumnForMouseEvent(e): Point {
    // component.screenPositionForMouseEvent is an undocumented method but it
    // may become public. See discussion at https://github.com/atom/atom/issues/7082.
    // TODO (t7337039) Convert to the public method if it becomes public.
    var screenPosition = this.editorView.component.screenPositionForMouseEvent(e);
    return this.editor.bufferPositionForScreenPosition(screenPosition);
  }

  // range may be null. If null, the marker will be cleared.
  updateSymbolNavigationMarkers(ranges: ?array<Range>) {
    // Clear the existing marker, if appropriate.
    // TODO(mbolin): This marker needs to be removed more aggressively, like when
    // the user releases the alt key. Note that the symbol-navigation CSS class
    // will also have to be removed, though we do that via toggleClass() at the
    // end of this method to limit how much we touch the DOM.
    if (this.symbolNavigationMarkers) {
      this.symbolNavigationMarkers.forEach((symbolNavigationMarker) => {
        symbolNavigationMarker.destroy();
      });
      this.symbolNavigationMarker = null;
    }

    if (ranges) {
      this.symbolNavigationMarkers = ranges.map((range) => {
        var marker = this.editor.markBufferRange(range, {invalidate: 'never'});
        this.editor.decorateMarker(
          marker,
          {type: 'highlight', class: 'symbol-navigation'});
        return marker;
      });
    }
    this.editorView.classList.toggle('symbol-navigation', !!ranges);
  }

  dispose() {
    this.editorView.removeEventListener('mousedown', this.onMouseDown);
    this.editorView.removeEventListener('mousemove', this.onMouseMove);
  }
};

module.exports = ClickToSymbol;
