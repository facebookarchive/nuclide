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
var React = require('react-for-atom');
var logger = require('nuclide-logging').getLogger();

import type {InlineComponent, RenderedComponent} from './types';

/**
 * The DiffViewEditor manages the lifecycle of the two editors used in the diff view,
 * and controls its rendering of highlights and offsets.
 */
module.exports = class DiffViewEditor {
  _editor: Object;
  _editorElement: Object;
  _markers: Array<atom$Marker>;
  _lineOffsets: Object;
  _originalBuildScreenLines: () => Object;

  constructor(editorElement: TextEditorElement) {
    this._editorElement = editorElement;
    this._editor = editorElement.getModel();

    this._markers = [];
    this._lineOffsets = {};

    // Ugly Hack to the display buffer to allow fake soft wrapped lines,
    // to create the non-numbered empty space needed between real text buffer lines.
    this._originalBuildScreenLines = this._editor.displayBuffer.buildScreenLines;
    this._editor.displayBuffer.checkScreenLinesInvariant = () => {};
    this._editor.displayBuffer.buildScreenLines = (...args) => this._buildScreenLinesWithOffsets.apply(this, args);

    // There is no editor API to cancel foldability, but deep inside the line state creation,
    // it uses those functions to determine if a line is foldable or not.
    // For Diff View, folding breaks offsets, hence we need to make it unfoldable.
    this._editor.isFoldableAtScreenRow = this._editor.isFoldableAtBufferRow = () => false;
  }

  renderInlineComponents(elements: Array<InlineComponent>): Promise<Array<RenderedComponent>> {
    var {object} = require('nuclide-commons');
    var components = [];
    var renderPromises = [];
    var scrollToRow = this._scrollToRow.bind(this);
    elements.forEach(element => {
      var {node, bufferRow} = element;
      if (!node.props.helpers) {
        node.props.helpers = {};
      }
      var helpers = {
        scrollToRow,
      };
      object.assign(node.props.helpers, helpers);
      var container = document.createElement('div');
      var component;
      var didRenderPromise = new Promise((res, rej) => {
        component = React.render(node, container, () => {
          res();
        });
      });
      renderPromises.push(didRenderPromise);
      components.push({
        bufferRow,
        component,
        container,
      });
    });
    return Promise.all(renderPromises).then(() => components);
  }

  attachInlineComponents(elements: Array<RenderedComponent>): void {
    elements.forEach(element => {
      var {bufferRow, container} = element;
      // an overlay marker at a buffer range with row x renders under row x + 1
      // so, use range at bufferRow - 1 to actually display at bufferRow
      var range = [[bufferRow - 1, 0], [bufferRow - 1, 0]];
      var marker = this._editor.markBufferRange(range, {invalidate: 'never'});
      this._editor.decorateMarker(marker, {type: 'overlay', item: container});
    });
  }

  getLineHeightInPixels(): number {
    return this._editor.getLineHeightInPixels();
  }

  setFileContents(filePath: string, contents: string, clearHistory: boolean): void {
    // The text is set via diffs to keep the cursor position.
    var buffer = this._editor.getBuffer();
    buffer.setTextViaDiff(contents);
    if (clearHistory) {
      buffer.clearUndoStack();
    }
    var grammar = atom.grammars.selectGrammar(filePath, contents);
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
  _createLineMarker(lineNumber: number, type: string): atom$Marker {
    var screenPosition = this._editor.screenPositionForBufferPosition({row: lineNumber, column: 0});
    var range = new Range(
        screenPosition,
        {row: screenPosition.row, column: this._editor.lineTextForScreenRow(screenPosition.row).length}
        // TODO: highlight the full line when the mapping between buffer lines to screen line is implemented.
        // {row: screenPosition.row + 1, column: 0}
    );
    var marker = this._editor.markScreenRange(range, {invalidate: 'never'});
    this._editor.decorateMarker(marker, {type: 'highlight', class: `diff-view-${type}`});
    return marker;
  }

  setOffsets(lineOffsets: any): void {
    this._lineOffsets = lineOffsets;
    // When the diff view is editable: upon edits in the new editor, the old editor needs to update its
    // rendering state to show the offset wrapped lines.
    // This isn't a public API, but came from a discussion on the Atom public channel.
    this._editor.displayBuffer.updateAllScreenLines();
    const component = this._editorElement.component || {};
    const {presenter} = component;
    if (!presenter) {
      logger.error('No text editor presenter is wired up to the Diff View text editor!');
      return;
    }
    if (typeof presenter.updateState === 'function') {
      // Atom until v1.0.18 has updateState to force re-rendering of editor state.
      // This is needed to request a full re-render from the editor.
      presenter.updateState();
    }
    // Atom master after v1.0.18 has will know when it has changed lines or decorations,
    // and will auto-update.
  }

  _buildScreenLinesWithOffsets(startBufferRow: number, endBufferRow: number): LineRangesWithOffsets {
    // HACK! Enabling `softWrapped` lines would greatly complicate the offset screen line mapping
    // needed to render the offset lines for the Diff View.
    // Hence, we need to disable the original screen line from returning soft-wrapped lines.
    const {displayBuffer} = this._editor;
    displayBuffer.softWrapped = false;
    const {regions, screenLines} = this._originalBuildScreenLines.apply(displayBuffer, arguments);
    displayBuffer.softWrapped = true;
    if (!Object.keys(this._lineOffsets).length) {
      return {regions, screenLines};
    }

    return buildLineRangesWithOffsets(screenLines, this._lineOffsets, startBufferRow, endBufferRow,
      () => {
        var copy = screenLines[0].copy();
        copy.token = [];
        copy.text = '';
        copy.tags = [];
        return copy;
      }
    );
  }

  setReadOnly(): void {
    // Unfotunately, there is no other clean way to make an editor read only.
    // Got this from Atom's code to make an editor read-only.
    // Filed an issue: https://github.com/atom/atom/issues/6880
    this._editor.getDecorations({class: 'cursor-line'})[0].destroy();
    // Cancel insert events to prevent typing in the text editor and disallow editing (read-only).
    this._editor.onWillInsertText(event => event.cancel());
    // Swallow paste texts.
    this._editor.pasteText = () => {};
    // Swallow insert and delete calls on its buffer.
    this._editor.getBuffer().delete = () => {};
    this._editor.getBuffer().insert = () => {};
  }

  _scrollToRow(row: number): void {
    this._editor.scrollToBufferPosition([row, 0]);
  }
};
