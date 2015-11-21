'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TextDiff, OffsetMap} from './types';

type ChunkPiece = {
  added: number;
  removed: number;
  value: string;
  count: number;
  offset: number;
};

type DiffChunk = {
  addedLines: Array<number>;
  removedLines: Array<number>;
  chunks: Array<ChunkPiece>;
};

export function computeDiff(oldText: string, newText: string): TextDiff {
  var {addedLines, removedLines, chunks} = _computeDiffChunks(oldText, newText);
  var {oldLineOffsets, newLineOffsets} = _computeOffsets(chunks);

  return {
    addedLines,
    removedLines,
    oldLineOffsets,
    newLineOffsets,
  };
}

function _computeDiffChunks(oldText: string, newText: string): DiffChunk {

  var JsDiff = require('diff');

  // If the last line has changes, JsDiff doesn't return that.
  // Generally, content with new line ending are easier to calculate offsets for.
  if (oldText[oldText.length - 1] !== '\n' || newText[newText.length - 1] !== '\n') {
    oldText += '\n';
    newText += '\n';
  }

  var lineDiff = JsDiff.diffLines(oldText, newText);
  var chunks = [];

  var addedCount = 0;
  var removedCount = 0;
  var nextOffset = 0;
  var offset = 0;

  var addedLines = [];
  var removedLines = [];
  lineDiff.forEach(part => {
    var {added, removed, value} = part;
    var count = value.split('\n').length - 1;
    if (!added && !removed) {
      addedCount += count;
      removedCount += count;
      offset = nextOffset;
      nextOffset = 0;
    } else if (added) {
      for (var i = 0; i < count; i++) {
        addedLines.push(addedCount + i);
      }
      addedCount += count;
      nextOffset += count;
    } else {
      for (var i = 0; i < count; i++) {
        removedLines.push(removedCount + i);
      }
      removedCount += count;
      nextOffset -= count;
    }
    chunks.push({added, removed, value, count, offset});
    offset = 0;
  });
  return {addedLines, removedLines, chunks};
}

function _computeOffsets(
  diffChunks: Array<ChunkPiece>,
): {oldLineOffsets: OffsetMap; newLineOffsets: OffsetMap;} {
  var newLineOffsets = {};
  var oldLineOffsets = {};

  var oldLineCount = 0;
  var newLineCount = 0;

  for (var chunk of diffChunks) {
    var {added, removed, offset, count} = chunk;
    if (added) {
      newLineCount += count;
    } else if (removed) {
      oldLineCount += count;
    } else {
      if (offset < 0) {
        // Non zero offset implies this block is neither a removal or an addition,
        // and is thus equal in both versions of the document.
        // Sign of offset indicates which version of document requires the offset
        // (negative -> old version, positive -> new version).
        // Magnitude of offset indicates the number of offset lines required for version.
        newLineOffsets[newLineCount] = offset * -1;
      } else if (offset > 0) {
        oldLineOffsets[oldLineCount] = offset;
      }
      newLineCount += count;
      oldLineCount += count;
    }
  }

  return {
    oldLineOffsets,
    newLineOffsets,
  };
}

export function getLineCountWithOffsets(contents: string, offsets: OffsetMap): number {
  const linesCount = contents.split(/\r\n|\n/).length;
  return Object.keys(offsets)
    .map(offsetKey => offsets[offsetKey])
    .reduce((count, offsetLines) => count + offsetLines, linesCount);
}

export function getOffsetLineNumber(lineNumber: number, offsets: OffsetMap): number {
  let offsetLineNumber = lineNumber;
  for (const offsetKey in offsets) {
    if (lineNumber > parseInt(offsetKey, 10)) {
      offsetLineNumber += offsets[offsetKey];
    }
  }
  return offsetLineNumber;
}
