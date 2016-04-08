'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {InlineComponent, RenderedComponent, OffsetMap} from './types';

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

  constructor(editorElement: atom$TextEditorElement) {
    this._editorElement = editorElement;
    this._editor = editorElement.getModel();
    this._highlightMarkers = [];
    this._offsetMarkers = [];
  }

  renderInlineComponents(elements: Array<InlineComponent>): Promise<Array<RenderedComponent>> {
    const {object} = require('../../nuclide-commons');
    const components = [];
    const renderPromises = [];
    const scrollToRow = this._scrollToRow.bind(this);
    elements.forEach(element => {
      const {node, bufferRow} = element;
      if (!node.props.helpers) {
        node.props.helpers = {};
      }
      const helpers = {
        scrollToRow,
      };
      // TODO(most): OMG, this mutates React props for the created component!!
      object.assign(node.props.helpers, helpers);
      const container = document.createElement('div');
      let component;
      const didRenderPromise = new Promise((res, rej) => {
        component = ReactDOM.render(node, container, () => {
          res();
        });
      });
      renderPromises.push(didRenderPromise);
      components.push({
        bufferRow,
        // $FlowFixMe(most)
        component,
        container,
      });
    });
    return Promise.all(renderPromises).then(() => components);
  }

  attachInlineComponents(elements: Array<RenderedComponent>): void {
    elements.forEach(element => {
      const {bufferRow, container} = element;
      // an overlay marker at a buffer range with row x renders under row x + 1
      // so, use range at bufferRow - 1 to actually display at bufferRow
      const range = [[bufferRow - 1, 0], [bufferRow - 1, 0]];
      const marker = this._editor.markBufferRange(range, {invalidate: 'never'});
      this._editor.decorateMarker(marker, {type: 'overlay', item: container});
    });
  }

  getLineHeightInPixels(): number {
    return this._editor.getLineHeightInPixels();
  }

  scrollToScreenLine(screenLine: number): void {
    this._editor.scrollToScreenPosition(
      // Markers are ordered in ascending order by line number.
      [screenLine, 0],
      {center: true},
    );
  }

  setFileContents(filePath: string, contents: string): void {
    // The text is set via diffs to keep the cursor position.
    const buffer = this._editor.getBuffer();
    if (buffer.getText() !== contents) {
      buffer.setTextViaDiff(contents);
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
      const marker = this._editor.markBufferPosition([lineNumber, 0], {invalidate: 'never'});
      this._editor.decorateMarker(
        marker,
        {type: 'block', item: blockItem, position: 'after'},
      );
      this._offsetMarkers.push(marker);
    }
  }

  destroy(): void {
    this._highlightMarkers.forEach(marker => marker.destroy());
    this._highlightMarkers = [];
    this._offsetMarkers.forEach(marker => marker.destroy());
    this._offsetMarkers = [];
    this._editor.destroy();
  }

  _scrollToRow(row: number): void {
    this._editor.scrollToBufferPosition([row, 0]);
  }
}
