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
exports.__TEST__ = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.computeDiff = computeDiff;
exports.computeNavigationSections = computeNavigationSections;
exports._computeLineDiffMapping = _computeLineDiffMapping;
exports.getOffsetLineCount = getOffsetLineCount;

var _diff;

function _load_diff() {
  return _diff = require('diff');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

function computeDiff(oldText, newText) {
  var _computeDiffChunks2 = _computeDiffChunks(oldText, newText);

  const addedLines = _computeDiffChunks2.addedLines,
        removedLines = _computeDiffChunks2.removedLines,
        chunks = _computeDiffChunks2.chunks;

  var _computeOffsets2 = _computeOffsets(chunks);

  const oldLineOffsets = _computeOffsets2.oldLineOffsets,
        newLineOffsets = _computeOffsets2.newLineOffsets;

  var _computeLineDiffMappi = _computeLineDiffMapping(chunks);

  const oldToNew = _computeLineDiffMappi.oldToNew,
        newToOld = _computeLineDiffMappi.newToOld;


  return {
    addedLines: addedLines,
    removedLines: removedLines,
    oldLineOffsets: oldLineOffsets,
    newLineOffsets: newLineOffsets,
    oldToNew: oldToNew,
    newToOld: newToOld
  };
}

function _computeDiffChunks(oldText_, newText_) {
  let oldText = oldText_;
  let newText = newText_;

  // If the last line has changes, JsDiff doesn't return that.
  // Generally, content with new line ending are easier to calculate offsets for.
  if (oldText[oldText.length - 1] !== '\n' || newText[newText.length - 1] !== '\n') {
    oldText += '\n';
    newText += '\n';
  }

  const lineDiff = (0, (_diff || _load_diff()).diffLines)(oldText, newText);
  const chunks = [];

  let addedCount = 0;
  let removedCount = 0;
  let nextOffset = 0;
  let offset = 0;

  const addedLines = [];
  const removedLines = [];
  lineDiff.forEach(part => {
    const added = part.added,
          removed = part.removed,
          value = part.value;

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
    chunks.push({ added: added, removed: removed, value: value, count: count, offset: offset });
    offset = 0;
  });
  if (nextOffset !== 0) {
    // Add a trailing offset block at the end of the shorter file.
    chunks.push({ added: 0, removed: 0, value: '', count: 0, offset: nextOffset });
  }
  return { addedLines: addedLines, removedLines: removedLines, chunks: chunks };
}

function _computeOffsets(diffChunks) {
  const newLineOffsets = new Map();
  const oldLineOffsets = new Map();

  let oldLineCount = 0;
  let newLineCount = 0;

  for (const chunk of diffChunks) {
    const added = chunk.added,
          removed = chunk.removed,
          offset = chunk.offset,
          count = chunk.count;

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
    oldLineOffsets: oldLineOffsets,
    newLineOffsets: newLineOffsets
  };
}

function getLineCountWithOffsets(contents, offsets) {
  const linesCount = contents.split(/\r\n|\n/).length;
  return Array.from(offsets.values()).reduce((count, offsetLines) => count + offsetLines, linesCount);
}

function getOffsetLineNumber(lineNumber, offsets) {
  let offsetLineNumber = lineNumber;
  for (const _ref of offsets) {
    var _ref2 = _slicedToArray(_ref, 2);

    const offsetLine = _ref2[0];
    const offsetLineNumbers = _ref2[1];

    if (lineNumber > offsetLine) {
      offsetLineNumber += offsetLineNumbers;
    }
  }
  return offsetLineNumber;
}

function computeNavigationSections(addedLines, removedLines, newUiElementLines, oldUiElementLines, oldLineOffsets, newLineOffsets) {
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
  const changedLinesWithOffsets = new Map();
  for (const _ref3 of addedLinesWithOffsets.entries()) {
    var _ref4 = _slicedToArray(_ref3, 2);

    const addedLinesOffset = _ref4[0];
    const addedLineNumber = _ref4[1];

    if (removedLinesWithOffsets.has(addedLinesOffset)) {
      removedLinesWithOffsets.delete(addedLinesOffset);
      addedLinesWithOffsets.delete(addedLinesOffset);
      changedLinesWithOffsets.set(addedLinesOffset, addedLineNumber);
    }
  }

  const newUiElementsWithOffsets = new Map();
  for (const lineNumber of newUiElementLines) {
    newUiElementsWithOffsets.set(getOffsetLineNumber(lineNumber, newLineOffsets), lineNumber);
  }

  const oldUiElementsWithOffsets = new Map();
  for (const lineNumber of oldUiElementLines) {
    oldUiElementsWithOffsets.set(getOffsetLineNumber(lineNumber, oldLineOffsets), lineNumber);
  }

  const lineSections = Array.from((0, (_collection || _load_collection()).concatIterators)(getLineSectionsWithStatus(addedLinesWithOffsets.entries(), (_constants || _load_constants()).NavigationSectionStatus.ADDED), getLineSectionsWithStatus(changedLinesWithOffsets.entries(), (_constants || _load_constants()).NavigationSectionStatus.CHANGED), getLineSectionsWithStatus(removedLinesWithOffsets.entries(), (_constants || _load_constants()).NavigationSectionStatus.REMOVED), getLineSectionsWithStatus(newUiElementsWithOffsets.entries(), (_constants || _load_constants()).NavigationSectionStatus.NEW_ELEMENT), getLineSectionsWithStatus(oldUiElementsWithOffsets.entries(), (_constants || _load_constants()).NavigationSectionStatus.OLD_ELEMENT)));

  lineSections.sort((navSection1, navSection2) => {
    return navSection1.offsetLineNumber - navSection2.offsetLineNumber;
  });

  // Merge line sections into region sections.
  const navSections = lineSections.length === 0 ? [] : [lineSections[0]];

  for (let i = 1; i < lineSections.length; i++) {
    const lastSection = navSections[navSections.length - 1];
    const lineSection = lineSections[i];
    if (lastSection.status === lineSection.status && lastSection.lineNumber + lastSection.lineCount === lineSection.lineNumber) {
      lastSection.lineCount += 1;
    } else {
      navSections.push(lineSection);
    }
  }

  return navSections;
}

function _computeLineDiffMapping(diffChunks) {
  const newToOld = [];
  const oldToNew = [];

  let oldLineCount = 0;
  let newLineCount = 0;

  // Used to track the changed sections.
  let addedCount = 0;
  let removedCount = 0;

  for (const chunk of diffChunks) {
    const added = chunk.added,
          removed = chunk.removed,
          offset = chunk.offset,
          count = chunk.count;

    if (added) {
      addedCount = count;
      newLineCount += count;
    } else if (removed) {
      removedCount = count;
      oldLineCount += count;
    } else {
      if (addedCount > 0 && removedCount > 0) {
        // There's a changed section.
        const changedCount = Math.min(addedCount, removedCount);
        for (let i = changedCount; i > 0; i--) {
          oldToNew.push(newLineCount - i);
          newToOld.push(oldLineCount - i);
        }
      }
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

  return {
    newToOld: newToOld,
    oldToNew: oldToNew
  };
}

function* getLineSectionsWithStatus(lineWithOffsets, status) {
  for (const _ref5 of lineWithOffsets) {
    var _ref6 = _slicedToArray(_ref5, 2);

    const offsetLineNumber = _ref6[0];
    const lineNumber = _ref6[1];

    yield {
      lineCount: 1,
      lineNumber: lineNumber,
      offsetLineNumber: offsetLineNumber,
      status: status
    };
  }
}

function getOffsetLineCount(oldContents, oldLineOffsets, newContents, newLineOffsets) {
  const newLinesCount = getLineCountWithOffsets(newContents, newLineOffsets);
  const oldLinesCount = getLineCountWithOffsets(oldContents, oldLineOffsets);
  const offsetLineCount = Math.max(newLinesCount, oldLinesCount);
  return offsetLineCount;
}

const __TEST__ = exports.__TEST__ = {
  getOffsetLineNumber: getOffsetLineNumber,
  getLineCountWithOffsets: getLineCountWithOffsets
};