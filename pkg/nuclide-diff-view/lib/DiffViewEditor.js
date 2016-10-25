'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

/**
 * The DiffViewEditor manages the lifecycle of the two editors used in the diff view,
 * and controls its rendering of highlights and offsets.
 */
let DiffViewEditor = class DiffViewEditor {

  constructor(editorElement) {
    this._editorElement = editorElement;
    this._editor = editorElement.getModel();
    this._highlightMarkers = [];
    this._offsetMarkers = [];
    this._uiElementsMarkers = [];
  }

  setUIElements(elements) {
    for (const marker of this._uiElementsMarkers) {
      marker.destroy();
    }
    this._uiElementsMarkers = elements.map(element => {
      const node = element.node;
      const bufferRow = element.bufferRow;
      // TODO(most): OMG, this mutates React props for the created component!!

      Object.assign(node.props.helpers, {
        scrollToRow: this._scrollToRow.bind(this)
      });
      const container = document.createElement('div');
      _reactForAtom.ReactDOM.render(node, container);
      // an overlay marker at a buffer range with row x renders under row x + 1
      // so, use range at bufferRow - 1 to actually display at bufferRow
      const range = [[bufferRow - 1, 0], [bufferRow - 1, 0]];
      const marker = this._editor.markBufferRange(range, { invalidate: 'never' });
      this._editor.decorateMarker(marker, {
        type: 'overlay',
        item: container,
        position: 'tail'
      });
      return marker;
    });
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
  setHighlightedLines() {
    let addedLines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    let removedLines = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

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
    this._editor.decorateMarker(marker, { type: 'highlight', class: `diff-view-${ type }` });
    return marker;
  }

  setOffsets(lineOffsets) {
    this._offsetMarkers.forEach(marker => marker.destroy());
    this._offsetMarkers = [];
    const lineHeight = this._editor.getLineHeightInPixels();
    for (const _ref of lineOffsets) {
      var _ref2 = _slicedToArray(_ref, 2);

      const lineNumber = _ref2[0];
      const offsetLines = _ref2[1];

      const blockItem = document.createElement('div');
      blockItem.style.minHeight = offsetLines * lineHeight + 'px';
      blockItem.className = 'nuclide-diff-view-block-offset';
      const marker = this._editor.markBufferPosition([lineNumber, 0], { invalidate: 'never' });
      // The position should be `after` if the offset is at the end of the file.
      const position = lineNumber >= this._editor.getLineCount() - 1 ? 'after' : 'before';
      this._editor.decorateMarker(marker, { type: 'block', item: blockItem, position: position });
      this._offsetMarkers.push(marker);
    }
  }

  destroy() {
    this._highlightMarkers.forEach(marker => marker.destroy());
    this._highlightMarkers = [];
    this._offsetMarkers.forEach(marker => marker.destroy());
    this._offsetMarkers = [];
    this._uiElementsMarkers.forEach(marker => marker.destroy());
    this._uiElementsMarkers = [];
    this._editor.destroy();
  }

  _scrollToRow(row) {
    this._editor.scrollToBufferPosition([row, 0], { center: true });
  }
};
exports.default = DiffViewEditor;
module.exports = exports['default'];