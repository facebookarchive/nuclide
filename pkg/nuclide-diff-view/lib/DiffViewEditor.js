'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {EditorElementsMap, LineMapper, OffsetMap} from './types';

import {Range} from 'atom';
import {React} from 'react-for-atom';
import {concatIterators} from '../../commons-node/collection';
import {renderReactRoot} from '../../commons-atom/renderReactRoot';
import invariant from 'assert';

type BlockElementWithProps = {
  element: React.Element<any>,
  customProps: Object,
};

function renderLineOffset(
  lineCount: number,
  lineHeight: number,
): React.Element<any> {
  return (
    <div
      className = "nuclide-diff-view-block-offset"
      style={{minHeight: lineCount * lineHeight}}
    />
  );
}

function renderInlineElement(
  inlineElement: React.Element<any>,
  scrollToRow: (buffeRow: number) => void,
): React.Element<any> {
  // TODO(most): Replace this property injection with a better UI Provider API.
  inlineElement.props.helpers.scrollToRow = scrollToRow;
  return inlineElement;
}

function renderInlineOffset(
  offsetElement: React.Element<any>,
): React.Element<any> {
  return (
    <div style={{position: 'relative', width: '100%'}}>
      <div
        className="nuclide-diff-view-block-offset"
        style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}}
      />
      <div style={{visibility: 'hidden', pointerEvents: 'none'}}>
        {offsetElement}
      </div>
    </div>
  );
}

/**
 * Instead of destroying all the decorations and re-rendering them on each edit,
 * while Atom markers may have already moved the elements to the right numbers,
 * this will diff the decorations of type: `diffBlockType` with what they should be,
 * given a source of truth: `source` that can be checked if an update is needed,
 * and `getElementWithProps` will be used to get the latest item to be rendered,
 * with the metadata it needs to store to check if no need for future changes.
 *
 * This introduces `React`-like behavior for Atom block decoration markers,
 * by diffing the source of truth to the rendered version, and applying only the needed changes.
 *
 * @return an array of markers to be destroyed when the decorations are no longer needed.
 */
function syncBlockDecorations<Value>(
  editorElement: atom$TextEditorElement,
  diffBlockType: string,
  source: Map<number, Value>,
  shouldUpdate: (value: Value, properties: Object) => boolean,
  getElementWithProps: (value: Value) => BlockElementWithProps,
  syncWidth?: boolean = false,
): Array<atom$Marker> {
  const editor = editorElement.getModel();
  const decorations = editor.getDecorations({diffBlockType});
  const renderedLineNumbers = new Set();
  const {component} = editorElement;
  invariant(component, 'Editor not yet initialized!');
  const editorWidthPx = syncWidth
    ? `${component.scrollViewNode.clientWidth}px`
    : '';

  const markers = [];

  for (const decoration of decorations) {
    const marker = decoration.getMarker();
    const lineNumber = marker.getBufferRange().start.row;
    const value = source.get(lineNumber);
    const properties = decoration.getProperties();
    const item: HTMLElement = properties.item;

    if (value == null || shouldUpdate(value, properties) || item.style.width !== editorWidthPx) {
      marker.destroy();
      continue;
    }

    // The item is already up to date.
    markers.push(marker);
    renderedLineNumbers.add(lineNumber);
  }

  for (const [lineNumber, value] of source) {
    if (renderedLineNumbers.has(lineNumber)) {
      continue;
    }

    const {element, customProps} = getElementWithProps(value);
    const marker = editor.markBufferPosition([lineNumber, 0], {invalidate: 'never'});

    // The position should be `after` if the element is at the end of the file.
    const position = lineNumber >= editor.getLineCount() - 1 ? 'after' : 'before';
    const item = renderReactRoot(element);
    item.style.width = editorWidthPx;
    editor.decorateMarker(marker, {
      ...customProps,
      type: 'block',
      item,
      position,
    });

    markers.push(marker);
  }

  return markers;
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
  _offsetUiElementsMarkers: Array<atom$Marker>;

  constructor(editorElement: atom$TextEditorElement) {
    this._editorElement = editorElement;
    this._editor = editorElement.getModel();
    this._highlightMarkers = [];
    this._offsetMarkers = [];
    this._uiElementsMarkers = [];
    this._offsetUiElementsMarkers = [];
    (this: any)._scrollToRow = this._scrollToRow.bind(this);
  }

  setUiElements(elements: EditorElementsMap): void {
    const diffBlockType = 'inline';
    this._uiElementsMarkers = syncBlockDecorations(
      this._editorElement,
      diffBlockType,
      elements,
      (element, customProps) => customProps.element !== element,
      element => ({
        element: renderInlineElement(element, this._scrollToRow),
        customProps: {diffBlockType, element},
      }),
      /* syncWidth */ true,
    );
  }

  setOffsetUiElements(
    offsetElements: EditorElementsMap,
    lineMapper: LineMapper,
  ): void {
    const mappedOffsetElements = new Map();
    for (const [bufferRow, offsetElement] of offsetElements) {
      mappedOffsetElements.set(
        lineMapper[bufferRow],
        offsetElement,
      );
    }

    const diffBlockType = 'inline-offset';
    this._offsetUiElementsMarkers = syncBlockDecorations(
      this._editorElement,
      diffBlockType,
      mappedOffsetElements,
      (offsetElement, customProps) => customProps.offsetElement !== offsetElement,
      offsetElement => ({
        element: renderInlineOffset(offsetElement),
        customProps: {diffBlockType, offsetElement},
      }),
    );
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
    const lineHeight = this._editor.getLineHeightInPixels();
    const diffBlockType = 'line-offset';
    this._offsetMarkers = syncBlockDecorations(
      this._editorElement,
      diffBlockType,
      lineOffsets,
      (lineCount, customProps) => customProps.lineCount !== lineCount,
      lineCount => ({
        element: renderLineOffset(lineCount, lineHeight),
        customProps: {lineCount, diffBlockType},
      }),
    );
  }

  _destroyMarkers(): void {
    const allMarkers = concatIterators(
      this._highlightMarkers,
      this._offsetMarkers,
      this._uiElementsMarkers,
      this._offsetUiElementsMarkers,
    );
    for (const marker of allMarkers) {
      marker.destroy();
    }
    this._highlightMarkers = [];
    this._offsetMarkers = [];
    this._uiElementsMarkers = [];
    this._offsetUiElementsMarkers = [];
  }

  destroy(): void {
    this._destroyMarkers();
    this._editor.destroy();
  }

  _scrollToRow(row: number): void {
    this._editor.scrollToBufferPosition(
      [row, 0],
      {center: true},
    );
  }
}
