'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LineMapping, OffsetMap, UIElement} from './types';

import {Range} from 'atom';
import {React} from 'react-for-atom';
import {ReactDOM} from 'react-for-atom';

type RenderedUiElement = {
  node: React.Element<any>,
  bufferRow: number,
};

function getOffsetBlockElements(
  offsets: OffsetMap,
  lineHeight: number,
): Array<RenderedUiElement> {
  return Array.from(offsets.entries())
    .map(([bufferRow, lineCount]) => ({
      bufferRow,
      node: (
        <div
          className = "nuclide-diff-view-block-offset"
          style={{minHeight: lineCount * lineHeight}}
        />
      ),
    }));
}

function getInlineBlockElements(
  inlineElements: Array<UIElement>,
  lineMapping: LineMapping,
  inNewEditor: boolean,
): Array<RenderedUiElement> {
  const elements = inlineElements.filter(element => element.inNewEditor === inNewEditor);

  const lineMapper = inNewEditor ? lineMapping.oldToNew : lineMapping.newToOld;

  const offsetElements = inlineElements.filter(element => element.inNewEditor !== inNewEditor)
    .map(({bufferRow, node}) => {
      const translatedBufferRow = lineMapper[bufferRow];
      const hiddenOffsetNode = (
        <div style={{position: 'relative'}}>
          <div
            className="nuclide-diff-view-block-offset"
            style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}}
          />
          <div style={{visibility: 'hidden', pointerEvents: 'none'}}>
            {node}
          </div>
        </div>
      );
      return {
        bufferRow: translatedBufferRow,
        node: hiddenOffsetNode,
      };
    });

  return elements.concat(offsetElements);
}

function renderBlockElements(
  editor: atom$TextEditor,
  elements: Array<RenderedUiElement>,
): Array<atom$Marker> {
  return elements.map(({bufferRow, node}) => {
    const marker = editor.markBufferPosition([bufferRow, 0], {invalidate: 'never'});

    // The position should be `after` if the element is at the end of the file.
    const position = bufferRow >= editor.getLineCount() - 1 ? 'after' : 'before';
    const container = document.createElement('div');
    ReactDOM.render(node, container);
    editor.decorateMarker(
      marker,
      {type: 'block', item: container, position},
    );

    return marker;
  });
}

/**
 * The DiffViewEditor manages the lifecycle of the two editors used in the diff view,
 * and controls its rendering of highlights and offsets.
 */
export default class DiffViewEditor {
  _editor: atom$TextEditor;
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

  setUIElements(
    elements: Array<UIElement>,
    lineMapping: LineMapping,
    inNewEditor: boolean,
  ): void {
    this._uiElementsMarkers.forEach(marker => marker.destroy());
    const uiElements = getInlineBlockElements(elements, lineMapping, inNewEditor);
    this._uiElementsMarkers = renderBlockElements(this._editor, uiElements);
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
      // Applies only to the compared read only text buffer.
      // Hence, it's safe and performant to use `setText` because the cursor position is hidden.
      buffer.setText(contents);
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
      lineNumber => this._createLineMarker(lineNumber, 'insert'),
    ).concat(removedLines.map(
      lineNumber => this._createLineMarker(lineNumber, 'delete'),
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
    const lineHeight = this._editor.getLineHeightInPixels();
    const offsetUiElements = getOffsetBlockElements(lineOffsets, lineHeight);
    this._offsetMarkers = renderBlockElements(this._editor, offsetUiElements);
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
