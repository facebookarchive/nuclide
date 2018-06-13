'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.syncBlockDecorations = syncBlockDecorations;

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function syncBlockDecorations(editorElement, diffBlockType, source, shouldUpdate, getElementWithProps, syncWidth = false) {
  const editor = editorElement.getModel();
  const decorations = editor.getDecorations({ diffBlockType });
  const renderedLineNumbers = new Set();
  const { component } = editorElement;

  const markers = [];

  for (const decoration of decorations) {
    const marker = decoration.getMarker();
    const lineNumber = marker.getBufferRange().start.row;
    const value = source.get(lineNumber);
    const properties = decoration.getProperties();
    const item = properties.item;

    // If the decoration should no longer exist or it has already been rendered,
    // it needs to be destroyed.
    if (value == null || renderedLineNumbers.has(lineNumber)) {
      marker.destroy();
      continue;
    }

    if (shouldUpdate(value, properties)) {
      const { element, customProps } = getElementWithProps(value);
      _reactDom.default.render(element, item);

      Object.assign(properties, customProps);

      // Invalidate the block decoration measurements.
      if (component != null) {
        component.invalidateBlockDecorationDimensions(decoration);
      }
    }

    // The item is already up to date.
    markers.push(marker);
    renderedLineNumbers.add(lineNumber);
  }

  for (const [lineNumber, value] of source) {
    if (renderedLineNumbers.has(lineNumber)) {
      continue;
    }

    const { element, customProps } = getElementWithProps(value);
    const marker = editor.markBufferPosition([lineNumber, 0], {
      invalidate: 'never'
    });

    // The position should be `after` if the element is at the end of the file.
    const position = lineNumber >= editor.getLineCount() - 1 ? 'after' : 'before';
    const item = document.createElement('div');
    _reactDom.default.render(element, item);
    marker.onDidDestroy(() => {
      _reactDom.default.unmountComponentAtNode(item);
    });
    editor.decorateMarker(marker, Object.assign({}, customProps, {
      type: 'block',
      item,
      position
    }));

    markers.push(marker);
  }

  return markers;
}