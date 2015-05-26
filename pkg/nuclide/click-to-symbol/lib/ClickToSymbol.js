'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var {trackTimingAndCallAsync} = require('nuclide-analytics');
var CLICK_TO_SYMBOL_EVENT = 'clickToSymbol';

module.exports = class ClickToSymbol {
  symbolNavigationMarkers: ?array<DisplayBufferMarker>;

  /**
   * Promise that `findDelegateAndClickableRanges` resolves to a
   * {delegate: ClickToSymbolDelegate; clickableRanges: ?array<Range>} or null
   * if no delegate can handle click to given position.
   */
  constructor(
      textEditor: TextEditor,
      shouldUseCmdKeyToActivate: () => boolean,
      findClickableRangesAndCallback: ?(editor: Editor, row: number, column: number, shiftKey: boolean) => Promise) {
    // TODO(6974959): Eliminate the use of the undocumented __spacePenView property.
    this.editorView = atom.views.getView(textEditor).__spacePenView;
    this.findClickableRangesAndCallback = findClickableRangesAndCallback;
    this.shouldUseCmdKeyToActivate = shouldUseCmdKeyToActivate;
    this.symbolNavigationMarkers = null;

    this.editor = textEditor;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.editorView.on('mousedown', this.onMouseDown);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.editorView.on('mousemove', this.onMouseMove);
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
    var clickableRangesAndCallback =
        await trackTimingAndCallAsync(CLICK_TO_SYMBOL_EVENT, () => {
      return this.findClickableRangesAndCallback(
          this.editor,
          rowAndColumn.row,
          rowAndColumn.column,
          e.shiftKey);
    });
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
    // Calculate screen position.
    var offset = this.editorView.scrollView.offset();

    var editorRelativeLeft = e.pageX - offset.left + this.editorView.scrollLeft();
    var editorRelativeTop = e.pageY - offset.top + this.editorView.scrollTop();

    var screenPosition = {
      row: Math.floor(editorRelativeTop / this.editorView.lineHeight),
      column: Math.floor(editorRelativeLeft / this.editor.getDefaultCharWidth()),
    };

    // Convert screen position to buffer position.
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
    this.editorView.toggleClass('symbol-navigation', !!ranges);
  }

  dispose() {
    this.editorView.off('mousedown', this.onMouseDown);
    this.editorView.off('mousemove', this.onMouseMove);
  }
};
