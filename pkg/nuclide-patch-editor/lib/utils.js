'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.patchToString = patchToString;
exports.isSpecialChange = isSpecialChange;
exports.parseWithAnnotations = parseWithAnnotations;
exports.createPatchData = createPatchData;
exports.createHunkData = createHunkData;

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _diffparser;

function _load_diffparser() {
  return _diffparser = _interopRequireDefault(require('diffparser'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Export an Array of diffparser$FileDiff objects to a string utilizable by the
// Mercurial edrecord extension
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

function patchToString(patchData) {
  const lines = [];

  patchData.files.forEach(fileData => {
    if (fileData.selected === (_constants || _load_constants()).SelectedState.NONE) {
      return;
    }
    const fileDiff = fileData.fileDiff;
    lines.push(`diff --git a/${fileDiff.from} b/${fileDiff.to}`);
    if (!isSpecialChange(fileDiff)) {
      lines.push(`--- a/${fileDiff.from}\n+++ b/${fileDiff.to}`);
      fileDiff.chunks.forEach(hunk => {
        const hunkData = (0, (_nullthrows || _load_nullthrows()).default)((0, (_nullthrows || _load_nullthrows()).default)(fileData.chunks).get(hunk.oldStart));
        if (hunkData.selected === (_constants || _load_constants()).SelectedState.NONE) {
          return;
        }
        lines.push(hunk.content);
        hunk.changes.forEach((change, index) => {
          if (change.type !== 'normal') {
            if (hunkData.allChanges[index - hunkData.firstChangedLineIndex]) {
              lines.push(change.content);
            } else if (change.type === 'del') {
              // disabling a 'del' line replaces the '-' prefix with ' '
              lines.push(' ' + change.content.substr(1));
            }
            // Don't push disabled 'add' lines
          } else {
            lines.push(change.content);
          }
        });
      });
    }
  });

  return lines.join('\n') + '\n'; // end file with a newline
}

// Special changes only require the first line of the header be printed
// Examples of special changes: binary files, renaming files, deleting files, adding empty files
function isSpecialChange(fileDiff) {
  return fileDiff.chunks.length === 0;
}

// Special changes come with annotations that will be useful to display on the FileChanges UI
function parseWithAnnotations(diffContent) {
  const patch = (0, (_diffparser || _load_diffparser()).default)(diffContent);

  const patchLines = diffContent.split('\n');
  let currentLine = 0;

  patch.forEach(fileDiff => {
    while (!patchLines[currentLine].startsWith('diff ')) {
      ++currentLine;
    }
    const annotationLines = [];
    while (patchLines[++currentLine].startsWith('# ')) {
      annotationLines.push(patchLines[currentLine].substr(2));
    }
    if (annotationLines.length > 0) {
      fileDiff.annotation = annotationLines.join('\n');
    }
  });
  return patch;
}

function createPatchData(patch) {
  return {
    files: new Map(patch.map(fileDiff => {
      const id = `${fileDiff.to}:${fileDiff.from}`;
      return [id, {
        chunks: isSpecialChange(fileDiff) ? null : new Map(fileDiff.chunks.map(chunk => [chunk.oldStart, createHunkData(chunk)])),
        countEnabledChunks: fileDiff.chunks.length,
        countPartialChunks: 0,
        fileDiff,
        id,
        selected: (_constants || _load_constants()).SelectedState.ALL
      }];
    }))
  };
}

function createHunkData(hunk) {
  const allChanges = hunk.changes.map(change => change.type !== 'normal').filter(isChange => isChange);
  const firstChangedLineIndex = hunk.changes.findIndex(change => change.type !== 'normal');
  return {
    allChanges,
    countEnabledChanges: allChanges.length,
    firstChangedLineIndex,
    selected: (_constants || _load_constants()).SelectedState.ALL
  };
}