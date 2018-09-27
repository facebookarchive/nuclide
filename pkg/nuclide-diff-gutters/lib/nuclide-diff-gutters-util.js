"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeDiffGutters = initializeDiffGutters;
exports.updateDiffs = updateDiffs;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const MAX_BUFFER_LENGTH_TO_DIFF = 2 * 1024 * 1024;
const markerMap = new Map();

function initializeDiffGutters(editor) {
  const gutter = atom.views.getView(editor).querySelector('.gutter');

  if (gutter != null) {
    const iconSetting = _featureConfig().default.get('nuclide-diff-gutters.showIconsInNuclideDiffGutter');

    if (iconSetting === true) {
      gutter.classList.add('nuclide-diff-gutters-icon');
    } else {
      gutter.classList.remove('nuclide-diff-gutters-icon');
    }
  }

  if (!markerMap.has(editor)) {
    markerMap.set(editor, []);
    editor.onDidDestroy(() => _cleanupDiffGutters(editor));
  }
}

function _cleanupDiffGutters(editor) {
  markerMap.delete(editor);
}

function updateDiffs(editor, diffs) {
  if (editor.isDestroyed()) {
    return;
  }

  _removeDecorations(editor);

  const length = editor.getBuffer().getLength();

  if (length < MAX_BUFFER_LENGTH_TO_DIFF) {
    _addDecorations(editor, diffs);
  }
}

function _addDecorations(editor, diffs) {
  if (diffs == null) {
    return;
  }

  for (const _ref of diffs) {
    const {
      newStart,
      oldLines,
      newLines
    } = _ref;
    const startRow = newStart - 1;
    const endRow = newStart + newLines - 1;

    if (oldLines === 0 && newLines > 0) {
      _markRange(editor, startRow, endRow, 'nuclide-line-added');
    } else if (newLines === 0 && oldLines > 0) {
      if (startRow < 0) {
        _markRange(editor, 0, 0, 'nuclide-previous-line-removed');
      } else {
        _markRange(editor, startRow, startRow, 'nuclide-line-removed');
      }
    } else {
      _markRange(editor, startRow, endRow, 'nuclide-line-modified');
    }
  }
}

function _removeDecorations(editor) {
  const markerArray = markerMap.get(editor);

  if (markerArray == null) {
    return;
  }

  markerArray.map(m => {
    m.destroy();
  });
  markerMap.set(editor, []);
}

function _markRange(editor, startRow, endRow, klass) {
  const marker = editor.markBufferRange([[startRow, 0], [endRow, 0]], {
    invalidate: 'never'
  });
  const markerParams = {
    type: 'line-number',
    class: klass
  };
  editor.decorateMarker(marker, markerParams);
  const markerArray = markerMap.get(editor);

  if (markerArray != null) {
    markerArray.push(marker);
  }
}