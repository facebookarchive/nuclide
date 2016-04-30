'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {OffsetMap} from './types';
import type {UIElement} from '../../nuclide-diff-ui-provider-interfaces';

import {Range} from 'atom';
import {ReactDOM} from 'react-for-atom';

/**
 * The DiffViewEditor manages the lifecycle of the two editors used in the diff view,
 * and controls its rendering of highlights and offsets.
 */
export default class DiffViewEditor {
  _editor: atom$TextEditor;;
  _editorElement: atom$TextEditorElement;
  _highlightMarkers: Array<atom$Marker>;
  _offsetMarkers: Array<atom$Marker>;
  _uiElementsMarkers: Array<atom$Marker>;

  constructor(editorElement: atom$TextEditorElement) {
    this._editorElement = editorElement;
    this._editor = editorElement.getModel();
    this._highlightMarkers = [];
    this._offsetMarkers = [];
    this._uiElementsMarkers = [];
  }

  setUIElements(elements: Array<UIElement>): void {
    for (const marker of this._uiElementsMarkers) {
      marker.destroy();
    }
    this._uiElementsMarkers = elements.map(element => {
      const {node, bufferRow} = element;
      // TODO(most): OMG, this mutates React props for the created component!!
      Object.assign(node.props.helpers, {
        scrollToRow: this._scrollToRow.bind(this),
      });
      const container = document.createElement('div');
      ReactDOM.render(node, container);
      // an overlay marker at a buffer range with row x renders under row x + 1
      // so, use range at bufferRow - 1 to actually display at bufferRow
      const range = [[bufferRow - 1, 0], [bufferRow - 1, 0]];
      const marker = this._editor.markBufferRange(range, {invalidate: 'never'});
      this._editor.decorateMarker(marker, {
        type: 'block',
        item: container,
        position: 'after',
      });
      return marker;
    });
  }

  scrollToScreenLine(screenLine: number): void {
    this._editor.scrollToScreenPosition(
      // Markers are ordered in ascending order by line number.
      [screenLine, 0],
      {center: true},
    );
  }

  setFileContents(filePath: string, contents: string): void {
    const buffer = this._editor.getBuffer();
    if (buffer.getText() !== contents) {
      if (buffer.getPath() === filePath && !buffer.isEmpty()) {
        // The text is set via diffs to keep the cursor position when updating the file that is
        // already active.
        buffer.setTextViaDiff(contents);
      } else {
        // `setText` is faster than diffing and is used for speed when the buffer is changing to a
        // different path or when an editable buffer is being loaded for the first time
        // (`buffer.isEmpty() === true`) because maintaining cursor position between file changes is
        // not needed.
        buffer.setText(contents);
      }
    }
    const grammar = atom.grammars.selectGrammar(filePath, contents);
    this._editor.setGrammar(grammar);
  }

  getModel(): Object {
    return this._editor;
  }

  getText(): string {
    return this._editor.getText();
  }

  /**
   * @param addedLines An array of buffer line numbers that should be highlighted as added.
   * @param removedLines An array of buffer line numbers that should be highlighted as removed.
   */
  setHighlightedLines(addedLines: Array<number> = [], removedLines: Array<number> = []) {
    for (const marker of this._highlightMarkers) {
      marker.destroy();
    }
    this._highlightMarkers = addedLines.map(
      lineNumber => this._createLineMarker(lineNumber, 'insert')
    ).concat(removedLines.map(
      lineNumber => this._createLineMarker(lineNumber, 'delete')
    ));
  }

  /**
   * @param lineNumber A buffer line number to be highlighted.
   * @param type The type of highlight to be applied to the line.
  *    Could be a value of: ['insert', 'delete'].
   */
  _createLineMarker(lineNumber: number, type: string): atom$Marker {
    const range = new Range(
      [lineNumber, 0],
      [lineNumber + 1, 0],
    );
    const marker = this._editor.markBufferRange(range, {invalidate: 'never'});
    this._editor.decorateMarker(marker, {type: 'highlight', class: `diff-view-${type}`});
    return marker;
  }

  setOffsets(lineOffsets: OffsetMap): void {
    this._offsetMarkers.forEach(marker => marker.destroy());
    this._offsetMarkers = [];
    const lineHeight = this._editor.getLineHeightInPixels();
    for (const [lineNumber, offsetLines] of lineOffsets) {
      const blockItem = document.createElement('div');
      blockItem.style.minHeight = (offsetLines * lineHeight) + 'px';
      blockItem.className = 'nuclide-diff-view-block-offset';
      const marker = this._editor.markBufferPosition([lineNumber, 0], {invalidate: 'never'});
      this._editor.decorateMarker(
        marker,
        {type: 'block', item: blockItem, position: 'before'},
      );
      this._offsetMarkers.push(marker);
    }
  }

  destroy(): void {
    this._highlightMarkers.forEach(marker => marker.destroy());
    this._highlightMarkers = [];
    this._offsetMarkers.forEach(marker => marker.destroy());
    this._offsetMarkers = [];
    this._uiElementsMarkers.forEach(marker => marker.destroy());
    this._uiElementsMarkers = [];
    this._editor.destroy();
  }

  _scrollToRow(row: number): void {
    this._editor.scrollToBufferPosition(
      [row, 0],
      {center: true},
    );
  }
}
