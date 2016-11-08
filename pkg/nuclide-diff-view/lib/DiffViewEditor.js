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

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../commons-atom/renderReactRoot');
}

function renderLineOffset(lineCount, lineHeight) {
  return _reactForAtom.React.createElement('div', {
    className: 'nuclide-diff-view-block-offset',
    style: { minHeight: lineCount * lineHeight }
  });
}
function renderInlineElement(inlineElement, scrollToRow) {
  // TODO(most): Replace this property injection with a better UI Provider API.
  inlineElement.props.helpers.scrollToRow = scrollToRow;
  return inlineElement;
}

function renderInlineOffset(offsetElement) {
  return _reactForAtom.React.createElement(
    'div',
    { style: { position: 'relative', width: '100%' } },
    _reactForAtom.React.createElement('div', {
      className: 'nuclide-diff-view-block-offset',
      style: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }
    }),
    _reactForAtom.React.createElement(
      'div',
      { style: { visibility: 'hidden', pointerEvents: 'none' } },
      offsetElement
    )
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
function syncBlockDecorations(editorElement, diffBlockType, source, shouldUpdate, getElementWithProps) {
  let syncWidth = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

  const editor = editorElement.getModel();
  const decorations = editor.getDecorations({ diffBlockType: diffBlockType });
  const renderedLineNumbers = new Set();
  const component = editorElement.component;

  if (!component) {
    throw new Error('Editor not yet initialized!');
  }

  const editorWidthPx = syncWidth ? `${ component.scrollViewNode.clientWidth }px` : '';

  const markers = [];

  for (const decoration of decorations) {
    const marker = decoration.getMarker();
    const lineNumber = marker.getBufferRange().start.row;
    const value = source.get(lineNumber);
    const properties = decoration.getProperties();
    const item = properties.item;

    if (value == null) {
      marker.destroy();
      continue;
    }

    if (shouldUpdate(value, properties) || item.style.width !== editorWidthPx) {
      // Refresh the  rendered element.
      const reactRoot = item;

      _reactForAtom.ReactDOM.unmountComponentAtNode(reactRoot);

      var _getElementWithProps = getElementWithProps(value);

      const element = _getElementWithProps.element,
            customProps = _getElementWithProps.customProps;

      _reactForAtom.ReactDOM.render(element, reactRoot);

      reactRoot.setReactElement(element);
      reactRoot.style.width = editorWidthPx;
      Object.assign(properties, customProps);

      // Invalidate the block decoration measurements.
      component.invalidateBlockDecorationDimensions(decoration);
    }

    // The item is already up to date.
    markers.push(marker);
    renderedLineNumbers.add(lineNumber);
  }

  for (const _ref of source) {
    var _ref2 = _slicedToArray(_ref, 2);

    const lineNumber = _ref2[0];
    const value = _ref2[1];

    if (renderedLineNumbers.has(lineNumber)) {
      continue;
    }

    var _getElementWithProps2 = getElementWithProps(value);

    const element = _getElementWithProps2.element,
          customProps = _getElementWithProps2.customProps;

    const marker = editor.markBufferPosition([lineNumber, 0], { invalidate: 'never' });

    // The position should be `after` if the element is at the end of the file.
    const position = lineNumber >= editor.getLineCount() - 1 ? 'after' : 'before';
    const item = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(element);
    item.style.width = editorWidthPx;
    editor.decorateMarker(marker, Object.assign({}, customProps, {
      type: 'block',
      item: item,
      position: position
    }));

    markers.push(marker);
  }

  return markers;
}

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
    this._offsetUiElementsMarkers = [];
    this._scrollToRow = this._scrollToRow.bind(this);

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
      _reactForAtom.ReactDOM.unmountComponentAtNode(element);
    }
  }

  setUiElements(elements) {
    const diffBlockType = 'inline';
    this._uiElementsMarkers = syncBlockDecorations(this._editorElement, diffBlockType, elements, (element, customProps) => customProps.element !== element, element => ({
      element: renderInlineElement(element, this._scrollToRow),
      customProps: { diffBlockType: diffBlockType, element: element }
    }),
    /* syncWidth */true);
  }

  setOffsetUiElements(offsetElements, lineMapper) {
    const mappedOffsetElements = new Map();
    for (const _ref3 of offsetElements) {
      var _ref4 = _slicedToArray(_ref3, 2);

      const bufferRow = _ref4[0];
      const offsetElement = _ref4[1];

      mappedOffsetElements.set(lineMapper[bufferRow], offsetElement);
    }

    const diffBlockType = 'inline-offset';
    this._offsetUiElementsMarkers = syncBlockDecorations(this._editorElement, diffBlockType, mappedOffsetElements, (offsetElement, customProps) => customProps.offsetElement !== offsetElement, offsetElement => ({
      element: renderInlineOffset(offsetElement),
      customProps: { diffBlockType: diffBlockType, offsetElement: offsetElement }
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
    const lineHeight = this._editor.getLineHeightInPixels();
    const diffBlockType = 'line-offset';
    this._offsetMarkers = syncBlockDecorations(this._editorElement, diffBlockType, lineOffsets, (lineCount, customProps) => customProps.lineCount !== lineCount, lineCount => ({
      element: renderLineOffset(lineCount, lineHeight),
      customProps: { lineCount: lineCount, diffBlockType: diffBlockType }
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

  _scrollToRow(row) {
    this._editor.scrollToBufferPosition([row, 0], { center: true });
  }
};
exports.default = DiffViewEditor;
module.exports = exports['default'];