Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.computeDiff = computeDiff;
exports.computeDiffSections = computeDiffSections;
exports.getOffsetLineCount = getOffsetLineCount;

var _diff2;

function _diff() {
  return _diff2 = require('diff');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

function computeDiff(oldText, newText) {
  var _computeDiffChunks2 = _computeDiffChunks(oldText, newText);

  var addedLines = _computeDiffChunks2.addedLines;
  var removedLines = _computeDiffChunks2.removedLines;
  var chunks = _computeDiffChunks2.chunks;

  var _computeOffsets2 = _computeOffsets(chunks);

  var oldLineOffsets = _computeOffsets2.oldLineOffsets;
  var newLineOffsets = _computeOffsets2.newLineOffsets;

  return {
    addedLines: addedLines,
    removedLines: removedLines,
    oldLineOffsets: oldLineOffsets,
    newLineOffsets: newLineOffsets
  };
}

function _computeDiffChunks(oldText_, newText_) {
  var oldText = oldText_;
  var newText = newText_;

  // If the last line has changes, JsDiff doesn't return that.
  // Generally, content with new line ending are easier to calculate offsets for.
  if (oldText[oldText.length - 1] !== '\n' || newText[newText.length - 1] !== '\n') {
    oldText += '\n';
    newText += '\n';
  }

  var lineDiff = (0, (_diff2 || _diff()).diffLines)(oldText, newText);
  var chunks = [];

  var addedCount = 0;
  var removedCount = 0;
  var nextOffset = 0;
  var offset = 0;

  var addedLines = [];
  var removedLines = [];
  lineDiff.forEach(function (part) {
    var added = part.added;
    var removed = part.removed;
    var value = part.value;

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
  var newLineOffsets = new Map();
  var oldLineOffsets = new Map();

  var oldLineCount = 0;
  var newLineCount = 0;

  for (var chunk of diffChunks) {
    var _added = chunk.added;
    var _removed = chunk.removed;
    var _offset = chunk.offset;
    var _count = chunk.count;

    if (_added) {
      newLineCount += _count;
    } else if (_removed) {
      oldLineCount += _count;
    } else {
      if (_offset < 0) {
        // Non zero offset implies this block is neither a removal or an addition,
        // and is thus equal in both versions of the document.
        // Sign of offset indicates which version of document requires the offset
        // (negative -> old version, positive -> new version).
        // Magnitude of offset indicates the number of offset lines required for version.
        newLineOffsets.set(newLineCount, _offset * -1);
      } else if (_offset > 0) {
        oldLineOffsets.set(oldLineCount, _offset);
      }
      newLineCount += _count;
      oldLineCount += _count;
    }
  }

  return {
    oldLineOffsets: oldLineOffsets,
    newLineOffsets: newLineOffsets
  };
}

function getLineCountWithOffsets(contents, offsets) {
  var linesCount = contents.split(/\r\n|\n/).length;
  return Array.from(offsets.values()).reduce(function (count, offsetLines) {
    return count + offsetLines;
  }, linesCount);
}

function getOffsetLineNumber(lineNumber, offsets) {
  var offsetLineNumber = lineNumber;
  for (var _ref3 of offsets) {
    var _ref2 = _slicedToArray(_ref3, 2);

    var offsetLine = _ref2[0];
    var offsetLineNumbers = _ref2[1];

    if (lineNumber > offsetLine) {
      offsetLineNumber += offsetLineNumbers;
    }
  }
  return offsetLineNumber;
}

function computeDiffSections(addedLines, removedLines, oldLineOffsets, newLineOffsets) {
  // The old and new text editor contents use offsets to create a global line number identifier
  // being the line number with offset.

  // Here is the mapping between the offset line numbers to the original line number.
  var addedLinesWithOffsets = new Map();
  for (var addedLine of addedLines) {
    addedLinesWithOffsets.set(getOffsetLineNumber(addedLine, newLineOffsets), addedLine);
  }

  var removedLinesWithOffsets = new Map();
  for (var removedLine of removedLines) {
    removedLinesWithOffsets.set(getOffsetLineNumber(removedLine, oldLineOffsets), removedLine);
  }

  // Intersect the added and removed lines maps, taking the values of the added lines.
  var changedLinesWithOffsets = new Map();
  for (var _ref43 of addedLinesWithOffsets.entries()) {
    var _ref42 = _slicedToArray(_ref43, 2);

    var addedLinesOffset = _ref42[0];
    var addedLineNumber = _ref42[1];

    if (removedLinesWithOffsets.has(addedLinesOffset)) {
      removedLinesWithOffsets.delete(addedLinesOffset);
      addedLinesWithOffsets.delete(addedLinesOffset);
      changedLinesWithOffsets.set(addedLinesOffset, addedLineNumber);
    }
  }

  var lineSections = Array.from((0, (_commonsNodeCollection2 || _commonsNodeCollection()).concatIterators)(getLineSectionsWithStatus(addedLinesWithOffsets.entries(), (_constants2 || _constants()).DiffSectionStatus.ADDED), getLineSectionsWithStatus(changedLinesWithOffsets.entries(), (_constants2 || _constants()).DiffSectionStatus.CHANGED), getLineSectionsWithStatus(removedLinesWithOffsets.entries(), (_constants2 || _constants()).DiffSectionStatus.REMOVED)));

  lineSections.sort(function (diffSection1, diffSection2) {
    return diffSection1.offsetLineNumber - diffSection2.offsetLineNumber;
  });

  // Merge line sections into region sections.
  var diffSections = lineSections.length === 0 ? [] : [lineSections[0]];

  for (var i = 1; i < lineSections.length; i++) {
    var lastSection = diffSections[diffSections.length - 1];
    var lineSection = lineSections[i];
    if (lastSection.status === lineSection.status && lastSection.lineNumber + lastSection.lineCount === lineSection.lineNumber) {
      lastSection.lineCount += 1;
    } else {
      diffSections.push(lineSection);
    }
  }

  return diffSections;
}

function* getLineSectionsWithStatus(lineWithOffsets, status) {
  for (var _ref53 of lineWithOffsets) {
    var _ref52 = _slicedToArray(_ref53, 2);

    var offsetLineNumber = _ref52[0];
    var lineNumber = _ref52[1];

    yield {
      lineCount: 1,
      lineNumber: lineNumber,
      offsetLineNumber: offsetLineNumber,
      status: status
    };
  }
}

function getOffsetLineCount(oldContents, oldLineOffsets, newContents, newLineOffsets) {
  var newLinesCount = getLineCountWithOffsets(newContents, newLineOffsets);
  var oldLinesCount = getLineCountWithOffsets(oldContents, oldLineOffsets);
  var offsetLineCount = Math.max(newLinesCount, oldLinesCount);
  return offsetLineCount;
}

var __TEST__ = {
  getOffsetLineNumber: getOffsetLineNumber,
  getLineCountWithOffsets: getLineCountWithOffsets
};
exports.__TEST__ = __TEST__;