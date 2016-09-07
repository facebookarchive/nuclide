'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  DiffSection,
  DiffSectionStatusType,
  OffsetMap,
  TextDiff,
} from './types';

import {diffLines} from 'diff';
import {DiffSectionStatus} from './constants';
import {concatIterators} from '../../commons-node/collection';

type ChunkPiece = {
  added: number,
  removed: number,
  value: string,
  count: number,
  offset: number,
};

type DiffChunk = {
  addedLines: Array<number>,
  removedLines: Array<number>,
  chunks: Array<ChunkPiece>,
};

export function computeDiff(oldText: string, newText: string): TextDiff {
  const {addedLines, removedLines, chunks} = _computeDiffChunks(oldText, newText);
  const {oldLineOffsets, newLineOffsets} = _computeOffsets(chunks);

  return {
    addedLines,
    removedLines,
    oldLineOffsets,
    newLineOffsets,
  };
}

function _computeDiffChunks(oldText_: string, newText_: string): DiffChunk {
  let oldText = oldText_;
  let newText = newText_;

  // If the last line has changes, JsDiff doesn't return that.
  // Generally, content with new line ending are easier to calculate offsets for.
  if (oldText[oldText.length - 1] !== '\n' || newText[newText.length - 1] !== '\n') {
    oldText += '\n';
    newText += '\n';
  }

  const lineDiff = diffLines(oldText, newText);
  const chunks = [];

  let addedCount = 0;
  let removedCount = 0;
  let nextOffset = 0;
  let offset = 0;

  const addedLines = [];
  const removedLines = [];
  lineDiff.forEach(part => {
    const {added, removed, value} = part;
    const count = value.split('\n').length - 1;
    if (!added && !removed) {
      addedCount += count;
      removedCount += count;
      offset = nextOffset;
      nextOffset = 0;
    } else if (added) {
      for (let i = 0; i < count; i++) {
        addedLines.push(addedCount + i);
      }
      addedCount += count;
      nextOffset += count;
    } else {
      for (let i = 0; i < count; i++) {
        removedLines.push(removedCount + i);
      }
      removedCount += count;
      nextOffset -= count;
    }
    chunks.push({added, removed, value, count, offset});
    offset = 0;
  });
  if (nextOffset !== 0) {
    // Add a trailing offset block at the end of the shorter file.
    chunks.push({added: 0, removed: 0, value: '', count: 0, offset: nextOffset});
  }
  return {addedLines, removedLines, chunks};
}

function _computeOffsets(
  diffChunks: Array<ChunkPiece>,
): {oldLineOffsets: OffsetMap, newLineOffsets: OffsetMap} {
  const newLineOffsets = new Map();
  const oldLineOffsets = new Map();

  let oldLineCount = 0;
  let newLineCount = 0;

  for (const chunk of diffChunks) {
    const {added, removed, offset, count} = chunk;
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
        newLineOffsets.set(newLineCount, offset * -1);
      } else if (offset > 0) {
        oldLineOffsets.set(oldLineCount, offset);
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

function getLineCountWithOffsets(contents: string, offsets: OffsetMap): number {
  const linesCount = contents.split(/\r\n|\n/).length;
  return Array.from(offsets.values())
    .reduce((count, offsetLines) => count + offsetLines, linesCount);
}

function getOffsetLineNumber(lineNumber: number, offsets: OffsetMap): number {
  let offsetLineNumber = lineNumber;
  for (const [offsetLine, offsetLineNumbers] of offsets) {
    if (lineNumber > offsetLine) {
      offsetLineNumber += offsetLineNumbers;
    }
  }
  return offsetLineNumber;
}

export function computeDiffSections(
  addedLines: Array<number>,
  removedLines: Array<number>,
  oldLineOffsets: OffsetMap,
  newLineOffsets: OffsetMap,
): Array<DiffSection> {
  // The old and new text editor contents use offsets to create a global line number identifier
  // being the line number with offset.

  // Here is the mapping between the offset line numbers to the original line number.
  const addedLinesWithOffsets = new Map();
  for (const addedLine of addedLines) {
    addedLinesWithOffsets.set(getOffsetLineNumber(addedLine, newLineOffsets), addedLine);
  }

  const removedLinesWithOffsets = new Map();
  for (const removedLine of removedLines) {
    removedLinesWithOffsets.set(getOffsetLineNumber(removedLine, oldLineOffsets), removedLine);
  }

  // Intersect the added and removed lines maps, taking the values of the added lines.
  const changedLinesWithOffsets: Map<number, number> = new Map();
  for (const [addedLinesOffset, addedLineNumber] of addedLinesWithOffsets.entries()) {
    if (removedLinesWithOffsets.has(addedLinesOffset)) {
      removedLinesWithOffsets.delete(addedLinesOffset);
      addedLinesWithOffsets.delete(addedLinesOffset);
      changedLinesWithOffsets.set(addedLinesOffset, addedLineNumber);
    }
  }

  const lineSections = Array.from(concatIterators(
    getLineSectionsWithStatus(addedLinesWithOffsets.entries(), DiffSectionStatus.ADDED),
    getLineSectionsWithStatus(changedLinesWithOffsets.entries(), DiffSectionStatus.CHANGED),
    getLineSectionsWithStatus(removedLinesWithOffsets.entries(), DiffSectionStatus.REMOVED),
  ));

  lineSections.sort((diffSection1, diffSection2) => {
    return diffSection1.offsetLineNumber - diffSection2.offsetLineNumber;
  });

  // Merge line sections into region sections.
  const diffSections = lineSections.length === 0 ? [] : [lineSections[0]];

  for (let i = 1; i < lineSections.length; i++) {
    const lastSection = diffSections[diffSections.length - 1];
    const lineSection = lineSections[i];
    if (
      lastSection.status === lineSection.status &&
      lastSection.lineNumber + lastSection.lineCount === lineSection.lineNumber
    ) {
      lastSection.lineCount += 1;
    } else {
      diffSections.push(lineSection);
    }
  }

  return diffSections;
}

function *getLineSectionsWithStatus(
  lineWithOffsets: Iterator<[number, number]>,
  status: DiffSectionStatusType,
): Iterator<DiffSection> {
  for (const [offsetLineNumber, lineNumber] of lineWithOffsets) {
    yield {
      lineCount: 1,
      lineNumber,
      offsetLineNumber,
      status,
    };
  }
}

export function getOffsetLineCount(
  oldContents: string,
  oldLineOffsets: OffsetMap,
  newContents: string,
  newLineOffsets: OffsetMap,
): number {
  const newLinesCount = getLineCountWithOffsets(newContents, newLineOffsets);
  const oldLinesCount = getLineCountWithOffsets(oldContents, oldLineOffsets);
  const offsetLineCount = Math.max(newLinesCount, oldLinesCount);
  return offsetLineCount;
}

export const __TEST__ = {
  getOffsetLineNumber,
  getLineCountWithOffsets,
};
