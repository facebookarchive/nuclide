'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _blockDecorations;

function _load_blockDecorations() {
  return _blockDecorations = require('./block-decorations');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function renderLineOffset(lineCount, lineHeight) {
  return _react.createElement('div', {
    className: 'nuclide-diff-view-block-offset',
    style: { minHeight: lineCount * lineHeight }
  });
}

function renderInlineOffset(offsetElement) {
  return _react.createElement(
    'div',
    { style: { position: 'relative', width: '100%' } },
    _react.createElement('div', {
      className: 'nuclide-diff-view-block-offset',
      style: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }
    }),
    _react.createElement(
      'div',
      { style: { visibility: 'hidden', pointerEvents: 'none' } },
      offsetElement
    )
  );
}

/**
 * The DiffViewEditor manages the lifecycle of the two editors used in the diff view,
 * and controls its rendering of highlights and offsets.
 */
class DiffViewEditor {

  constructor(editorElement) {
    this._editorElement = editorElement;
    this._editor = editorElement.getModel();
    this._highlightMarkers = [];
    this._offsetMarkers = [];
    this._uiElementsMarkers = [];
    this._offsetUiElementsMarkers = [];

    this._cleanupInvisibleDecorations();
  }

  // This is now to work around Atom 1.12.x not clearing removed block decorations.
  // TODO(most): Remove this when upgrading to Atom 1.13.x.
  _cleanupInvisibleDecorations() {
    if (this._editor.isDestroyed()) {
      return;
    }
    const removedElements = Array.from(this._editorElement.getElementsByClassName('atom--invisible-block-decoration'));
    for (const element of removedElements) {
      _reactDom.default.unmountComponentAtNode(element);
    }
  }

  setUiElements(elements) {
    const diffBlockType = 'inline';
    this._uiElementsMarkers = (0, (_blockDecorations || _load_blockDecorations()).syncBlockDecorations)(this._editorElement, diffBlockType, elements, (element, customProps) => customProps.element !== element, element => ({
      element,
      customProps: { diffBlockType, element }
    }),
    /* syncWidth */true);
  }

  setOffsetUiElements(offsetElements, lineMapper) {
    const mappedOffsetElements = new Map();
    for (const [bufferRow, offsetElement] of offsetElements) {
      mappedOffsetElements.set(lineMapper[bufferRow], offsetElement);
    }

    const diffBlockType = 'inline-offset';
    this._offsetUiElementsMarkers = (0, (_blockDecorations || _load_blockDecorations()).syncBlockDecorations)(this._editorElement, diffBlockType, mappedOffsetElements, (offsetElement, customProps) => customProps.offsetElement !== offsetElement, offsetElement => ({
      element: renderInlineOffset(offsetElement),
      customProps: { diffBlockType, offsetElement }
    }));
  }

  scrollToScreenLine(screenLine) {
    this._editor.scrollToScreenPosition(
    // Markers are ordered in ascending order by line number.
    [screenLine, 0], { center: true });
  }

  setFileContents(filePath, contents) {
    const buffer = this._editor.getBuffer();
    if (buffer.getText() !== contents) {
      // Applies only to the compared read only text buffer.
      // Hence, it's safe and performant to use `setText` because the cursor position is hidden.
      buffer.setText(contents);
    }
    const grammar = atom.grammars.selectGrammar(filePath, contents);
    this._editor.setGrammar(grammar);
  }

  getModel() {
    return this._editor;
  }

  getText() {
    return this._editor.getText();
  }

  /**
   * @param addedLines An array of buffer line numbers that should be highlighted as added.
   * @param removedLines An array of buffer line numbers that should be highlighted as removed.
   */
  setHighlightedLines(addedLines = [], removedLines = []) {
    for (const marker of this._highlightMarkers) {
      marker.destroy();
    }
    this._highlightMarkers = addedLines.map(lineNumber => this._createLineMarker(lineNumber, 'insert')).concat(removedLines.map(lineNumber => this._createLineMarker(lineNumber, 'delete')));
  }

  /**
   * @param lineNumber A buffer line number to be highlighted.
   * @param type The type of highlight to be applied to the line.
  *    Could be a value of: ['insert', 'delete'].
   */
  _createLineMarker(lineNumber, type) {
    const range = new _atom.Range([lineNumber, 0], [lineNumber + 1, 0]);
    const marker = this._editor.markBufferRange(range, { invalidate: 'never' });
    this._editor.decorateMarker(marker, {
      type: 'highlight',
      class: `diff-view-${type}`
    });
    return marker;
  }

  setOffsets(lineOffsets) {
    const lineHeight = this._editor.getLineHeightInPixels();
    const diffBlockType = 'line-offset';
    this._offsetMarkers = (0, (_blockDecorations || _load_blockDecorations()).syncBlockDecorations)(this._editorElement, diffBlockType, lineOffsets, (lineCount, customProps) => customProps.lineCount !== lineCount, lineCount => ({
      element: renderLineOffset(lineCount, lineHeight),
      customProps: { lineCount, diffBlockType }
    }));
  }

  destroyMarkers() {
    const allMarkers = (0, (_collection || _load_collection()).concatIterators)(this._highlightMarkers, this._offsetMarkers, this._uiElementsMarkers, this._offsetUiElementsMarkers);
    for (const marker of allMarkers) {
      marker.destroy();
    }
    this._highlightMarkers = [];
    this._offsetMarkers = [];
    this._uiElementsMarkers = [];
    this._offsetUiElementsMarkers = [];
    this._cleanupInvisibleDecorations();
  }

  destroy() {
    this.destroyMarkers();
    this._editor.destroy();
  }

  getEditor() {
    return this._editor;
  }

  getEditorDomElement() {
    return this._editorElement;
  }
}
exports.default = DiffViewEditor;