'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Range}  = require('atom');
var {buildLineRangesWithOffsets} = require('./editor-utils');

/**
 * The DiffViewEditor manages the lifecycle of the two editors used in the diff view,
 * and controls its rendering of highlights and offsets.
 */
module.exports = class DiffViewEditor {

  constructor(editorElement: TextEditorElement) {
    this._editorElement = editorElement;
    this._editor = editorElement.getModel();

    this._markers = [];
    this._lineOffsets = {};

    // Ugly Hack to the display buffer to allow fake soft wrapped lines,
    // to create the non-numbered empty space needed between real text buffer lines.
    this._originalBuildScreenLines = this._editor.displayBuffer.buildScreenLines;
    this._editor.displayBuffer.buildScreenLines = (...args) => this._buildScreenLinesWithOffsets.apply(this, args);

    // There is no editor API to cancel foldability, but deep inside the line state creation,
    // it uses those functions to determine if a line is foldable or not.
    // For Diff View, folding breaks offsets, hence we need to make it unfoldable.
    this._editor.isFoldableAtScreenRow = this._editor.isFoldableAtBufferRow = () => false;
  }

  setFileContents(filePath: string, contents: string): void {
    this._editor.setText(contents);
    var grammar = atom.grammars.selectGrammar(filePath, contents);
    this._editor.setGrammar(grammar);
  }

  getText(): string {
    return this._editor.getText();
  }

  /**
   * @param addedLines An array of buffer line numbers that should be highlighted as added.
   * @param removedLines An array of buffer line numbers that should be highlighted as removed.
   */
  setHighlightedLines(addedLines: ?Array<number> = [], removedLines: ?Array<number> = []) {
    for (var marker of this._markers) {
      marker.destroy();
    }
    this._markers = addedLines.map(lineNumber => this._createLineMarker(lineNumber, 'insert'))
        .concat(removedLines.map(lineNumber => this._createLineMarker(lineNumber, 'delete')));
  }

  /**
   * @param lineNumber A buffer line number to be highlighted.
   * @param type The type of highlight to be applied to the line.
  *    Could be a value of: ['insert', 'delete'].
   */
  _createLineMarker(lineNumber: number, type: string): Marker {
    var screenPosition = this._editor.screenPositionForBufferPosition({row: lineNumber, column: 0});
    var range = new Range(
        screenPosition,
        {row: screenPosition.row, column: this._editor.lineTextForScreenRow(screenPosition.row).length}
        // TODO: highlight the full line when the mapping between buffer lines to screen line is implemented.
        // {row: screenPosition.row + 1, column: 0}
    );
    var marker = this._editor.markScreenRange(range, {invalidate: 'never'});
    var klass = 'diff-view-' + type;
    this._editor.decorateMarker(marker, {type: 'line-number', class: klass});
    this._editor.decorateMarker(marker, {type: 'highlight', class: klass});
    return marker;
  }

  setOffsets(lineOffsets: any): void {
    this._lineOffsets = lineOffsets;
    // When the diff view is editable: upon edits in the new editor, the old editor needs to update its
    // rendering state to show the offset wrapped lines.
    // This isn't a public API, but came from a discussion on the Atom public channel.
    // Needed Atom API: Request a full re-render from an editor.
    this._editor.displayBuffer.updateAllScreenLines();
    this._editorElement.component.presenter.updateState();
  }

  _buildScreenLinesWithOffsets(startBufferRow: number, endBufferRow: number): LineRangesWithOffsets {
    var {regions, screenLines} = this._originalBuildScreenLines.apply(this._editor.displayBuffer, arguments);
    if (!Object.keys(this._lineOffsets).length) {
      return {regions, screenLines};
    }

    return buildLineRangesWithOffsets(screenLines, this._lineOffsets, startBufferRow, endBufferRow,
      () => {
        var copy = screenLines[0].copy();
        copy.token = [];
        copy.text = 'empty_lolo';
        copy.tags = [];
        return copy;
      }
    );
  }

  setReadOnly(): void {
    // Unfotunately, there is no other clean way to make an editor read only.
    // Got this from Atom's code to make an editor read-only.
    // Filed an issue: https://github.com/atom/atom/issues/6880
    this._editorElement.removeAttribute('tabindex');
    this._editor.getDecorations({class: 'cursor-line', type: 'line'})[0].destroy();
  }
};
