'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.patchToString = patchToString;
exports.isSpecialChange = isSpecialChange;
exports.parseWithAnnotations = parseWithAnnotations;
exports.createPatchData = createPatchData;
exports.createHunkData = createHunkData;

var _diffparser;

function _load_diffparser() {
  return _diffparser = _interopRequireDefault(require('diffparser'));
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
 */

function patchToString(patch) {
  const lines = [];

  patch.forEach(fileDiff => {
    lines.push(`diff --git a/${fileDiff.from} b/${fileDiff.to}`);
    if (!isSpecialChange(fileDiff)) {
      lines.push(`--- a/${fileDiff.from}\n+++ b/${fileDiff.to}`);
      fileDiff.chunks.forEach(hunk => {
        lines.push(hunk.content);
        hunk.changes.forEach(change => lines.push(change.content));
      });
    }
  });

  return lines.join('\n') + '\n';
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
    files: new Map(patch.map(fileDiff => [fileDiff.to, {
      chunks: isSpecialChange(fileDiff) ? null : new Map(fileDiff.chunks.map(chunk => [chunk.oldStart, createHunkData(chunk)])),
      collapsed: false,
      countEnabledChunks: fileDiff.chunks.length,
      fileDiff,
      selected: 'all'
    }]))
  };
}

function createHunkData(hunk) {
  const lines = hunk.changes.map(change => change.type !== 'normal').filter(isChange => isChange);
  return {
    collapsed: false,
    countAllChanges: lines.length,
    countEnabledChanges: lines.length,
    lines,
    selected: 'all'
  };
}