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
  NavigationSection,
  NavigationSectionStatusType,
  LineMapping,
  OffsetMap,
  TextDiff,
} from './types';

import {diffLines} from 'diff';
import {NavigationSectionStatus} from './constants';
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
  const {oldToNew, newToOld} = _computeLineDiffMapping(chunks);

  return {
    addedLines,
    removedLines,
    oldLineOffsets: Array.from(oldLineOffsets), // serialize for JSON.
    newLineOffsets: Array.from(newLineOffsets), // serialize for JSON.
    oldToNew,
    newToOld,
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

export function computeNavigationSections(
  addedLines: Iterable<number>,
  removedLines: Iterable<number>,
  newUiElementLines: Iterable<number>,
  oldUiElementLines: Iterable<number>,
  oldLineOffsets: OffsetMap,
  newLineOffsets: OffsetMap,
): Array<NavigationSection> {
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

  const newUiElementsWithOffsets: Map<number, number> = new Map();
  for (const lineNumber of newUiElementLines) {
    newUiElementsWithOffsets.set(getOffsetLineNumber(lineNumber, newLineOffsets), lineNumber);
  }

  const oldUiElementsWithOffsets: Map<number, number> = new Map();
  for (const lineNumber of oldUiElementLines) {
    oldUiElementsWithOffsets.set(getOffsetLineNumber(lineNumber, oldLineOffsets), lineNumber);
  }

  const lineSections = Array.from(concatIterators(
    getLineSectionsWithStatus(
      addedLinesWithOffsets.entries(), NavigationSectionStatus.ADDED),
    getLineSectionsWithStatus(
      changedLinesWithOffsets.entries(), NavigationSectionStatus.CHANGED),
    getLineSectionsWithStatus(
      removedLinesWithOffsets.entries(), NavigationSectionStatus.REMOVED),
    getLineSectionsWithStatus(
      newUiElementsWithOffsets.entries(), NavigationSectionStatus.NEW_ELEMENT),
    getLineSectionsWithStatus(
      oldUiElementsWithOffsets.entries(), NavigationSectionStatus.OLD_ELEMENT),
  ));

  lineSections.sort((navSection1, navSection2) => {
    return navSection1.offsetLineNumber - navSection2.offsetLineNumber;
  });

  // Merge line sections into region sections.
  const navSections = lineSections.length === 0 ? [] : [lineSections[0]];

  for (let i = 1; i < lineSections.length; i++) {
    const lastSection = navSections[navSections.length - 1];
    const lineSection = lineSections[i];
    if (
      lastSection.status === lineSection.status &&
      lastSection.lineNumber + lastSection.lineCount === lineSection.lineNumber
    ) {
      lastSection.lineCount += 1;
    } else {
      navSections.push(lineSection);
    }
  }

  return navSections;
}

export function _computeLineDiffMapping(
  diffChunks: Array<ChunkPiece>,
): LineMapping {
  const newToOld = [];
  const oldToNew = [];

  let oldLineCount = 0;
  let newLineCount = 0;

  // Used to track the changed sections.
  let addedCount = 0;
  let removedCount = 0;

  for (const chunk of diffChunks) {
    const {added, removed, offset, count} = chunk;
    if (added) {
      addedCount = count;
    } else if (removed) {
      removedCount = count;
    } else {
      if (addedCount > 0 && removedCount > 0) {
        // There's a changed section.
        const changedCount = Math.min(addedCount, removedCount);
        for (let i = 0; i < changedCount; i++) {
          oldToNew.push(newLineCount + i);
          newToOld.push(oldLineCount + i);
        }
      }
      newLineCount += addedCount;
      oldLineCount += removedCount;
      if (offset < 0) {
        for (let i = offset; i < 0; i++) {
          oldToNew.push(newLineCount);
        }
      } else if (offset > 0) {
        for (let i = 0; i < offset; i++) {
          newToOld.push(oldLineCount);
        }
      }
      for (let i = 0; i < count; i++) {
        newToOld.push(oldLineCount);
        oldToNew.push(newLineCount);
        newLineCount++;
        oldLineCount++;
      }
      addedCount = 0;
      removedCount = 0;
    }
  }

  // Add two line number mapping for `after` decorations.
  newToOld.push(newLineCount++);
  newToOld.push(newLineCount);

  oldToNew.push(oldLineCount++);
  oldToNew.push(oldLineCount);

  return {
    newToOld,
    oldToNew,
  };
}

function *getLineSectionsWithStatus(
  lineWithOffsets: Iterator<[number, number]>,
  status: NavigationSectionStatusType,
): Iterator<NavigationSection> {
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
